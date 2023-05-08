import "../Home/Home.css";
import "./Tables.css";
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
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

const SERVER_URL = "http://127.0.0.1:5000";

function Tables(props) {
  let [userToken, setUserToken] = useState(props.userToken);
  let [tableType, setTableType] = useState(props.tableType);
  let [requests, setRequests] = useState([]);
  let [isTeller, setIsTeller] = useState(props.isTeller);
  let [offers, setOffers] = useState([]);

  let [openNewRequestDialog, setOpenNewRequestDialog] = useState(false);
  let [openNewOfferDialog, setOpenNewOfferDialog] = useState(false);
  let [openViewOffersDialog, setOpenViewOffersDialog] = useState(false);

  let [requestedAmount, setRequestedAmount] = useState("");
  let [requestedCurrency, setRequestedCurrency] = useState("lbp");
  let [offeredAmount, setOfferedAmount] = useState("");
  let [history, setHistory] = useState([]);

  let [error, setError] = useState("");

  useEffect(() => {
    setUserToken(props.userToken);
  }, [props.userToken]);

  useEffect(() => {
    setIsTeller(props.isTeller);
  }, [props.isTeller]);

  useEffect(() => {
    setTableType(props.tableType);
  }, [props.tableType]);

  const newRequest = () => {
    setOpenNewRequestDialog(true);
  };
  const closeDialog = () => {
    setOpenNewRequestDialog(false);
  };
  const newOffer = () => {
    setOpenNewOfferDialog(true);
  };
  const closeOffer = () => {
    setOpenNewOfferDialog(false);
  };

  const fetchRequests = useCallback(() => {
    fetch(`${SERVER_URL}/transaction-requests`, {
      headers: {
        Authorization: `bearer ${userToken}`,
      },
    })
      .then((response) => response.json())
      .then((requests) => setRequests(requests))
      .catch((error) => {
        setError(error.message);
        setRequests([]);
      });
  }, [userToken]);

  useEffect(() => {
    if (userToken && tableType === "requests") {
      fetchRequests();
    }
  }, [fetchRequests, userToken]);

  const postOffer = (requestId) => {
    fetch(`${SERVER_URL}/offer`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        transaction_id: parseInt(requestId),
        amount: parseFloat(requestedAmount),
      }),
    })
      .then((response) => {
        if (response.ok) {
          setOpenNewOfferDialog(false);
          fetchRequests();
        } else {
          throw new Error("Error posting offer");
        }
      })
      .catch((error) => {
        setError(error.message);
      });
  };

  const postRequest = () => {
    let usd_to_lbp;
    if (requestedCurrency == "lbp") {
      usd_to_lbp = 1;
    } else {
      usd_to_lbp = 0;
    }
    fetch(`${SERVER_URL}/transaction-request`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        amount: parseFloat(requestedAmount),
        usd_to_lbp: usd_to_lbp,
      }),
    })
      .then((response) => {
        if (response.ok) {
          setOpenNewRequestDialog(false);
          fetchRequests();
        } else {
          throw new Error("Error posting request");
        }
      })
      .catch((error) => {
        setError(error.message);
      });
  };

  const handleDeleteRequest = (requestId) => {
    fetch(`${SERVER_URL}/transaction-request/${requestId}`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
    })
      .then((response) => {
        if (response.ok) {
          fetchRequests();
        } else {
          throw new Error("Failed to delete request.");
        }
      })
      .catch((error) => {
        setError(error.message);
      });
  };

  const handleDeleteOffer = (offerId) => {
    fetch(`${SERVER_URL}/offer/${offerId}`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
    })
      .then((response) => {
        if (response.ok) {
          fetchRequests();
        } else {
          throw new Error("Failed to delete offer.");
        }
      })
      .catch((error) => {
        setError(error.message);
      });
  };

  const viewReqOffers = (requestId) => {
    fetch(`${SERVER_URL}/offers/${requestId}`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          console.log("here");
          throw new Error("Failed to get offers.");
        }
      })
      .then((offers) => {
        setOffers(offers);
      })
      .catch((error) => {
        setError(error.message);
      });
  };

  const myOffers = useCallback(() => {
    fetch(`${SERVER_URL}/offers`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Failed to get offers.");
        }
      })
      .then((offers) => {
        setOffers(offers);
      })
      .catch((error) => {
        setError(error.message);
      });
  }, [userToken]);

  useEffect(() => {
    if (userToken && tableType === "myoffers") {
      myOffers();
    }
  }, [myOffers, userToken]);

  const handleViewOffers = (requestId) => {
    viewReqOffers(requestId);
    setOpenViewOffersDialog(true);
  };
  const handleCloseErrorSnackbar = () => {
    setError("");
  };
  const closeOffersDialog = () => {
    setOpenViewOffersDialog(false);
  };
  const handleAccept = (offerId) => {
    fetch(`${SERVER_URL}/offer/accept`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        offer_id: offerId,
      }),
    });
  };

  const handleReject = (offerId) => {
    fetch(`${SERVER_URL}/offer/reject`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        offer_id: offerId,
      }),
    });
  };

  const getHistory = useCallback(() => {
    fetch(`${SERVER_URL}/transaction`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Failed to get offers.");
        }
      })
      .then((history) => {
        setHistory(history);
      })
      .catch((error) => {
        setError(error.message);
      });
  }, [userToken]);

  useEffect(() => {
    if (userToken && tableType === "history") {
      getHistory();
    }
  }, [getHistory, userToken]);

  const getOfferRows = (offers) => {
    const rows = [];
    offers.forEach((offer) => {
      offer.offers.forEach((offerData) => {
        rows.push({
          id: offer.id,
          added_date: offerData.added_date,
          num_offers: offer.num_offers,
          requested_amount: offer.amount,
          requested_currency: offer.usd_to_lbp ? "LBP" : "USD",
          offered_amount: offerData.amount,
        });
      });
    });
    return rows;
  };

  const getRequestRows = (requests) => {
    const rows = [];
    requests.forEach((request) => {
      rows.push({
        id: request.id,
        added_date: request.added_date,
        requested_amount: request.amount,
        requested_currency: request.usd_to_lbp ? "LBP" : "USD",
        num_offers: request.num_offers,
      });
    });
    return rows;
  };

  return (
    <div className="wrapper">
      <Snackbar
        elevation={6}
        variant="filled"
        open={error.length > 0}
        autoHideDuration={2000}
        onClose={handleCloseErrorSnackbar}
      >
        <Alert severity="error">{error}</Alert>
      </Snackbar>

      <Dialog
        open={openViewOffersDialog}
        onClose={closeOffersDialog}
        fullWidth
        maxWidth="sm"
      >
        <div className="dialog-container-offers">
          <DialogTitle>Offers</DialogTitle>
          <DataGrid
            columnVisibilityModel={{
              status: tableType === "requests" && !isTeller ? true : false,
            }}
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
                field: "teller_id",
                headerName: "Teller ID",
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
            rows={getOfferRows(offers)}
            autoHeight={true}
          />
        </div>
      </Dialog>

      {tableType === "requests" && !isTeller ? (
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
                  onChange={({ target: { value } }) => {
                    if (!isNaN(value)) {
                      console.log("correct input");
                      setRequestedAmount(value);
                    }
                  }}
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
        </div>
      ) : (
        <div></div>
      )}

      {tableType === "requests" && isTeller ? (
        <div>
          <Dialog
            open={openNewOfferDialog}
            onClose={closeOffer}
            maxWidth="xs"
            fullWidth
          >
            <div className="dialog-container-transactions">
              <DialogTitle>New Offer</DialogTitle>
              <div className="form-item-transactions">
                <TextField
                  className="offered-amount"
                  label="Offered Amount"
                  type="float"
                  value={offeredAmount}
                  onChange={({ target: { value } }) => {
                    if (!isNaN(value)) {
                      console.log("correct input");
                      setOfferedAmount(value);
                    }
                  }}
                />
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
        </div>
      ) : (
        <div></div>
      )}

      {tableType != "history" ? (
        <DataGrid
          columnVisibilityModel={{
            delete_request:
              tableType === "requests" && !isTeller ? true : false,
            add_offer: tableType === "requests" && isTeller ? true : false,
            offered_amount: tableType === "myoffers" && isTeller ? true : false,
            delete_offer: tableType === "myoffers" && isTeller ? true : false,
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
              field: "added_date",
              flex: 0.15,
              headerName: "Date Added",
              headerAlign: "center",
              align: "center",
            },
            {
              field: "requested_amount",
              flex: 0.1,
              headerName: "Amount Requested",
              headerAlign: "center",
              align: "center",
            },
            {
              field: "requested_currency",
              flex: 0.07,
              headerName: "Currency",
              headerAlign: "center",
              align: "center",
            },
            {
              field: "offered_amount",
              flex: 0.1,
              headerName: "Amount Offered",
              headerAlign: "center",
              align: "center",
            },
            {
              field: "num_offers",
              flex: 0.1,
              headerName: "Offers number",
              headerAlign: "center",
              align: "center",
            },
            {
              field: "delete_request",
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
              field: "delete_offer",
              align: "center",
              flex: 0.1,
              headerAlign: "center",
              headerName: "Delete",
              renderCell: (params) => (
                <Button
                  variant="contained"
                  onClick={() => handleDeleteOffer(params.row.id)}
                >
                  Delete
                </Button>
              ),
            },
            {
              field: "add_offer",
              align: "center",
              flex: 0.1,
              headerAlign: "center",
              headerName: "Add Offer",
              renderCell: (params) => (
                <Button
                  variant="contained"
                  onClick={() => newOffer(params.row.id)}
                >
                  Add Offer
                </Button>
              ),
            },
            {
              field: "nb_offers",
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
            },
          ]}
          rows = {tableType === "myoffers" ? getOfferRows(offers) : getRequestRows(requests) }
          autoHeight={true}
          autoWidth={true}
        />
      ) : (
        <DataGrid
          columns={[
            {
              field: "id",
              flex: 0.05,
              headerName: "ID",
              headerAlign: "center",
              align: "center",
            },
            {
              field: "added_date",
              flex: 0.1,
              headerName: "Added Date",
              headerAlign: "center",
              align: "center",
            },

            {
              field: "lbp_amount",
              flex: 0.1,
              headerName: "LBP Amount",
              headerAlign: "center",
              align: "center",
            },
            {
              field: "usd_amount",
              flex: 0.1,
              headerName: "USD Amount",
              headerAlign: "center",
              align: "center",
            },
            {
              field: "usd_to_lbp",
              flex: 0.1,
              headerName: "USD to LBP",
              headerAlign: "center",
              align: "center",
            },
          ]}
          rows={history}
          autoHeight={true}
          autoWidth={true}
        />
      )}
    </div>
  );
}

export default Tables;
