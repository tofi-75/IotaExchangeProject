import "./Home.css";
import React, { useCallback } from "react";
import { useState, useEffect } from "react";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import { DatePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import LineChart from "../linechart";
import dayjs from "dayjs";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";

const SERVER_URL = "http://127.0.0.1:5000";
function Home(props) {
  const [userToken, setUserToken] = useState(props.userToken);
  const [isTeller, setIsTeller] = useState(props.isTeller);

  useEffect(() => {
    setIsTeller(props.isTeller);
  }, [props.isTeller]);

  useEffect(() => {
    setUserToken(props.userToken);
  }, [props.userToken]);

  console.log(userToken);
  const getInitialStartDate = () => {
    let initialStartDate = dayjs().subtract(1, "year");
    return initialStartDate;
  };

  let [buyUsdRate, setBuyUsdRate] = useState(null);
  let [sellUsdRate, setSellUsdRate] = useState(null);
  let [lbpInput, setLbpInput] = useState("");
  let [usdInput, setUsdInput] = useState("");
  let [transactionType, setTransactionType] = useState("usd-to-lbp");
  let [calculatorInput, setCalculatorInput] = useState("");
  let [calculatorInputType, setCalculatorInputType] = useState("usd");
  let [calculatorOutput, setCalculatorOutput] = useState(null);
  let [calculatorOutputType, setCalculatorOutputType] = useState(null);
  let [userTransactions, setUserTransactions] = useState([]);
  let [fluctuationsStart, setFluctuationsStart] = useState(
    getInitialStartDate()
  );
  let [fluctuationsEnd, setFluctuationsEnd] = useState(dayjs());
  let [fluctuationsData, setFluctuationsData] = useState(null);
  let [movingAverage, setMovingAverage] = useState(false);
  let [fluctuationsType, setFluctuationsType] = useState("usd-to-lbp");
  let [averageFluctuations, setAverageFluctuations] = useState([]);
  let [ratesAverage, setRatesAverage] = useState(null);
  let [ratesDifference, setRatesDifference] = useState(null);

  function fetchRates() {
    fetch(`${SERVER_URL}/rates/current`)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setBuyUsdRate(data.usd_to_lbp.toFixed(2));
        setSellUsdRate(data.lbp_to_usd.toFixed(2));
      });
  }

  useEffect(fetchRates, []);

  const calculateStats = (averageFluctuations) => {
    if (averageFluctuations.length > 0) {
      console.log(averageFluctuations);
      console.log("calculating average");
      let total = 0;
      for (let i = 0; i < averageFluctuations.length; i++) {
        total += averageFluctuations[i].rate;
      }

      const average = total / averageFluctuations.length;
      console.log(average);
      setRatesAverage(
        `The average rate between these two days is ${average.toFixed(2)} LBP`
      );

      let difference =
        averageFluctuations[averageFluctuations.length - 1].rate -
        averageFluctuations[0].rate;
      if (difference > 0) {
        setRatesDifference(
          `The rate has increased by ${Math.abs(difference).toFixed(2)} LBP`
        );
      } else if (difference < 0) {
        setRatesDifference(
          `The rate has decreased by ${Math.abs(difference).toFixed(2)} LBP`
        );
      } else {
        setRatesDifference("The rate is unchanged");
      }
    }
  };
  useEffect(() => {
    calculateStats(averageFluctuations);
  }, [averageFluctuations]);

  const getAverageFluctuations = (fluctuationsData, fluctuationsType) => {
    console.log(fluctuationsData);
    let buyorsell;
    if (fluctuationsType === "lbp-to-usd") {
      buyorsell = "buy_usd";
    } else {
      buyorsell = "sell_usd";
    }
    if (!fluctuationsData) {
      return [];
    }
    return fluctuationsData.map(
      ({
        day,
        [`${buyorsell}_max`]: max,
        [`${buyorsell}_min`]: min,
        [`${buyorsell}_avg`]: rate,
        num_buy_transactions,
        num_sell_transactions,
      }) => ({
        date: new Date(day),
        rate,
        max,
        min,
        num_transactions:
          buyorsell === "buy_usd"
            ? num_buy_transactions
            : num_sell_transactions,
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
      `${SERVER_URL}/rates/history?startDay=${fluctuationsStart.format(
        "YYYY-MM-DD"
      )}&endDay=${fluctuationsEnd.format("YYYY-MM-DD")}`
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((daily_rates) => {
        console.log(daily_rates);
        setFluctuationsData(daily_rates);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }, [fluctuationsStart, fluctuationsEnd]);
  useEffect(() => {
    getFluctuations();
  }, [getFluctuations]);

  function addItem() {
    if (transactionType === "usd-to-lbp") {
      transactionType = 0;
    } else {
      transactionType = 1;
    }

    let data_in = {
      usd_amount: parseInt(usdInput),
      lbp_amount: parseInt(lbpInput),
      lbp_to_usd: transactionType,
    };

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
        setUsdInput("");
        setLbpInput("");
      });
  }

  function convert() {
    if (calculatorInput.length === 0 || parseFloat(calculatorInput) <= 0) {
      console.log("Invalid input");
    } else {
      if (buyUsdRate === 0 || sellUsdRate === 0) {
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

  return (
    <div className="Home">
      <div className="wrapper">
        <div className="exchange-rate-container">
          <Typography variant="h4">Today's Exchange Rate</Typography>
          <p>LBP to USD Exchange Rate</p>
          <Typography variant="h6">
            Buy USD:{" "}
            <span id="buy-usd-rate">{buyUsdRate ? buyUsdRate : null}</span> LBP
          </Typography>
          <Typography variant="h6">
            Sell USD:{" "}
            <span id="sell-usd-rate">{sellUsdRate ? sellUsdRate : null}</span>{" "}
            LBP
          </Typography>
        </div>
        <hr />
        <Typography className="title" variant="h4">
          Fluctuations & Statistics
        </Typography>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            className="start_date"
            label="Starting Date"
            format="YYYY-MM-DD"
            value={fluctuationsStart}
            onChange={(date) => setFluctuationsStart(date)}
          />
          <DatePicker
            format="YYYY-MM-DD"
            className="end_date"
            label="Ending Date"
            value={fluctuationsEnd}
            onChange={(date) => setFluctuationsEnd(date)}
          />
        </LocalizationProvider>
        <div>
          <Select
            className="fluctuations-type"
            id="transaction-type"
            value={fluctuationsType}
            label="Input Currency"
            onChange={(e) => setFluctuationsType(e.target.value)}
          >
            <MenuItem value="lbp-to-usd">Buy USD</MenuItem>
            <MenuItem value="usd-to-lbp">Sell USD</MenuItem>
          </Select>

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
        <div className="statistics">
          <Typography variant="h6">
            <div>
              <span id="ratesAverage">
                {ratesAverage ? ratesAverage : null}
              </span>
            </div>
            <div>
              <span id="ratesDifference">
                {ratesDifference ? ratesDifference : null}
              </span>
            </div>
          </Typography>
        </div>

        <div className="line_chart" id="chart-container">
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

      {isTeller ? (
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
      ) : (
        <div></div>
      )}
    </div>
  );
}

export default Home;
