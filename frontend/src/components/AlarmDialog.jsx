import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Box
} from '@mui/material';
import AccessAlarmIcon from '@mui/icons-material/AccessAlarm';

export default function AlarmDialog({ open, onClose }) {
  return (
    <Dialog open={open} onClose={onClose}>
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
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
