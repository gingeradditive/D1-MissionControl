import { useEffect, useState, useRef } from 'react';
import { Box } from '@mui/material';
import TemperatureDisplay from './TemperatureDisplay';
import Controls from './Controls';
import Footer from './Footer';
import CheckLight from './CheckLight';
import { api } from '../api';
import ScreensaverOverlay from './ScreensaverOverlay';

export default function StatusManager() {
  const isKiosk = new URLSearchParams(window.location.search).get("kiosk") === "true";

  const [isScreensaverActive, setIsScreensaverActive] = useState(false);
  const [inactivityTimeout, setInactivityTimeout] = useState(null);
  const lastInteractionTime = useRef(Date.now()); // usare ref per evitare dipendenze extra

  const [status, setStatus] = useState({
    current_temp: null,
    setpoint: null,
    current_humidity: null,
    heater: false,
    fan: false,
    status: false,
  });

  // Fetch configurazione timeout
  useEffect(() => {
    const fetchTimeout = async () => {
      try {
        const response = await api.getConfiguration("inactivity_timeout");
        setInactivityTimeout(response.data); // Assicurati che sia il valore in secondi
      } catch (error) {
        console.error("Errore durante il fetch:", error);
      }
    };

    fetchTimeout();
  }, []);

  // Fetch status regolarmente
  useEffect(() => {
    const interval = setInterval(() => {
      api.getStatus()
        .then(res => setStatus(res.data))
        .catch(err => console.error("Errore nel fetch /status:", err));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Event handler per interazione utente
  const resetTimer = () => {
    lastInteractionTime.current = Date.now();
    if (isScreensaverActive) {
      setIsScreensaverActive(false);
    }
  };

  // Gestione inattività
  useEffect(() => {
    if (!isKiosk || inactivityTimeout == null || inactivityTimeout == "" || inactivityTimeout <= 0) return;

    const events = ['mousemove', 'mousedown', 'touchstart', 'keydown'];
    events.forEach(e => window.addEventListener(e, resetTimer));

    const interval = setInterval(() => {
      if (Date.now() - lastInteractionTime.current > inactivityTimeout * 1000) {
        setIsScreensaverActive(true);
      }
    }, 1000);

    return () => {
      events.forEach(e => window.removeEventListener(e, resetTimer));
      clearInterval(interval);
    };
  }, [inactivityTimeout, isKiosk]);

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

  const handleStatusChange = () => {
    api.setStatus(!status.status)
      .then(() => {
        setStatus(prev => ({ ...prev, status: !prev.status }));
      })
      .catch(err => console.error("Errore nel cambio stato:", err));
  };

  return (
    <>
      <Box display="flex" justifyContent="space-evenly" alignItems="center" my={3}>
        <Controls direction="down" onClick={handleDecrease} />
        <TemperatureDisplay
          currentTemp={status.current_temp}
          setpoint={status.setpoint}
          status={status.status}
        />
        <Controls direction="up" onClick={handleIncrease} />
      </Box>

      <Box display="flex" justifyContent="end" alignItems="center" mx={4}>
        <CheckLight
          heaterOn={status.heater}
          fanOn={status.fan}
          timerSet={false} // TODO: implement timerSet logic
        />
      </Box>

      <Footer
        ext_hum="---"
        int_hum={status.current_humidity}
        status={status.status}
        onStatusChange={handleStatusChange}
      />

      {isKiosk && isScreensaverActive && (
        <ScreensaverOverlay
          temperature={status.current_temp}
          onExit={() => {
            setIsScreensaverActive(false);
            lastInteractionTime.current = Date.now();
          }}
        />
      )}
    </>
  );
}
