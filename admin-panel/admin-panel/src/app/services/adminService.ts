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

export const getProducts = async (params?: { page?: number; limit?: number; search?: string }) => {
  const response = await authApi(getAuthToken()).get("/product", { params });
  return response.data;
};

export const getCategories = async (params?: { page?: number; limit?: number; search?: string }) => {
  const response = await authApi(getAuthToken()).get("/category", { params });
  return response.data;
};

export const getUsers = async (params?: { page?: number; limit?: number; search?: string }) => {
  const response = await authApi(getAuthToken()).get("/admin/users", { params });
  return response.data;
};

export const getAdmins = async (params?: { page?: number; limit?: number; search?: string }) => {
  const response = await authApi(getAuthToken()).get("/admin/users/admins", { params });
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

export const getCities = async (params?: { page?: number; limit?: number; search?: string }) => {
  const response = await authApi(getAuthToken()).get("/city", { params });
  return response.data;
};

export const createCity = async (payload: { state: string; cities: string[]; image?: string }) => {
  const response = await authApi(getAuthToken()).post("/city", payload);
  return response.data;
};

export const updateCity = async (id: string, payload: { state: string; cities: string[]; image?: string }) => {
  const response = await authApi(getAuthToken()).put(`/city/${id}`, payload);
  return response.data;
};

export const deleteCity = async (id: string) => {
  const response = await authApi(getAuthToken()).delete(`/city/${id}`);
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
  shippingCost?: number;
  discount?: number;
  tax?: number;
  isCodAvailable?: boolean;
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
    shippingCost?: number;
    discount?: number;
    tax?: number;
    isCodAvailable?: boolean;
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

export const deleteImage = async (url: string) => {
  const response = await authApi(getAuthToken()).delete("/upload", { data: { url } });
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

export const getAllOrders = async (params?: { page?: number; limit?: number; search?: string }) => {
  const response = await authApi(getAuthToken()).get("/order/admin/all", { params });
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

export const getUnviewedOrders = async () => {
  const response = await authApi(getAuthToken()).get("/order/admin/unviewed");
  return response.data;
};

export const markOrderAsViewed = async (id: string) => {
  const response = await authApi(getAuthToken()).put(`/order/admin/${id}/viewed`);
  return response.data;
};

export const getUserWishlist = async (userId: string, params?: { page?: number; limit?: number; filter?: string }) => {
  const response = await authApi(getAuthToken()).get(`/wishlist/admin/user/${userId}`, { params });
  return response.data;
};
