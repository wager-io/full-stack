import axios from 'axios';
import { getCookie } from './cookies';
import { toast } from 'sonner';

// NOTE: The old Heroku/Express backend is gone. Admin endpoints are being
// re-pointed at Supabase (RLS reads + admin RPCs / Edge Functions) in Phase 5.
// Base now resolves to the Supabase Functions URL so nothing references Heroku.
export const backendUrl = () => {
  const url = import.meta.env.VITE_SUPABASE_URL ?? '';
  return url ? `${url}/functions/v1` : '';
};

const api = axios.create({
  baseURL: backendUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

api.interceptors.request.use(
  (config) => {
    // Do Add auth token
    const token = getCookie("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      console.error('API Error:', error.response.data);
      toast.error(error.response.data?.error);
    } else if (error.request) {
      console.error('Network Error:', error.request);
      toast.error("Network Error");
    } else {
      console.error('Error:', error.message);
      toast.error(error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
