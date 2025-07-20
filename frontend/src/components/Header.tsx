import { Box, Typography, IconButton } from '@mui/material';
import WifiIcon from '@mui/icons-material/Wifi';
import SettingsIcon from '@mui/icons-material/Settings';
import AreaChartIcon from '@mui/icons-material/AreaChart';
import AccessAlarmIcon from '@mui/icons-material/AccessAlarm';

export default function Header() {
  return (
    <Box display="flex" justifyContent="space-between" color="gray">
      <Box display="flex" alignItems="center">
        <IconButton>
          <WifiIcon />
        </IconButton>
        <IconButton>
          <AccessAlarmIcon />
        </IconButton>
      </Box>
      <Typography variant="body2" my={1}>Ginger Dryer</Typography>
      <Box display="flex" alignItems="center">
        <IconButton>
          <AreaChartIcon />
        </IconButton>
        <IconButton>
          <SettingsIcon />
        </IconButton>
      </Box>
    </Box>
  );
}
