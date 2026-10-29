import axios from 'axios';
import { store } from '../store';
import { logout } from '../store/authSlice';

const API = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Bearer token
API.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.token || localStorage.getItem('sportsync_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 Unauthorized globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('Unauthorized request - clearing session');
      store.dispatch(logout());
    }
    return Promise.reject(error);
  }
);

export default API;
