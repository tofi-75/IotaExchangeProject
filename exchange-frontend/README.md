- the index.js file is the starting point, it renders app.js which contains the navBar that is common to all pages.
- If the user is logged in as a teller the avaialble navigation options for them are: 
Offers representing the pending offers made by this teller and an option to delete the Offer, and view other offers corresponding to the same request.
Available requests representing the requests done by users to which the teller can post offer and view other offers.
History option where the teller checks all previous transactions

- If the user is logged in as a user the avaialble navigation options for them are:
Requests showing the pending requests for the user, and where the user can delete a request, post a new request, and view offers to pending requests. The user can interact with pending requests, reject or accept them.
History showing all past transactions.

Finally as features and structure:
The exchange rate and calculator and graphing functionalities are in the Home folder.

The tables representing requests and offers are in the Tables folder. It is a single Table.js file to which an argument "tableType" is passed and according to its value, various versions of the tables are rendered. This ensures an efficient code reusability. Based on the type of the table the components of the page differ.

For the graph, d3.js library is used, it allows interaction with the user where the user can move the cursor on the graph to check the nearest value and can click on the graph to get the information of the clicked date, and the linechart.js file contains all the description of the graph which is dynamic and changes accoridng to the selected start and end dates and the corresponding data obtained from the backend.






