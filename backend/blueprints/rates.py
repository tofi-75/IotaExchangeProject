from flask import Blueprint, abort, request, jsonify
from ..model.exchange_rate_daily import ExchangeRateDaily, exchange_rate_daily_schema
from ..model.exchange_rate_history import ExchangeRateHistory, exchange_rate_history_schema

rates_blueprint = Blueprint('rates_blueprint', __name__)


@rates_blueprint.route('/current', methods=['GET'])
def get_current_rate():
    latest_exchange_rate: ExchangeRateHistory = ExchangeRateHistory.query \
        .order_by(ExchangeRateHistory.date.desc()).first()

    return jsonify(
        usd_to_lbp=latest_exchange_rate.sell_usd_rate if latest_exchange_rate is not None else None,
        lbp_to_usd=latest_exchange_rate.buy_usd_rate if latest_exchange_rate is not None else None
    )


@rates_blueprint.route('/history', methods=['GET'])
def get_daily_rates():
    start_day = request.args.get('startDay', default=None)
    end_day = request.args.get('endDay', default=None)
    daily_rates = ExchangeRateDaily.query
    if start_day is not None:
        daily_rates = daily_rates.filter(ExchangeRateDaily.day >= start_day)
    if end_day is not None:
        daily_rates = daily_rates.filter(ExchangeRateDaily.day <= end_day)
    daily_rates = daily_rates.order_by(ExchangeRateDaily.day).all()

    return jsonify(exchange_rate_daily_schema.dump(daily_rates))
