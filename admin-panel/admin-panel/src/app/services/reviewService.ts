import { authApi, getAuthToken } from "./apiClient";

export const getAllReviews = async (params?: { page?: number; limit?: number; search?: string }) => {
  const response = await authApi(getAuthToken()).get("/review/admin/all", { params });
  return response.data;
};

export const adminReplyReview = async (reviewId: string, reply: string) => {
  const response = await authApi(getAuthToken()).post(`/review/admin/reply/${reviewId}`, { reply });
  return response.data;
};

export const adminDeleteReview = async (reviewId: string) => {
  const response = await authApi(getAuthToken()).delete(`/review/admin/${reviewId}`);
  return response.data;
};

export const adminBulkDeleteReviews = async (ids: string[]) => {
  const response = await authApi(getAuthToken()).post("/review/admin/bulk-delete", { ids });
  return response.data;
};

export const getReviewById = async (reviewId: string) => {
  const response = await authApi(getAuthToken()).get(`/review/admin/${reviewId}`);
  return response.data;
};

export const adminUpdateReview = async (reviewId: string, payload: any) => {
  // Assuming we use the same endpoint but maybe with admin privileges
  const response = await authApi(getAuthToken()).put(`/review/${reviewId}`, payload);
  return response.data;
};

export const updateReviewStatus = async (reviewId: string, status: string) => {
  const response = await authApi(getAuthToken()).put(`/review/admin/status/${reviewId}`, { status });
  return response.data;
};

