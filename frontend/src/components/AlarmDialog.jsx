import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Box, TextField, MenuItem,
  List, ListItem, IconButton, Grid
} from '@mui/material';
import AccessAlarmIcon from '@mui/icons-material/AccessAlarm';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function AlarmDialog({ open, onClose }) {
  const [rules, setRules] = useState([]);
  const [activeTab, setActiveTab] = useState('list');

  // Timer state
  const [timerAction, setTimerAction] = useState('on');
  const [timerMinutes, setTimerMinutes] = useState('');
  const [timerTemperature, setTimerTemperature] = useState('');

  // Schedule state
  const [scheduleAction, setScheduleAction] = useState('on');
  const [scheduleTime, setScheduleTime] = useState('');
  const [scheduleTemperature, setScheduleTemperature] = useState('');
  const [selectedDays, setSelectedDays] = useState([]);

  const addTimerRule = () => {
    if (timerMinutes) {
      setRules([...rules, {
        type: 'timer',
        action: timerAction,
        delayMinutes: Number(timerMinutes),
        temperature: timerAction === 'on' ? Number(timerTemperature) : null
      }]);
      setTimerMinutes('');
      setTimerTemperature('');
      setTimerAction('on');
      setActiveTab("list");
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
      setScheduleTime('');
      setScheduleTemperature('');
      setScheduleAction('on');
      setSelectedDays([]);
      setActiveTab("list");
    }
  };

  const removeRule = (index) => {
    setRules(rules.filter((_, i) => i !== index));
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
        {/* Toggle Tabs */}
        <Box display="flex" justifyContent="center" mb={2}>
          <ToggleButtonGroup
            value={activeTab}
            exclusive
            onChange={(e, value) => value && setActiveTab(value)}
            size="small"
            aria-label="alarm tab selector"
          >
            <ToggleButton value="list">Active Rules</ToggleButton>
            <ToggleButton value="timer">Add Timer</ToggleButton>
            <ToggleButton value="schedule">Add Schedule</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* TIMER TAB */}
        {activeTab === 'timer' && (
          <>
            <Grid container spacing={2} mb={2}>
              <Grid item size={4}>
                <TextField
                  size="small"
                  label="Action"
                  select
                  value={timerAction}
                  onChange={(e) => setTimerAction(e.target.value)}
                  fullWidth
                >
                  <MenuItem value="on">Turn ON</MenuItem>
                  <MenuItem value="off">Turn OFF</MenuItem>
                </TextField>
              </Grid>
              <Grid item size={4}>
                <TextField
                  size="small"
                  label="After (minutes)"
                  type="number"
                  value={timerMinutes}
                  onChange={(e) => setTimerMinutes(e.target.value)}
                  fullWidth
                />
              </Grid>
              {timerAction === 'on' && (
                <Grid item size={4}>
                  <TextField
                    size="small"
                    label="With Temperature (°C)"
                    type="number"
                    value={timerTemperature}
                    onChange={(e) => setTimerTemperature(e.target.value)}
                    fullWidth
                  />
                </Grid>
              )}

              <Grid item size={12}>
                <Button variant="outlined" onClick={addTimerRule} startIcon={<AddIcon />}>
                  Add Timer
                </Button>
              </Grid>
            </Grid>
          </>
        )}

        {/* SCHEDULE TAB */}
        {activeTab === 'schedule' && (
          <>
            <Grid container spacing={2} mb={2}>
              <Grid item size={4}>
              <TextField
                size="small"
                select
                label="Action"
                value={scheduleAction}
                onChange={(e) => setScheduleAction(e.target.value)}
                fullWidth
              >
                <MenuItem value="on">Turn ON</MenuItem>
                <MenuItem value="off">Turn OFF</MenuItem>
              </TextField>
              </Grid>

              <Grid item size={4}>
              <TextField
                size="small"
                label="At (time)"
                type="time"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                fullWidth
              />
              </Grid>
              {scheduleAction === 'on' && (
                <Grid item size={4}>
                <TextField
                  size="small"
                  label="With Temperature (°C)"
                  type="number"
                  value={scheduleTemperature}
                  onChange={(e) => setScheduleTemperature(e.target.value)}
                  fullWidth
                />
                </Grid>
              )}
              <Grid item size={12}>
              <ToggleButtonGroup
                value={selectedDays}
                onChange={(event, newDays) => setSelectedDays(newDays)}
                aria-label="days of the week"
                fullWidth
              >
                {daysOfWeek.map((day) => (
                  <ToggleButton key={day} value={day}>
                    {day.slice(0, 3)}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
              </Grid>
              <Grid item size={12}>
              <Button variant="outlined" onClick={addScheduleRule} startIcon={<AddIcon />}>
                Add Schedule
              </Button>
              </Grid>
            </Grid>
          </>
        )}

        {/* RULES LIST TAB */}
        {activeTab === 'list' && (
          <>
            {rules.length === 0 ? (
              <Typography>No schedule set.</Typography>
            ) : (
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
                    <Box>
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
                          </>
                        )}
                      </Typography>
                      {rule.type === 'schedule' && (
                        <Typography variant="caption" color="text.secondary">
                          Last executed: {rule.lastExecuted ? new Date(rule.lastExecuted).toLocaleString() : 'Never'}
                        </Typography>
                      )}
                    </Box>
                  </ListItem>
                ))}
              </List>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
