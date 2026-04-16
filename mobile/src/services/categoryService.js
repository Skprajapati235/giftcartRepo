import api from '../api/apiClient';

const categoryService = {
  getCategories: async (params = {}) => {
    const response = await api.get('/category', { params });
    if (Array.isArray(response.data)) {
      return { data: response.data, total: response.data.length, totalPages: 1 };
    }
    return response.data;
  },
};

export default categoryService;
