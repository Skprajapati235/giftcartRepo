import api from '../api/apiClient';

const locationService = {
  getCities: async (params = {}) => {
    const response = await api.get('/city', { params });
    if (Array.isArray(response.data)) {
      return { data: response.data, total: response.data.length, totalPages: 1 };
    }
    return response.data;
  },
};

export default locationService;
