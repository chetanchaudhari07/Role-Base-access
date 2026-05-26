import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3000/api",
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

export const loginUser = (data) => API.post("/auth/login", data);

export const registerUser = (data) =>
  API.post("/auth/register", data);
export const getUsers = () => API.get("/users");

export const getTasks = () => API.get("/tasks");

export const getLogs = () => API.get("/logs");

export const getAnalytics = () => API.get("/analytics");

export default API;