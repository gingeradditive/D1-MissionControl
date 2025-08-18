import { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';

export default function DateTimeDisplay() {
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = dateTime.toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const formattedTime = dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 16,
        left: 16,
        padding: '6px 12px',
        borderRadius: 2,
        fontSize: '2rem',
        color: '#999',
        zIndex: 0,
      }}
    >
      <Typography>{formattedDate} - {formattedTime}</Typography>
    </Box>
  );
}
