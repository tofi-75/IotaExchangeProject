from ..app import db, ma, bcrypt
from flask_sqlalchemy.model import Model
from flask_marshmallow.schema import Schema
from sqlalchemy import Column, Integer, String

BaseModel: Model = db.Model
BaseSchema: Schema = ma.Schema


class User(BaseModel):

    id = Column(Integer, primary_key=True)
    user_name = Column(String(30), unique=True)
    hashed_password = Column(String(128))

    def __init__(self, user_name, password):
        super(User, self).__init__(user_name=user_name)
        self.hashed_password = bcrypt.generate_password_hash(password)


class UserSchema(BaseSchema):
    class Meta:
        fields = ("id", "user_name")
        model = User


user_schema = UserSchema()
