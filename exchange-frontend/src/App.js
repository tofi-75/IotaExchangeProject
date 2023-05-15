import "./App.css";
import UserCredentialsDialog from "./UserCredentialsDialog/UserCredentialsDialog";
import React from "react";
import { useState } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { Route, Routes } from "react-router-dom";
import Home from "./Home/Home";
import Tables from "./Tables/Tables";
import { getUserToken, saveUserToken, clearUserToken } from "./localStorage";
import { getUserisTeller, saveUserisTeller, clearUserisTeller} from "./localStorage";
import { useNavigate } from "react-router-dom";

const SERVER_URL = "http://127.0.0.1:5000";
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
  let [isTeller, setIsTeller] = useState(getUserisTeller());
  let [error, setError] = useState("");

  function login(username, password) {
    return fetch(`${SERVER_URL}/user/authenticate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        password: password,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Invalid username or password");
        }
        return response.json();
      })
      .then((body) => {
        setAuthState(States.USER_AUTHENTICATED);
        setUserToken(body.token);
        saveUserToken(body.token);
        setIsTeller(body.is_teller);
        saveUserisTeller(body.is_teller);
      })
      .catch((error) => {
        setError("Invalid username or password");
      });
  }
  function createUser(username, password, is_teller) {
    return fetch(`${SERVER_URL}/user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        password: password,
        is_teller: is_teller,
      }),
    }).then((response) => {
      if (!response.ok) {
        throw new Error("Invalid username or password");
      }
      login(username, password);
    })
    .catch((error) => {
      setError("Invalid username or password");
    });
  }
  function logout() {
    setUserToken(null);
    setIsTeller(false);
    clearUserisTeller();
    clearUserToken();
    navigate("/");
  }
  function requests() {
    navigate("/requests");
  }
  function exchangePage() {
    navigate("/");
  }
  function myOffers() {
    navigate("/myoffers");
  }
  function history() {
    navigate("/history");
  }
  const handleCloseErrorSnackbar = () => {
    setError("");
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

      <Snackbar
        elevation={6}
        variant="filled"
        open={error.length > 0}
        autoHideDuration={2000}
        onClose={handleCloseErrorSnackbar}
      >
        <Alert severity="error">{error}</Alert>
      </Snackbar>
      <div className="navbar">
        <AppBar position="static">
          <Toolbar classes={{ root: "nav" }}>
            <Typography variant="h5">Currency Exchange</Typography>
            <div>
              {userToken !== null ? (
                <div>
                  {isTeller == true ? (
                    <div>
                      <Button color="inherit" onClick={exchangePage}>
                        Exchange Rate
                      </Button>
                      <Button color="inherit" onClick={requests}>
                        Available Requests
                      </Button>
                      <Button color="inherit" onClick={myOffers}>
                        My Offers
                      </Button>
                      <Button color="inherit" onClick={history}>
                        History
                      </Button>
                      <Button color="inherit" onClick={logout}>
                        Logout
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <Button color="inherit" onClick={exchangePage}>
                        Exchange Rate
                      </Button>
                      <Button color="inherit" onClick={requests}>
                        Pending Requests
                      </Button>
                      <Button color="inherit" onClick={history}>
                        History
                      </Button>
                      <Button color="inherit" onClick={logout}>
                        Logout
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <Button color="inherit" onClick={exchangePage}>
                    Exchange Rate
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
      <Routes>
        <Route path="/" element={<Home userToken={userToken} />} />
        {userToken && (
          <Route
            path="/requests"
            element={<Tables userToken={userToken} isTeller={isTeller} tableType="requests" />}
          />
        )}
        {userToken && isTeller && (
          <Route
            path="/myoffers"
            element={<Tables userToken={userToken} isTeller={isTeller} tableType="myoffers" />}
          />
        )}
        {userToken && (
          <Route
            path="/history"
            element={<Tables userToken={userToken} isTeller={isTeller} tableType="history" />}
          />
        )}

        <Route path="*" element={<Home userToken={userToken} />} />
      </Routes>
    </div>
  );
}

export default App;
