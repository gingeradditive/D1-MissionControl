import { IconButton } from '@mui/material';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

export default function Controls({ direction }) {
  return (
    <IconButton sx={{ border:"2px solid #cccccc", background:"#eeeeee", color: '#333' }}>
      {direction === 'up' ? <ArrowDropUpIcon fontSize="large" /> : <ArrowDropDownIcon fontSize='large' />}
    </IconButton>
  );
}
