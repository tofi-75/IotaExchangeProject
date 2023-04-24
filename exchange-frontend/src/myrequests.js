import React, { useCallback } from "react";
import { useState, useEffect } from "react";
import Typography from "@mui/material/Typography";
import { DataGrid } from "@mui/x-data-grid";
import Button from "@mui/material/Button";

function MyRequests(props) {
  let [userRequests, setUserRequests] = useState([]);
  const { userToken, SERVER_URL } = props;

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

  function addRequest(){

  }

  return (
    <div>
      <h1>My Requests</h1>
      <p>Welcome to your requests page!</p>

      <span>
            <Button variant="contained" onClick={addRequest}>
              New Request
            </Button>
          </span>
      
      <div className="wrapper">
          <Typography variant="h5">Your Requests</Typography>
          <DataGrid
            columns={[
              { field: "id" },
              { field: "added_date" },
              { field: "usd_amount" },
              { field: "lbp_amount" },
              { field: "usd_to_lbp" },
            ]}
            rows={userRequests}
            autoHeight
          />
        </div>


    </div>
  );
}

export default MyRequests;