import axios from 'axios';

const DEFAULT_BACKEND_URL = 'https://people-pluse-backend-1.onrender.com';
const API_BASE_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8000' : DEFAULT_BACKEND_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
});

export default api;
