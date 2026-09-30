import { authApi, getAuthToken } from "./apiClient";

export const getAllLeads = async (params: any = {}) => {
  const response = await authApi(getAuthToken()).get("/leads", { params });
  return response.data;
};

export const createLead = async (data: any) => {
  const response = await authApi(getAuthToken()).post("/leads", data);
  return response.data;
};

export const updateLead = async (id: string, data: any) => {
  const response = await authApi(getAuthToken()).put(`/leads/${id}`, data);
  return response.data;
};

export const deleteLead = async (id: string) => {
  const response = await authApi(getAuthToken()).delete(`/leads/${id}`);
  return response.data;
};
