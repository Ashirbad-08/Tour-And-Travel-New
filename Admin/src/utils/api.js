import axios from 'axios';

const api = axios.create({
  // This must point to the Express API, including `/api`, not to the Admin site.
  baseURL: (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api").replace(/\/+$/, ""),
  withCredentials: true,
});

console.log("API Base URL:", import.meta.env.VITE_API_BASE_URL);
console.log("Current Origin:", window.location.origin);

// Request interceptor to add token if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle logout on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error Detail:", error);
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('adminToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
