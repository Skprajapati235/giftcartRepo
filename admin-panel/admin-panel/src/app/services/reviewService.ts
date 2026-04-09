import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_URL;

const getAuthToken = () => {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("giftcartAdminToken") || "";
};

const authApi = (token?: string) =>
  axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

export const getAllReviews = async () => {
  const response = await authApi(getAuthToken()).get("/review/admin/all");
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

export const getReviewById = async (reviewId: string) => {
  const response = await authApi(getAuthToken()).get(`/review/admin/${reviewId}`);
  return response.data;
};

export const adminUpdateReview = async (reviewId: string, payload: any) => {
  // Assuming we use the same endpoint but maybe with admin privileges
  const response = await authApi(getAuthToken()).put(`/review/${reviewId}`, payload);
  return response.data;
};
