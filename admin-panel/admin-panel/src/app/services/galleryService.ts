import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_URL;

const getAuthToken = () => {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("giftcartAdminToken") || "";
};

const authApi = (token?: string) =>
  axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

export interface GalleryItem {
  _id: string;
  title: string;
  caption?: string;
  image: string;
  mediaType: "image" | "video";
  videoUrl?: string;
  category: string;
  tags?: string[];
  likes: number;
  order: number;
  isFeatured: boolean;
  isActive: boolean;
  linkedProduct?: { _id: string; name: string; price: number; image?: string } | null;
  date?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GalleryStats {
  total: number;
  active: number;
  featured: number;
  categoriesCount: number;
}

export interface GallerySettings {
  _id?: string;
  mobileLayout: "masonry" | "grid" | "feed" | "carousel";
  webLayout: "masonry" | "grid" | "carousel" | "slideshow";
  title: string;
  subtitle: string;
  enableLikes: boolean;
  enableShopLook: boolean;
  itemsPerPage: number;
}

export interface GetGalleryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  mediaType?: string;
  isFeatured?: boolean | string;
  isActive?: boolean | string;
  all?: boolean;
}

export const getGalleryItems = async (params?: GetGalleryParams) => {
  const response = await authApi(getAuthToken()).get("/gallery", { params });
  return response.data;
};

export const getGalleryCategories = async () => {
  const response = await authApi(getAuthToken()).get("/gallery/categories");
  return response.data;
};

export const getGalleryItemById = async (id: string) => {
  const response = await authApi(getAuthToken()).get(`/gallery/${id}`);
  return response.data;
};

export const createGalleryItem = async (payload: Partial<GalleryItem>) => {
  const response = await authApi(getAuthToken()).post("/gallery", payload);
  return response.data;
};

export const updateGalleryItem = async (id: string, payload: Partial<GalleryItem>) => {
  const response = await authApi(getAuthToken()).put(`/gallery/${id}`, payload);
  return response.data;
};

export const updateGalleryStatus = async (
  id: string,
  payload: { isActive?: boolean; isFeatured?: boolean }
) => {
  const response = await authApi(getAuthToken()).patch(`/gallery/${id}/status`, payload);
  return response.data;
};

export const deleteGalleryItem = async (id: string) => {
  const response = await authApi(getAuthToken()).delete(`/gallery/${id}`);
  return response.data;
};

export const bulkDeleteGalleryItems = async (ids: string[]) => {
  const response = await authApi(getAuthToken()).post("/gallery/bulk-delete", { ids });
  return response.data;
};

export const reorderGalleryItems = async (items: { id: string; order: number }[]) => {
  const response = await authApi(getAuthToken()).put("/gallery/reorder", { items });
  return response.data;
};

export const getGallerySettings = async () => {
  const response = await authApi(getAuthToken()).get("/gallery/settings");
  return response.data;
};

export const updateGallerySettings = async (payload: Partial<GallerySettings>) => {
  const response = await authApi(getAuthToken()).put("/gallery/settings", payload);
  return response.data;
};

