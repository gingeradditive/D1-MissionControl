import React, { useState } from 'react';
import { Box, Typography, IconButton } from '@mui/material';

import SignalWifiOffIcon from '@mui/icons-material/SignalWifiOff';
import SignalWifi1BarIcon from '@mui/icons-material/SignalWifi1Bar';
import SignalWifi2BarIcon from '@mui/icons-material/SignalWifi2Bar';
import SignalWifi3BarIcon from '@mui/icons-material/SignalWifi3Bar';
import SignalWifi4BarIcon from '@mui/icons-material/SignalWifi4Bar';

import SettingsIcon from '@mui/icons-material/Settings';
import AreaChartIcon from '@mui/icons-material/AreaChart';
import AccessAlarmIcon from '@mui/icons-material/AccessAlarm';

import WifiDialog from './WifiDialog';
import AlarmDialog from './AlarmDialog';
import ChartDialog from './ChartDialog';
import SettingsDialog from './SettingsDialog';

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

export default function Header({ network }) {
  const [openModal, setOpenModal] = useState(null);
  const [selectedWifi, setSelectedWifi] = useState(null);
  const [wifiPassword, setWifiPassword] = useState('');
  const [range, setRange] = useState('1h');

  const handleOpen = (modal) => () => setOpenModal(modal);
  const handleClose = () => {
    setOpenModal(null);
    setSelectedWifi(null);
    setWifiPassword('');
  };

  const getWifiIcon = (network) => {
    if (!network?.connected) return <SignalWifiOffIcon />;
    const strength = network.strength;

    if (strength > 75) return <SignalWifi4BarIcon />;
    if (strength > 50) return <SignalWifi3BarIcon />;
    if (strength > 25) return <SignalWifi2BarIcon />;
    return <SignalWifi1BarIcon />;
  };


  return (
    <>
      <Box display="flex" justifyContent="space-between" color="gray">
        <Box display="flex" alignItems="center">
          <IconButton onClick={handleOpen('wifi')}>
            {getWifiIcon(network)}
          </IconButton>

          <IconButton onClick={handleOpen('alarm')}><AccessAlarmIcon /></IconButton>
        </Box>
        <Typography variant="body2" my={1}>Ginger Dryer</Typography>
        <Box display="flex" alignItems="center">
          <IconButton onClick={handleOpen('chart')}><AreaChartIcon /></IconButton>
          <IconButton onClick={handleOpen('settings')}><SettingsIcon /></IconButton>
        </Box>
      </Box>

      <WifiDialog
        open={openModal === 'wifi'}
        onClose={handleClose}
        wifiList={mockWifiList}
        selectedWifi={selectedWifi}
        setSelectedWifi={setSelectedWifi}
        wifiPassword={wifiPassword}
        setWifiPassword={setWifiPassword}
      />

      <AlarmDialog open={openModal === 'alarm'} onClose={handleClose} />

      <ChartDialog
        open={openModal === 'chart'}
        onClose={handleClose}
        range={range}
        setRange={setRange}
        chartData={mockChartData}
      />

      <SettingsDialog open={openModal === 'settings'} onClose={handleClose} />
    </>
  );
}
