import { Box, IconButton, Typography, Switch } from '@mui/material';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';

export default function Footer() {
  return (
    <Box display="flex" justifyContent="end" alignItems="center" mt={2}>
      <Switch />
    </Box>
  );
}
