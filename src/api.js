import axios from 'axios';

const DEFAULT_BACKEND_URL = 'https://backend-people-plus.onrender.com';
const DEFAULT_LOCAL_PORT = 8000;

function getViteEnvValue() {
  try {
    return import.meta.env?.VITE_API_URL || '';
  } catch {
    return '';
  }
}

export function getBaseUrl(hostname = typeof window !== 'undefined' ? window.location.hostname : '') {
  const normalizedHostname = (hostname || '').toLowerCase();

  // Local development: use the same hostname as the page (ensures 127.0.0.1 vs localhost match)
  if (!normalizedHostname || normalizedHostname === 'localhost' || normalizedHostname.startsWith('127.')) {
    const host = normalizedHostname || 'localhost';
    return `http://${host}:${DEFAULT_LOCAL_PORT}`;
  }

  // Common LAN ranges -> assume backend running on same host:8000
  if (normalizedHostname.startsWith('192.168.') || normalizedHostname.startsWith('10.') || normalizedHostname.startsWith('172.')) {
    return `http://${normalizedHostname}:${DEFAULT_LOCAL_PORT}`;
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
