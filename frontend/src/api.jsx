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
  getHistory: (mode) => apiClient.get(`/history/${mode}`),
  setPoint: (value) => apiClient.post(`/setpoint/${value}`),
};
