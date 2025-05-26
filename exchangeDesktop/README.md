#Desktop Client
This is the  SARREF desktop app . It is a JavaFX exchange rate application that utilizes GSON to communicate with the backend.
Below are some off its functionalities.

##Installation
Unzip the app and open it in your preferred IDE. Open and run the Main Java class. 
If you get an error with retrofit, make sure the converter-gson dependency is installed and reload the pom file.
The app should run correctly.

##Architecture
The app is split into multiple modules. Each module is responsible for one functionality.

###User Authentication
The Login and Register pages are responsible for authenticating the user. These pages are only visible for logged out users.
Users can be of two types: Users and Tellers. More about their roles and permissions below.

###Transactions
The standard transaction functionality has been left intact. It is implemented within the rates page.

###Graphing
Within the rates page, we have added a graphing functionality. 
The user can input the desired timeframe, and a graph of the average daily rates is displayed.

###Statistics
Within the graphing functionality, The maximum, minimum and average transaction rate of the most recent day are displayed.

###Requests and Offers
SARREF also provides interaction between users and tellers. Users and teller can make online bidding and transactions.
####Users
Each user has the option to request a certain amount of money exchanged. 
Users post a transaction request by adding a request to the pending requests page.
Users also have the option to view their pending requests and delete any previous pending requests.
Users can also see any tellers' offers to their request.
Users can either accept or reject offers to their request.
After a transaction is complete, Users can view their transaction history in the Transactions page.
####Tellers
Tellers can see all the Users' pending requests, as well the anonymous offers to each request.
Tellers have the option to add, edit, and delete an offer in the Pending Offers page.
Tellers can also view their transaction history in the Transactions page after a transaction is accepted.

###Calculator
The calculator gives the exchange value of an inputted amount in the requested currency. It currently converts LBP and USD currencies.
THe end goal is to call extrenal API's to convert betwwen a wide range of currencies.

##Design and Layout
Both the React App and the Desktop app use the same color schemes. A Logo was developped and added to the taskbar icon of the app.
