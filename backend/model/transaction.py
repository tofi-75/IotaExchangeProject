from ..app import db, ma
from flask_sqlalchemy.model import Model
from flask_marshmallow.schema import Schema
from sqlalchemy import Column, Integer, Float, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
import datetime

BaseModel: Model = db.Model
BaseSchema: Schema = ma.Schema


class Transaction(BaseModel):
    id = Column(Integer, primary_key=True, nullable=False)
    usd_amount = Column(Float, nullable=False)
    lbp_amount = Column(Float, nullable=False)
    usd_to_lbp = Column(Boolean, nullable=False)
    added_date = Column(DateTime)
    teller_id = Column(Integer, ForeignKey('user.id'), nullable=False)
    user_id = Column(Integer, nullable=True)

    teller = relationship('User', back_populates='transactions')

    def __init__(self, usd_amount, lbp_amount, usd_to_lbp, teller_id, user_id, added_date):
        super(Transaction, self).__init__(
            usd_amount=usd_amount,
            lbp_amount=lbp_amount,
            usd_to_lbp=usd_to_lbp,
            teller_id=teller_id,
            user_id=user_id,
            added_date=added_date)  # Transactions are saved in server time, GMT+2 rather than UTC


class TransactionSchema(BaseSchema):
    class Meta:
        fields = ("id", "usd_amount", "lbp_amount", "usd_to_lbp", "added_date", "teller_id", "user_id")
        model = Transaction


transaction_schema = TransactionSchema()
transactions_schema = TransactionSchema(many=True)
