import { authApi, api } from "./apiClient";

export interface DeliverySlotItem {
  _id?: string;
  name: string;
  type: "standard" | "fixed_time" | "fixed" | "midnight" | "early_morning";
  startTime: string;
  endTime: string;
  timeRange: string;
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
  category: "candle" | "card" | "chocolate" | "balloon" | "popper" | "teddy" | "accessory";
  price: number;
  image: string;
  description?: string;
  isPopular?: boolean;
  isActive: boolean;
  sortOrder?: number;
  createdAt?: string;
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
  isActive: boolean;
  sortOrder?: number;
  createdAt?: string;
}

// ──────────────────────────────────────────────
// Delivery Slots API
// ──────────────────────────────────────────────
export const getAdminDeliverySlots = async (): Promise<DeliverySlotItem[]> => {
  const res = await authApi().get("/delivery-slots?all=true");
  return res.data?.data || [];
};

export const createDeliverySlot = async (slot: Partial<DeliverySlotItem>): Promise<DeliverySlotItem> => {
  const res = await authApi().post("/delivery-slots", slot);
  return res.data?.data;
};

export const updateDeliverySlot = async (id: string, slot: Partial<DeliverySlotItem>): Promise<DeliverySlotItem> => {
  const res = await authApi().put(`/delivery-slots/${id}`, slot);
  return res.data?.data;
};

export const deleteDeliverySlot = async (id: string): Promise<void> => {
  await authApi().delete(`/delivery-slots/${id}`);
};

// ──────────────────────────────────────────────
// Add-ons API
// ──────────────────────────────────────────────
export const getAdminAddons = async (): Promise<AddonItem[]> => {
  const res = await authApi().get("/addons?all=true");
  return res.data?.data || [];
};

export const createAddon = async (addon: Partial<AddonItem>): Promise<AddonItem> => {
  const res = await authApi().post("/addons", addon);
  return res.data?.data;
};

export const updateAddon = async (id: string, addon: Partial<AddonItem>): Promise<AddonItem> => {
  const res = await authApi().put(`/addons/${id}`, addon);
  return res.data?.data;
};

export const deleteAddon = async (id: string): Promise<void> => {
  await authApi().delete(`/addons/${id}`);
};

// ──────────────────────────────────────────────
// Stories API
// ──────────────────────────────────────────────
export const getAdminStories = async (): Promise<StoryItem[]> => {
  const res = await authApi().get("/stories?all=true");
  return res.data?.data || [];
};

export const createStory = async (story: Partial<StoryItem>): Promise<StoryItem> => {
  const res = await authApi().post("/stories", story);
  return res.data?.data;
};

export const updateStory = async (id: string, story: Partial<StoryItem>): Promise<StoryItem> => {
  const res = await authApi().put(`/stories/${id}`, story);
  return res.data?.data;
};

export const deleteStory = async (id: string): Promise<void> => {
  await authApi().delete(`/stories/${id}`);
};

// ──────────────────────────────────────────────
// Live Kitchen Status API (for Kanban Board)
// ──────────────────────────────────────────────
export const updateOrderKitchenStatus = async (orderId: string, kitchenStatus: string) => {
  const res = await authApi().put(`/order/admin/${orderId}/kitchen-status`, { kitchenStatus });
  return res.data;
};

