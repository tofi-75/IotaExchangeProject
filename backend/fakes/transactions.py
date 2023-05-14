from ..model.transaction import Transaction
from ..helpers.transactions import add_transaction
import datetime
import random


def generate_fake_transactions(days_back: int = 10, transactions_per_day: int = 10):
    for i in range(days_back):
        randomized_rate = random.randrange(15000, 300000, 1000)
        transaction_day = datetime.date.today() - datetime.timedelta(days=days_back-i)
        for j in range(transactions_per_day):
            transaction_date = datetime.datetime.combine(transaction_day, datetime.time(10))\
                               + datetime.timedelta(hours=j*10/transactions_per_day)
            usd_amount = random.randint(1, 200)
            lbp_amount = randomized_rate * (usd_amount + random.random())
            transaction = Transaction(
                usd_amount=usd_amount,
                lbp_amount=lbp_amount,
                usd_to_lbp=random.randint(0, 1) == 1,
                user_id=1,
                teller_id=1,
                added_date=transaction_date
            )
            add_transaction(transaction)