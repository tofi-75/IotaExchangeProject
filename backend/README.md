# Backend
Maintained and developed by Nader Zantout ([SpicePlusPlus](https://github.com/SpicePlusPlus))

## Note
After pulling the repo, add the file db_config.py to the backend/ folder (where app.py is located) and add the following constant depending on what your MySQL configuration is:

    DB_CONFIG = 'mysql+pymysql://[user]:[pass]@localhost:[port]/exchange'

## Another note
Uncomment populate_rates_tables() on line 29 in app.py the first time you run to generate the new tables, then comment it once more
