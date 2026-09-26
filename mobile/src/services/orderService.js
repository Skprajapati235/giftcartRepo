import api from '../api/apiClient';

const orderService = {
  createOrder: async (orderData) => {
    const response = await api.post('/order/create', orderData);
    return response.data;
  },
  verifyPayment: async (paymentData) => {
    const response = await api.post('/order/verify', paymentData, { timeout: 60000 });
    return response.data;
  },
  sendOrderEmail: async (orderId) => {
    try {
      const response = await api.post(`/order/${orderId}/send-email`);
      return response.data;
    } catch (err) {
      // Non-critical — don't block the flow if email fails
      console.warn('Order email trigger failed:', err);
    }
  },
  getUserOrders: async () => {
    const response = await api.get('/order/user');
    if (response.data && response.data.data) {
      return response.data.data;
    }
    return response.data;
  },
  getOrderById: async (orderId) => {
    const response = await api.get(`/order/user/${orderId}`);
    return response.data;
  },
};

export default orderService;
