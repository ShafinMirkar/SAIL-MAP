import axios from "axios";

const api = axios.create({ baseURL: "/api" });

export const createRequest = (payload) => api.post("/requests", payload).then((r) => r.data);
export const fetchReport = (requestId) => api.get(`/requests/${requestId}/report`).then((r) => r.data);
export const fetchPorts = (type) => api.get("/ports", { params: type ? { type } : {} }).then((r) => r.data);
export const runScenario = (payload) => api.post("/scenario", payload).then((r) => r.data);
export const fetchHealth = () => api.get("/health").then((r) => r.data);

export default api;
