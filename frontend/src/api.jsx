import axios from "axios";

const BASE_URL = `${window.location.protocol}//${window.location.hostname}:8000`;

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const api = {
  getStatus: () => apiClient.get("/status"),
  setStatus: (status) => apiClient.post(`/status/${status}`),
  getHistory: (mode) => apiClient.get(`/history`, { params: { mode } }),
  setPoint: (value) => apiClient.post(`/setpoint/${value}`),

  getConnection: () => apiClient.get("/connection"),
  setConnection: (ssid, password) => apiClient.post(`/connection/${ssid}/${password}`),
  getConnectionStatus: () => apiClient.get("/connection/status"),
  getconnectionG1OS: () => apiClient.get("/connection/g1os"),
  setConnectionForget: () => apiClient.post(`/connection/forget`),

  getConfigurations: () => apiClient.get("/config"),
  setConfiguration: (key, value) => apiClient.post("/config/set",
    new URLSearchParams({ key, value }).toString(),
    {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }
  ),
  getConfiguration: (key) => apiClient.get(`/config/${key}`),
  
  getUpdateVersion: () => apiClient.get("/update/version"),
  getUpdateCheck: () => apiClient.get("/update/check"),
  getUpdateApply: () => apiClient.get("/update/apply"),
};
