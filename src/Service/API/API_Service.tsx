import axios from "axios";
import { clearStoredToken, getStoredToken, isTokenExpired, setStoredToken } from "./AuthService"

//const API_BASE_URL = "https://newbillingapigateway.onrender.com/";
const API_BASE_URL = "http://localhost:5281/";

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