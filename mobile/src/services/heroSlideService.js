import api from '../api/apiClient';

const heroSlideService = {
  getHeroSlides: async () => {
    try {
      const response = await api.get('/heroslides');
      if (Array.isArray(response.data)) {
        return { data: response.data, total: response.data.length };
      }
      if (response.data && Array.isArray(response.data.data)) {
        return { data: response.data.data, total: response.data.data.length };
      }
      return response.data || { data: [] };
    } catch (error) {
      console.warn('heroSlideService: Failed to fetch hero slides:', error?.message);
      return { data: [] };
    }
  },
};

export default heroSlideService;
