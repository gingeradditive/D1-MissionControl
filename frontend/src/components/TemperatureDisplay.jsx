import { Box, Typography } from "@mui/material";

export default function TemperatureDisplay({ currentTemp, setpoint, status }) {
  // Colori condizionati dallo status
  const ringColor = status ? "#d72e28" : "#ccc";
  const animated = status;

  return (
    <Box textAlign="center" sx={{ height: "126px", marginBottom: "36px" }}>
      <Box
        sx={{
          width: 200,
          height: 200,
          position: "relative",
          margin: "auto",
          top: "-37px"
        }}
      >
        {/* Cerchi */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            border: `1px dashed ${ringColor}`,
            borderRadius: "50%",
            animation: animated ? "pulse1 9s ease-in-out infinite" : "none",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            top: 7,
            left: 7,
            width: 185,
            height: 185,
            border: `2px dotted ${ringColor}`,
            borderRadius: "50%",
            animation: animated ? "pulse2 6s ease-in-out infinite" : "none",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            top: 15,
            left: 15,
            width: 170,
            height: 170,
            border: `2px solid ${ringColor}`,
            borderRadius: "50%",
            animation: animated ? "pulse3 3s ease-in-out infinite" : "none",
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
          <Typography variant="h2" pl={3}>
            {currentTemp !== null ? `${currentTemp}°` : "--"}
          </Typography>
          <Typography variant="body2" color="gray">
            Set {setpoint !== null ? `${setpoint}°` : ""}
          </Typography>
        </Box>
      </Box>

      {/* Animazioni CSS */}
      <style>{`
        @keyframes pulse1 {
          0%, 100% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.05) rotate(10deg); }
        }
        @keyframes pulse2 {
          0%, 100% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.03) rotate(-10deg); }
        }
        @keyframes pulse3 {
          0%, 100% { transform: scale(1);}
          50% { transform: scale(1.02); }
        }
      `}</style>
    </Box>
  );
}
