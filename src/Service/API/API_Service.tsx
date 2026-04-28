import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { clearStoredToken, getStoredToken, isTokenExpired, setStoredToken } from "./AuthService";
import { APP_CONFIG } from "../../config/appConfig";

const API_BASE_URL = APP_CONFIG.apiBaseUrl;

export const API_SERVICE = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

let isRefreshing = false;
let requestQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: AxiosError | Error) => void;
}> = [];

const processQueue = (error: AxiosError | Error | null, newToken: string | null = null) => {
  requestQueue.forEach((pendingRequest) => {
    if (error) {
      pendingRequest.reject(error);
    } else {
      pendingRequest.resolve(newToken || "");
    }
  });
  requestQueue = [];
};

API_SERVICE.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const tokenData = getStoredToken();
    const accessToken = tokenData?.response?.accessToken;
    const refreshToken = tokenData?.response?.refreshToken;

    if (!tokenData) return config;

    if (accessToken && !isTokenExpired(accessToken)) {
      config.headers.Authorization = `Bearer ${accessToken}`;
      return config;
    }

    if (!isRefreshing) {
      isRefreshing = true;

      try {
        const res = await axios.post(
          `${API_BASE_URL}/auth-api/Account/refreshToken`,
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

        config.headers.Authorization = `Bearer ${newTokenData.response.accessToken}`;
        return config;
      } catch (error) {
        const refreshError = error instanceof Error ? error : new Error("Token refresh failed");
        isRefreshing = false;
        processQueue(refreshError, null);
        clearStoredToken();
        window.location.href = "/";
        return Promise.reject(refreshError);
      }
    }

    return new Promise((resolve, reject) => {
      requestQueue.push({
        resolve: (newToken: string) => {
          if (newToken) {
            config.headers.Authorization = `Bearer ${newToken}`;
          }
          resolve(config);
        },
        reject: (error: AxiosError | Error) => {
          reject(error);
        },
      });
    });
  },
  (error) => Promise.reject(error)
);

API_SERVICE.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 429) {
      console.warn('Rate limit hit (429). Please wait before retrying.');
    }
    return Promise.reject(error);
  }
);
