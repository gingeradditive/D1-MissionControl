import { Box, IconButton } from '@mui/material';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import AirIcon from '@mui/icons-material/Air';

export default function CheckLight() {
  return (
    <Box display="flex" justifyContent="end" alignItems="center">
      <IconButton sx={{ color: 'red' }}>
        <LocalFireDepartmentIcon fontSize='medium'/>
      </IconButton>
      <IconButton sx={{ color: 'lightblue' }}>
        <AirIcon fontSize='medium'/>
      </IconButton>
    </Box>
  );
}
