import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Centralized Axios client instance
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('schoolerp_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for centralized error mapping
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response ? error.response.status : null;
    let message = 'An unexpected error occurred. Please try again.';

    if (status === 400) {
      message = error.response.data?.message || 'Invalid data submitted. Please check the fields.';
    } else if (status === 401) {
      message = 'Your session has expired. Please sign in again.';
      localStorage.removeItem('schoolerp_token');
      localStorage.removeItem('schoolerp_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    } else if (status === 403) {
      message = 'You do not have permission to perform this action.';
    } else if (status === 404) {
      message = 'The requested resource was not found.';
    } else if (status === 409) {
      message = error.response.data?.message || 'A conflicting record already exists (e.g. duplicate ID).';
    } else if (status >= 500) {
      message = 'Server error. Our engineers have been alerted.';
    } else if (error.code === 'ECONNABORTED' || !error.response) {
      message = 'Network connection issue. Operating in offline/mock mode.';
    }

    const enhancedError = new Error(message);
    enhancedError.status = status;
    enhancedError.originalError = error;
    return Promise.reject(enhancedError);
  }
);

export default api;
