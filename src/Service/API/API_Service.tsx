import axios from "axios";

const API_BASE_URL = "https://newbillingapigateway.onrender.com/";
//const API_BASE_URL = "http://localhost:5281/";

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
        config.headers.Authorization = `Bearer ${JSON.parse(token).response.accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);