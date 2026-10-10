import { api, authApi, getAuthToken } from "./apiClient";

export { getAuthToken, authApi };

export const verifyAdminSession = async () => {
  const token = getAuthToken();
  if (!token) {
    return { valid: false, message: "No token" };
  }
  const response = await authApi(token).get("/admin/auth/verify-session");
  return response.data;
};

export const loginAdmin = async (payload: { email: string; password: string }) => {
  const response = await api.post("/admin/auth/login", payload);
  return response.data;
};

export const registerAdmin = async (payload: {
  name: string;
  email: string;
  password: string;
  role?: string;
  department?: string;
  city?: string;
  permissions?: string[];
}) => {
  const token = getAuthToken();
  const client = token ? authApi(token) : api;
  const response = await client.post("/admin/auth/register", payload);
  return response.data;
};

export const requestAdminPasswordReset = async (email: string) => {
  const response = await api.post("/admin/auth/forgot-password", { email });
  return response.data;
};

export const resetAdminPassword = async (payload: {
  email: string;
  otp: string;
  newPassword: string;
}) => {
  const response = await api.post("/admin/auth/reset-password", payload);
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
  images?: string[];
  category: string;
  hasEgglessOption?: boolean;
  shippingCost?: number;
  discount?: number;
  tax?: number;
  isCodAvailable?: boolean;
  flavor?: string;
  weight?: string;
  flowerCount?: string;
  weightOptions?: Array<{ weight: string; price: number; salePrice?: number; discount?: number; tax?: number; shippingCost?: number }>;
  flowerCountOptions?: Array<{ flowerCount: string; price: number; salePrice?: number; discount?: number; tax?: number; shippingCost?: number }>;
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
    images?: string[];
    category: string;
    hasEgglessOption?: boolean;
    shippingCost?: number;
    discount?: number;
    tax?: number;
    isCodAvailable?: boolean;
    flavor?: string;
    weight?: string;
    flowerCount?: string;
    weightOptions?: Array<{ weight: string; price: number; salePrice?: number; discount?: number; tax?: number; shippingCost?: number }>;
    flowerCountOptions?: Array<{ flowerCount: string; price: number; salePrice?: number; discount?: number; tax?: number; shippingCost?: number }>;
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
  });

  return response.data;
};

export const deleteImage = async (url: string) => {
  const response = await authApi(getAuthToken()).delete("/upload", { data: { url } });
  return response.data;
};

export const getMediaList = async (params?: { page?: number; limit?: number; search?: string; folderId?: string | null }) => {
  const response = await authApi(getAuthToken()).get("/upload", { params });
  return response.data;
};

export const uploadMediaFiles = async (files: File[], folderId?: string | null) => {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  if (folderId) formData.append("folderId", folderId);

  const response = await authApi(getAuthToken()).post("/upload", formData, {
  });
  return response.data;
};

export const updateMedia = async (id: string, file?: File, name?: string) => {
  const formData = new FormData();
  if (file) formData.append("file", file);
  if (name) formData.append("name", name);

  const response = await authApi(getAuthToken()).put(`/upload/${id}`, formData, {
  });
  return response.data;
};

export const deleteMediaById = async (id: string) => {
  const response = await authApi(getAuthToken()).delete(`/upload/${id}`);
  return response.data;
};

export const syncCloudinaryMedia = async () => {
  const response = await authApi(getAuthToken()).post("/upload/sync");
  return response.data;
};

// --- MEDIA FOLDERS ---

export const getMediaFolders = async () => {
  const response = await authApi(getAuthToken()).get("/upload/folders");
  return response.data;
};

export const createMediaFolder = async (name: string) => {
  const response = await authApi(getAuthToken()).post("/upload/folders", { name });
  return response.data;
};

export const updateMediaFolder = async (id: string, name: string) => {
  const response = await authApi(getAuthToken()).put(`/upload/folders/${id}`, { name });
  return response.data;
};

export const deleteMediaFolder = async (id: string) => {
  const response = await authApi(getAuthToken()).delete(`/upload/folders/${id}`);
  return response.data;
};

export const deleteUser = async (id: string) => {
  const response = await authApi(getAuthToken()).delete(`/admin/users/${id}`);
  return response.data;
};

export const updateAdmin = async (
  id: string,
  payload: {
    name?: string;
    email?: string;
    city?: string;
    profilePic?: string;
    role?: string;
    department?: string;
    permissions?: string[];
  }
) => {
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

// Only allowed by the backend once an order is Delivered or Cancelled.
export const deleteOrder = async (id: string) => {
  const response = await authApi(getAuthToken()).delete(`/order/admin/${id}`);
  return response.data;
};

export const deleteMultipleOrders = async (ids: string[]) => {
  const response = await authApi(getAuthToken()).post(`/order/admin/bulk-delete`, { ids });
  return response.data;
};

export interface UnviewedOrder {
  _id: string;
  deliverySlot?: { name?: string };
  user?: { name?: string };
  totalAmount?: number;
  createdAt?: string;
}

export const getUnviewedOrders = async (): Promise<UnviewedOrder[]> => {
  const token = getAuthToken();
  if (!token) return [];
  const response = await authApi(token).get("/order/admin/unviewed");
  if (!Array.isArray(response.data)) {
    throw new Error("Unexpected response while fetching unviewed orders");
  }
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

export const deleteUserWishlist = async (id: string) => {
  const response = await authApi(getAuthToken()).delete(`/wishlist/admin/${id}`);
  return response.data;
};

export const getFlavors = async (params?: { page?: number; limit?: number; search?: string; all?: boolean }) => {
  const response = await authApi(getAuthToken()).get("/flavor", { params });
  return response.data;
};

export const createFlavor = async (payload: { name: string; image?: string }) => {
  const response = await authApi(getAuthToken()).post("/flavor", payload);
  return response.data;
};

export const updateFlavor = async (id: string, payload: { name: string; image?: string }) => {
  const response = await authApi(getAuthToken()).put(`/flavor/${id}`, payload);
  return response.data;
};

export const deleteFlavor = async (id: string) => {
  const response = await authApi(getAuthToken()).delete(`/flavor/${id}`);
  return response.data;
};

export const getOccasions = async (params?: { page?: number; limit?: number; search?: string; all?: boolean }) => {
  const response = await authApi(getAuthToken()).get("/occasion", { params });
  return response.data;
};

export const createOccasion = async (payload: { name: string; image?: string; isActive?: boolean }) => {
  const response = await authApi(getAuthToken()).post("/occasion", payload);
  return response.data;
};

export const updateOccasion = async (id: string, payload: { name?: string; image?: string; isActive?: boolean }) => {
  const response = await authApi(getAuthToken()).put(`/occasion/${id}`, payload);
  return response.data;
};

export const deleteOccasion = async (id: string) => {
  const response = await authApi(getAuthToken()).delete(`/occasion/${id}`);
  return response.data;
};

export const getHeroSlides = async (params?: { page?: number; limit?: number; search?: string; all?: boolean }) => {
  const response = await authApi(getAuthToken()).get("/heroslides", { params });
  return response.data;
};

export const createHeroSlide = async (payload: {
  tag?: string;
  title: string;
  desc?: string;
  cta?: string;
  categoryMatch?: string;
  image: string;
  order?: number;
  isActive?: boolean;
}) => {
  const response = await authApi(getAuthToken()).post("/heroslides", payload);
  return response.data;
};

export const updateHeroSlide = async (
  id: string,
  payload: {
    tag?: string;
    title?: string;
    desc?: string;
    cta?: string;
    categoryMatch?: string;
    image?: string;
    order?: number;
    isActive?: boolean;
  }
) => {
  const response = await authApi(getAuthToken()).put(`/heroslides/${id}`, payload);
  return response.data;
};

export const deleteHeroSlide = async (id: string) => {
  const response = await authApi(getAuthToken()).delete(`/heroslides/${id}`);
  return response.data;
};

// =============================================================
// SEO SERVICES
// =============================================================

export const getSeoGlobal = async () => {
  const response = await authApi(getAuthToken()).get("/seo/global");
  return response.data;
};

export const updateSeoGlobal = async (payload: any) => {
  const response = await authApi(getAuthToken()).put("/seo/global", payload);
  return response.data;
};

export const getSeoPages = async (params?: { page?: number; limit?: number; search?: string }) => {
  const response = await authApi(getAuthToken()).get("/seo/pages", { params });
  return response.data;
};

export const createSeoPage = async (payload: any) => {
  const response = await authApi(getAuthToken()).post("/seo/pages", payload);
  return response.data;
};

export const updateSeoPage = async (id: string, payload: any) => {
  const response = await authApi(getAuthToken()).put(`/seo/pages/${id}`, payload);
  return response.data;
};

export const deleteSeoPage = async (id: string) => {
  const response = await authApi(getAuthToken()).delete(`/seo/pages/${id}`);
  return response.data;
};

export const seedSeoPages = async () => {
  const response = await authApi(getAuthToken()).post("/seo/seed");
  return response.data;
};

export const getSeoRedirects = async (params?: { page?: number; limit?: number; search?: string }) => {
  const response = await authApi(getAuthToken()).get("/seo/redirects", { params });
  return response.data;
};

export const createSeoRedirect = async (payload: any) => {
  const response = await authApi(getAuthToken()).post("/seo/redirects", payload);
  return response.data;
};

export const updateSeoRedirect = async (id: string, payload: any) => {
  const response = await authApi(getAuthToken()).put(`/seo/redirects/${id}`, payload);
  return response.data;
};

export const deleteSeoRedirect = async (id: string) => {
  const response = await authApi(getAuthToken()).delete(`/seo/redirects/${id}`);
  return response.data;
};

export const getSeoAudit = async () => {
  const response = await authApi(getAuthToken()).get("/seo/audit");
  return response.data;
};

export const getSitemapData = async () => {
  const response = await authApi(getAuthToken()).get("/seo/sitemap-data");
  return response.data;
};

export const getRobotsData = async () => {
  const response = await authApi(getAuthToken()).get("/seo/robots-data");
  return response.data;
};

// Testimonial API re-exports
export * from "./testimonialService";

// Gallery API re-exports
export * from "./galleryService";

// Footer Management API
export const getFooterAdmin = async () => {
  const response = await authApi(getAuthToken()).get("/footer/admin");
  return response.data;
};

export const updateFooter = async (payload: any) => {
  const response = await authApi(getAuthToken()).put("/footer", payload);
  return response.data;
};

export const updateFooterBrand = async (payload: any) => {
  const response = await authApi(getAuthToken()).put("/footer/brand", payload);
  return response.data;
};

export const updateFooterNewsletter = async (payload: any) => {
  const response = await authApi(getAuthToken()).put("/footer/newsletter", payload);
  return response.data;
};

export const updateFooterBottom = async (payload: any) => {
  const response = await authApi(getAuthToken()).put("/footer/bottom", payload);
  return response.data;
};

export const updateFooterSeo = async (payload: any) => {
  const response = await authApi(getAuthToken()).put("/footer/seo", payload);
  return response.data;
};

export const addFooterBadge = async (payload: any) => {
  const response = await authApi(getAuthToken()).post("/footer/badges", payload);
  return response.data;
};

export const updateFooterBadge = async (id: string, payload: any) => {
  const response = await authApi(getAuthToken()).put(`/footer/badges/${id}`, payload);
  return response.data;
};

export const deleteFooterBadge = async (id: string) => {
  const response = await authApi(getAuthToken()).delete(`/footer/badges/${id}`);
  return response.data;
};

export const addFooterColumn = async (payload: any) => {
  const response = await authApi(getAuthToken()).post("/footer/columns", payload);
  return response.data;
};

export const updateFooterColumn = async (id: string, payload: any) => {
  const response = await authApi(getAuthToken()).put(`/footer/columns/${id}`, payload);
  return response.data;
};

export const deleteFooterColumn = async (id: string) => {
  const response = await authApi(getAuthToken()).delete(`/footer/columns/${id}`);
  return response.data;
};

export const addFooterLink = async (columnId: string, payload: any) => {
  const response = await authApi(getAuthToken()).post(`/footer/columns/${columnId}/links`, payload);
  return response.data;
};

export const updateFooterLink = async (columnId: string, linkId: string, payload: any) => {
  const response = await authApi(getAuthToken()).put(`/footer/columns/${columnId}/links/${linkId}`, payload);
  return response.data;
};

export const deleteFooterLink = async (columnId: string, linkId: string) => {
  const response = await authApi(getAuthToken()).delete(`/footer/columns/${columnId}/links/${linkId}`);
  return response.data;
};

export const resetFooterDefaults = async () => {
  const response = await authApi(getAuthToken()).post("/footer/reset-defaults");
  return response.data;
};

// ==========================================
// PARTNER / TIE-UP STORES (CLOUD HUB) APIS
// ==========================================

export const getStores = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  city?: string;
}) => {
  const response = await authApi(getAuthToken()).get("/stores", { params });
  return response.data;
};

export const getStoreById = async (id: string) => {
  const response = await authApi(getAuthToken()).get(`/stores/${id}`);
  return response.data;
};

export const createStore = async (payload: {
  name: string;
  image?: string;
  ownerFirstName: string;
  ownerLastName?: string;
  ownerPhone: string;
  whatsappNumber: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  googleMapsUrl?: string;
  description?: string;
  categories?: string[];
  commissionPercentage?: number;
  status?: string;
  notes?: string;
}) => {
  const response = await authApi(getAuthToken()).post("/stores", payload);
  return response.data;
};

export const updateStore = async (
  id: string,
  payload: Partial<{
    name: string;
    image?: string;
    ownerFirstName: string;
    ownerLastName?: string;
    ownerPhone: string;
    whatsappNumber: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    googleMapsUrl?: string;
    description?: string;
    categories?: string[];
    commissionPercentage?: number;
    status?: string;
    notes?: string;
  }>
) => {
  const response = await authApi(getAuthToken()).put(`/stores/${id}`, payload);
  return response.data;
};

export const deleteStore = async (id: string) => {
  const response = await authApi(getAuthToken()).delete(`/stores/${id}`);
  return response.data;
};

export const toggleStoreStatus = async (id: string) => {
  const response = await authApi(getAuthToken()).patch(`/stores/${id}/toggle-status`);
  return response.data;
};

// ==========================================
// DECORATION PACKAGES & VENUE BOOKINGS APIS
// ==========================================
// ==========================================
// DECORATION SERVICES (MODULARIZED IN ./decoration/)
// ==========================================
export * from "./decoration";
