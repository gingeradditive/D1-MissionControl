import { useEffect, useState } from "react";
import { Box, Container } from '@mui/material';
import Header from './components/Header';
import TemperatureDisplay from './components/TemperatureDisplay';
import Controls from './components/Controls';
import Footer from './components/Footer';
import CheckLight from './components/CheckLight';
import DateTimeDisplay from './components/DateTimeDisplay';
import BackButton from './components/BackButton';
import { api } from "./api";
import './App.css';

export default function App() {
  const [status, setStatus] = useState({
    current_temp: null,
    setpoint: null,
    current_humidity: null,
    heater: null,
  });

  useEffect(() => {
    let interval = setInterval(() => {
      api.getStatus()
        .then(res => setStatus(res.data))
        .catch(err => console.error("Errore nel fetch /status:", err));
    }, 1000); //

    return () => clearInterval(interval);
  }, []);

  function handleIncrease() {
     let newSet = status.setpoint + 5;
     if (newSet > 100)
       newSet = 100;
     api.setPoint(newSet);
     api.getStatus()
        .then(res => setStatus(res.data))
        .catch(err => console.error("Errore nel fetch /status:", err));
  }
  
  function handleDecrease() {
      let newSet = status.setpoint - 5;
      if (newSet < 0)
        newSet = 0;
      api.setPoint(newSet);
      api.getStatus()
        .then(res => setStatus(res.data))
        .catch(err => console.error("Errore nel fetch /status:", err));
  }

  return (
    <Box
      sx={{
        backgroundColor: '#f5f5f5',
        minHeight: '90vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative', // importante per posizionamento figlio
      }}
    >
      <Container
        maxWidth="sm"
        sx={{
          backgroundColor: '#fff',
          color: '#333',
          borderRadius: 4,
          p: 3,
          boxShadow: 2,
          zIndex: 1, // metti sopra l'immagine
        }}
      >
        <Header />
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
            fanOn={false} //TODO: implementare logica per il fan
            timerSet={false} //TODO: implementare logica per il timer
          />
        </Box>
        <Footer
          ext_hum = {"---"}
          int_hum = {status.current_humidity}
        />
      </Container>
      <Box
        component="img"
        src="/Logo_ginger.svg"
        alt="Logo Ginger"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          width: 150,
          height: 'auto',
          opacity: 0.7, // un po' trasparente se vuoi
          zIndex: 0, // sotto il container
          pointerEvents: 'none', // per non interferire con i click
        }}
      />
      <BackButton onClick={() => window.location.href = 'https://g1os.local'} />
      <DateTimeDisplay />
    </Box>
  );
}
