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

export interface Testimonial {
  _id: string;
  name: string;
  designation?: string;
  company?: string;
  avatar?: string;
  rating: number;
  title?: string;
  message: string;
  platform: "website" | "google" | "instagram" | "facebook" | "trustpilot" | "other";
  videoUrl?: string;
  product?: { _id: string; name: string; price: number; image?: string } | null;
  order: number;
  isFeatured: boolean;
  isActive: boolean;
  date?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TestimonialStats {
  total: number;
  active: number;
  featured: number;
  avgRating: number;
}

export interface GetTestimonialsParams {
  page?: number;
  limit?: number;
  search?: string;
  platform?: string;
  rating?: string | number;
  isFeatured?: boolean | string;
  isActive?: boolean | string;
  all?: boolean;
}

export const getTestimonials = async (params?: GetTestimonialsParams) => {
  const response = await authApi(getAuthToken()).get("/testimonials", { params });
  return response.data;
};

export const getTestimonialById = async (id: string) => {
  const response = await authApi(getAuthToken()).get(`/testimonials/${id}`);
  return response.data;
};

export const createTestimonial = async (payload: Partial<Testimonial>) => {
  const response = await authApi(getAuthToken()).post("/testimonials", payload);
  return response.data;
};

export const updateTestimonial = async (id: string, payload: Partial<Testimonial>) => {
  const response = await authApi(getAuthToken()).put(`/testimonials/${id}`, payload);
  return response.data;
};

export const updateTestimonialStatus = async (
  id: string,
  payload: { isActive?: boolean; isFeatured?: boolean }
) => {
  const response = await authApi(getAuthToken()).patch(`/testimonials/${id}/status`, payload);
  return response.data;
};

export const deleteTestimonial = async (id: string) => {
  const response = await authApi(getAuthToken()).delete(`/testimonials/${id}`);
  return response.data;
};

export const bulkDeleteTestimonials = async (ids: string[]) => {
  const response = await authApi(getAuthToken()).post("/testimonials/bulk-delete", { ids });
  return response.data;
};

export const reorderTestimonials = async (items: { id: string; order: number }[]) => {
  const response = await authApi(getAuthToken()).put("/testimonials/reorder", { items });
  return response.data;
};
