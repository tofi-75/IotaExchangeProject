import datetime
import jwt
from flask import request, abort

SECRET_KEY = "b'|\xe7\xbfU3`\xc4\xec\xa7\xa9zf:}\xb5\xc7\xb9\x139^3@Dv'"


def create_token(user_id, is_teller):
    payload = {
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=4),
        'iat': datetime.datetime.utcnow(),
        'sub': user_id,
        'is_teller': is_teller
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
    return payload['sub'], payload['is_teller']


def authenticate():
    token = extract_auth_token(request)
    if token is None:
        abort(403)
    try:
        user_id, is_teller = decode_token(token)
    except jwt.ExpiredSignatureError:
        abort(403)
    except jwt.InvalidTokenError:
        abort(403)

    return user_id, is_teller
