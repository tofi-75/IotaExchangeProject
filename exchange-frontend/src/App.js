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
import dayjs from "dayjs";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import MyRequests from './myrequests';
var SERVER_URL = "http://127.0.0.1:5000";

const States = {
  PENDING: "PENDING",
  USER_CREATION: "USER_CREATION",
  USER_LOG_IN: "USER_LOG_IN",
  USER_AUTHENTICATED: "USER_AUTHENTICATED",
};

function App() {
  const data = [
    { date: new Date("2022-01-01"), rate: 10000, max: 12000, min: 11000, num_transactions:5 },
    { date: new Date("2022-01-11"), rate: 18000, max: 12000, min: 11000, num_transactions:5 },
    { date: new Date("2022-01-13"), rate: 18000, max: 12000, min: 11000, num_transactions:5 },
    { date: new Date("2022-01-22"), rate: 30000, max: 12000, min: 11000, num_transactions:5 },
    { date: new Date("2022-02-04"), rate: 10000, max: 12000, min: 11000, num_transactions:5 },
    { date: new Date("2022-03-05"), rate: 29000, max: 12000, min: 11000, num_transactions:5 },
    // Add more data here
  ];

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
  let [fluctuationsStart, setFluctuationsStart] = useState(null);
  let [fluctuationsEnd, setFluctuationsEnd] = useState(null);
  let [fluctuationsData, setFluctuationsData] = useState(null);
  let [movingAverage, setMovingAverage] = useState(false);
  let [fluctuationsType, setFluctuationsType] = useState("usd-to-lbp");
  let [averageFluctuations, setAverageFluctuations] = useState([]);
  let [ratesAverage, setRatesAverage] = useState(null);
  let [ratesDifference, setRatesDifference] = useState(null);

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
  function createUser(username, password, position) {
    return fetch(`${SERVER_URL}/user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_name: username,
        password: password,
        position: position,
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

  function calculateAverage(data) {
    let total = 0;
    for (let i = 0; i < data.length; i++) {
      total += data[i].rate;
    }
    const average = total / data.length;
    return `Average Rate is ${average}`;
  }

  function calculateDifference(data) {
    const difference = data[data.length - 1].rate - data[0].rate;
    if (difference > 0) {
      return `Rate has increased by ${Math.abs(difference)}`;
    } else if (difference < 0) {
      return `Rate has decreased by ${Math.abs(difference)}`;
    } else {
      return "Rate is unchanged";
    }
  }

  const getAverageFluctuations = (fluctuationsData, fluctuationsType) => {
    let buyorsell;
    if (fluctuationsType === "lbp-to-usd") {
      buyorsell = "buy_usd";
    } else {
      buyorsell = "sell_usd";
    }
    if (!fluctuationsData) {
      return data; 
    }
    return fluctuationsData.map(
      ({ date, [buyorsell]: { max, min, avg, num_transactions } }) => ({
        date: new Date(date),
        rate: avg,
        max: max,
        min: min,
        num_transactions: num_transactions,
      })
    );
  };
  useEffect(() => {
    setAverageFluctuations(
      getAverageFluctuations(fluctuationsData, fluctuationsType)
    );
  }, [fluctuationsData, fluctuationsType]);



  const getFluctuations = useCallback(() => {
    fetch(
      `${SERVER_URL}/getFluctuations?startDate=${fluctuationsStart}&endDate=${fluctuationsEnd}`
    )
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        const parsedData = JSON.parse(data);
        setFluctuationsData(parsedData);

        setRatesAverage(calculateAverage(fluctuationsData));
        setRatesDifference(calculateDifference(fluctuationsData));
      });
  }, [fluctuationsStart, fluctuationsEnd]);
  useEffect(() => {
    getFluctuations();
  }, [getFluctuations]);

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

  const getInitialStartDate = () => {
    const initialStartDate = dayjs().subtract(1, "year");
    return initialStartDate;
  };

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
                  <div>
                  <Button color="inherit" onClick={logout}>
                    Logout
                  </Button>
                  </div>
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

        <Typography variant="h4">Fluctuations & Statistics</Typography>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            className="start_date"
            label="Starting Date"
            value={fluctuationsStart || getInitialStartDate()}
            onChange={(date) =>
              setFluctuationsStart(date || getInitialStartDate())
            }
          />
          <DatePicker
            className="end_date"
            label="Ending Date"
            value={fluctuationsEnd || dayjs()}
            onChange={(date) => setFluctuationsEnd(date || dayjs())}
          />
        </LocalizationProvider>
        <div style={{ marginTop: 10, marginLeft: 10 }}>
          <Select
            id="transaction-type"
            value={fluctuationsType}
            label="Input Currency"
            onChange={(e) => setFluctuationsType(e.target.value)}
          >
            <MenuItem value="lbp-to-usd">Buy USD</MenuItem>
            <MenuItem value="usd-to-lbp">Sell USD</MenuItem>
          </Select>
        </div>
        <Typography variant="h6">
          <span id="ratesAverage">{ratesAverage ? ratesAverage : null}</span>
          <span id="ratesDifference">
            {ratesDifference ? ratesDifference : null}
          </span>
        </Typography>

        <div style={{ marginTop: 10, marginLeft: 10 }}>
          <FormControlLabel
            control={
              <Switch
                checked={movingAverage}
                onChange={(e) => setMovingAverage(e.target.checked)}
              />
            }
            label="Moving Average"
          />
        </div>

        <div className="line_chart">
          <LineChart data={averageFluctuations} movingAvg={movingAverage} />
        </div>
        <hr />
      </div>
      <div className="wrapper">
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
            <MenuItem value="lbp-to-usd">LBP to USD</MenuItem>
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
