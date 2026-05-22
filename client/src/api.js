import axios from 'axios';

/** Deployed backend only — no local server */
export const API_BASE_URL = 'https://travel-forge11.vercel.app/api';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (!err.response) {
      err.message =
        'Cannot reach API. Redeploy backend after CORS fix, or check VITE_API_URL.';
    }
    return Promise.reject(err);
  }
);

export default api;
