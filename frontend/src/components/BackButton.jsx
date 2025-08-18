// components/BackButton.jsx
import { Box, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function BackButton({ onClick }) {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 16,
        left: 16,
        zIndex: 10,
      }}
    >
      <Button
        variant="outlined"
        startIcon={<ArrowBackIcon />}
        onClick={onClick}
        sx={{
          textTransform: 'none',
          backgroundColor: '#fff',
          color: '#d72e28',
          borderColor: '#fff',
          borderRadius: 8,
          fontSize: '1.2rem',
          '&:hover': {
            backgroundColor: '#f0f0f0',
            borderColor: '#d72e28',
          },
          boxShadow: 6,
          padding: '8px 16px',
        }}
      >
        Go to G1OS
      </Button>
    </Box>
  );
}
