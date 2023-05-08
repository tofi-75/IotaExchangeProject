import datetime
from typing import List, Tuple
from ..model.exchange_rate_history import ExchangeRateHistory
from ..model.exchange_rate_daily import ExchangeRateDaily
from ..model.transaction import Transaction
from ..app import db


def update_exchange_rate_history(transaction: Transaction):
    lbp_amount = transaction.lbp_amount
    usd_amount = transaction.usd_amount
    usd_to_lbp = transaction.usd_to_lbp
    transaction_date = transaction.added_date
    new_exchange_rate = lbp_amount / usd_amount

    prev_exchange_rate_history: ExchangeRateHistory = ExchangeRateHistory.query \
        .order_by(ExchangeRateHistory.date.desc()).first()

    if prev_exchange_rate_history is None:
        new_exchange_rate_history = ExchangeRateHistory(
            buy_usd_rate=new_exchange_rate if not usd_to_lbp else None,
            sell_usd_rate=new_exchange_rate if usd_to_lbp else None,
            num_buy_transactions=1 if not usd_to_lbp else 0,
            num_sell_transactions=1 if usd_to_lbp else 0,
            date=transaction_date
        )
        db.session.add(new_exchange_rate_history)
        db.session.commit()
        return

    prev_buy_rate = prev_exchange_rate_history.buy_usd_rate \
        if prev_exchange_rate_history.buy_usd_rate is not None else 0
    prev_sell_rate = prev_exchange_rate_history.sell_usd_rate \
        if prev_exchange_rate_history.sell_usd_rate is not None else 0
    n_sell = prev_exchange_rate_history.num_sell_transactions
    n_buy = prev_exchange_rate_history.num_buy_transactions

    new_exchange_rate_history = ExchangeRateHistory(
        buy_usd_rate=(prev_buy_rate * n_buy + new_exchange_rate) / (n_buy + 1) if not usd_to_lbp else prev_buy_rate,
        sell_usd_rate=(prev_sell_rate * n_sell + new_exchange_rate) / (n_sell + 1) if usd_to_lbp else prev_sell_rate,
        num_buy_transactions=n_buy + 1 if not usd_to_lbp else n_buy,
        num_sell_transactions=n_sell + 1 if usd_to_lbp else n_sell,
        date=transaction_date
    )
    db.session.add(new_exchange_rate_history)
    db.session.commit()


def get_min_max_avg(rates: List[Tuple[float, datetime.datetime]]):
    if len(rates) > 0:
        max_rate = max(rates, key=lambda x: x[0])[0]
        min_rate = min(rates, key=lambda x: x[0])[0]
        avg_rate = 0
        if len(rates) > 1:
            for i in range(1, len(rates)):
                avg_rate += rates[i - 1][0] * (rates[i][1] - rates[i - 1][1]).total_seconds()
            avg_rate /= (rates[-1][1] - rates[0][1]).total_seconds()
        else:
            avg_rate = max_rate
    else:
        max_rate = None
        min_rate = None
        avg_rate = None

    return max_rate, min_rate, avg_rate


def update_daily_exchange_rate(rate_date: datetime.datetime):
    day_begin = rate_date.replace(hour=0, minute=0, second=0)
    day_end = rate_date.replace(hour=23, minute=59, second=59)

    exchange_rates_on_day: List[ExchangeRateHistory] = ExchangeRateHistory.query.filter(
        ExchangeRateHistory.date >= day_begin,
        ExchangeRateHistory.date <= day_end
    ).order_by(ExchangeRateHistory.date).all()
    prev_exchange_rate: ExchangeRateHistory = ExchangeRateHistory.query.filter(ExchangeRateHistory.date < day_begin)\
        .order_by(ExchangeRateHistory.date.desc()).first()

    buy_rates = [(rate.buy_usd_rate, rate.date) for rate in exchange_rates_on_day if rate.buy_usd_rate is not None]
    sell_rates = [(rate.sell_usd_rate, rate.date) for rate in exchange_rates_on_day if rate.sell_usd_rate is not None]

    num_sell_transactions = 0 if len(sell_rates) == 0 else exchange_rates_on_day[-1].num_sell_transactions - \
        (0 if prev_exchange_rate is None or prev_exchange_rate.num_sell_transactions is None else
            prev_exchange_rate.num_sell_transactions)
    num_buy_transactions = 0 if len(buy_rates) == 0 else exchange_rates_on_day[-1].num_buy_transactions - \
        (0 if prev_exchange_rate is None or prev_exchange_rate.num_buy_transactions is None else
            prev_exchange_rate.num_buy_transactions)

    if prev_exchange_rate is not None and prev_exchange_rate.buy_usd_rate is not None:
        buy_rates = [(prev_exchange_rate.buy_usd_rate, day_begin)] + buy_rates
    if prev_exchange_rate is not None and prev_exchange_rate.sell_usd_rate is not None:
        sell_rates = [(prev_exchange_rate.sell_usd_rate, day_begin)] + sell_rates
    if len(buy_rates) > 0 and datetime.datetime.now() > day_end:
        buy_rates += [(buy_rates[-1][0], day_end)]
        sell_rates += [(sell_rates[-1][0], day_end)]

    max_buy_rate, min_buy_rate, avg_buy_rate = get_min_max_avg(buy_rates)
    max_sell_rate, min_sell_rate, avg_sell_rate = get_min_max_avg(sell_rates)

    day = rate_date.date()

    daily_exchange_rate = ExchangeRateDaily.query.filter_by(day=day).scalar()
    if daily_exchange_rate is None:
        new_daily_exchange_rate = ExchangeRateDaily(
            buy_usd_max=max_buy_rate,
            buy_usd_min=min_buy_rate,
            buy_usd_avg=avg_buy_rate,
            sell_usd_max=max_sell_rate,
            sell_usd_min=min_sell_rate,
            sell_usd_avg=avg_sell_rate,
            num_sell_transactions=num_sell_transactions,
            num_buy_transactions=num_buy_transactions,
            day=day
        )
        db.session.add(new_daily_exchange_rate)
    else:
        daily_exchange_rate.buy_usd_max = max_buy_rate
        daily_exchange_rate.buy_usd_min = min_buy_rate
        daily_exchange_rate.buy_usd_avg = avg_buy_rate
        daily_exchange_rate.sell_usd_max = max_sell_rate
        daily_exchange_rate.sell_usd_min = min_sell_rate
        daily_exchange_rate.sell_usd_avg = avg_sell_rate
        daily_exchange_rate.num_buy_transactions = num_buy_transactions
        daily_exchange_rate.num_sell_transactions = num_sell_transactions
        daily_exchange_rate.day = day

    db.session.commit()

    if prev_exchange_rate is not None and (day - prev_exchange_rate.date.date()).days > 1:
        update_daily_exchange_rate(rate_date - datetime.timedelta(days=1))


def populate_rates_tables():
    transactions: List[Transaction] = Transaction.query.order_by(Transaction.added_date).all()
    for transaction in transactions:
        update_exchange_rate_history(transaction)
        update_daily_exchange_rate(transaction.added_date)
