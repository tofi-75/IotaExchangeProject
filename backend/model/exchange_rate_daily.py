from ..app import db, ma
from flask_sqlalchemy.model import Model
from flask_marshmallow.schema import Schema
from sqlalchemy import Column, Integer, Float, Date

BaseModel: Model = db.Model
BaseSchema: Schema = ma.Schema


class ExchangeRateDaily(BaseModel):

    id = Column(Integer, primary_key=True, nullable=False)
    buy_usd_max = Column(Float, nullable=True)
    buy_usd_min = Column(Float, nullable=True)
    buy_usd_avg = Column(Float, nullable=True)
    sell_usd_max = Column(Float, nullable=True)
    sell_usd_min = Column(Float, nullable=True)
    sell_usd_avg = Column(Float, nullable=True)
    num_sell_transactions = Column(Integer, nullable=False)
    num_buy_transactions = Column(Integer, nullable=False)
    day = Column(Date, unique=True, nullable=False)

    def __init__(
            self,
            buy_usd_max,
            buy_usd_min,
            buy_usd_avg,
            sell_usd_max,
            sell_usd_min,
            sell_usd_avg,
            num_sell_transactions,
            num_buy_transactions,
            day
    ):
        super(ExchangeRateDaily, self).__init__(
            buy_usd_max=buy_usd_max,
            buy_usd_min=buy_usd_min,
            buy_usd_avg=buy_usd_avg,
            sell_usd_max=sell_usd_max,
            sell_usd_min=sell_usd_min,
            sell_usd_avg=sell_usd_avg,
            num_sell_transactions=num_sell_transactions,
            num_buy_transactions=num_buy_transactions,
            day=day
        )


class ExchangeRateDailySchema(ma.Schema):
    class Meta:
        fields = (
            "id",
            "buy_usd_max",
            "buy_usd_min",
            "buy_usd_avg",
            "sell_usd_max",
            "sell_usd_min",
            "sell_usd_avg",
            "num_sell_transactions",
            "num_buy_transactions",
            "day"
        )
        model = ExchangeRateDaily


exchange_rate_daily_schema = ExchangeRateDailySchema(many=True)
