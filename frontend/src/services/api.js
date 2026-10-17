import axios from 'axios';

// In production the backend address comes from VITE_API_URL (set at build time).
// Locally it falls back to the backend on port 5000.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the server says the login token is bad, clear it and go to the login page
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message;
    if (error.response?.status === 403 && message === 'Invalid or expired token') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.hash = '#/login';
    }
    return Promise.reject(error);
  }
);

export default api;