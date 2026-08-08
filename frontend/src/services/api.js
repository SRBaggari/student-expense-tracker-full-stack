import axios from 'axios';

// Create an Axios instance with base API URL
const api = axios.create({
  baseURL: '/api', // Relative path to work with the Vite local proxy
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor to attach JWT token to headers automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor to handle authentication expiration errors automatically
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the server returns a 401 Unauthorized, remove token and redirect to login
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      // If we are not already on the login page or home page, redirect
      if (
        window.location.pathname !== '/login' &&
        window.location.pathname !== '/register' &&
        window.location.pathname !== '/'
      ) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
