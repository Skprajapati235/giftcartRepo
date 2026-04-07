import api from '../api/apiClient';

const locationService = {
  getCities: async () => {
    const response = await api.get('/city');
    return response.data;
  },
};

export default locationService;
