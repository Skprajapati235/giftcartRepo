import api from '../api/apiClient';

const galleryService = {
  getGallery: async (params = {}) => {
    try {
      const response = await api.get('/gallery', { params });
      if (response.data && response.data.success) {
        return response.data;
      }
      if (Array.isArray(response.data)) {
        return { success: true, data: response.data, total: response.data.length };
      }
      return response.data || { success: true, data: [] };
    } catch (error) {
      console.warn('galleryService: Failed to fetch gallery:', error?.message);
      return { success: false, data: [] };
    }
  },

  getCategories: async () => {
    try {
      const response = await api.get('/gallery/categories');
      if (response.data && response.data.success) {
        return response.data.data || [];
      }
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.warn('galleryService: Failed to fetch categories:', error?.message);
      return [];
    }
  },

  likeItem: async (id) => {
    try {
      const response = await api.post(`/gallery/${id}/like`);
      return response.data;
    } catch (error) {
      console.warn('galleryService: Failed to like item:', error?.message);
      return { success: false };
    }
  },

  getSettings: async () => {
    try {
      const response = await api.get('/gallery/settings');
      if (response.data && response.data.success) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.warn('galleryService: Failed to fetch settings:', error?.message);
      return null;
    }
  },
};

export default galleryService;
