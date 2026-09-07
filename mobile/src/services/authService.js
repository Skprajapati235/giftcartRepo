import api from '../api/apiClient';

const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  register: async (name, email, password) => {
    const response = await api.post('/auth/register', { name, email, password });
    return response.data;
  },
  requestPasswordReset: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },
  resetPassword: async (email, otp, newPassword) => {
    const response = await api.post('/auth/reset-password', { email, otp, newPassword });
    return response.data;
  },
};

export default authService;
