import apiClient from '../api/apiClient';

const couponService = {
  validateCoupon: async (payload) => {
    // payload: { code, amount }
    const response = await apiClient.post('/coupons/validate', payload);
    return response.data;
  },
  getActiveCoupons: async (params = {}) => {
    const response = await apiClient.get('/coupons/active', { params });
    if (Array.isArray(response.data)) {
      return { data: response.data, total: response.data.length, totalPages: 1 };
    }
    return response.data;
  },
};

export default couponService;
