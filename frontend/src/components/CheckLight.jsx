import { Box, Tooltip } from '@mui/material';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import AirIcon from '@mui/icons-material/Air';
import AlarmOffIcon from '@mui/icons-material/AlarmOff';

export default function CheckLight() {
  return (
    <Box display="flex" justifyContent="end" alignItems="center">
        <Tooltip title="No timer set">
            <AlarmOffIcon fontSize='medium' sx={{ color: '#cccccc', marginRight: 2 }}/>
        </Tooltip>
        <Tooltip title="Heater ON">
            <LocalFireDepartmentIcon fontSize='medium' sx={{ color: 'red', marginRight: 2  }}/>
        </Tooltip>
        <Tooltip title="Fan ON">
            <AirIcon fontSize='medium' sx={{ color: 'lightblue' }}/>
        </Tooltip>
    </Box>
  );
}
