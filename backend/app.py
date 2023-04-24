from flask import Flask, request, jsonify, abort
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_marshmallow import Marshmallow
from flask_bcrypt import Bcrypt
import jwt
import datetime

from .db_config import DB_CONFIG

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = DB_CONFIG

ma = Marshmallow(app)
CORS(app)
bcrypt = Bcrypt(app)
db = SQLAlchemy(app)

from .model.user import User, user_schema
from .model.transaction import Transaction, transaction_schema, transactions_schema
from .model.exchange_rate_daily import ExchangeRateDaily, exchange_rate_daily_schema
from .model.exchange_rate_history import ExchangeRateHistory, exchange_rate_history_schema
from .helpers.authorization import create_token, extract_auth_token, decode_token
from .helpers.exchange_rate_updates import update_exchange_rate_history, update_daily_exchange_rate, \
    populate_rates_tables

with app.app_context():
    db.create_all()
    # populate_rates_tables()

@app.route('/transaction', methods=['POST'])
def create_transaction():
    token = extract_auth_token(request)
    if token is not None:
        try:
            user_id = decode_token(token)
        except jwt.ExpiredSignatureError:
            abort(403)
        except jwt.InvalidTokenError:
            abort(403)
    else:
        user_id = None

    new_transaction = Transaction(
        lbp_amount=float(request.json['lbp_amount']),
        usd_amount=float(request.json['usd_amount']),
        usd_to_lbp=bool(request.json['usd_to_lbp']),
        user_id=user_id
    )
    db.session.add(new_transaction)
    db.session.commit()
    update_exchange_rate_history(new_transaction)
    update_daily_exchange_rate(new_transaction.added_date)
    return jsonify(transaction_schema.dump(new_transaction))


@app.route('/transaction', methods=['GET'])
def get_transaction():
    token = extract_auth_token(request)
    if token is None:
        abort(403)

    try:
        user_id = decode_token(token)
        transactions = Transaction.query.filter_by(user_id=user_id).all()
        return jsonify(transactions_schema.dump(transactions))
    except jwt.ExpiredSignatureError:
        abort(403)
    except jwt.InvalidTokenError:
        abort(403)


@app.route('/user', methods=['POST'])
def user():
    if 'user_name' not in request.json or 'password' not in request.json:
        abort(400)
    new_user = User(request.json['user_name'], request.json['password'])
    db.session.add(new_user)
    db.session.commit()
    return jsonify(user_schema.dump(new_user))


@app.route('/authentication', methods=['POST'])
def authentication():
    if 'user_name' not in request.json or 'password' not in request.json:
        abort(400)

    user_name = request.json['user_name']
    password = request.json['password']

    user = User.query.filter_by(user_name=user_name).first()
    if user is None:
        abort(403)

    if not bcrypt.check_password_hash(user.hashed_password, password):
        abort(403)

    token = create_token(user.id)
    return jsonify(token=token)


@app.route('/getCurrentRate', methods=['GET'])
def get_current_rate():
    latest_exchange_rate: ExchangeRateHistory = ExchangeRateHistory.query \
        .order_by(ExchangeRateHistory.date.desc()).first()

    return jsonify(
        usd_to_lbp=latest_exchange_rate.sell_usd_rate,
        lbp_to_usd=latest_exchange_rate.buy_usd_rate
    )


@app.route('/getDailyRates', methods=['GET'])
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
