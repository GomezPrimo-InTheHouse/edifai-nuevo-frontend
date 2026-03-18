import axios from 'axios';
import { env } from '../app/config/env';

const httpClient = axios.create({
  baseURL: env.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor para auth token
httpClient.interceptors.request.use(
  (config) => {
    // TODO: Obtener token de auth store
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor para errores y logout
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // TODO: Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default httpClient;
