from flask import Flask, request, jsonify, abort
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_marshmallow import Marshmallow
from flask_bcrypt import Bcrypt
import jwt
import datetime

SECRET_KEY = "b'|\xe7\xbfU3`\xc4\xec\xa7\xa9zf:}\xb5\xc7\xb9\x139^3@Dv'"

app = Flask(__name__)
ma = Marshmallow(app)
CORS(app)
bcrypt = Bcrypt(app)

from .db_config import DB_CONFIG

app.config['SQLALCHEMY_DATABASE_URI'] = DB_CONFIG

db = SQLAlchemy(app)

from .model.user import User, user_schema
from .model.transaction import Transaction, transaction_schema, transactions_schema

def create_token(user_id):
    payload = {
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=4),
        'iat': datetime.datetime.utcnow(),
        'sub': user_id
    }
    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm='HS256'
    )

def extract_auth_token(authenticated_request):
    auth_header = authenticated_request.headers.get('Authorization')
    if auth_header:
        return auth_header.split(" ")[1]
    else:
        return None

def decode_token(token):
    payload = jwt.decode(token, SECRET_KEY, 'HS256')
    return payload['sub']

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
        lbp_amount = float(request.json['lbp_amount']),
        usd_amount = float(request.json['usd_amount']),
        usd_to_lbp = bool(request.json['usd_to_lbp']),
        user_id=user_id
    )
    db.session.add(new_transaction)
    db.session.commit()
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
    
@app.route('/exchangeRate', methods=['GET'])
def exchange_rate():
    start_date = datetime.datetime.now() + datetime.timedelta(days=-3)
    end_date = datetime.datetime.now()
    lbp_to_usd_exchanges = Transaction.query.filter(
        Transaction.added_date.between(start_date, end_date),
        Transaction.usd_to_lbp==False).all()
    usd_to_lbp_exchanges = Transaction.query.filter(
        Transaction.added_date.between(start_date, end_date),
        Transaction.usd_to_lbp==True).all()
    lbp_to_usd_rates = [exchange.lbp_amount / exchange.usd_amount for exchange in lbp_to_usd_exchanges]
    usd_to_lbp_rates = [exchange.lbp_amount / exchange.usd_amount for exchange in usd_to_lbp_exchanges]
    return jsonify(
        usd_to_lbp=sum(usd_to_lbp_rates)/len(usd_to_lbp_rates) if len(usd_to_lbp_rates)>0 else None,
        lbp_to_usd=sum(lbp_to_usd_rates)/len(lbp_to_usd_rates) if len(lbp_to_usd_rates)>0 else None
    )
