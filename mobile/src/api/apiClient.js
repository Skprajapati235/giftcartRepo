// import axios from 'axios';

// // Production backend — Render deployment
// const baseURL = process.env.API_BASE_URL || 'https://giftcartrepo.onrender.com/api';

// const api = axios.create({
//   baseURL: baseURL,
//   timeout: 15000, // Slightly increased timeout for mobile network
// });

// // Normalize request URLs so leading "/api" doesn't collide with baseURL ending in "/api"
// api.interceptors.request.use((config) => {
//   const rawBase = (config.baseURL || baseURL || '').replace(/\/+$/, '');
//   if (rawBase.endsWith('/api') && config.url && config.url.startsWith('/api/')) {
//     config.url = config.url.replace(/^\/api/, '');
//   }
//   return config;
// });

// export const setAuthToken = (token) => {
//   if (token) {
//     api.defaults.headers.common.Authorization = `Bearer ${token}`;
//   } else {
//     delete api.defaults.headers.common.Authorization;
//   }
// };

// export const handleApiError = (error) => {
//   if (error.response?.status === 401) {
//     return { code: 401, message: 'Session expired. Please login again.' };
//   }

//   const message =
//     error.response?.data?.message ||
//     error.response?.data ||
//     error.message ||
//     'Network error';

//   return { code: error.response?.status || 500, message };
// };

// export default api;



import axios from 'axios';
import { setToken as saveSecureToken } from '../utils/secureToken';

// Production backend — Render deployment
const baseURL = process.env.API_BASE_URL || 'https://giftcartrepo.onrender.com/api';

const api = axios.create({
  baseURL: baseURL,
  timeout: 45000, // long enough for a Render cold start (~30-40s) on mobile networks
});

// Normalize request URLs so leading "/api" doesn't collide with baseURL ending in "/api"
api.interceptors.request.use((config) => {
  const rawBase = (config.baseURL || baseURL || '').replace(/\/+$/, '');
  if (rawBase.endsWith('/api') && config.url && config.url.startsWith('/api/')) {
    config.url = config.url.replace(/^\/api/, '');
  }
  return config;
});

// ── Sliding 365-day session ─────────────────────────────────────────────────
// While the user is active the server hands out a fresh token (X-Renewed-Token header,
// at most once a week). We store it, so the user stays logged in until they tap Logout.
api.interceptors.response.use((response) => {
  const renewed = response?.headers?.['x-renewed-token'];
  if (renewed && typeof renewed === 'string') {
    setAuthToken(renewed);
    saveSecureToken(renewed).catch(() => { });
  }
  return response;
});

// ── Auto-logout on expired / invalid token ──────────────────────────────────
// AuthContext registers a handler here. When the server answers 401 to a request
// that carried our token, the session is dead → the handler signs the user out
// (once, even if several requests fail together).
let unauthorizedHandler = null;
let handlingUnauthorized = false;

export const setUnauthorizedHandler = (fn) => {
  unauthorizedHandler = fn;
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const headers = error?.config?.headers;
    const sentToken = Boolean(
      headers?.Authorization || headers?.get?.('Authorization') || api.defaults.headers.common.Authorization
    );
    // Only for requests made WITH a token — a wrong OTP (no token yet) must not log anyone out.
    if (status === 401 && sentToken && unauthorizedHandler && !handlingUnauthorized) {
      handlingUnauthorized = true;
      Promise.resolve()
        .then(() => unauthorizedHandler())
        .catch(() => { })
        .finally(() => {
          setTimeout(() => { handlingUnauthorized = false; }, 3000);
        });
    }
    return Promise.reject(error);
  }
);

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

export const handleApiError = (error) => {
  if (error.response?.status === 401) {
    return { code: 401, message: 'Session expired. Please login again.' };
  }

  const message =
    error.response?.data?.message ||
    error.response?.data ||
    error.message ||
    'Network error';

  return { code: error.response?.status || 500, message };
};

export default api;
