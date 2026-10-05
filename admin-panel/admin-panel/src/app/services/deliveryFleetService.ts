// import { authApi } from "./apiClient";

// export interface DeliveryRider {
//   _id: string;
//   name: string;
//   phone: string;
//   vehicle: "Motorcycle" | "Electric Scooter" | "Delivery Van" | "Bicycle";
//   vehicleNumber: string;
//   status: "Available" | "En Route" | "Offline";
//   rating: number;
//   currentZone: string;
//   activeOrders: number;
//   totalDeliveriesCompleted?: number;
// }

// export const deliveryFleetService = {
//   getRiders: async (): Promise<DeliveryRider[]> => {
//     try {
//       const res = await authApi().get("/delivery-riders");
//       if (res.data?.success && res.data?.data) {
//         return res.data.data;
//       }
//       return [];
//     } catch (err: any) {
//       console.warn("Could not fetch riders from backend:", err?.message);
//       return [];
//     }
//   },

//   createRider: async (data: Partial<DeliveryRider>): Promise<DeliveryRider | null> => {
//     try {
//       const res = await authApi().post("/delivery-riders", data);
//       return res.data?.data || null;
//     } catch (err: any) {
//       throw new Error(err.response?.data?.message || "Failed to create rider");
//     }
//   },

//   assignRider: async (orderId: string, riderId: string) => {
//     try {
//       const res = await authApi().put("/delivery-riders/assign", { orderId, riderId });
//       return res.data;
//     } catch (err: any) {
//       throw new Error(err.response?.data?.message || "Failed to assign rider");
//     }
//   },

//   updateStatus: async (riderId: string, status: string) => {
//     try {
//       const res = await authApi().put(`/delivery-riders/${riderId}/status`, { status });
//       return res.data;
//     } catch (err: any) {
//       throw new Error(err.response?.data?.message || "Failed to update rider status");
//     }
//   },
// };


import { authApi } from "./apiClient";

export type RiderStatus = "Available" | "En Route" | "Offline";

export interface DeliveryRider {
  _id: string;
  name: string;
  phone: string;
  vehicle: "Motorcycle" | "Electric Scooter" | "Delivery Van" | "Bicycle";
  vehicleNumber: string;
  status: RiderStatus;
  rating: number;
  currentZone: string;
  activeOrders: number;
  totalDeliveriesCompleted?: number;
}

const errMsg = (err: any, fallback: string) =>
  err?.response?.data?.message || err?.message || fallback;

export const deliveryFleetService = {
  getRiders: async (): Promise<DeliveryRider[]> => {
    try {
      const res = await authApi().get("/delivery-riders");
      return res.data?.data || [];
    } catch (err: any) {
      throw new Error(errMsg(err, "Riders load nahi ho paaye"));
    }
  },

  getDispatchOrders: async (): Promise<any[]> => {
    try {
      const res = await authApi().get("/delivery-riders/dispatch-orders");
      return res.data?.data || [];
    } catch (err: any) {
      throw new Error(errMsg(err, "Orders load nahi ho paaye"));
    }
  },

  createRider: async (data: Partial<DeliveryRider>): Promise<DeliveryRider | null> => {
    try {
      const res = await authApi().post("/delivery-riders", data);
      return res.data?.data || null;
    } catch (err: any) {
      throw new Error(errMsg(err, "Rider add nahi ho paaya"));
    }
  },

  assignRider: async (orderId: string, riderId: string) => {
    try {
      const res = await authApi().put("/delivery-riders/assign", { orderId, riderId });
      return res.data;
    } catch (err: any) {
      throw new Error(errMsg(err, "Rider assign nahi ho paaya"));
    }
  },

  unassignRider: async (orderId: string) => {
    try {
      const res = await authApi().put("/delivery-riders/unassign", { orderId });
      return res.data;
    } catch (err: any) {
      throw new Error(errMsg(err, "Rider hata nahi paaye"));
    }
  },

  dispatchOrder: async (orderId: string) => {
    try {
      const res = await authApi().put("/delivery-riders/dispatch", { orderId });
      return res.data;
    } catch (err: any) {
      throw new Error(errMsg(err, "Order dispatch nahi ho paaya"));
    }
  },

  completeDelivery: async (orderId: string) => {
    try {
      const res = await authApi().put("/delivery-riders/complete", { orderId });
      return res.data;
    } catch (err: any) {
      throw new Error(errMsg(err, "Order delivered mark nahi ho paaya"));
    }
  },

  updateStatus: async (riderId: string, status: RiderStatus) => {
    try {
      const res = await authApi().put(`/delivery-riders/${riderId}/status`, { status });
      return res.data;
    } catch (err: any) {
      throw new Error(errMsg(err, "Rider status update nahi ho paaya"));
    }
  },
};

