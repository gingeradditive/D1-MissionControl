import { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import TemperatureDisplay from './TemperatureDisplay';
import Controls from './Controls';
import Footer from './Footer';
import CheckLight from './CheckLight';
import { api } from '../api';

export default function StatusManager() {
  const [status, setStatus] = useState({
    current_temp: null,
    setpoint: null,
    current_humidity: null,
    heater: null,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      api.getStatus()
        .then(res => setStatus(res.data))
        .catch(err => console.error("Errore nel fetch /status:", err));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleIncrease = () => {
    let newSet = Math.min(status.setpoint + 5, 100);
    api.setPoint(newSet);
    api.getStatus()
      .then(res => setStatus(res.data))
      .catch(err => console.error("Errore nel fetch /status:", err));
  };

  const handleDecrease = () => {
    let newSet = Math.max(status.setpoint - 5, 0);
    api.setPoint(newSet);
    api.getStatus()
      .then(res => setStatus(res.data))
      .catch(err => console.error("Errore nel fetch /status:", err));
  };

  return (
    <>
      <Box display="flex" justifyContent="space-evenly" alignItems="center" my={3}>
        <Controls direction="down" onClick={handleDecrease} />
        <TemperatureDisplay
          currentTemp={status.current_temp}
          setpoint={status.setpoint}
          humidity={status.current_humidity}
          heater={status.heater}
        />
        <Controls direction="up" onClick={handleIncrease} />
      </Box>

      <Box display="flex" justifyContent="end" alignItems="center" mx={4}>
        <CheckLight
          heaterOn={status.heater === 1}
          fanOn={false} // TODO
          timerSet={false} // TODO
        />
      </Box>

      <Footer
        ext_hum="---"
        int_hum={status.current_humidity}
      />
    </>
  );
}
