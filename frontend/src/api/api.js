import axios from "axios";

// Ensure we always hit the backend on port 5000 unless an explicit absolute URL is provided.
const envBase = (process.env.REACT_APP_API_URL || "").trim();
const resolvedBase =
  !envBase
    ? "http://localhost:5000/api"
    : envBase.startsWith("http://") || envBase.startsWith("https://")
      ? envBase
      : `http://localhost:5000${envBase.startsWith("/") ? "" : "/"}${envBase}`;

const api = axios.create({
  baseURL: resolvedBase,
});

// Automatically attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers["x-auth-token"] = token;
  }
  return config;
});

// Handle authentication errors and network errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Network error - backend not reachable
    if (!error.response) {
      if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        error.networkError = true;
        error.message = 'Cannot connect to server. Make sure the backend is running on port 5000.';
      }
    }
    
    // Authentication error
    if (error.response?.status === 401) {
      const path = window.location.pathname || "";
      const isAuthPage = path.includes("/login") || path.includes("/register") || path.includes("/admin/login");
      if (!isAuthPage) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
