import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Box, TextField, MenuItem,
  FormGroup, FormControlLabel, Checkbox, List, ListItem, IconButton
} from '@mui/material';
import AccessAlarmIcon from '@mui/icons-material/AccessAlarm';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function AlarmDialog({ open, onClose }) {
  const [rules, setRules] = useState([]);

  // Timer state
  const [timerAction, setTimerAction] = useState('on');
  const [timerMinutes, setTimerMinutes] = useState('');
  const [timerTemperature, setTimerTemperature] = useState('');

  // Schedule state
  const [scheduleAction, setScheduleAction] = useState('on');
  const [scheduleTime, setScheduleTime] = useState('');
  const [scheduleTemperature, setScheduleTemperature] = useState('');
  const [selectedDays, setSelectedDays] = useState([]);

  const toggleDay = (day) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const addTimerRule = () => {
    if (timerMinutes) {
      setRules([...rules, {
        type: 'timer',
        action: timerAction,
        delayMinutes: Number(timerMinutes),
        temperature: timerAction === 'on' ? Number(timerTemperature) : null
      }]);
      // Reset
      setTimerMinutes('');
      setTimerTemperature('');
      setTimerAction('on');
    }
  };

  const addScheduleRule = () => {
    if (scheduleTime && selectedDays.length > 0) {
      setRules([...rules, {
        type: 'schedule',
        action: scheduleAction,
        time: scheduleTime,
        temperature: scheduleAction === 'on' ? Number(scheduleTemperature) : null,
        days: selectedDays,
        lastExecuted: null
      }]);
      // Reset
      setScheduleTime('');
      setScheduleTemperature('');
      setScheduleAction('on');
      setSelectedDays([]);
    }
  };

  const removeRule = (index) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    console.log("Regole salvate:", rules);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <AccessAlarmIcon sx={{ mr: 1 }} />
          Timer & Scheduling Rules
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* TIMER SECTION */}
        <Typography variant="h6" mb={1}>Add Timer</Typography>
        <Box display="flex" gap={2} mb={2}>
          <TextField
            label="Action"
            select
            value={timerAction}
            onChange={(e) => setTimerAction(e.target.value)}
            fullWidth
          >
            <MenuItem value="on">Turn ON</MenuItem>
            <MenuItem value="off">Turn OFF</MenuItem>
          </TextField>
          <TextField
            label="After (minutes)"
            type="number"
            value={timerMinutes}
            onChange={(e) => setTimerMinutes(e.target.value)}
            fullWidth
          />
          {timerAction === 'on' && (
            <TextField
              label="With Temperature (°C)"
              type="number"
              value={timerTemperature}
              onChange={(e) => setTimerTemperature(e.target.value)}
              fullWidth
            />
          )}
          <Button variant="outlined" onClick={addTimerRule}><AddIcon /></Button>
        </Box>

        {/* SCHEDULE SECTION */}
        <Typography variant="h6" mt={3} mb={1}>Add Weekly Schedule</Typography>
        <Box display="flex" gap={2} mb={2}>
          <TextField
            select
            label="Action"
            value={scheduleAction}
            onChange={(e) => setScheduleAction(e.target.value)}
            fullWidth
          >
            <MenuItem value="on">Turn ON</MenuItem>
            <MenuItem value="off">Turn OFF</MenuItem>
          </TextField>
          <TextField
            label="At (time)"
            type="time"
            value={scheduleTime}
            onChange={(e) => setScheduleTime(e.target.value)}
            fullWidth
          />
          {scheduleAction === 'on' && (
            <TextField
              label="With Temperature (°C)"
              type="number"
              value={scheduleTemperature}
              onChange={(e) => setScheduleTemperature(e.target.value)}
              fullWidth
            />
          )}
          <Button variant="outlined" onClick={addScheduleRule}><AddIcon /></Button>
        </Box>

        <ToggleButtonGroup
          value={selectedDays}
          onChange={(event, newDays) => setSelectedDays(newDays)}
          aria-label="days of the week"
          fullWidth
        >
          {daysOfWeek.map((day) => (
            <ToggleButton key={day} value={day}>
              {day.slice(0, 3)} {/* mostra LUN, MAR, MER... */}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        {/* LIST OF RULES */}
        <Typography variant="h6" mt={4}>Active Timers & Schedules</Typography>
        {rules.length === 0 && <Typography>No schedule set.</Typography>}
        <List dense>
          {rules.map((rule, index) => (
            <ListItem
              key={index}
              secondaryAction={
                <IconButton edge="end" onClick={() => removeRule(index)}>
                  <DeleteIcon />
                </IconButton>
              }
            >
              <Typography variant="body2">
                {rule.type === 'timer' && (
                  <>
                    Timer: {rule.action === 'on' ? 'Turn on' : 'Turn off'} in {rule.delayMinutes} min
                    {rule.temperature != null ? ` at ${rule.temperature}°C` : ''}
                  </>
                )}
                {rule.type === 'schedule' && (
                  <>
                    {rule.action === 'on' ? 'Turn on' : 'Turn off'} at {rule.time}
                    {rule.temperature != null ? ` at ${rule.temperature}°C` : ''}
                    {' '}({rule.days.join(', ')})
                    <br />
                    <Typography variant="caption" color="text.secondary">
                      Last executed: {rule.lastExecuted ? new Date(rule.lastExecuted).toLocaleString() : 'Never'}
                    </Typography>
                  </>
                )}
              </Typography>
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
