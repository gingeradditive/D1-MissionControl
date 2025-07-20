import { Box, IconButton, Typography, Switch } from '@mui/material';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import WaterDropIcon from '@mui/icons-material/WaterDrop';

export default function Footer() {
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
      <Box display="flex" justifyContent="center" alignItems="center">
      <ThermostatIcon fontSize="small" />
      <Typography variant="h6">24°</Typography>
      <Typography variant="h6" sx={{ color: "#cccccc", padding: "0px 10px" }} >/</Typography>
      <WaterDropIcon fontSize="small" />
      <Typography variant="h6">10%</Typography>
      </Box>
      <Box display="flex" justifyContent="end" alignItems="center">
        <Switch />
      </Box>
    </Box>
  );
}
