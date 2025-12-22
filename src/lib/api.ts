import axios from 'axios';
import { config } from './config';

const baseURL = config.apiBaseUrl;

export const apiClient = axios.create({
  baseURL,
  timeout: config.apiTimeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      // TODO: navigate to login page when routing is available
    }
    return Promise.reject(error);
  }
);

