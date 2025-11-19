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
  withCredentials: true,
});

// Attach Access Token
axiosInstance.interceptors.request.use((config) => {
  config.headers["Content-Type"] = "application/json";
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
        const response = await axiosInstance.post("/auth/refresh");

        const newToken = response.data.access_token;

        localStorage.setItem(
          "auth",
          JSON.stringify({
            token: newToken,
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
