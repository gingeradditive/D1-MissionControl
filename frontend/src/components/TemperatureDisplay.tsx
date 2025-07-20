import { Box, Typography } from '@mui/material';

export default function TemperatureDisplay() {
  return (
    <Box textAlign="center">
      <Box
        sx={{
          border: '1px solid #d72e28',
          borderRadius: '50%',
          width: 126,
          height: 126,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          margin: 'auto',
        }}
      >
        <Box
          sx={{
            border: '2px solid #d72e28',
            borderRadius: '50%',
            width: 115,
            height: 115,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            margin: 'auto',
          }}
        >
          <Box
            sx={{
              border: '4px solid #d72e28',
              borderRadius: '50%',
              width: 100,
              height: 100,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              margin: 'auto',
            }}
          > 
            <Typography variant="h4">70°</Typography>
            <Typography variant="caption" color="gray">Set</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
