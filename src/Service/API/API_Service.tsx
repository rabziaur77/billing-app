import axios from "axios";
import { clearStoredToken, getStoredToken, isTokenExpired, setStoredToken } from "./AuthService";

const API_BASE_URL = "https://89-116-21-168.sslip.io/";

export const API_SERVICE = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// ===== Refresh Token Handler =====
let isRefreshing = false;
let requestQueue: ((token: string) => void)[] = [];

const processQueue = (newToken: string | null) => {
  requestQueue.forEach((cb) => cb(newToken || ""));
  requestQueue = [];
};

// ===== Request Interceptor =====
API_SERVICE.interceptors.request.use(
  async (config: any) => {
    const tokenData = getStoredToken();
    const accessToken = tokenData?.response?.accessToken;

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

      axios
        .post(`${API_BASE_URL}auth-api/Account/refreshToken`, {
          AccessToken: accessToken || "",
          RefreshToken: "",
        }, { withCredentials: true })
        .then((res) => {
          const newTokenData = res.data;
          clearStoredToken();
          setStoredToken(newTokenData);

          isRefreshing = false;
          processQueue(newTokenData.response.accessToken);
          
          config.headers = {
            ...config.headers,
            Authorization: `Bearer ${newTokenData.response.accessToken}`,
          };

          return config;
        })
        .catch((err) => {
          isRefreshing = false;
          processQueue(null);
          clearStoredToken();
          window.location.href = "/";
          throw err;
        });
    }

    // ⏳ Queue requests until refresh done
    return new Promise((resolve) => {
      requestQueue.push((newToken) => {
        if (newToken) {
          config.headers = {
            ...config.headers,
            Authorization: `Bearer ${newToken}`,
          };
        }
        resolve(config);
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
