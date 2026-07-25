import axios from 'axios';

const DEFAULT_BACKEND_URL = 'https://people-pluse-backend-1.onrender.com';
const LOCAL_BACKEND_URL = 'http://localhost:8000';

function getViteEnvValue() {
  try {
    return import.meta.env?.VITE_API_URL || '';
  } catch {
    return '';
  }
}

export function getBaseUrl(hostname = typeof window !== 'undefined' ? window.location.hostname : '') {
  const normalizedHostname = (hostname || '').toLowerCase();
  if (!normalizedHostname || normalizedHostname === 'localhost' || normalizedHostname === '127.0.0.1' || normalizedHostname.startsWith('127.0.0.1')) {
    return LOCAL_BACKEND_URL;
  }

  if (normalizedHostname.startsWith('192.168.') || normalizedHostname.startsWith('10.') || normalizedHostname.startsWith('172.')) {
    return LOCAL_BACKEND_URL;
  }

  return getViteEnvValue() || DEFAULT_BACKEND_URL;
}

const API_BASE_URL = getViteEnvValue() || getBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
