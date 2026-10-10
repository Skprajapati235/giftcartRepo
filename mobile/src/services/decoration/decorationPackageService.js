import api from '../../api/apiClient.js';

/**
 * Service for decoration packages in mobile app
 */
export const fetchDecorationPackages = async (params = {}) => {
  try {
    const res = await api.get('/decoration/packages', {
      params: { city: 'Faridabad', ...params },
    });
    const list = res.data?.packages || res.data?.data;
    return Array.isArray(list) ? list : [];
  } catch (error) {
    console.warn('fetchDecorationPackages error:', error?.message || error);
    return [];
  }
};

export const fetchDecorationPackageBySlug = async (slug) => {
  try {
    const res = await api.get(`/decoration/packages/${slug}`);
    return res.data?.package || res.data?.data || null;
  } catch (error) {
    console.warn('fetchDecorationPackageBySlug error:', error?.message || error);
    return null;
  }
};
