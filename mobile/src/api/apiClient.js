import axios from 'axios';

export const API_BASE_URL = 'http://10.227.227.187:5000';
// If you run on an Android emulator, use 10.0.2.2 instead of a local IP.
// For a physical device on the same Wi-Fi, use your laptop's LAN IP.

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

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
