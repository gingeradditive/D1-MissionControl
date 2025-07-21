import React, { useState } from 'react';
import {
  Box, Typography, IconButton, Dialog,
  DialogTitle, DialogContent, DialogActions, Button,
  TextField, List, ListItem, ListItemButton,
  ListItemIcon, ListItemText, Divider, Select, MenuItem
} from '@mui/material';

import WifiIcon from '@mui/icons-material/Wifi';
import SettingsIcon from '@mui/icons-material/Settings';
import AreaChartIcon from '@mui/icons-material/AreaChart';
import AccessAlarmIcon from '@mui/icons-material/AccessAlarm';
import SignalWifi0Bar from '@mui/icons-material/SignalWifi0Bar';
import SignalWifi1Bar from '@mui/icons-material/SignalWifi1Bar';
import SignalWifi2Bar from '@mui/icons-material/SignalWifi2Bar';
import SignalWifi3Bar from '@mui/icons-material/SignalWifi3Bar';
import SignalWifi4Bar from '@mui/icons-material/SignalWifi4Bar';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Mock data
const mockWifiList = [
  { ssid: 'GingerNet', strength: 4 },
  { ssid: 'DryerWiFi', strength: 2 },
  { ssid: 'Studio 42', strength: 3 },
  { ssid: 'OpenNet', strength: 1 },
];

const mockChartData = Array.from({ length: 10 }, (_, i) => ({
  time: `T${i}`,
  temperature: 20 + i,
  humidity: 50 + i * 2,
}));

function getWifiIcon(strength) {
  switch (strength) {
    case 1: return <SignalWifi1Bar />;
    case 2: return <SignalWifi2Bar />;
    case 3: return <SignalWifi3Bar />;
    case 4: return <SignalWifi4Bar />;
    default: return <SignalWifi0Bar />;
  }
}

export default function Header() {
  const [openModal, setOpenModal] = useState(null); // 'wifi' | 'alarm' | 'chart' | 'settings'
  const [selectedWifi, setSelectedWifi] = useState(null);
  const [wifiPassword, setWifiPassword] = useState('');
  const [range, setRange] = useState('1h');

  const handleOpen = (modal) => () => setOpenModal(modal);
  const handleClose = () => {
    setOpenModal(null);
    setSelectedWifi(null);
    setWifiPassword('');
  };

  return (
    <>
      <Box display="flex" justifyContent="space-between" color="gray">
        <Box display="flex" alignItems="center">
          <IconButton onClick={handleOpen('wifi')}>
            <WifiIcon />
          </IconButton>
          <IconButton onClick={handleOpen('alarm')}>
            <AccessAlarmIcon />
          </IconButton>
        </Box>
        <Typography variant="body2" my={1}>Ginger Dryer</Typography>
        <Box display="flex" alignItems="center">
          <IconButton onClick={handleOpen('chart')}>
            <AreaChartIcon />
          </IconButton>
          <IconButton onClick={handleOpen('settings')}>
            <SettingsIcon />
          </IconButton>
        </Box>
      </Box>

      {/* WiFi Modal */}
      <Dialog open={openModal === 'wifi'} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <WifiIcon sx={{ mr: 1 }} />
            Select WiFi Network
          </Box>
        </DialogTitle>
        <DialogContent>
          <List>
            {mockWifiList.map((network) => (
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
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={() => {
              console.log(`Connecting to ${selectedWifi} with password ${wifiPassword}`);
              handleClose();
            }}
            disabled={!selectedWifi || !wifiPassword}
          >
            Connect
          </Button>
        </DialogActions>
      </Dialog>

      {/* Timer Modal */}
      <Dialog open={openModal === 'alarm'} onClose={handleClose}>
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <AccessAlarmIcon sx={{ mr: 1 }} />
            Timer Settings
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Typography>Coming soon...</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Chart Modal */}
      <Dialog open={openModal === 'chart'} onClose={handleClose} fullWidth maxWidth="xl">
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <AreaChartIcon sx={{ mr: 1 }} />
            Chart for Temperature & Humidity
          </Box>
        </DialogTitle>

        <DialogContent>
          <Box mb={2}>
            <Typography variant="subtitle2">Range:</Typography>
            <Box display="flex" gap={1} mt={1}>
              <Select
                value={range}
                label="Range"
                onChange={(e) => setRange(e.target.value)}
              >
                <MenuItem value="1m">Last minute (1 value per second)</MenuItem>
                <MenuItem value="1h">Last hour (1 value for minute)</MenuItem>
                <MenuItem value="12h">12 hours (2 value for hour)</MenuItem>
              </Select>
            </Box>
          </Box>

          <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={4}>
            <Box flex={1}>
              <Typography variant="subtitle2" mb={1}>Temperature</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mockChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="temperature" stroke="#ff5722" />
                </LineChart>
              </ResponsiveContainer>
            </Box>
            <Box flex={1}>
              <Typography variant="subtitle2" mb={1}>Humidity</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mockChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="humidity" stroke="#2196f3" />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Settings Modal */}
      <Dialog open={openModal === 'settings'} onClose={handleClose}>
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <SettingsIcon sx={{ mr: 1 }} />
            Settings
          </Box>
        </DialogTitle>

        <DialogContent>
          <Typography>Settings will be available soon...</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
