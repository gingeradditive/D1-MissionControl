import { IconButton } from '@mui/material';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

export default function Controls({ direction, onClick }) {
  return (
    <IconButton
      onClick={onClick}
      sx={{
        border: "2px solid #cccccc",
        color: '#333'
      }}
    >
      {direction === 'up' ? (
        <ArrowDropUpIcon fontSize="large" />
      ) : (
        <ArrowDropDownIcon fontSize="large" />
      )}
    </IconButton>
  );
}
