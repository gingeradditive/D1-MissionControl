import { Box, Container } from '@mui/material';
import Header from './components/Header';
import TemperatureDisplay from './components/TemperatureDisplay';
import Controls from './components/Controls';
import Footer from './components/Footer';
import CheckLight from './components/CheckLight';
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
          <Controls direction="down" />
          <TemperatureDisplay />
          <Controls direction="up" />
        </Box>
        <Box display="flex" justifyContent="end" alignItems="center" mx={4}>
          <CheckLight />
        </Box>
        <Footer />
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
