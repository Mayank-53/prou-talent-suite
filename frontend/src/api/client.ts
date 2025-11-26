import axios from 'axios';
import type { AxiosRequestHeaders } from 'axios';
import { AUTH_STORAGE_KEY } from '../providers/AuthProvider';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  timeout: 10_000,
});

api.interceptors.request.use((config) => {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as { token?: string };
      if (parsed.token) {
        const headers = (config.headers ?? {}) as AxiosRequestHeaders;
        headers.Authorization = `Bearer ${parsed.token}`;
        config.headers = headers;
      }
    } catch {
      // ignore parse errors
    }
  }
  return config;
});

export default api;

