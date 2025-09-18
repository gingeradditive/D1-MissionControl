import { useEffect, useState, useRef } from 'react';
import { Box } from '@mui/material';
import TemperatureDisplay from './TemperatureDisplay';
import Controls from './Controls';
import Footer from './Footer';
import { api } from '../api';
import ScreensaverOverlay from './ScreensaverOverlay';
import { useSnackbar } from 'notistack';
import { IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export default function StatusManager() {
  const isKiosk = new URLSearchParams(window.location.search).get("kiosk") === "true";

  const [isScreensaverActive, setIsScreensaverActive] = useState(false);
  const [inactivityTimeout, setInactivityTimeout] = useState(null);
  const lastInteractionTime = useRef(Date.now()); // usare ref per evitare dipendenze extra

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const activeErrorsRef = useRef(new Map()); // description_date → snackbarId
  const shownErrorsRef = useRef(new Set());

  const [status, setStatus] = useState({
    current_temp: null,
    setpoint: null,
    current_humidity: null,
    heater: false,
    fan: false,
    status: false,
    valve: false,
    errors: {} //"errors": {"Simulazione errore sensore": "2025-09-18T16:38:10.298137"}
  });

  // Mostra toast per nuovi errori
  useEffect(() => {
    const currentKeys = new Set(
      Object.entries(status.errors).map(
        ([description, date]) => `${description}_${date}`
      )
    );

    // 1. Mostra toast per nuovi errori
    Object.entries(status.errors).forEach(([description, date]) => {
      const key = `${description}_${date}`;
      if (!activeErrorsRef.current.has(key)) {
        const snackbarId = enqueueSnackbar(
          `${new Date(date).toLocaleString()} - ${description}`,
          {
            variant: "error",
            persist: true, // 👈 rimane finché non lo chiudiamo noi
            action: (snackbarId) => (
              <IconButton
                onClick={() => {
                  closeSnackbar(snackbarId);
                  activeErrorsRef.current.delete(key);
                }}
                size="small"
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            )
          }
        );
        activeErrorsRef.current.set(key, snackbarId);
      }
    });

    // 2. Chiudi i toast degli errori che non ci sono più
    activeErrorsRef.current.forEach((snackbarId, key) => {
      if (!currentKeys.has(key)) {
        closeSnackbar(snackbarId);
        activeErrorsRef.current.delete(key);
      }
    });
  }, [status.errors, enqueueSnackbar, closeSnackbar]);

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

      <Footer
        ext_hum="---"
        int_hum={status.current_humidity}
        status={status.status}
        heater={status.heater}
        fan={status.fan}
        valve={status.valve}
        onStatusChange={handleStatusChange}
      />

      {isKiosk && isScreensaverActive && (
        <ScreensaverOverlay
          temperature={status.current_temp}
          status={status.status}
          onExit={() => {
            setIsScreensaverActive(false);
            lastInteractionTime.current = Date.now();
          }}
        />
      )}
    </>
  );
}
