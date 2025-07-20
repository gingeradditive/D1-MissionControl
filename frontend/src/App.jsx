import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import "chart.js/auto";

const PRIMARY_COLOR = "#d72e28";

function App() {
  const [status, setStatus] = useState(null);
  const [mode, setMode] = useState("1h");
  const [setpointInput, setSetpointInput] = useState("");
  const [dryingOn, setDryingOn] = useState(true);
  const [loadingSetpoint, setLoadingSetpoint] = useState(false);
  const [loadingToggle, setLoadingToggle] = useState(false);
  const intervalId = useRef(null);

  const fetchStatus = async () => {
    try {
      const res = await axios.get(`http://localhost:8000/status?mode=${mode}`);
      setStatus(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchStatus();

    if (intervalId.current) {
      clearInterval(intervalId.current);
    }

    let intervalTime = 60 * 1000; // default fallback

    if (mode === '1m') intervalTime = 1000; // 1s
    else if (mode === '1h') intervalTime = 60 * 1000; // 1min
    else if (mode === '12h') intervalTime = 60 * 1000; // 1min

    intervalId.current = setInterval(fetchStatus, intervalTime);

    return () => {
      if (intervalId.current) {
        clearInterval(intervalId.current);
      }
    };
  }, [mode]);

  const handleSetpointSubmit = async () => {
    if (!setpointInput || isNaN(Number(setpointInput))) return;
    setLoadingSetpoint(true);
    try {
      await axios.post(`http://localhost:8000/setpoint/${Number(setpointInput)}`);
      setLoadingSetpoint(false);
    } catch (error) {
      console.error("Error setting setpoint:", error);
      setLoadingSetpoint(false);
    }
  };

  const handleToggleDrying = async () => {
    setLoadingToggle(true);
    try {
      // Assumo che tu abbia endpoint per toggle, es: /drying/toggle o /drying/onoff?value=true/false
      await axios.post(`http://localhost:8000/drying/toggle`, { active: !dryingOn });
      setDryingOn(!dryingOn);
      setLoadingToggle(false);
    } catch (error) {
      console.error("Error toggling drying:", error);
      setLoadingToggle(false);
    }
  };

  if (!status) return <div style={{ padding: 20 }}>Loading...</div>;

  // Dati grafico temperatura
  const tempChartData = {
    labels: status.history.map((h) => h.timestamp),
    datasets: [
      {
        label: "Temperature (°C)",
        data: status.history.map((h) => h.temperature),
        borderColor: PRIMARY_COLOR,
        fill: false,
        tension: 0.2,
      },
      {
        label: "Temp Min (°C)",
        data: status.history.map((h) => h.temp_min),
        borderColor: "#faa",
        borderDash: [5, 5],
        fill: false,
        tension: 0.2,
      },
      {
        label: "Temp Max (°C)",
        data: status.history.map((h) => h.temp_max),
        borderColor: "#d00",
        borderDash: [5, 5],
        fill: false,
        tension: 0.2,
      },
    ],
  };

  // Dati grafico umidità
  const humChartData = {
    labels: status.history.map((h) => h.timestamp),
    datasets: [
      {
        label: "Humidity (%)",
        data: status.history.map((h) => h.humidity),
        borderColor: "#0077cc",
        fill: false,
        tension: 0.2,
      },
      {
        label: "Humidity Min (%)",
        data: status.history.map((h) => h.hum_min),
        borderColor: "#99ccee",
        borderDash: [5, 5],
        fill: false,
        tension: 0.2,
      },
      {
        label: "Humidity Max (%)",
        data: status.history.map((h) => h.hum_max),
        borderColor: "#004466",
        borderDash: [5, 5],
        fill: false,
        tension: 0.2,
      },
    ],
  };

  return (
    <div
      style={{
        backgroundColor: "white",
        color: "#333",
        minHeight: "100vh",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        padding: 20,
        width: "calc(100vw - 55px)",      // tutta la larghezza finestra
        margin: 0,
      }}
    >
      <h1 style={{ color: PRIMARY_COLOR, marginBottom: 20 }}>Dryer Dashboard</h1>

      {/* Setpoint input */}
      <div
        style={{
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <label htmlFor="setpoint-input" style={{ fontWeight: "bold" }}>
          Setpoint (°C):
        </label>
        <input
          id="setpoint-input"
          type="number"
          min={0}
          max={100}
          step={0.1}
          value={setpointInput}
          onChange={(e) => setSetpointInput(e.target.value)}
          style={{ padding: "6px 10px", flex: "1 1 auto", fontSize: 16 }}
        />
        <button
          onClick={handleSetpointSubmit}
          disabled={loadingSetpoint}
          style={{
            backgroundColor: PRIMARY_COLOR,
            border: "none",
            color: "white",
            padding: "8px 16px",
            cursor: loadingSetpoint ? "wait" : "pointer",
            fontWeight: "bold",
            borderRadius: 4,
          }}
        >
          {loadingSetpoint ? "Saving..." : "Set"}
        </button>
      </div>

      {/* Mode selector and toggle drying */}
      <div
        style={{
          marginBottom: 30,
          display: "flex",
          alignItems: "center",
          gap: 20,
          flexWrap: "wrap",
        }}
      >
        <div>
          <label htmlFor="mode-select" style={{ fontWeight: "bold" }}>
            Select Mode:
          </label>
          <select
            id="mode-select"
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            style={{ marginLeft: 10, padding: "6px 10px", fontSize: 16 }}
          >
            <option value="1m">Last Minute (raw)</option>
            <option value="1h">Last Hour (1 min average)</option>
            <option value="12h">Last 12 Hours (30 min average)</option>
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <label htmlFor="drying-toggle" style={{ fontWeight: "bold" }}>
            Drying Cycle:
          </label>
          <button
            id="drying-toggle"
            onClick={handleToggleDrying}
            disabled={loadingToggle}
            style={{
              backgroundColor: dryingOn ? PRIMARY_COLOR : "#ccc",
              color: dryingOn ? "white" : "#666",
              border: "none",
              padding: "8px 20px",
              cursor: loadingToggle ? "wait" : "pointer",
              borderRadius: 20,
              fontWeight: "bold",
              userSelect: "none",
            }}
            aria-pressed={dryingOn}
          >
            {loadingToggle ? "Updating..." : dryingOn ? "ON 🔥" : "OFF ❄️"}
          </button>
        </div>
      </div>

      {/* KPI */}
      <div
        style={{
          display: "flex",
          gap: 40,
          marginBottom: 30,
          flexWrap: "wrap",
          fontSize: 18,
        }}
      >
        <div>
          <div style={{ fontWeight: "bold", marginBottom: 5, color: PRIMARY_COLOR }}>
            Current Temperature
          </div>
          <div>{status.current_temp.toFixed(2)} °C</div>
        </div>

        <div>
          <div style={{ fontWeight: "bold", marginBottom: 5, color: PRIMARY_COLOR }}>
            Current Humidity
          </div>
          <div>{status.current_humidity.toFixed(2)} %</div>
        </div>

        <div>
          <div style={{ fontWeight: "bold", marginBottom: 5, color: PRIMARY_COLOR }}>
            Heater Status
          </div>
          <div>{dryingOn ? (status.heater ? "ON 🔥" : "OFF ❄️") : "OFF ❄️"}</div>
        </div>
      </div>

      {/* Grafico Temperatura */}
      <div style={{ marginBottom: 40 }}>
        <h2 style={{ color: PRIMARY_COLOR, marginBottom: 10 }}>Temperature</h2>
        <Line data={tempChartData} />
      </div>

      {/* Grafico Umidità */}
      <div>
        <h2 style={{ color: PRIMARY_COLOR, marginBottom: 10 }}>Humidity</h2>
        <Line data={humChartData} />
      </div>
    </div>
  );
}

export default App;
