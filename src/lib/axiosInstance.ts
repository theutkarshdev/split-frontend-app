// api/axiosInstance.ts
import axios from "axios";
import { toast } from "react-hot-toast";
import { callLogout } from "./logoutHelper";

interface AuthData {
  token?: string;
}

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  timeout: 10000,
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const authRaw = localStorage.getItem("auth");
    let token: string | undefined;

    if (authRaw) {
      try {
        const parsed: AuthData = JSON.parse(authRaw);
        token = parsed.token;
      } catch {
        token = undefined;
      }
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      if (status === 401) {
        toast.error("Session expired. Please log in again.");
        callLogout();
      } else if (status === 404) {
        toast.error("Resource not found.");
      } else if (status >= 500) {
        toast.error("Server error. Please try again later.");
      } else {
        toast.error(data?.message || "Something went wrong.");
      }
    } else {
      toast.error("Network error. Please check your connection.");
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
