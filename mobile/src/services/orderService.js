import api from '../api/apiClient';

const orderService = {
  createOrder: async (orderData) => {
    const response = await api.post('/order/create', orderData);
    return response.data;
  },
  verifyPayment: async (paymentData) => {
    const response = await api.post('/order/verify', paymentData);
    return response.data;
  },
  getUserOrders: async () => {
    const response = await api.get('/order/user');
    if (response.data && response.data.data) {
      return response.data.data;
    }
    return response.data;
  },
};

export default orderService;
