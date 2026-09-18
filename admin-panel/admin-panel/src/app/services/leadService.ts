import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_URL;

const authApi = (token?: string) =>
  axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

const getAuthToken = () => {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("giftcartAdminToken") || "";
};

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
