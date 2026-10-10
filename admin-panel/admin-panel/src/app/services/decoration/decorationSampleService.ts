import { authApi, getAuthToken } from "../apiClient";

export const getDecorationSamples = async (params?: { storefrontOnly?: boolean }) => {
  const response = await authApi(getAuthToken()).get("/decoration/samples", { params });
  return response.data;
};

export const createDecorationSample = async (payload: any) => {
  const response = await authApi(getAuthToken()).post("/decoration/samples", payload);
  return response.data;
};

export const updateDecorationSample = async (id: string, payload: any) => {
  const response = await authApi(getAuthToken()).put(`/decoration/samples/${id}`, payload);
  return response.data;
};

export const deleteDecorationSample = async (id: string) => {
  const response = await authApi(getAuthToken()).delete(`/decoration/samples/${id}`);
  return response.data;
};

export const toggleDecorationSample = async (id: string) => {
  const response = await authApi(getAuthToken()).patch(`/decoration/samples/${id}/toggle`);
  return response.data;
};
