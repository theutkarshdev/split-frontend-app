import axios from "axios";
import { toast } from "react-hot-toast";
import { callLogout } from "./logoutHelper";

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve(token);
  });
  failedQueue = [];
};

// MAIN INSTANCE
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: false, // No longer using cookies
});

// Attach Access Token
axiosInstance.interceptors.request.use((config) => {
  const raw = localStorage.getItem("auth");
  if (raw) {
    const { token } = JSON.parse(raw);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
axiosInstance.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // If Access Token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = "Bearer " + token;
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log("Refreshing token....");

        // Get refresh token from localStorage
        const authData = JSON.parse(localStorage.getItem("auth") || "{}");
        const refreshToken = authData.refreshToken;

        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/auth/refresh`,
          {
            refresh_token: refreshToken,
          }
        );
        const newToken = response.data.access_token;
        const newRefreshToken = response.data.refresh_token; // Get new refresh token if provided

        localStorage.setItem(
          "auth",
          JSON.stringify({
            token: newToken,
            refreshToken: newRefreshToken || refreshToken, // Use new refresh token or keep existing
            isAuthenticated: true,
            is_new: false,
          })
        );

        processQueue(null, newToken);
        isRefreshing = false;

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        console.log("logout....");

        callLogout();
        toast.error("Session expired. Please login again.");
        return Promise.reject(refreshError);
      }
    }

    // Other errors
    if (error.response?.status === 404) {
      toast.error("Resource not found.");
    } else if (error.response?.status >= 500) {
      toast.error("Server error.");
    } else {
      toast.error(error.response?.data?.message || "Something went wrong.");
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
