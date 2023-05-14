from flask import Blueprint, abort, request, jsonify, render_template
import yaml
from pathlib import Path

spec_path = Path(__file__).parents[1] / 'openapi-spec' / 'openapi.yaml'

openapi_blueprint = Blueprint('openapi_blueprint', __name__)
swagger_ui_blueprint = Blueprint('swagger_ui_blueprint', __name__)


@openapi_blueprint.route('', methods=['GET'])
def get_openapi_spec():
    with open(spec_path, 'r') as f:
        return jsonify(yaml.safe_load(f))


@swagger_ui_blueprint.route('', methods=['GET'])
def get_swagger_ui():
    return render_template('swagger-ui.html')
