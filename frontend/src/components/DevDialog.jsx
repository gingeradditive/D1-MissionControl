import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Divider
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';

export default function DevDialog({ open, onClose }) {
  const isKiosk = new URLSearchParams(window.location.search).get("kiosk") === "true";

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <SettingsIcon sx={{ mr: 1 }} />
          Developer Panel
        </Box>
      </DialogTitle>

      <DialogContent
        dividers
        sx={{
          '&::-webkit-scrollbar': isKiosk ? { width: '24px', height: '24px' } : {},
          '&::-webkit-scrollbar-thumb': isKiosk ? { backgroundColor: '#888', borderRadius: '4px' } : {},
          '&::-webkit-scrollbar-track': isKiosk ? { backgroundColor: '#f1f1f1', borderRadius: '4px' } : {},
        }}
      >
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          Area di sviluppo — qui puoi aggiungere strumenti, log, test API, ecc.
        </Typography>

        <Divider sx={{ my: 2 }} />

        {/* --- Inserisci qui i contenuti futuri --- */}
        <Box>
          {/* Per ora vuoto */}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Chiudi</Button>
      </DialogActions>
    </Dialog>
  );
}
