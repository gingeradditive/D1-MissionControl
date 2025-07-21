import { Box, Typography } from '@mui/material';

export default function TemperatureDisplay() {
  return (
    <Box textAlign="center">
      <Box
        sx={{
          width: 126,
          height: 126,
          position: 'relative',
          margin: 'auto',
        }}
      >
        {/* Cerchio 1 */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            border: '1px dashed #d72e28',
            borderRadius: '50%',
            animation: 'pulse1 9s ease-in-out infinite',
          }}
        />
        {/* Cerchio 2 */}
        <Box
          sx={{
            position: 'absolute',
            top: 4,
            left: 4,
            width: 116,
            height: 116,
            border: '2px dotted #d72e28',
            borderRadius: '50%',
            animation: 'pulse2 6s ease-in-out infinite',
          }}
        />
        {/* Cerchio 3 */}
        <Box
          sx={{
            position: 'absolute',
            top: 10,
            left: 10,
            width: 104,
            height: 104,
            border: '2px solid #d72e28',
            borderRadius: '50%',
            animation: 'pulse3 3s ease-in-out infinite',
          }}
        />

        {/* Contenuto centrale NON animato */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="h4">70°</Typography>
          <Typography variant="caption" color="gray">
            Set
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
