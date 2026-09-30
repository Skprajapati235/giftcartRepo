import { authApi, getAuthToken } from "./apiClient";

export const getAllCrmContacts = async (params: any = {}) => {
  const response = await authApi(getAuthToken()).get("/crm", { params });
  return response.data;
};

export const createCrmContact = async (data: any) => {
  const response = await authApi(getAuthToken()).post("/crm", data);
  return response.data;
};

export const updateCrmContact = async (id: string, data: any) => {
  const response = await authApi(getAuthToken()).put(`/crm/${id}`, data);
  return response.data;
};

export const deleteCrmContact = async (id: string) => {
  const response = await authApi(getAuthToken()).delete(`/crm/${id}`);
  return response.data;
};
