import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import React, { useState } from "react";
import Select from "@mui/material/Select";
import "./UserCredentialsDialog.css";
// Component that presents a dialog to collect credentials from the user
export default function UserCredentialsDialog({
  open,
  onSubmit,
  onClose,
  title,
  submitText,
}) {
  let [username, setUsername] = useState("");
  let [password, setPassword] = useState("");
  let [isTeller, setIsTeller] = useState(false);
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <div className="dialog-container">
        <DialogTitle>{title}</DialogTitle>
        <div className="form-item">
          <TextField
            fullWidth
            label="Username"
            type="text"
            value={username}
            onChange={({ target: { value } }) => setUsername(value)}
          />
        </div>
        <div className="form-item">
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={({ target: { value } }) => setPassword(value)}
          />
        </div>
        {submitText === "Register" && (
          <div className="form-item">
            <Select
            id="user_position"
            value={isTeller}
            label="isTeller"
            onChange={(e) => {
              setIsTeller(e.target.value);
              if (e.target.value === "teller") {
                setIsTeller(true);
              }
            }}
          >
            <MenuItem value="teller">Teller</MenuItem>
            <MenuItem value="user">User</MenuItem>
          </Select>
          </div>
)}
        
        {submitText === "Register" && <Button
          color="primary"
          variant="contained"
          onClick={() => onSubmit(username, password, isTeller)}
        >
          {submitText}
        </Button>}

        {submitText === "Login" && <Button
          color="primary"
          variant="contained"
          onClick={() => onSubmit(username, password)}
        >
          {submitText}
        </Button>}

      </div>
    </Dialog>
  );
}
