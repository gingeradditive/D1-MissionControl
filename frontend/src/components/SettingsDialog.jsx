import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Box, Divider, CircularProgress
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import UpdateIcon from '@mui/icons-material/SystemUpdateAlt';
import { api } from '../api';

export default function SettingsDialog({ open, onClose }) {
  const [checking, setChecking] = useState(false);
  const [updateStatus, setUpdateStatus] = useState(null);

  const handleCheckUpdates = () => {
    setChecking(true);
    setUpdateStatus(null);

    api.checkForUpdates()
      .then(response => {
        setChecking(false);
        if (response.data.updateAvailable) {
          setUpdateStatus("Update in progress...");
        } else {
          setUpdateStatus("You have the latest version.");
        }
      })
      .catch(error => {
        setChecking(false);
        console.error('Error checking for updates:', error);
        setUpdateStatus("Failed to check for updates.");
      });


    // Simula una richiesta asincrona per il check aggiornamenti
    // setTimeout(() => {
    //   setChecking(false);
    //   setUpdateStatus("You have the latest version.");
    // }, 2000);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <SettingsIcon sx={{ mr: 1 }} />
          Settings
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Typography mb={2}>Settings will be available soon...</Typography>

        <Divider sx={{ my: 2 }} />

        <Box>
          <Box display="flex" alignItems="center" mb={1}>
            <UpdateIcon sx={{ mr: 1 }} />
            <Typography variant="subtitle1">Check for Updates</Typography>
          </Box>

          <Button
            variant="outlined"
            onClick={handleCheckUpdates}
            disabled={checking}
            sx={{ mb: 1 }}
          >
            {checking ? <CircularProgress size={20} /> : "Check Now"}
          </Button>

          {updateStatus && (
            <Typography variant="body2" color="textSecondary">
              {updateStatus}
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
