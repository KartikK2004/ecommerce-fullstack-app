import axios from 'axios';

// This creates a pre-configured axios instance so we don't have to
// type the full backend URL every time we make a request.
const api = axios.create({
  baseURL: 'http://localhost:5000/api'
});

// An "interceptor" runs automatically before every request.
// This one attaches the saved JWT token (if the user is logged in)
// so protected routes (cart, checkout) work without extra code each time.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
