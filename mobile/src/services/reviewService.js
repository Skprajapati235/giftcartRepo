import apiClient from '../api/apiClient';

export const getProductReviews = async (productId) => {
  const response = await apiClient.get(`/review/product/${productId}`);
  return response.data;
};

export const addReview = async (productId, reviewData) => {
  const response = await apiClient.post(`/review/product/${productId}`, reviewData);
  return response.data;
};

export const updateReview = async (reviewId, reviewData) => {
  const response = await apiClient.put(`/review/${reviewId}`, reviewData);
  return response.data;
};

export const deleteReview = async (reviewId) => {
  const response = await apiClient.delete(`/review/${reviewId}`);
  return response.data;
};

export const likeReview = async (reviewId) => {
  const response = await apiClient.post(`/review/${reviewId}/like`);
  return response.data;
};

export const dislikeReview = async (reviewId) => {
  const response = await apiClient.post(`/review/${reviewId}/dislike`);
  return response.data;
};
