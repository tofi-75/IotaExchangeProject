import "./App.css";
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

function AllRequests(props) {
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
  let [userRequests, setUserRequests] = useState(rows);
  const [userToken, setUserToken] = useState(props.userToken);
  const [serverUrl, setServerUrl] = useState(props.serverUrl);
  const [openNewOfferDialog, setOpenNewOfferDialog] = useState(false);
  const [requestedAmount, setRequestedAmount] = useState(null);
  const [requestedCurrency, setRequestedCurrency] = useState("lbp");
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

  
  const postOffer = () => {
    setOpenNewOfferDialog(false);
  };

  const handleNewOffer = (requestId) => {
    //call a get request to get the corresponding offers
    setOpenNewOfferDialog(true);
  };
  const closeOfferDialog = () => {
    setOpenNewOfferDialog(false);
  };

  return (
    <div className="wrapper">
      <p>Welcome to all requests page!</p>

      <Typography variant="h5">All Requests</Typography>
      <Dialog
        open={openNewOfferDialog}
        onClose={closeOfferDialog}
        maxWidth="xs"
        fullWidth
      >
        <div className="dialog-container-transactions">
          <DialogTitle>New Offer</DialogTitle>
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
          onClick={() => postOffer()}
        >
          Post Offer
        </Button>
        </div>
      </Dialog>
      <DataGrid
        columns={[
          { field: "id" ,flex: 0.05, headerName: "ID",headerAlign: 'center', align: "center"  },
          { field: "added_date",flex: 0.1, headerName: "Date Added",headerAlign: 'center', align: "center"  },
          { field: "amount" ,flex: 0.1, headerName: "Amount",headerAlign: 'center', align: "center"  },
          { field: "currency" ,flex: 0.07, headerName: "Currency",headerAlign: 'center', align: "center"},
          {
            field: "offers",
            align: "center",
            flex: 0.15,
            headerAlign: 'center',
            headerName: "Offers",
            renderCell: (params) => (
              <Button className ="ViewOfferButton"
                variant="contained"
                onClick={() => handleNewOffer(params.row.id)}
              >
                Add Offer
              </Button>
            ),
          },
        ]}
        rows={userRequests}
        autoHeight={true}
        autoWidth={true}
      />
    </div>
  );
}

export default AllRequests;
