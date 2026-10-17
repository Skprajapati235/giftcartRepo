import api from '../../api/apiClient.js';

/**
 * Service for decoration packages in mobile app
 */
// All active packages. Returns [] when there are none and THROWS when the server can't be reached,
// so the screen can show a proper "try again" state instead of a misleading "no packages".
export const fetchDecorationPackages = async (params = {}) => {
  const res = await api.get('/decoration/packages', {
    params: { city: 'Faridabad', limit: 100, ...params },
  });
  const list = res.data?.packages || res.data?.data;
  return Array.isArray(list) ? list : [];
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
