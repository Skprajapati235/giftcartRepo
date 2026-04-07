import api from '../api/apiClient';

const productService = {
  getProducts: async () => {
    const response = await api.get('/product');
    return response.data;
  },
  getProductById: async (id) => {
    const response = await api.get(`/product/${id}`);
    return response.data;
  },
};

export default productService;
