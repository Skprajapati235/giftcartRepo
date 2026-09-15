import api from '../api/apiClient';

const authService = {
  sendOtp: async (name, mobileNumber) => {
    const response = await api.post('/auth/send-otp', { name, mobileNumber });
    return response.data;
  },
  verifyOtp: async (mobileNumber, otp) => {
    const response = await api.post('/auth/verify-otp', { mobileNumber, otp });
    return response.data;
  },
};

export default authService;
