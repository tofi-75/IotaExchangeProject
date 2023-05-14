from flask import Flask, request, jsonify, abort
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_marshmallow import Marshmallow
from flask_bcrypt import Bcrypt
from .db_config import DB_CONFIG
import os

app = Flask(__name__)

DATABASE_URL = 'postgresql+psycopg2'+os.environ['DATABASE_URL'][os.environ['DATABASE_URL'].find(':'):]
app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL

ma = Marshmallow(app)
CORS(app)
bcrypt = Bcrypt(app)
db = SQLAlchemy(app)

from .fakes.transactions import generate_fake_transactions

# Importing and registering blueprints

from .blueprints.user import user_blueprint
from .blueprints.rates import rates_blueprint
from .blueprints.offer import offer_blueprint, offers_blueprint
from .blueprints.transaction import transaction_blueprint
from .blueprints.transaction_request import transaction_request_blueprint, transaction_requests_blueprint
from .blueprints.openapi import openapi_blueprint, swagger_ui_blueprint

app.register_blueprint(user_blueprint, url_prefix='/user')
app.register_blueprint(rates_blueprint, url_prefix='/rates')
app.register_blueprint(offer_blueprint, url_prefix='/offer')
app.register_blueprint(offers_blueprint, url_prefix='/offers')
app.register_blueprint(transaction_blueprint, url_prefix='/transaction')
app.register_blueprint(transaction_request_blueprint, url_prefix='/transaction-request')
app.register_blueprint(transaction_requests_blueprint, url_prefix='/transaction-requests')
app.register_blueprint(openapi_blueprint, url_prefix='/openapi-spec')
app.register_blueprint(swagger_ui_blueprint, url_prefix='/swagger-ui')

with app.app_context():
    db.create_all()
    # Uncomment to generate fake transactions ONLY ONCE, comment it back
    # generate_fake_transactions(days_back=10, transactions_per_day=10)
