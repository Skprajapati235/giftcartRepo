import apiClient from '../api/apiClient';

export const toggleWishlist = async (productId) => {
  const response = await apiClient.post('/wishlist/toggle', { productId });
  return response.data;
};

export const getWishlist = async () => {
  const response = await apiClient.get('/wishlist');
  return response.data;
};
