import { authApi, getAuthToken } from "./apiClient";

export interface DeliverySlotItem {
  _id?: string;
  name: string;
  type: "standard" | "fixed_time" | "fixed" | "midnight" | "early_morning";
  startTime: string;
  endTime: string;
  timeRange: string;
  image?: string;
  extraCharge: number;
  cutoffTime?: string;
  badge?: string;
  maxOrdersPerDay?: number;
  isActive: boolean;
  sortOrder?: number;
  createdAt?: string;
}

export interface AddonItem {
  _id?: string;
  name: string;
  category: string;
  productCategories?: Array<string | ProductCategoryOption>;
  price: number;
  image: string;
  description?: string;
  isPopular?: boolean;
  isActive: boolean;
  sortOrder?: number;
  createdAt?: string;
}

export interface AddonCategory {
  _id: string;
  name: string;
  slug: string;
  addonCount: number;
}

export interface ProductCategoryOption {
  _id: string;
  name: string;
  slug?: string;
}

export interface StoryItem {
  _id?: string;
  title: string;
  thumbnail?: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  subtitle?: string;
  duration?: number;
  tag?: string;
  ctaText?: string;
  ctaLink?: string;
  ctaCategory?: string | ProductCategoryOption;
  isActive: boolean;
  sortOrder?: number;
  createdAt?: string;
}

// ──────────────────────────────────────────────
// Delivery Slots API
// ──────────────────────────────────────────────
export const getAdminDeliverySlots = async (): Promise<DeliverySlotItem[]> => {
  const res = await authApi(getAuthToken()).get("/delivery-slots?all=true");
  return res.data?.data || [];
};

export const createDeliverySlot = async (slot: Partial<DeliverySlotItem>): Promise<DeliverySlotItem> => {
  const res = await authApi(getAuthToken()).post("/delivery-slots", slot);
  return res.data?.data;
};

export const updateDeliverySlot = async (id: string, slot: Partial<DeliverySlotItem>): Promise<DeliverySlotItem> => {
  const res = await authApi(getAuthToken()).put(`/delivery-slots/${id}`, slot);
  return res.data?.data;
};

export const deleteDeliverySlot = async (id: string): Promise<void> => {
  await authApi(getAuthToken()).delete(`/delivery-slots/${id}`);
};

// ──────────────────────────────────────────────
// Add-ons API
// ──────────────────────────────────────────────
export const getAdminAddons = async (): Promise<AddonItem[]> => {
  const res = await authApi(getAuthToken()).get("/addons?all=true");
  return res.data?.data || [];
};

export const createAddon = async (addon: Partial<AddonItem>): Promise<AddonItem> => {
  const res = await authApi(getAuthToken()).post("/addons", addon);
  return res.data?.data;
};

export const updateAddon = async (id: string, addon: Partial<AddonItem>): Promise<AddonItem> => {
  const res = await authApi(getAuthToken()).put(`/addons/${id}`, addon);
  return res.data?.data;
};

export const deleteAddon = async (id: string): Promise<void> => {
  await authApi(getAuthToken()).delete(`/addons/${id}`);
};

export const getAdminAddonCategories = async (): Promise<AddonCategory[]> => {
  const res = await authApi(getAuthToken()).get("/addon-categories");
  return res.data?.data || [];
};

export const createAddonCategory = async (name: string): Promise<AddonCategory> => {
  const res = await authApi(getAuthToken()).post("/addon-categories", { name });
  return res.data?.data;
};

export const updateAddonCategory = async (id: string, name: string): Promise<AddonCategory> => {
  const res = await authApi(getAuthToken()).put(`/addon-categories/${id}`, { name });
  return res.data?.data;
};

export const deleteAddonCategory = async (id: string): Promise<void> => {
  await authApi(getAuthToken()).delete(`/addon-categories/${id}`);
};

// ──────────────────────────────────────────────
// Stories API
// ──────────────────────────────────────────────
export const getAdminStories = async (): Promise<StoryItem[]> => {
  const res = await authApi(getAuthToken()).get("/stories?all=true");
  return res.data?.data || [];
};

export const createStory = async (story: Partial<StoryItem>): Promise<StoryItem> => {
  const res = await authApi(getAuthToken()).post("/stories", story);
  return res.data?.data;
};

export const updateStory = async (id: string, story: Partial<StoryItem>): Promise<StoryItem> => {
  const res = await authApi(getAuthToken()).put(`/stories/${id}`, story);
  return res.data?.data;
};

export const deleteStory = async (id: string): Promise<void> => {
  await authApi(getAuthToken()).delete(`/stories/${id}`);
};

// ──────────────────────────────────────────────
// Live Kitchen Status API (for Kanban Board)
// ──────────────────────────────────────────────
export const updateOrderKitchenStatus = async (orderId: string, kitchenStatus: string) => {
  const res = await authApi(getAuthToken()).put(`/order/admin/${orderId}/kitchen-status`, { kitchenStatus });
  return res.data;
};
