import api from '../../api/apiClient.js';

/**
 * Service for showcase samples in mobile app
 */
export const fetchDecorationSamples = async (params = {}) => {
  try {
    const res = await api.get('/decoration/samples', {
      params: { storefrontOnly: true, ...params },
    });
    const list = res.data?.samples || res.data?.data;
    return Array.isArray(list) ? list : [];
  } catch (error) {
    console.warn('fetchDecorationSamples error:', error?.message || error);
    return [];
  }
};
