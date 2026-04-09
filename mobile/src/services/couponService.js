import apiClient from '../api/apiClient';

const couponService = {
  validateCoupon: async (payload) => {
    // payload: { code, amount }
    const response = await apiClient.post('/coupons/validate', payload);
    return response.data;
  },
};

export default couponService;
