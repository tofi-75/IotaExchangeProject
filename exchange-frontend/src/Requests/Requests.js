import "../App.css";
import "./Requests.css";
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

const { SERVER_URL } = process.env;

function Requests(props) {
  const rows = [
    {
      id: 1,
      added_date: "2022-01-01",
      amount: 1000,
      currency: "USD",
      offer: "hello",
    },
    {
      id: 2,
      added_date: "2022-01-02",
      amount: 2000,
      currency: "LBP",
      offer: "hello",
    },
    {
      id: 3,
      added_date: "2022-01-03",
      amount: 1500,
      currency: "USD",
      offer: "hello",
    },
  ];
  const offers = [
    { id: 1, added_date: "2022-01-01", issuer: "Toufic", amount: 10000 },
    { id: 2, added_date: "2022-01-02", issuer: "Nader", amount: 20000 },
    { id: 3, added_date: "2022-01-03", issuer: "Marina", amount: 30000 },
  ];
  let [userRequests, setUserRequests] = useState(rows);
  const [userToken, setUserToken] = useState(props.userToken);
  const [requestsType, setRequestsType] = useState(props.requestsType);
  const [openNewRequestDialog, setOpenNewRequestDialog] = useState(false);
  const [requestedAmount, setRequestedAmount] = useState(null);
  const [requestedCurrency, setRequestedCurrency] = useState("lbp");
  const [openViewOffersDialog, setOpenViewOffersDialog] = useState(false);

  useEffect(() => {
    setUserToken(props.userToken);
  }, [props.userToken]);

  useEffect(() => {
    setRequestsType(props.requestsType);
  }, [props.requestsType]);

  const fetchUserRequests = useCallback(() => {
    fetch(`${SERVER_URL}/requests`, {
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
      {requestsType == "pending" ? (
        <div>
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
                <TextField
                  className="requested-amount"
                  label="Requested Amount"
                  type="float"
                  value={requestedAmount}
                  onChange={({ target: { value } }) =>
                    setRequestedAmount(value)
                  }
                />
                <Select
                  className="requested-currency"
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

          <Dialog
            open={openViewOffersDialog}
            onClose={closeOffersDialog}
            fullWidth
            maxWidth="sm"
          >
            <div className="dialog-container-offers">
              <DialogTitle>Offers</DialogTitle>
              <DataGrid
                columns={[
                  {
                    field: "id",
                    headerName: "ID",
                    headerAlign: "center",
                    align: "center",
                    flex: 0.05,
                  },
                  {
                    field: "added_date",
                    headerName: "Date Offered",
                    headerAlign: "center",
                    align: "center",
                    flex: 1,
                  },
                  {
                    field: "issuer",
                    headerName: "Issuer",
                    headerAlign: "center",
                    align: "center",
                    flex: 1,
                  },
                  {
                    field: "amount",
                    headerName: "Amount",
                    headerAlign: "center",
                    align: "center",
                    flex: 1,
                  },
                  {
                    field: "status",
                    flex: 2,
                    headerName: "Action",
                    headerAlign: "center",
                    align: "center",
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
                  },
                ]}
                rows={offers}
                autoHeight={true}
              />
            </div>
          </Dialog>
        </div>
      ) : null}

      <Typography variant="h5">Requests</Typography>
      <DataGrid
      
      columnVisibilityModel={{
        delete: requestsType === "pending" ? true : false,
        offers: requestsType === "pending" ? true : false,
        offer: requestsType === "served" ? true : false,
        issuer: requestsType === "all" ? true : false,
      }}
        columns={[
          {
            field: "id",
            flex: 0.05,
            headerName: "ID",
            headerAlign: "center",
            align: "center",
          },
          {
            field: "issuer",
            flex: 0.05,
            headerName: "Issuer",
            headerAlign: "center",
            align: "center",
          },
          {
            field: "added_date",
            flex: 0.1,
            headerName: "Date Added",
            headerAlign: "center",
            align: "center",
          },
          {
            field: "amount",
            flex: 0.1,
            headerName: "Amount",
            headerAlign: "center",
            align: "center",
          },
          {
            field: "currency",
            flex: 0.07,
            headerName: "Currency",
            headerAlign: "center",
            align: "center",
          },
            {
                field: "delete",
                align: "center",
                flex: 0.1,
                headerAlign: "center",
                headerName: "Delete",
                renderCell: (params) => (
                  <Button
                    variant="contained"
                    onClick={() => handleDeleteRequest(params.row.id)}
                  >
                    Delete
                  </Button>
                ),
              },
            {
                field: "offer",
                flex: 0.15,
                headerName: "Offered Rate",
                headerAlign: "center",
                align: "center",
            },
            {
                field: "offers",
                align: "center",
                flex: 0.15,
                headerAlign: "center",
                headerName: "Offers",
                renderCell: (params) => (
                  <Button
                    className="ViewOfferButton"
                    variant="contained"
                    onClick={() => handleViewOffers(params.row.id)}
                  >
                    View Offers
                  </Button>
                ),
              }
          
        ]}
        rows={userRequests}
        autoHeight={true}
        autoWidth={true}
      />
    </div>
  );
}

export default Requests;
