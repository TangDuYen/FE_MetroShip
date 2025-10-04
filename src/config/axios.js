import { PATH_NAME } from "../constants/pathname";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

// const baseUrl = "https://localhost:7085/api/";
const baseUrl = "https://metroship-cosdy.ondigitalocean.app/api/";
const config = {
  baseURL: baseUrl,
  timeout: 3000000,
};
const api = axios.create(config);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

const handleBefore = async (config) => {
  const noAuthEndpoints = ["/auth/register", "/auth/authentication", "/auth/refresh-token"];
  const requiresAuth = !noAuthEndpoints.some((endpoint) =>
    config.url.includes(endpoint)
  );

  const token = localStorage.getItem("token")?.replaceAll('"', "");
  const refreshToken = localStorage.getItem("refreshToken");

  if (requiresAuth && token) {
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000;

    if (decodedToken.exp < currentTime) {
      if (!isRefreshing) {
        isRefreshing = true;

        try {
          const response = await axios.post(`${baseUrl}auth/refresh-token`, {
            token: refreshToken,
          });

          const newToken = response.data.token;
          localStorage.setItem("token", newToken);

          processQueue(null, newToken);
          config.headers["Authorization"] = `Bearer ${newToken}`;
        } catch (err) {
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          window.location.href = PATH_NAME.LOGIN;
          processQueue(err, null);
          throw err;
        } finally {
          isRefreshing = false;
        }
      } else {
        return new Promise(function (resolve, reject) {
          failedQueue.push({
            resolve: (token) => {
              config.headers["Authorization"] = `Bearer ${token}`;
              resolve(config);
            },
            reject: (err) => {
              reject(err);
            },
          });
        });
      }
    } else {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
  }

  return config;
};

const handleError = (error) => {
  console.error("Request Error: ", error);
  return Promise.reject(error);
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401) {
      const url = originalRequest.url;

      // OTP ERROR
      if (url.includes("/auth/email/verification")) {
        return Promise.reject(error);
      }

      // ANOHER ERROR UNAUTHORIZED
      if (
        !url.includes("/auth/authentication") &&
        !url.includes("/auth/register")
      ) {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("refreshTokenExpiredTime");
        localStorage.removeItem("userId");
        localStorage.removeItem("userData");
        localStorage.removeItem("staffAssignments");
      }
    }

    return Promise.reject(error);
  }
);

api.interceptors.request.use(handleBefore, handleError);

export default api;
