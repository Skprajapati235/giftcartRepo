import api from '../api/apiClient';

const productService = {
  getProducts: async (params = {}) => {
    const response = await api.get('/product', { params });
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return response.data?.data || response.data?.products || [];
  },
  getProductsWithPagination: async (params = {}) => {
    const response = await api.get('/product', { params });
    if (Array.isArray(response.data)) {
      return {
        products: response.data,
        total: response.data.length,
        page: Number(params.page) || 1,
        totalPages: 1,
        hasMore: false,
      };
    }
    const data = response.data?.data || response.data?.products || [];
    const total = Number(response.data?.total) || data.length;
    const page = Number(response.data?.page) || Number(params.page) || 1;
    const limit = Number(params.limit) || 10;
    const totalPages = Number(response.data?.totalPages) || Math.ceil(total / limit) || 1;
    const hasMore = page < totalPages && data.length > 0;

    return {
      products: data,
      total,
      page,
      totalPages,
      hasMore,
    };
  },
  getProductById: async (id) => {
    const response = await api.get(`/product/${id}`);
    return response.data;
  },
  deleteProduct: async (id) => {
    const response = await api.delete(`/product/${id}`);
    return response.data;
  },
};

export default productService;
