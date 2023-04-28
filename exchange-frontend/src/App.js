import "./App.css";
import UserCredentialsDialog from "./UserCredentialsDialog/UserCredentialsDialog";
import React from "react";
import { useState} from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { Route, Routes} from "react-router-dom"
import Home from "./Home"
import MyRequests from "./myrequests"
import { getUserToken, saveUserToken, clearUserToken } from "./localStorage";
import {useNavigate} from 'react-router-dom'

var SERVER_URL = "http://127.0.0.1:5000";
const States = {
  PENDING: "PENDING",
  USER_CREATION: "USER_CREATION",
  USER_LOG_IN: "USER_LOG_IN",
  USER_AUTHENTICATED: "USER_AUTHENTICATED",
};

function App() {
  const navigate = useNavigate();
  let [authState, setAuthState] = useState(States.PENDING);
  let [userToken, setUserToken] = useState(getUserToken());
  
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
  function logout() {
    setUserToken(null);
    clearUserToken();
    navigate('/');
  }
  function myRequests(){
    navigate('/myrequests');
  }

  return (
    <div className="App">
      <header>
        <meta charSet="UTF-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>LBP Exchange Tracker</title>
      </header>

      <UserCredentialsDialog
        open={authState === States.USER_CREATION}
        onSubmit={createUser}
        onClose={() => setAuthState(States.PENDING)}
        title={"Welcome"}
        submitText={"Register"}
      />
      <UserCredentialsDialog
        open={authState === States.USER_LOG_IN}
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
                    <Button color="inherit" onClick={myRequests}>
                      My Requests
                    </Button>
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
      <Routes>
      <Route path="/" element={<Home userToken={userToken} serverUrl={SERVER_URL}/>} />
      <Route path="/myrequests" element={<MyRequests userToken={userToken} serverUrl={SERVER_URL} />} />
    </Routes>
      </div>

  );
}

export default App;
