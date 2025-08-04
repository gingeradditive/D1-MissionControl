import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, List, ListItem, ListItemButton,
  ListItemIcon, ListItemText, Divider, TextField, Typography, Box
} from '@mui/material';
import WifiIcon from '@mui/icons-material/Wifi';
import SignalWifi0Bar from '@mui/icons-material/SignalWifi0Bar';
import SignalWifi1Bar from '@mui/icons-material/SignalWifi1Bar';
import SignalWifi2Bar from '@mui/icons-material/SignalWifi2Bar';
import SignalWifi3Bar from '@mui/icons-material/SignalWifi3Bar';
import SignalWifi4Bar from '@mui/icons-material/SignalWifi4Bar';
import Keyboard from 'react-simple-keyboard';
import 'react-simple-keyboard/build/css/index.css';
import { api } from '../api';

const getWifiIcon = (strength) => {
  const level = Math.ceil(strength / 25); // strength from 0–100 mapped to 0–4
  switch (level) {
    case 1: return <SignalWifi1Bar />;
    case 2: return <SignalWifi2Bar />;
    case 3: return <SignalWifi3Bar />;
    case 4: return <SignalWifi4Bar />;
    default: return <SignalWifi0Bar />;
  }
};

export default function WifiDialog({ open, onClose }) {
  const [wifiList, setWifiList] = useState([]);
  const [selectedWifi, setSelectedWifi] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [showKeyboard, setShowKeyboard] = useState(false);
  const keyboardRef = useRef();
  const isKiosk = new URLSearchParams(window.location.search).get("kiosk") === "true";

  useEffect(() => {
    if (open) {
      setSelectedWifi('');
      setWifiPassword('');
      setStatusMessage('');
      api.getNetworks()
        .then(res => {
          const sorted = res.data.sort((a, b) => b.strength - a.strength);
          setWifiList(sorted);
        })
        .catch(err => {
          console.error("Error loading networks:", err);
          setStatusMessage("Unable to load WiFi networks.");
        });
    }
  }, [open]);

  const handleConnect = async () => {
    try {
      setStatusMessage('Connecting...');
      const res = await api.setConnection(selectedWifi, wifiPassword);
      setStatusMessage(res.data.status);

      const ipRes = await api.getIp();
      console.log("IP obtained:", ipRes.data.ip);

      setStatusMessage(`Connected! IP: ${ipRes.data.ip}`);

      setTimeout(() => {
        onClose();
        setWifiPassword('');
        setSelectedWifi('');
      }, 2000);
    } catch (error) {
      console.error("Connection error:", error);
      setStatusMessage('Error during connection. Check your password..');
    }
  };

  const onChangeInput = (e) => {
    setWifiPassword(e.target.value);
    if (keyboardRef.current) {
      keyboardRef.current.setInput(e.target.value);
    }
  };

  const onKeyboardChange = (input) => {
    setWifiPassword(input);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <WifiIcon sx={{ mr: 1 }} />
          Select a WiFi network
        </Box>
      </DialogTitle>
      <DialogContent>
        <List>
          {wifiList.map((network) => (
            <ListItem key={network.ssid} disablePadding>
              <ListItemButton
                onClick={() => {
                  setSelectedWifi(network.ssid);
                  setWifiPassword('');
                  setStatusMessage('');
                }}
                selected={selectedWifi === network.ssid}
              >
                <ListItemIcon>{getWifiIcon(network.strength)}</ListItemIcon>
                <ListItemText primary={network.ssid} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        {selectedWifi && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" gutterBottom>
              Connessione a "{selectedWifi}"
            </Typography>
            <TextField
              fullWidth
              type="password"
              label="Password"
              margin="normal"
              value={wifiPassword}
              onChange={onChangeInput}
              onFocus={() => setShowKeyboard(true && isKiosk)}
            />
            {showKeyboard && (
              <Box mt={2}>
                <Keyboard
                  keyboardRef={(r) => (keyboardRef.current = r)}
                  layoutName="default"
                  onChange={onKeyboardChange}
                  inputName="password"
                />
              </Box>
            )}
            {statusMessage && (
              <Typography mt={2} color="text.secondary">
                {statusMessage}
              </Typography>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleConnect}
          disabled={!selectedWifi || !wifiPassword}
        >
          Connect
        </Button>
      </DialogActions>
    </Dialog>
  );
}
