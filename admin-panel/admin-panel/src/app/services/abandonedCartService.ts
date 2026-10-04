import { authApi } from "./apiClient";

export interface AbandonedCartRecord {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  email: string;
  items: Array<{
    name: string;
    weight: string;
    qty: number;
    price: number;
  }>;
  cartTotal: number;
  droppedAt: string;
  status: "Pending" | "WhatsApp Sent" | "Email Sent" | "Recovered";
  couponSent?: string | null;
}

export const abandonedCartService = {
  getAbandonedCarts: async (): Promise<AbandonedCartRecord[]> => {
    try {
      const res = await authApi().get("/abandoned-carts");
      if (res.data?.success && res.data?.data) {
        return res.data.data;
      }
      return [];
    } catch (err: any) {
      console.warn("Could not fetch abandoned carts:", err?.message);
      return [];
    }
  },

  recordRecovery: async (id: string, couponCode: string, method = "whatsapp") => {
    try {
      const res = await authApi().post(`/abandoned-carts/${id}/recover`, { couponCode, method });
      return res.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || "Failed to record recovery");
    }
  },

  markRecovered: async (id: string) => {
    try {
      const res = await authApi().put(`/abandoned-carts/${id}/mark-recovered`);
      return res.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || "Failed to mark recovered");
    }
  },
};
