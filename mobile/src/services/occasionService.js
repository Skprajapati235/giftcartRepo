import api from '../api/apiClient';

const occasionService = {
  getOccasions: async (params = { all: 'true' }) => {
    const response = await api.get('/occasion', { params });
    if (Array.isArray(response.data)) {
      return { data: response.data, total: response.data.length, totalPages: 1 };
    }
    return response.data;
  },
};

export default occasionService;
