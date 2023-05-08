from flask import Blueprint, abort, request, jsonify
from ..app import db
from ..model.transaction_request import TransactionRequest, transaction_request_schema, transaction_requests_schema
from ..model.offer import Offer, offer_schema, offers_schema
from ..helpers.authentication import create_token, extract_auth_token, decode_token, authenticate
from sqlalchemy.orm import joinedload

transaction_request_blueprint = Blueprint('transaction_request_blueprint', __name__)
transaction_requests_blueprint = Blueprint('transaction_requests_blueprint', __name__)


@transaction_requests_blueprint.route('', methods=['GET'])
def get_transaction_requests():
    user_id, is_teller = authenticate()

    if is_teller:
        transaction_requests = TransactionRequest.query.all()
        return jsonify(transaction_requests_schema.dump(transaction_requests))
    else:
        transaction_requests = TransactionRequest.query.filter_by(user_id=user_id).all()
        return jsonify(transaction_requests_schema.dump(transaction_requests))


@transaction_request_blueprint.route('', methods=['POST'])
def post_transaction_request():
    user_id, is_teller = authenticate()

    if is_teller:
        abort(403)

    try:
        transaction_request = TransactionRequest(
            amount=float(request.json['amount']),
            usd_to_lbp=bool(request.json['usd_to_lbp']),
            user_id=user_id
        )
        db.session.add(transaction_request)
        db.session.commit()
        return jsonify(transaction_request_schema.dump(transaction_request))
    except ValueError:
        abort(400)
    except KeyError:
        abort(400)


@transaction_request_blueprint.route('', methods=['DELETE'])
def delete_transaction_request():
    user_id, is_teller = authenticate()
    if is_teller:
        abort(403)
    transaction_request_id = request.args.get('request-id', default=None)
    Offer.query.filter_by(transaction_id=transaction_request_id).delete()
    transaction_request = TransactionRequest.query.filter_by(id=transaction_request_id).first()
    if transaction_request is None:
        abort(400)
    db.session.delete(transaction_request)
    db.session.commit()
    return jsonify(transaction_request_schema.dump(transaction_request))


