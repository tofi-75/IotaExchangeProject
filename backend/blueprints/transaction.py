from flask import Blueprint, abort, request, jsonify
import jwt
from ..app import db
from ..model.transaction import Transaction, transaction_schema, transactions_schema
from ..helpers.exchange_rate_updates import update_exchange_rate_history, update_daily_exchange_rate
from ..helpers.authentication import create_token, extract_auth_token, decode_token, authenticate

transaction_blueprint = Blueprint('transaction_blueprint', __name__)


@transaction_blueprint.route('/', methods=['POST'])
def create_transaction():
    teller_id, is_teller = authenticate()

    if not is_teller:
        abort(403)

    try:
        new_transaction = Transaction(
            lbp_amount=float(request.json['lbp_amount']),
            usd_amount=float(request.json['usd_amount']),
            usd_to_lbp=bool(request.json['usd_to_lbp']),
            teller_id=teller_id,
            user_id=None
        )
        db.session.add(new_transaction)
        db.session.commit()
        update_exchange_rate_history(new_transaction)
        update_daily_exchange_rate(new_transaction.added_date)
        return jsonify(transaction_schema.dump(new_transaction))
    except ValueError:
        abort(400)
    except KeyError:
        abort(400)


@transaction_blueprint.route('/', methods=['GET'])
def get_transaction():
    token = extract_auth_token(request)
    if token is None:
        abort(403)

    try:
        user_id, _ = decode_token(token)
        transactions = Transaction.query.filter_by(user_id=user_id).all()
        return jsonify(transactions_schema.dump(transactions))
    except jwt.ExpiredSignatureError:
        abort(403)
    except jwt.InvalidTokenError:
        abort(403)
