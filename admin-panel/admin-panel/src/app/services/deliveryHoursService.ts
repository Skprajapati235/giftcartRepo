import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_URL;

const getAuthToken = () => {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("giftcartAdminToken") || "";
};

const authApi = () =>
  axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });

const publicApi = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface DeliveryHoursStatus {
  isRestricted: boolean;
  isCurrentlyRestricted: boolean;
  dailyStart: string;
  dailyEnd: string;
  nextAvailableTime: string | null;
  formattedEnd?: string;
  message: string;
  blockOrders: boolean;
  allowBrowsing: boolean;
}

/**
 * Public: Get current delivery operating hours status and availability
 */
export const getDeliveryHours = async (): Promise<DeliveryHoursStatus> => {
  const response = await publicApi.get("/store-settings/delivery-hours");
  return response.data.data;
};

/**
 * Admin: Update delivery operating hours configuration
 */
export const updateDeliveryHours = async (payload: {
  isRestricted: boolean;
  dailyStart?: string;
  dailyEnd?: string;
  customMessage?: string;
  blockOrders?: boolean;
  allowBrowsing?: boolean;
}): Promise<DeliveryHoursStatus> => {
  const response = await authApi().put("/store-settings/delivery-hours", payload);
  return response.data.data;
};
