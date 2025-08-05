import React, { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Typography, Box
} from '@mui/material';
import WifiIcon from '@mui/icons-material/Wifi';
import { api } from '../api';

export default function WifiConnectDialog({ network, onClose, onSuccess }) {
    const [password, setPassword] = useState('');
    const [statusMessage, setStatusMessage] = useState('');

    const handleConnect = async () => {
        try {
            setStatusMessage('Connecting...');
            const res = await api.setConnection(network.ssid, password);
            setStatusMessage(res.data.message);
            if(res.data.status == "Success")
                onSuccess();
        } catch (error) {
            console.error("Connection error:", error);
            setStatusMessage('Error during connection. Check your password.');
        }
    };

    return (
        <Dialog open onClose={onClose} fullWidth maxWidth="xl">
            <DialogTitle>
                <Box display="flex" alignItems="center">
                    <WifiIcon sx={{ mr: 1 }} />
                    Connect to "{network.ssid}"
                </Box>
            </DialogTitle>
            <DialogContent>
                <TextField
                    fullWidth
                    type="password"
                    label="Password"
                    margin="normal"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                {statusMessage && (
                    <Typography mt={2} color="text.secondary">
                        {statusMessage}
                    </Typography>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    onClick={handleConnect}
                    disabled={!password}
                >
                    Connect
                </Button>
            </DialogActions>
        </Dialog>
    );
}
