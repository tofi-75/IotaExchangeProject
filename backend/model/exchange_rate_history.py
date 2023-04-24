from ..app import db, ma
from flask_sqlalchemy.model import Model
from flask_marshmallow.schema import Schema
from sqlalchemy import Column, Integer, Float, DateTime

BaseModel: Model = db.Model
BaseSchema: Schema = ma.Schema


class ExchangeRateHistory(BaseModel):

    id = Column(Integer, primary_key=True, nullable=False)
    buy_usd_rate = Column(Float, nullable=True)
    sell_usd_rate = Column(Float, nullable=True)
    num_sell_transactions = Column(Integer, nullable=False)
    num_buy_transactions = Column(Integer, nullable=False)
    date = Column(DateTime, nullable=False)

    def __init__(
            self,
            buy_usd_rate,
            sell_usd_rate,
            num_sell_transactions,
            num_buy_transactions,
            date
    ):
        super(ExchangeRateHistory, self).__init__(
            buy_usd_rate=buy_usd_rate,
            sell_usd_rate=sell_usd_rate,
            num_sell_transactions=num_sell_transactions,
            num_buy_transactions=num_buy_transactions,
            date=date
        )


class ExchangeRateHistorySchema(ma.Schema):
    class Meta:
        fields = (
            "id",
            "buy_usd_rate",
            "sell_usd_rate",
            "num_sell_transactions",
            "num_buy_transactions",
            "date"
        )
        model = ExchangeRateHistory


exchange_rate_history_schema = ExchangeRateHistorySchema()
