import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import TouchAppIcon from '@mui/icons-material/TouchApp';

const ScreensaverOverlay = ({ onExit, temperature }) => {
  const [logoPosition, setLogoPosition] = useState({ top: '80%', left: '80%' });

  useEffect(() => {
    const interval = setInterval(() => {
      const randomTop = Math.floor(Math.random() * 80) + '%';
      const randomLeft = Math.floor(Math.random() * 80) + '%';
      setLogoPosition({ top: randomTop, left: randomLeft });
    }, 5000); // Cambia posizione ogni 5s

    return () => clearInterval(interval);
  }, []);

  return (
    <Box
      onClick={onExit}
      onTouchStart={onExit}
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'black',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#333333',
        textAlign: 'center',
      }}
    >
      <Typography variant="h2" sx={{ mb: 4, opacity: 1, background: "#000", padding: 1, borderRadius:"8px" }}>
        {temperature} °C
      </Typography>
      <Typography variant="h6" sx={{ opacity: 1, background: "#000", padding: 1, borderRadius:"8px" }}>
        <TouchAppIcon/> Touch to exit screensaver
      </Typography>
      <Box
        component="img"
        src="/Logo_ginger.svg"
        alt="Logo Ginger"
        sx={{
          position: 'absolute',
          width: 80,
          height: 'auto',
          opacity: 0.3,
          transition: 'top 5s linear, left 5s linear',
          zIndex: -1,
          ...logoPosition,
        }}
      />
    </Box>
  );
};

export default ScreensaverOverlay;
