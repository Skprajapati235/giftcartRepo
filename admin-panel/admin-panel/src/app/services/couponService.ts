import { authApi, getAuthToken } from "./apiClient";

export const getAllCoupons = async () => {
  const response = await authApi(getAuthToken()).get("/coupons");
  return response.data;
};

export const createCoupon = async (data: any) => {
  const response = await authApi(getAuthToken()).post("/coupons", data);
  return response.data;
};

export const updateCoupon = async (id: string, data: any) => {
  const response = await authApi(getAuthToken()).put(`/coupons/${id}`, data);
  return response.data;
};

export const deleteCoupon = async (id: string) => {
  const response = await authApi(getAuthToken()).delete(`/coupons/${id}`);
  return response.data;
};
