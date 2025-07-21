import React, { useState } from "react";
import { Box, IconButton, Typography, Switch, styled } from '@mui/material';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";

const StyledSwitch = styled(Switch)(({ theme }) => ({
  width: 56.5,
  height: 34.5,
  padding: 7,
  transform: "scale(1.5)",
  "& .MuiSwitch-switchBase": {
    padding: 8,
    "&.Mui-checked": {
      transform: "translateX(22px)",
      color: "#fff",
      "& + .MuiSwitch-track": {
        backgroundColor: "green",
        opacity: 1,
      },
    },
  },
  "& .MuiSwitch-thumb": {
    backgroundColor: "#f1f1f1",
    width: 18,
    height: 18,
  },
  "& .MuiSwitch-track": {
    borderRadius: 20 / 2,
    backgroundColor: "red",
    opacity: 1,
  },
}));

export default function Footer({ext_hum, int_hum}) {
  const [checked, setChecked] = useState(false);

  const handleChange = (event) => {
    setChecked(event.target.checked);
  };

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      bgcolor="#fafafa"
      p={1}
      borderRadius={2}
      mt={2}
    >
      <Box display="flex" justifyContent="center" alignItems="baseline">
        <WaterDropIcon fontSize="small" />
        <Typography variant="caption" sx={{ fontSize: '0.6em', ml: 0.2 }}>ext</Typography>
        <Typography variant="h6" sx={{ ml: 0.5 }}>{ext_hum !== null ? `${ext_hum}%` : ""}</Typography>
        <Typography variant="h6" sx={{ color: "#cccccc", padding: "0px 10px" }}>/</Typography>
        <WaterDropIcon fontSize="small" />
        <Typography variant="caption" sx={{ fontSize: '0.6em', ml: 0.2 }}>int</Typography>
        <Typography variant="h6" sx={{ ml: 0.5 }}>{int_hum !== null ? `${int_hum}%` : ""}</Typography>
      </Box>
      <Box position="relative" display="flex" justifyContent="end" alignItems="center">
        <StyledSwitch checked={checked} onChange={handleChange} />
        <Box
          position="absolute"
          left={checked ? 37 : 4.5}
          top={10}
          pointerEvents="none"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <PowerSettingsNewIcon
            style={{ fontSize: 14, color: "gray" }}
          />
        </Box>
      </Box>
    </Box>
  );
}
