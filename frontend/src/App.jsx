import { Box, Container } from '@mui/material';
import Header from './components/Header';
import StatusManager from './components/StatusManager';
import DateTimeDisplay from './components/DateTimeDisplay';
import BackButton from './components/BackButton';
import './App.css';

export default function App() {
  return (
    <Box
      sx={{
        backgroundColor: '#f5f5f5',
        minHeight: '90vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
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
          width: 150,
          height: 'auto',
          opacity: 0.7,
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      <BackButton onClick={() => window.location.href = 'https://g1os.local'} />
      <DateTimeDisplay />
    </Box>
  );
}
