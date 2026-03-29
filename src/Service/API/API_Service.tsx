import axios from "axios";
import { clearStoredToken, getStoredToken, isTokenExpired, setStoredToken } from "./AuthService";

const API_BASE_URL = "http://localhost:5180/"; // "https://89-116-21-168.sslip.io/";

export const API_SERVICE = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// ===== Refresh Token Handler =====
let isRefreshing = false;
let requestQueue: { resolve: (token: string) => void; reject: (error: any) => void }[] = [];

const processQueue = (error: any, newToken: string | null = null) => {
  requestQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(newToken || "");
    }
  });
  requestQueue = [];
};

// ===== Request Interceptor =====
API_SERVICE.interceptors.request.use(
  async (config: any) => {
    const tokenData = getStoredToken();
    const accessToken = tokenData?.response?.accessToken;
    const refreshToken = tokenData?.response?.refreshToken;

    if (!tokenData) return config;

    // ✅ If token is valid, attach it
    if (accessToken && !isTokenExpired(accessToken)) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${accessToken}`,
      };
      return config;
    }

    // 🚫 Token expired – avoid multiple refresh calls
    if (!isRefreshing) {
      isRefreshing = true;

      try {
        const res = await axios.post(
          `${API_BASE_URL}auth-api/Account/refreshToken`,
          {
            AccessToken: accessToken || "",
            RefreshToken: refreshToken || "",
          },
          { withCredentials: true }
        );

        const newTokenData = res.data;
        clearStoredToken();
        setStoredToken(newTokenData);

        isRefreshing = false;
        processQueue(null, newTokenData.response.accessToken);

        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${newTokenData.response.accessToken}`,
        };
        return config;
      } catch (err) {
        isRefreshing = false;
        processQueue(err, null);
        clearStoredToken();
        window.location.href = "/";
        return Promise.reject(err);
      }
    }

    // ⏳ Queue requests until refresh done
    return new Promise((resolve, reject) => {
      requestQueue.push({
        resolve: (newToken: string) => {
          if (newToken) {
            config.headers = {
              ...config.headers,
              Authorization: `Bearer ${newToken}`,
            };
          }
          resolve(config);
        },
        reject: (err: any) => {
          reject(err);
        },
      });
    });
  },
  (error) => Promise.reject(error)
);

// ===== Response Interceptor =====
API_SERVICE.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 429 && error.response?.data === "Too Many Requests") {
      await axios.get(`${API_BASE_URL}auth-api/Tax/GetTaxes741`);
    }
    return Promise.reject(error);
  }
);
