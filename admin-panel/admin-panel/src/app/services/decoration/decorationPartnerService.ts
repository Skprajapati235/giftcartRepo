import { authApi, getAuthToken } from "../apiClient";

export const getDecoratorPartners = async (params?: { city?: string; status?: string }) => {
  const response = await authApi(getAuthToken()).get("/decoration/partners", { params });
  return response.data;
};

export const createDecoratorPartner = async (payload: any) => {
  const response = await authApi(getAuthToken()).post("/decoration/partners", payload);
  return response.data;
};

export const updateDecoratorPartner = async (id: string, payload: any) => {
  const response = await authApi(getAuthToken()).put(`/decoration/partners/${id}`, payload);
  return response.data;
};

export const deleteDecoratorPartner = async (id: string) => {
  const response = await authApi(getAuthToken()).delete(`/decoration/partners/${id}`);
  return response.data;
};
