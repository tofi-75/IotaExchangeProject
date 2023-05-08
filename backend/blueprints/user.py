from flask import Blueprint, abort, request, jsonify
from ..app import db, bcrypt
from ..model.user import User, user_schema
from ..helpers.authentication import create_token

user_blueprint = Blueprint('user_blueprint', __name__)


@user_blueprint.route('/', methods=['POST'])
def user():
    if 'user_name' not in request.json or 'password' not in request.json or 'is_teller' not in request.json:
        abort(400)
    new_user = User(request.json['user_name'], request.json['password'], request.json['is_teller'])
    db.session.add(new_user)
    db.session.commit()
    return jsonify(user_schema.dump(new_user))


@user_blueprint.route('/authenticate', methods=['POST'])
def authenticate():
    if 'user_name' not in request.json or 'password' not in request.json or 'is_teller' not in request.json:
        abort(400)

    user_name = request.json['user_name']
    password = request.json['password']

    user = User.query.filter_by(user_name=user_name).first()
    is_teller = user.is_teller
    if user is None:
        abort(403)

    if not bcrypt.check_password_hash(user.hashed_password, password):
        abort(403)

    token = create_token(user.id, is_teller)
    return jsonify(token=token)
