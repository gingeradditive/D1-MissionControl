import React, { useEffect, useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, Typography, Box, Select, MenuItem
} from '@mui/material';
import AreaChartIcon from '@mui/icons-material/AreaChart';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { api } from '../api';

export default function ChartDialog({ open, onClose }) {
    const [range, setRange] = useState('1m');
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        let interval;
        const fetchData = () => {
            api.getHistory(range)
                .then(response => {
                    const transformed = response.data.history.map(entry => ({
                        time: entry.timestamp.slice(11),
                        temperature: entry.temperature,
                        humidity: entry.humidity,
                        tempMin: entry.temp_min,
                        tempMax: entry.temp_max,
                        humMin: entry.hum_min,
                        humMax: entry.hum_max,
                    }));
                    setChartData(transformed);
                })
                .catch(error => {
                    console.error('Failed to fetch chart data:', error);
                    setChartData([]);
                });
        };

        if (open) {
            fetchData();

            const intervalTime = range === '1m' ? 1000 : range === '1h' ? 60000 : null;

            if (intervalTime) {
                interval = setInterval(fetchData, intervalTime);
            }
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [range, open]);

    useEffect(() => {
        if (open) {
            api.getHistory(range)
                .then(response => {
                    const transformed = response.data.history.map(entry => ({
                        time: entry.timestamp.slice(11),
                        temperature: entry.temperature,
                        humidity: entry.humidity,
                        tempMin: entry.temp_min,
                        tempMax: entry.temp_max,
                        humMin: entry.hum_min,
                        humMax: entry.hum_max,
                    }));
                    setChartData(transformed);
                })
                .catch(error => {
                    console.error('Failed to fetch chart data:', error);
                    setChartData([]);
                });
        }
    }, [range, open]);

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
                                <YAxis
                                    domain={[0, 100]}
                                    tickFormatter={(value) => `${value}°C`}
                                />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" name="Average" dataKey="temperature" stroke="#ff5722" dot={false} isAnimationActive={false} />
                                <Line type="monotone" name="Min" dataKey="tempMin" stroke="#ffccbc" strokeDasharray="5 5" dot={false} isAnimationActive={false} />
                                <Line type="monotone" name="Max" dataKey="tempMax" stroke="#bf360c" strokeDasharray="5 5" dot={false} isAnimationActive={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </Box>
                    <Box flex={1}>
                        <Typography variant="subtitle2" mb={1}>Humidity</Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="time" />
                                <YAxis
                                    domain={[0, 100]}
                                    tickFormatter={(value) => `${value}%`}
                                />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" name="Average" dataKey="humidity" stroke="#2196f3" dot={false} isAnimationActive={false} />
                                <Line type="monotone" name="Min" dataKey="humMin" stroke="#bbdefb" strokeDasharray="5 5" dot={false} isAnimationActive={false} />
                                <Line type="monotone" name="Max" dataKey="humMax" stroke="#0d47a1" strokeDasharray="5 5" dot={false} isAnimationActive={false} />
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
