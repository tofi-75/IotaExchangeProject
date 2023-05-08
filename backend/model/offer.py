from ..app import db, ma
from flask_sqlalchemy.model import Model
from flask_marshmallow.schema import Schema
from sqlalchemy import Column, Integer, Float, DateTime, Boolean, ForeignKey
import datetime
from sqlalchemy.orm import relationship


BaseModel: Model = db.Model
BaseSchema: Schema = ma.Schema


class Offer(BaseModel):
    id = Column(Integer, primary_key=True, nullable=False)
    amount = Column(Float, nullable=False)
    added_date = Column(DateTime)

    teller_id = Column(Integer, ForeignKey('user.id'), nullable=False)
    transaction_id = Column(Integer, ForeignKey('transaction_request.id'), nullable=False)

    teller = relationship('User', back_populates='offers')
    transaction_request = relationship('TransactionRequest', back_populates='offers')

    def __init__(self, amount, teller_id, transaction_id):
        super(Offer, self).__init__(
            amount=amount,
            teller_id=teller_id,
            transaction_id=transaction_id,
            added_date=datetime.datetime.now())


class OfferSchema(BaseSchema):
    class Meta:
        fields = ("id", "amount", "usd_to_lbp", "added_date", "teller_id", "transaction_id")
        model = Offer


offer_schema = OfferSchema()
offers_schema = OfferSchema(many=True)
