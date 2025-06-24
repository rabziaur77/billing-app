import axios from "axios";

const API_BASE_URL = "https://newbilingauthservice.onrender.com/";
//const API_BASE_URL = "http://localhost:5185/";

export const API_SERVICE = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

API_SERVICE.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${JSON.parse(token).accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);