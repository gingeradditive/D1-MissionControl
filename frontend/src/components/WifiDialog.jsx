import React from 'react';
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

const getWifiIcon = (strength) => {
  switch (strength) {
    case 1: return <SignalWifi1Bar />;
    case 2: return <SignalWifi2Bar />;
    case 3: return <SignalWifi3Bar />;
    case 4: return <SignalWifi4Bar />;
    default: return <SignalWifi0Bar />;
  }
};

export default function WifiDialog({ open, onClose, wifiList, selectedWifi, setSelectedWifi, wifiPassword, setWifiPassword }) {
  const handleConnect = () => {
    console.log(`Connecting to ${selectedWifi} with password ${wifiPassword}`);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <WifiIcon sx={{ mr: 1 }} />
          Select WiFi Network
        </Box>
      </DialogTitle>
      <DialogContent>
        <List>
          {wifiList.map((network) => (
            <ListItem key={network.ssid} disablePadding>
              <ListItemButton onClick={() => setSelectedWifi(network.ssid)} selected={selectedWifi === network.ssid}>
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
              Connect to "{selectedWifi}"
            </Typography>
            <TextField
              fullWidth
              type="password"
              label="Password"
              margin="normal"
              value={wifiPassword}
              onChange={(e) => setWifiPassword(e.target.value)}
            />
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleConnect} disabled={!selectedWifi || !wifiPassword}>
          Connect
        </Button>
      </DialogActions>
    </Dialog>
  );
}
