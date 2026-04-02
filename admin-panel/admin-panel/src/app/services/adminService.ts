import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

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

export const loginAdmin = async (payload: { email: string; password: string }) => {
  const response = await api.post("/admin/auth/login", payload);
  return response.data;
};

export const registerAdmin = async (payload: {
  name: string;
  email: string;
  password: string;
}) => {
  const response = await api.post("/admin/auth/register", payload);
  return response.data;
};

export const getProducts = async () => {
  const response = await authApi(getAuthToken()).get("/product");
  return response.data;
};

export const getCategories = async () => {
  const response = await authApi(getAuthToken()).get("/category");
  return response.data;
};

export const getUsers = async () => {
  const response = await authApi(getAuthToken()).get("/admin/users");
  return response.data;
};

export const getAdmins = async () => {
  const response = await authApi(getAuthToken()).get("/admin/users/admins");
  return response.data;
};

export const createCategory = async (payload: { name: string; image?: string }) => {
  const response = await authApi(getAuthToken()).post("/category", payload);
  return response.data;
};

export const updateCategory = async (id: string, payload: { name: string; image?: string }) => {
  const response = await authApi(getAuthToken()).put(`/category/${id}`, payload);
  return response.data;
};

export const deleteCategory = async (id: string) => {
  const response = await authApi(getAuthToken()).delete(`/category/${id}`);
  return response.data;
};

export const createProduct = async (payload: {
  name: string;
  price: number;
  salePrice?: number;
  description: string;
  summary?: string;
  layout?: string;
  image: string;
  category: string;
  weight?: string;
  flowers?: number;
}) => {
  const response = await authApi(getAuthToken()).post("/product", payload);
  return response.data;
};

export const updateProduct = async (
  id: string,
  payload: {
    name: string;
    price: number;
    salePrice?: number;
    description: string;
    summary?: string;
    layout?: string;
    image: string;
    category: string;
    weight?: string;
    flowers?: number;
  }
) => {
  const response = await authApi(getAuthToken()).put(`/product/${id}`, payload);
  return response.data;
};

export const deleteProduct = async (id: string) => {
  const response = await authApi(getAuthToken()).delete(`/product/${id}`);
  return response.data;
};

export const uploadImage = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await authApi(getAuthToken()).post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
};

export const deleteUser = async (id: string) => {
  const response = await authApi(getAuthToken()).delete(`/admin/users/${id}`);
  return response.data;
};

export const updateAdmin = async (id: string, payload: { name?: string; email?: string; city?: string; profilePic?: string; role?: string }) => {
  const response = await authApi(getAuthToken()).put(`/admin/users/${id}`, payload);
  return response.data;
};

export const deleteAdmin = async (id: string) => {
  const response = await authApi(getAuthToken()).delete(`/admin/users/${id}`);
  return response.data;
};

export const getAllOrders = async () => {
  const response = await authApi(getAuthToken()).get("/order/admin/all");
  return response.data;
};

export const getOrderPayments = async () => {
  const response = await authApi(getAuthToken()).get("/order/admin/payments");
  return response.data;
};

export const getOrderDetail = async (id: string) => {
  const response = await authApi(getAuthToken()).get(`/order/admin/detail/${id}`);
  return response.data;
};

export const updateOrderStatus = async (id: string, status: string) => {
  const response = await authApi(getAuthToken()).put(`/order/admin/${id}/status`, { status });
  return response.data;
};
