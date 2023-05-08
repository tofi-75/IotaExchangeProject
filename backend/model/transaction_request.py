from ..app import db, ma
from flask_sqlalchemy.model import Model
from flask_marshmallow.schema import Schema
from sqlalchemy import Column, Integer, Float, DateTime, Boolean, String, ForeignKey
from sqlalchemy.orm import relationship
import datetime
from .offer import OfferSchema

BaseModel: Model = db.Model
BaseSchema: Schema = ma.Schema


class TransactionRequest(BaseModel):
    id = Column(Integer, primary_key=True, nullable=False)
    amount = Column(Float, nullable=False)
    usd_to_lbp = Column(Boolean, nullable=False)
    added_date = Column(DateTime)
    num_offers = Column(Integer, nullable=False)

    user_id = Column(Integer, ForeignKey('user.id'), nullable=False)

    user = relationship('User', back_populates='transaction_requests')
    offers = relationship('Offer', back_populates='transaction_request')

    def __init__(self, amount, usd_to_lbp, user_id):
        super(TransactionRequest, self).__init__(
            amount=amount,
            usd_to_lbp=usd_to_lbp,
            user_id=user_id,
            added_date=datetime.datetime.now(),
            num_offers=0)


class TransactionRequestSchema(BaseSchema):
    class Meta:
        fields = ("id", "amount", "usd_to_lbp", "added_date", "user_id", "num_offers")
        model = TransactionRequest
    offers = ma.Nested(OfferSchema, many=True)


transaction_request_schema = TransactionRequestSchema()
transaction_requests_schema = TransactionRequestSchema(many=True)
