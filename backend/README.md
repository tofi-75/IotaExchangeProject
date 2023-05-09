# Backend
Maintained and developed by Nader Zantout ([SpicePlusPlus](https://github.com/SpicePlusPlus))

To run the server:

    pip install -r requirements.txt
    flask run
    
## Note
After pulling the repo, add the file db_config.py to the backend/ folder (where app.py is located) and add the following constant depending on what your MySQL configuration is:

    DB_CONFIG = 'mysql+pymysql://[user]:[pass]@localhost:[port]/exchange'

## OpenAPI Specification
The OpenAPI documentation for this backend's endpoints is in swagger/swagger.yaml. 

## Project structure
app.py is the main file for flask. Various blueprints registered in app.py are found in the blueprints folder, helper functions are found in the helpers folder, and SQLAlchemy ORM tables are in the model folder.

## Functionality
### Statistics and Graphing
A history of exchange rates, which changes for every valid transaction, is stored in an exchange_rate_history table. The daily average, minimum, and maximum rates are then computed from that table for both the buy and sell rates, where the average rate is the time average rather than the average over the number of transactions during that day.
### Transaction Platform
Two different user types have been created to support this platform: Users, and Tellers. Users can create transaction requests, where they post a certain amount of either USD (selling) or LBP (buying). Tellers may then see the current pending transaction requests, and may choose to make an offer to any of the users. A user may then choose to accept or reject any particular offer. A user may choose to delete a previously posted transaction request, and a teller may choose to delete a posted offer. Once a transaction is completed, it is added to the transaction history, used to compute the newest exchange rate, and the user and teller who performed the transaction may see their history.
