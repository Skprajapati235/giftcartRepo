import api from '../api/apiClient';

const productService = {
  getProducts: async () => {
    const response = await api.get('/api/product');
    return response.data;
  },
  getProductById: async (id) => {
    const response = await api.get(`/api/product/${id}`);
    return response.data;
  },
};

export default productService;
