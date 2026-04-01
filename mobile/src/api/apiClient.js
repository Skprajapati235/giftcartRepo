import axios from 'axios';

// For local development on a physical device, use your laptop's Wi-Fi IP address.
// Current LAN IP: 10.104.56.187 (verified)
const baseURL = process.env.API_BASE_URL || 'http://10.104.56.187:5000';

const api = axios.create({
  baseURL: baseURL,
  timeout: 15000, // Slightly increased timeout for mobile network
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
