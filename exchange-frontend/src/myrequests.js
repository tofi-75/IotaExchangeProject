import "./App.css";
import "./UserCredentialsDialog/UserCredentialsDialog.css";
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

function MyRequests(props) {
  const rows = [
    { id: 1, added_date: '2022-01-01', amount: 1000, currency: 'USD', status: 'pending' },
    { id: 2, added_date: '2022-01-02', amount: 2000, currency: 'LBP', status: 'approved' },
    { id: 3, added_date: '2022-01-03', amount: 1500, currency: 'USD', status: 'pending' },
  ]  
  const offers = [
    { id: 1, added_date: '2022-01-01', issuer: "Toufic", amount: 10000},
    { id: 2, added_date: '2022-01-02', issuer: "Nader", amount: 20000},
    { id: 3, added_date: '2022-01-03', issuer: "Marina", amount: 30000},
  ]  
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
  const handleAccept = () => {
  };
  const handleReject = () => {
  };

  return (
    <div className="wrapper">
      <p>Welcome to your requests page!</p>
      <span>
        <Button variant="contained" onClick={newRequest}>
          New Request
        </Button>
      </span>
      <Dialog open={openNewRequestDialog} onClose={closeDialog} maxWidth="xs" fullWidth>
      <div className="dialog-container">
        <DialogTitle>New Request</DialogTitle>
      </div>
      <div className="form-item">
          <TextField
            fullWidth
            label="Requested Amount"
            type="float"
            value={requestedAmount}
            onChange={({ target: { value } }) => setRequestedAmount(value)}
          />
        </div>
            <Select
            id="requestedCurrency"
            value={requestedCurrency}
            label="Requested Currency"
            onChange={(e) => setRequestedCurrency(e.target.value)}
          >
            <MenuItem value="usd">USD</MenuItem>
            <MenuItem value="lbp">LBP</MenuItem>
          </Select>

        <Button
          color="primary"
          variant="contained"
          onClick={() => postRequest()}
        >
          Post Request
        </Button>
      </Dialog>
      <Dialog open={openViewOffersDialog} onClose={closeOffersDialog} maxWidth="xs" fullWidth>
      <div className="dialog-container">
        <DialogTitle>Offers</DialogTitle>
        <DataGrid
        columns={[
          { field: "id" },
          { field: "added_date" },
          { field: "issuer" },
          { field: "amount" },
          {
            field: "status",
            headerName: "Action",
            renderCell: (params) => (
              <>
              <Button
                variant="contained"
                onClick={() => handleAccept(params.row.id)}
              >
                Accept
              </Button>
              <Button
                variant="contained"
                onClick={() => handleReject(params.row.id)}
              >
                Reject
              </Button>
              </>
            
            ),
          }]}
        rows={offers}
        autoHeight
      />
      </div>
      </Dialog>


      <Typography variant="h5">Your Requests</Typography>
      <DataGrid
        columns={[
          { field: "id" },
          { field: "added_date" },
          { field: "amount" },
          { field: "currency" },
          { field: "status" },
          {
            field: "offers",
            headerName: "Offers",
            renderCell: (params) => (
              <Button
                variant="contained"
                onClick={() => handleViewOffers(params.row.id)}
                disabled={params.row.status !== "pending"}
              >
                View Offers
              </Button>
            ),
          },
          {
            field: "delete",
            headerName: "Delete",
            renderCell: (params) => (
              <Button
                variant="contained"
                onClick={() => handleDeleteRequest(params.row.id)}
                disabled={params.row.status !== "pending"}
              >
                Delete
              </Button>
            ),
          },
        ]}
        rows={userRequests}
        autoHeight
      />
    </div>
  );
}

export default MyRequests;
