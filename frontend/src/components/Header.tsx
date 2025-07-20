import { Box, Typography, IconButton } from '@mui/material';
import WifiIcon from '@mui/icons-material/Wifi';
import SettingsIcon from '@mui/icons-material/Settings';

export default function Header() {
  return (
    <Box display="flex" justifyContent="space-between" color="gray">
      <IconButton>
        <WifiIcon />
      </IconButton>
      <Typography variant="body2">10:10 AM • 1 AUG 2024</Typography>
      <IconButton>
        <SettingsIcon />
      </IconButton>
    </Box>
  );
}
