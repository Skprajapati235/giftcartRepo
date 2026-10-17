import { authApi, getAuthToken } from "../apiClient";

export const getDecorationPackages = async (params?: {
  category?: string;
  city?: string;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  // admin panel also needs hidden / inactive packages (the API only returns them to logged-in staff)
  const response = await authApi(getAuthToken()).get("/decoration/packages", { params: { ...params, includeInactive: 1 } });
  return response.data;
};

export const getDecorationPackageBySlug = async (slug: string) => {
  const response = await authApi(getAuthToken()).get(`/decoration/packages/${slug}`, { params: { includeInactive: 1 } });
  return response.data;
};

export const createDecorationPackage = async (payload: any) => {
  const response = await authApi(getAuthToken()).post("/decoration/packages", payload);
  return response.data;
};

export const updateDecorationPackage = async (id: string, payload: any) => {
  const response = await authApi(getAuthToken()).put(`/decoration/packages/${id}`, payload);
  return response.data;
};

export const deleteDecorationPackage = async (id: string) => {
  const response = await authApi(getAuthToken()).delete(`/decoration/packages/${id}`);
  return response.data;
};
