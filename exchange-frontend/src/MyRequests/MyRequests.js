import "../App.css";
import React, { useCallback } from "react";
import { useState, useEffect } from "react";
import Typography from "@mui/material/Typography";
import { DataGrid } from "@mui/x-data-grid";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";

function ServedRequests(props) {
  const rows = [
    {
      id: 1,
      added_date: "2022-01-01",
      amount: 1000,
      currency: "USD",
      status: "pending",
    },
    {
      id: 2,
      added_date: "2022-01-02",
      amount: 2000,
      currency: "LBP",
      status: "approved",
    },
    {
      id: 3,
      added_date: "2022-01-03",
      amount: 1500,
      currency: "USD",
      status: "pending",
    },
  ];
  const offers = [
    { id: 1, added_date: "2022-01-01", issuer: "Toufic", amount: 10000 },
    { id: 2, added_date: "2022-01-02", issuer: "Nader", amount: 20000 },
    { id: 3, added_date: "2022-01-03", issuer: "Marina", amount: 30000 },
  ];
  let [userRequests, setUserRequests] = useState(rows);
  const [userToken, setUserToken] = useState(props.userToken);
  const [serverUrl, setServerUrl] = useState(props.serverUrl);
  const [openNewRequestDialog, setOpenNewRequestDialog] = useState(false);
  const [requestedAmount, setRequestedAmount] = useState(null);
  const [requestedCurrency, setRequestedCurrency] = useState("lbp");
  const [openViewOffersDialog, setOpenViewOffersDialog] = useState(false);

  useEffect(() => {
    setUserToken(props.userToken);
  }, [props.userToken]);

  useEffect(() => {
    setServerUrl(props.serverUrl);
  }, [props.serverUrl]);

  const fetchUserRequests = useCallback(() => {
    fetch(`${serverUrl}/requests`, {
      headers: {
        Authorization: `bearer ${userToken}`,
      },
    })
      .then((response) => response.json())
      .then((requests) => setUserRequests(requests));
  }, [userToken]);
  useEffect(() => {
    if (userToken) {
      fetchUserRequests();
    }
  }, [fetchUserRequests, userToken]);

  const newRequest = () => {
    setOpenNewRequestDialog(true);
  };
  const closeDialog = () => {
    setOpenNewRequestDialog(false);
  };
  const postRequest = () => {
    fetchUserRequests();
    setOpenNewRequestDialog(false);
  };

  const handleDeleteRequest = (requestId) => {};

  const handleViewOffers = (requestId) => {
    //call a get request to get the corresponding offers
    setOpenViewOffersDialog(true);
  };
  const closeOffersDialog = () => {
    setOpenViewOffersDialog(false);
  };
  const handleAccept = () => {};
  const handleReject = () => {};

  return (
    <div className="wrapper">
      <p>Welcome to your requests page!</p>
      <span>
        <Button variant="contained" onClick={newRequest}>
          New Request
        </Button>
      </span>
      <Dialog
        open={openNewRequestDialog}
        onClose={closeDialog}
        maxWidth="xs"
        fullWidth
      >
        <div className="dialog-container-transactions">
          <DialogTitle>New Request</DialogTitle>
        <div className="form-item-transactions">

          <TextField className="requested-amount"
            label="Requested Amount"
            type="float"
            value={requestedAmount}
            onChange={({ target: { value } }) => setRequestedAmount(value)}
          />
        <Select className="requested-currency"
          id="requestedCurrency"
          value={requestedCurrency}
          label="Requested Currency"
          onChange={(e) => setRequestedCurrency(e.target.value)}
        >
          <MenuItem value="usd">USD</MenuItem>
          <MenuItem value="lbp">LBP</MenuItem>
        </Select>
        </div>

        
        <Button 
          color="primary"
          variant="contained"
          onClick={() => postRequest()}
        >
          Post Request
        </Button>
        </div>
      </Dialog>

      <Typography variant="h5">Your Requests</Typography>
      <DataGrid
        columns={[
          { field: "id" ,flex: 0.05, headerName: "ID",headerAlign: 'center', align: "center"  },
          { field: "added_date",flex: 0.1, headerName: "Date Added",headerAlign: 'center', align: "center"  },
          { field: "amount" ,flex: 0.1, headerName: "Amount",headerAlign: 'center', align: "center"  },
          { field: "currency" ,flex: 0.07, headerName: "Currency",headerAlign: 'center', align: "center"},
        ]}
        rows={userRequests}
        autoHeight={true}
        autoWidth={true}
      />
    </div>
  );
}

export default ServedRequests;
