import { authApi } from "./apiClient";

export interface DeliveryRider {
  _id: string;
  name: string;
  phone: string;
  vehicle: "Motorcycle" | "Electric Scooter" | "Delivery Van" | "Bicycle";
  vehicleNumber: string;
  status: "Available" | "En Route" | "Offline";
  rating: number;
  currentZone: string;
  activeOrders: number;
  totalDeliveriesCompleted?: number;
}

export const deliveryFleetService = {
  getRiders: async (): Promise<DeliveryRider[]> => {
    try {
      const res = await authApi().get("/delivery-riders");
      if (res.data?.success && res.data?.data) {
        return res.data.data;
      }
      return [];
    } catch (err: any) {
      console.warn("Could not fetch riders from backend:", err?.message);
      return [];
    }
  },

  createRider: async (data: Partial<DeliveryRider>): Promise<DeliveryRider | null> => {
    try {
      const res = await authApi().post("/delivery-riders", data);
      return res.data?.data || null;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || "Failed to create rider");
    }
  },

  assignRider: async (orderId: string, riderId: string) => {
    try {
      const res = await authApi().put("/delivery-riders/assign", { orderId, riderId });
      return res.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || "Failed to assign rider");
    }
  },

  updateStatus: async (riderId: string, status: string) => {
    try {
      const res = await authApi().put(`/delivery-riders/${riderId}/status`, { status });
      return res.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || "Failed to update rider status");
    }
  },
};
