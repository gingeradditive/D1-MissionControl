import { useEffect, useState } from 'react';
import { Box, Container } from '@mui/material';
import Header from './components/Header';
import StatusManager from './components/StatusManager';
import DateTimeDisplay from './components/DateTimeDisplay';
import BackButton from './components/BackButton';
import './App.css';
import { api } from './api';
import "react-simple-keyboard/build/css/index.css";
import { KeyboardProvider } from './KeyboardContext';
import VirtualKeyboard from './components/VirtualKeyboard';

export default function App() {
  const [showBackButton, setShowBackButton] = useState(false);
  const isKiosk = new URLSearchParams(window.location.search).get("kiosk") === "true";

  useEffect(() => {
    const checkG1OS = async () => {
      const result = await api.getconnectionG1OS();
      setShowBackButton(result.data.status === true);
    };
    checkG1OS();
  }, []);

  return (
    <KeyboardProvider>
      <Box
        sx={{
          backgroundColor: '#f5f5f5',
          minHeight: '90vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          network: {
            connected: false,
            ssid: "",
            strength: 0
          }
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
            zIndex: 1,
          }}
        >
          <Header />
          <StatusManager />
        </Container>

        <Box
          component="img"
          src="/Logo_ginger.svg"
          alt="Logo Ginger"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            width: "8vw",
            maxWidth: 100,
            height: 'auto',
            opacity: 0.7,
            zIndex: 0,
            pointerEvents: 'none',
          }}
        />

        {showBackButton & !isKiosk && (
          <BackButton onClick={() => window.location.href = 'https://g1os.local'} />
        )}

        <DateTimeDisplay />
      </Box>
      <VirtualKeyboard />
    </KeyboardProvider>
  );
}
