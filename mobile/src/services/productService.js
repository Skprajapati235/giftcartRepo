import api from '../api/apiClient';

const productService = {
  getProducts: async (params = {}) => {
    const response = await api.get('/product', { params });
    if (Array.isArray(response.data)) {
      return { data: response.data, total: response.data.length, totalPages: 1 };
    }
    return response.data;
  },
  getProductById: async (id) => {
    const response = await api.get(`/product/${id}`);
    return response.data;
  },
};

export default productService;
