from ..model.transaction import Transaction
from .exchange_rate_updates import update_exchange_rate_history, update_daily_exchange_rate
from ..app import db


def add_transaction(transaction: Transaction):
    db.session.add(transaction)
    db.session.commit()
    update_exchange_rate_history(transaction)
    update_daily_exchange_rate(transaction.added_date)
