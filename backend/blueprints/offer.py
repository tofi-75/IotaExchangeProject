from flask import Blueprint, abort, request, jsonify
from typing import List
import jwt
from ..app import db
from ..model.offer import Offer, offer_schema, offers_schema
from ..model.transaction_request import TransactionRequest, transaction_requests_schema, transaction_request_schema
from ..model.transaction import Transaction, transaction_schema, transactions_schema
from ..helpers.authentication import create_token, extract_auth_token, decode_token, authenticate
from ..helpers.exchange_rate_updates import update_exchange_rate_history, update_daily_exchange_rate
from sqlalchemy.orm import joinedload

offer_blueprint = Blueprint('offer_blueprint', __name__)
offers_blueprint = Blueprint('offers_blueprint', __name__)


@offers_blueprint.route('', methods=['GET'])
def get_offers():
    user_id, is_teller = authenticate()
    transaction_request_id = request.args.get('request-id', default=None)
    if is_teller:
        if transaction_request_id is not None:
            transaction_request: TransactionRequest = TransactionRequest.query.filter_by(id=transaction_request_id).options(
                joinedload(TransactionRequest.offers)
            ).first()
            if transaction_request is None:
                abort(400)
            for offer in transaction_request.offers:
                if offer.teller_id != user_id:
                    offer.teller_id = None
            transaction_request_json = transaction_request_schema.dump(transaction_request)
            transaction_request_json['offers'] = offers_schema.dump(transaction_request.offers)
            return jsonify(transaction_request_json)
        else:
            transaction_requests: List[TransactionRequest] = TransactionRequest.query\
                .join(TransactionRequest.offers).filter(Offer.teller_id == user_id).all()
            transaction_requests_json = transaction_requests_schema.dump(transaction_requests)
            for i, tr in enumerate(transaction_requests_json):
                tr['offers'] = offers_schema.dump(transaction_requests[i].offers)
            return jsonify(transaction_requests_json)
    else:
        transaction_request: TransactionRequest = TransactionRequest.query.filter_by(id=transaction_request_id).options(
            joinedload(TransactionRequest.offers)
        ).first()
        if transaction_request is None:
            abort(400)
        transaction_request_json = transaction_request_schema.dump(transaction_request)
        transaction_request_json['offers'] = offers_schema.dump(transaction_request.offers)
        return jsonify(transaction_request_json)


@offer_blueprint.route('', methods=['POST'])
def post_offer():
    user_id, is_teller = authenticate()
    if not is_teller:
        abort(403)
    try:
        transaction_request: TransactionRequest = TransactionRequest.query.filter_by(id=request.json['transaction_id'])\
            .first()
        if transaction_request is None:
            abort(400)
        transaction_request.num_offers += 1
        offer = Offer(
            amount=float(request.json['amount']),
            transaction_id=request.json['transaction_id'],
            teller_id=user_id,
        )
        db.session.add(offer)
        db.session.commit()
        return jsonify(offer_schema.dump(offer))
    except ValueError:
        abort(400)
    except KeyError:
        abort(400)


@offer_blueprint.route('', methods=['DELETE'])
def delete_offer():
    user_id, is_teller = authenticate()
    if not is_teller:
        abort(403)
    offer_id = request.args.get('offer-id')
    offer: Offer = Offer.query.filter_by(id=offer_id).first()
    if offer is None:
        abort(400)
    if offer.teller_id != user_id:
        abort(403)
    transaction_request: TransactionRequest = TransactionRequest.query.filter_by(id=offer.transaction_id)\
        .first()
    transaction_request.num_offers -= 1
    db.session.delete(offer)
    db.session.commit()
    return jsonify(offer_schema.dump(offer))


@offer_blueprint.route('/accept', methods=['POST'])
def accept_offer():
    user_id, is_teller = authenticate()
    if is_teller:
        abort(403)
    try:
        offer: Offer = Offer.query.filter_by(id=request.json['offer_id']).first()
        if offer is None:
            abort(400)
        transaction_id = offer.transaction_id
        transaction_request: TransactionRequest = TransactionRequest.query.filter_by(id=transaction_id).first()
        usd_to_lbp = transaction_request.usd_to_lbp
        transaction = Transaction(
            usd_to_lbp=usd_to_lbp,
            usd_amount=transaction_request.amount if usd_to_lbp else offer.amount,
            lbp_amount=offer.amount if usd_to_lbp else transaction_request.amount,
            teller_id=offer.teller_id,
            user_id=user_id
        )
        db.session.add(transaction)
        db.session.commit()
        update_exchange_rate_history(transaction)
        update_daily_exchange_rate(transaction.added_date)
        offer_json = offer_schema.dump(offer)
        Offer.query.filter_by(transaction_id=transaction_id).delete()
        TransactionRequest.query.filter_by(id=transaction_id).delete()
        db.session.commit()
        return jsonify(offer_schema.dump(offer_json))
    except KeyError:
        abort(400)


@offer_blueprint.route('/reject', methods=['POST'])
def reject_offer():
    user_id, is_teller = authenticate()
    if is_teller:
        abort(403)
    try:
        offer: Offer = Offer.query.filter_by(id=request.json['offer_id']).first()
        if offer is None:
            abort(400)
        transaction_request: TransactionRequest = TransactionRequest.query.filter_by(id=offer.transaction_id)\
            .first()
        if user_id != transaction_request.user_id:
            abort(403)
        transaction_request.num_offers -= 1
        offer_json = offer_schema.dump(offer)
        db.session.delete(offer)
        db.session.commit()
        return jsonify(offer_json)
    except KeyError:
        abort(400)
