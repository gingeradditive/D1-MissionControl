import { Box, Container } from '@mui/material';
import Header from './components/Header';
import TemperatureDisplay from './components/TemperatureDisplay';
import Controls from './components/Controls';
import IndoorTemp from './components/IndoorTemp';
import Footer from './components/Footer';
import CheckLight from './components/CheckLight';
import './App.css';

export default function App() {
  return (
    <Box
      sx={{
        backgroundColor: '#f5f5f5',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
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
        <IndoorTemp />
        <Footer />
      </Container>
    </Box>
  );
}
