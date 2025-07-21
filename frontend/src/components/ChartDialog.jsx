import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Box, Select, MenuItem
} from '@mui/material';
import AreaChartIcon from '@mui/icons-material/AreaChart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function ChartDialog({ open, onClose, range, setRange, chartData }) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xl">
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <AreaChartIcon sx={{ mr: 1 }} />
          Chart for Temperature & Humidity
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box mb={2}>
          <Typography variant="subtitle2">Range:</Typography>
          <Box display="flex" gap={1} mt={1}>
            <Select value={range} onChange={(e) => setRange(e.target.value)}>
              <MenuItem value="1m">Last minute (1 value per second)</MenuItem>
              <MenuItem value="1h">Last hour (1 value per minute)</MenuItem>
              <MenuItem value="12h">12 hours (2 values per hour)</MenuItem>
            </Select>
          </Box>
        </Box>

        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={4}>
          <Box flex={1}>
            <Typography variant="subtitle2" mb={1}>Temperature</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="temperature" stroke="#ff5722" />
              </LineChart>
            </ResponsiveContainer>
          </Box>
          <Box flex={1}>
            <Typography variant="subtitle2" mb={1}>Humidity</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="humidity" stroke="#2196f3" />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
