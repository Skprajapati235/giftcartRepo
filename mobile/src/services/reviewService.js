import api from '../api/apiClient';

const reviewService = {
  getReviewsByProduct: async (productId) => {
    const response = await api.get(`/review/product/${productId}`);
    return response.data;
  },

  getEligibility: async (productId) => {
    const response = await api.get(`/review/product/${productId}/eligible`);
    return response.data;
  },

  createReview: async (payload) => {
    const response = await api.post('/review', payload);
    return response.data;
  },

  updateReview: async (id, payload) => {
    const response = await api.put(`/review/${id}`, payload);
    return response.data;
  },

  deleteReview: async (id) => {
    const response = await api.delete(`/review/${id}`);
    return response.data;
  },

  uploadReviewImage: async (formData) => {
    const response = await api.post('/review/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

export default reviewService;
