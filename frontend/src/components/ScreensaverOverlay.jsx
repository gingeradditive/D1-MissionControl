import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import TouchAppIcon from '@mui/icons-material/TouchApp';

const ScreensaverOverlay = ({ onExit, temperature, status }) => {
  const ringColor = status ? "#B71C1C" : "#757575";
  const animated = status;

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
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#333333',
        textAlign: 'center'
      }}
    >
      {/* Cerchi */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "400px",
          height: "400px",
          border: `2px dashed ${ringColor}`,
          borderRadius: "50%",
          animation: animated ? "pulse1 9s ease-in-out infinite" : "none",
          top: "calc(50% - 200px)",
          left: "calc(50% - 200px)"
        }}
      />
      <Box
        sx={{
          position: "absolute",
          top: 7,
          left: 7,
          width: 370,
          height: 370,
          border: `3px dotted ${ringColor}`,
          borderRadius: "50%",
          animation: animated ? "pulse2 6s ease-in-out infinite" : "none",
          top: "calc(50% - 185px)",
          left: "calc(50% - 185px)"
        }}
      />
      <Box
        sx={{
          position: "absolute",
          top: 15,
          width: 340,
          height: 340,
          border: `4px solid ${ringColor}`,
          borderRadius: "50%",
          animation: animated ? "pulse3 3s ease-in-out infinite" : "none",
          top: "calc(50% - 170px)",
          left: "calc(50% - 170px)"
        }}
      />

      {/* Contenuto centrale */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="h1" sx={{fontSize: "150px"}} pl={3}>
          {temperature !== null ? `${temperature}°` : "--"}
        </Typography>
      </Box>

      <Typography variant="h6" sx={{ opacity: 1, background: "#000", padding: 1, position: 'absolute', bottom: 20, borderTop: `1px solid #222` }}>
        <TouchAppIcon /> Touch to exit screensaver
      </Typography>
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
          zIndex: 0,
          pointerEvents: 'none',
          opacity: 0.5
        }}
      />
    </Box>
  );
};

export default ScreensaverOverlay;
