import axios from 'axios';

/** The single Axios instance used by the whole app (base URL + token interceptors). */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: { Accept: 'application/json' },
});

export const TOKEN_KEY = 'library_token';

// Attach the Sanctum token to every request: Authorization: Bearer <token>
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 401 => the token is missing/expired: clear it and tell the app to go to /login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginCall = error.config?.url?.includes('/login');
    if (error.response?.status === 401 && !isLoginCall) {
      localStorage.removeItem(TOKEN_KEY);
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    return Promise.reject(error);
  }
);

/** Pull a readable message + field errors (422) out of an Axios error. */
export function parseError(error) {
  const data = error.response?.data;
  return {
    status: error.response?.status,
    message: data?.message || (error.request ? 'Cannot reach the server. Is the API running?' : 'Something went wrong.'),
    errors: data?.errors || {}, // { field: ['message', ...] }
  };
}

export default api;
