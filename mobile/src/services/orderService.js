import api from '../api/apiClient';

const orderService = {
  createOrder: async (orderData) => {
    const response = await api.post('/api/order/create', orderData);
    return response.data;
  },
  verifyPayment: async (paymentData) => {
    const response = await api.post('/api/order/verify', paymentData);
    return response.data;
  },
  getUserOrders: async () => {
    const response = await api.get('/api/order/user');
    return response.data;
  },
};

export default orderService;
