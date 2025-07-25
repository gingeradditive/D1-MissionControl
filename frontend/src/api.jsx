import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

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
  
  getNetworks: () => apiClient.get("/networks"),
  setConnection: (ssid, password) => apiClient.post("/connect", { ssid, password }),
  getIp: () => apiClient.get("/ip"),
  getG1OS: () => apiClient.get("/g1os"),
};
