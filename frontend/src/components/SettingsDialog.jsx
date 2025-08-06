import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Box, Divider, CircularProgress,
  TextField, IconButton, Grid
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import UpdateIcon from '@mui/icons-material/SystemUpdateAlt';
import ReplayIcon from '@mui/icons-material/Replay';
import { api } from '../api';
import { useKeyboard } from '../KeyboardContext';  

export default function SettingsDialog({
  open,
  onClose,
  keysToShow = null,
  titlesMap = {},
}) {
  const isKiosk = new URLSearchParams(window.location.search).get("kiosk") === "true";
  const { openKeyboard } = useKeyboard();

  const [config, setConfig] = useState(null);
  const [originalConfig, setOriginalConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [checking, setChecking] = useState(false);
  const [updateStatus, setUpdateStatus] = useState(null);

  useEffect(() => {
    if (open) {
      setLoading(true);
      api.getConfigurations()
        .then(response => {
          setConfig(response.data);
          setOriginalConfig(response.data);
          setLoading(false);
          setSaveError(null);
          setUpdateStatus(null);
        })
        .catch(err => {
          setLoading(false);
          setSaveError('Failed to load configuration.');
        });
    }
  }, [open]);

  const handleConfigChange = (key, value) => {
    setConfig(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleResetField = (key) => {
    setConfig(prev => ({
      ...prev,
      [key]: originalConfig[key],
    }));
  };

  const handleSave = () => {
    if (!config) return;
    setSaving(true);
    setSaveError(null);
    // Filtra solo i valori modificati per ottimizzare richieste
    const keysToUpdate = Object.keys(config).filter(
      key => config[key] !== originalConfig[key]
    );
    Promise.all(
      keysToUpdate.map(key => api.setConfiguration(key, config[key]))
    )
      .then(() => {
        setOriginalConfig(config);
        setSaving(false);
      })
      .catch(err => {
        setSaveError('Failed to save configuration.');
        setSaving(false);
      });
  };

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
        {loading && <CircularProgress />}
        {saveError && (
          <Typography color="error" mb={2}>
            {saveError}
          </Typography>
        )}

        {config && !loading && (
          <>
            <Grid container spacing={2} mb={2}>
              {Object.entries(config)
                .filter(([key]) => !keysToShow || keysToShow.includes(key))
                .map(([key, value]) => {
                  const isModified = originalConfig[key] !== config[key];
                  const label = titlesMap[key] ||
                    key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

                  return (
                    <Grid item size={6} key={key}>
                      <TextField
                        label={label}
                        type="number"
                        value={value}
                        onChange={e => !isKiosk && handleConfigChange(key, Number(e.target.value))}
                        size="small"
                        fullWidth
                        InputProps={{
                          endAdornment: isModified && (
                            <IconButton
                              edge="end"
                              size="small"
                              onClick={() => handleResetField(key)}
                              title="Reset to original"
                            >
                              <ReplayIcon />
                            </IconButton>
                          ),
                          inputProps: { min: 0, step: 0.1 }
                        }}
                        readOnly={isKiosk}
                        onFocus={() => isKiosk && openKeyboard(value, val => handleConfigChange(key, Number(val)))}
                        onClick={() => isKiosk && openKeyboard(value, val => handleConfigChange(key, Number(val)))}
                      />
                    </Grid>
                  );
                })}
            </Grid>

            <Box display="flex" justifyContent="flex-start" gap={1}>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={saving || JSON.stringify(config) === JSON.stringify(originalConfig)}
              >
                {saving ? <CircularProgress size={20} /> : "Save"}
              </Button>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ mb: 3 }}>
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
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
