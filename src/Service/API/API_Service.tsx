import axios from "axios";
import { clearStoredToken, getStoredToken, isTokenExpired, setStoredToken } from "./AuthService"

const API_BASE_URL = "https://billingapigateway.accurateappsolution.com/";
//const API_BASE_URL = "http://localhost:5281/";

export const API_SERVICE = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

API_SERVICE.interceptors.request.use(
  async (config) => {
    const tokenData = getStoredToken();
    const accessToken = tokenData?.response?.accessToken;
    const refreshToken = "";

    if (tokenData) {
      if (accessToken && !isTokenExpired(accessToken)) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      } else {
        try {
          const postData = {
            AccessToken: accessToken || "",
            RefreshToken: refreshToken || "",
          };

          const response = await axios.post(`${API_BASE_URL}auth-api/Account/refreshToken`, postData, {
            withCredentials: true,
          })
          const newTokenData = response.data;
          clearStoredToken();
          setStoredToken(newTokenData);

          config.headers.Authorization = `Bearer ${newTokenData.response.accessToken}`;
        } catch (err) {
          console.error("Error refreshing token:", err);
          clearStoredToken();
          window.location.href = "/";
          return Promise.reject(err);
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

API_SERVICE.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response && error.response.data === "Too Many Requests" && error.response.status === 429) {
      await axios.get(`${API_BASE_URL}auth-api/Tax/GetTaxes741`);
    }
    return Promise.reject(error);
  }
);