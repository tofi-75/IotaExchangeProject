from ..app import db, ma, bcrypt
from flask_sqlalchemy.model import Model
from flask_marshmallow.schema import Schema
from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship

BaseModel: Model = db.Model
BaseSchema: Schema = ma.Schema


class User(BaseModel):

    id = Column(Integer, primary_key=True)
    user_name = Column(String(30), unique=True)
    hashed_password = Column(String(128))
    is_teller = Column(Boolean)

    transaction_requests = relationship('TransactionRequest', back_populates='user')
    offers = relationship('Offer', back_populates='teller')
    transactions = relationship('Transaction', back_populates='teller')

    def __init__(self, user_name, password, is_teller):
        super(User, self).__init__(user_name=user_name, is_teller=is_teller)
        self.hashed_password = bcrypt.generate_password_hash(password)


class UserSchema(BaseSchema):
    class Meta:
        fields = ("id", "user_name", "is_teller")
        model = User


user_schema = UserSchema()
