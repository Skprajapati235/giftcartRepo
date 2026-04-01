import api from '../api/apiClient';

const categoryService = {
  getCategories: async () => {
    const response = await api.get('/api/category');
    return response.data;
  },
};

export default categoryService;
