import "./App.css";
import UserCredentialsDialog from "./UserCredentialsDialog/UserCredentialsDialog";
import React, { useCallback } from "react";
import { useState, useEffect } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { DataGrid } from "@mui/x-data-grid";
import { getUserToken, saveUserToken, clearUserToken } from "./localStorage";
import { DatePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import LineChart from "./linechart";

var SERVER_URL = "http://127.0.0.1:5000";

const States = {
  PENDING: "PENDING",
  USER_CREATION: "USER_CREATION",
  USER_LOG_IN: "USER_LOG_IN",
  USER_AUTHENTICATED: "USER_AUTHENTICATED",
};

function App() {
  let [buyUsdRate, setBuyUsdRate] = useState(null);
  let [sellUsdRate, setSellUsdRate] = useState(null);
  let [lbpInput, setLbpInput] = useState("");
  let [usdInput, setUsdInput] = useState("");
  let [transactionType, setTransactionType] = useState("usd-to-lbp");
  let [authState, setAuthState] = useState(States.PENDING);
  let [userToken, setUserToken] = useState(getUserToken());
  let [calculatorInput, setCalculatorInput] = useState("");
  let [calculatorInputType, setCalculatorInputType] = useState("usd");
  let [calculatorOutput, setCalculatorOutput] = useState(null);
  let [calculatorOutputType, setCalculatorOutputType] = useState(null);
  let [userTransactions, setUserTransactions] = useState([]);
  let [fluctuationsStart, setFluctuationsStart] = useState("");

  function fluctuations_data() {
    //if (fluctuationsPeriod=="1month"){
    //}
    //else if(fluctuationsPeriod=="6month"){
    //}
    //else{
    //}
  }

  function login(username, password) {
    return fetch(`${SERVER_URL}/authentication`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_name: username,
        password: password,
      }),
    })
      .then((response) => response.json())
      .then((body) => {
        setAuthState(States.USER_AUTHENTICATED);
        setUserToken(body.token);
        saveUserToken(body.token);
      });
  }
  function createUser(username, password) {
    return fetch(`${SERVER_URL}/user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_name: username,
        password: password,
      }),
    }).then((response) => login(username, password));
  }

  function fetchRates() {
    fetch(`${SERVER_URL}/exchangeRate`)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setBuyUsdRate(data.usd_to_lbp.toFixed(2));
        setSellUsdRate(data.lbp_to_usd.toFixed(2));
      });
  }

  useEffect(fetchRates, []);

  function addItem() {
    if (transactionType === "usd-to-lbp") {
      transactionType = 1;
    } else {
      transactionType = 0;
    }

    let data_in = {
      usd_amount: parseInt(usdInput),
      lbp_amount: parseInt(lbpInput),
      usd_to_lbp: transactionType,
    };

    if (userToken) {
      fetch(`${SERVER_URL}/transaction`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify(data_in),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          fetchRates();
          fetchUserTransactions();
          setUsdInput("");
          setLbpInput("");
        });
    } else {
      fetch(`${SERVER_URL}/transaction`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data_in),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          fetchRates();
          setUsdInput("");
          setLbpInput("");
        });
    }
  }

  function logout() {
    setUserToken(null);
    clearUserToken();
  }
  function convert() {
    if (calculatorInput.length == 0 || parseFloat(calculatorInput) <= 0) {
      console.log("Invalid input");
    } else {
      if (buyUsdRate == 0 || sellUsdRate == 0) {
        console.log("Rate not available");
      } else {
        if (calculatorInputType === "lbp") {
          setCalculatorOutput(calculatorInput / buyUsdRate);
          setCalculatorOutputType("USD");
        } else {
          setCalculatorOutput(calculatorInput * sellUsdRate);
          setCalculatorOutputType("LBP");
        }
      }
    }
  }

  const fetchUserTransactions = useCallback(() => {
    fetch(`${SERVER_URL}/transaction`, {
      headers: {
        Authorization: `bearer ${userToken}`,
      },
    })
      .then((response) => response.json())
      .then((transactions) => setUserTransactions(transactions));
  }, [userToken]);
  useEffect(() => {
    if (userToken) {
      fetchUserTransactions();
    }
  }, [fetchUserTransactions, userToken]);
  const data = [
    { date: new Date("2022-01-01"), rate: 10000 },
    { date: new Date("2022-01-02"), rate: 20000 },
    { date: new Date("2022-01-10"), rate: 18000 },
    { date: new Date("2022-01-20"), rate: 30000 },
    { date: new Date("2022-02-04"), rate: 10000 },
    { date: new Date("2022-03-05"), rate: 29000 },
    // Add more data here
  ];

  return (
    <div className="App">
      <header>
        <meta charSet="UTF-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>LBP Exchange Tracker</title>
      </header>

      <UserCredentialsDialog
        open={authState == States.USER_CREATION}
        onSubmit={createUser}
        onClose={() => setAuthState(States.PENDING)}
        title={"Welcome"}
        submitText={"Register"}
      />
      <UserCredentialsDialog
        open={authState == States.USER_LOG_IN}
        onSubmit={login}
        onClose={() => setAuthState(States.PENDING)}
        title={"Welcome"}
        submitText={"Login"}
      />
      <Snackbar
        elevation={6}
        variant="filled"
        open={authState === States.USER_AUTHENTICATED}
        autoHideDuration={2000}
        onClose={() => setAuthState(States.PENDING)}
      >
        <Alert severity="success">Success</Alert>
      </Snackbar>

      <div>
        <div className="header">
          <AppBar position="static">
            <Toolbar classes={{ root: "nav" }}>
              <Typography variant="h5">Currency Exchange</Typography>
              <div>
                {userToken !== null ? (
                  <Button color="inherit" onClick={logout}>
                    Logout
                  </Button>
                ) : (
                  <div>
                    <Button
                      color="inherit"
                      onClick={() => setAuthState(States.USER_CREATION)}
                    >
                      Register
                    </Button>
                    <Button
                      color="inherit"
                      onClick={() => setAuthState(States.USER_LOG_IN)}
                    >
                      Login
                    </Button>
                  </div>
                )}
              </div>
            </Toolbar>
          </AppBar>
        </div>
      </div>

      <div className="wrapper">
        <Typography variant="h4">Today's Exchange Rate</Typography>
        <p>LBP to USD Exchange Rate</p>
        <Typography variant="h6">
          Buy USD:{" "}
          <span id="buy-usd-rate">{buyUsdRate ? buyUsdRate : null}</span>
        </Typography>
        <Typography variant="h6">
          Sell USD:{" "}
          <span id="sell-usd-rate">{sellUsdRate ? sellUsdRate : null}</span>
        </Typography>
        <hr />

        <Typography variant="h4">Fluctuations</Typography>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker label="Starting Date" value={fluctuationsStart} 
          onChange={setFluctuationsStart}/>
        </LocalizationProvider>

        <div>
          <LineChart data={data} />
        </div>
        <hr />

        <div className="calculator">
          <Typography variant="h4">Calculator</Typography>
          <div className="calc_input">
            <TextField
              id="calculator_input"
              label="Amount to convert"
              variant="outlined"
              type="number"
              value={calculatorInput}
              onChange={(e) => setCalculatorInput(e.target.value)}
            />
          </div>

          <Select
            id="calculator_input_type"
            value={calculatorInputType}
            label="Input Currency"
            onChange={(e) => setCalculatorInputType(e.target.value)}
          >
            <MenuItem value="usd">USD</MenuItem>
            <MenuItem value="lbp">LBP</MenuItem>
          </Select>
          <span>
            <Button variant="contained" onClick={convert}>
              Convert
            </Button>
          </span>

          <Typography variant="h6">
            {calculatorOutput ? "Conversion Result: " : ""}
            <span id="calculator-output">
              {calculatorOutput ? calculatorOutput.toFixed(2) : ""}
              {"         "}
              {calculatorOutputType ? calculatorOutputType : ""}
            </span>
          </Typography>
        </div>
      </div>

      <div className="wrapper">
        <Typography variant="h4"> Record recent transaction</Typography>
        <form name="transaction-entry">
          <div className="amount-input">
            <TextField
              id="lbp-amount"
              label="LBP Amount"
              variant="outlined"
              type="number"
              value={lbpInput}
              onChange={(e) => setLbpInput(e.target.value)}
            />
          </div>
          <div className="amount-input">
            <TextField
              id="usd-amount"
              label="USD Amount"
              variant="outlined"
              type="number"
              value={usdInput}
              onChange={(e) => setUsdInput(e.target.value)}
            />
          </div>
          <Select
            id="transaction-type"
            value={transactionType}
            label="Input Currency"
            onChange={(e) => setTransactionType(e.target.value)}
          >
            <MenuItem value="usd-to-lbp">USD to LBP</MenuItem>
            <MenuItem value="usd-to-lbp">LBP to USD</MenuItem>
          </Select>

          <Button variant="contained" onClick={addItem}>
            Add
          </Button>
        </form>
      </div>
      {userToken && (
        <div className="wrapper">
          <Typography variant="h5">Your Transactions</Typography>
          <DataGrid
            columns={[
              { field: "id" },
              { field: "added_date" },
              { field: "usd_amount" },
              { field: "lbp_amount" },
              { field: "usd_to_lbp" },
              { field: "user_id" },
            ]}
            rows={userTransactions}
            autoHeight
          />
        </div>
      )}
    </div>
  );
}

export default App;
