import { useEffect, useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

function App() {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const fetchStatus = async () => {
      const res = await axios.get('http://localhost:8000/status');
      setStatus(res.data);
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!status) return <div>Loading...</div>;

  const chartData = {
    labels: status.history.map(h => h.timestamp),
    datasets: [{
      label: 'Temperature (°C)',
      data: status.history.map(h => h.temperature),
      borderColor: 'blue',
      fill: false
    }]
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Dryer Dashboard</h1>
      <p><strong>Setpoint:</strong> {status.setpoint} °C</p>
      <p><strong>Current Temp:</strong> {status.current_temp} °C</p>
      <p><strong>Heater:</strong> {status.heater ? 'ON 🔥' : 'OFF ❄️'}</p>
      <Line data={chartData} />
    </div>
  );
}

export default App;
