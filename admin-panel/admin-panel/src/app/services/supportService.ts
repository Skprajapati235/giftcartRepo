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

export interface SupportTicket {
  _id: string;
  name: string;
  email: string;
  mobileNumber: string;
  subject: string;
  orderId?: string;
  order?: {
    _id: string;
    orderId?: string;
    totalAmount?: number;
    status?: string;
    paymentStatus?: string;
    createdAt?: string;
  } | null;
  message: string;
  status: "pending" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  adminReply?: string;
  repliedAt?: string;
  repliedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface SupportQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: "all" | "pending" | "in_progress" | "resolved" | "closed";
  priority?: "all" | "low" | "medium" | "high" | "urgent";
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

/**
 * Public function for customer to submit inquiry
 */
export const createSupportTicket = async (payload: {
  name: string;
  email: string;
  mobileNumber: string;
  subject: string;
  orderId?: string;
  message: string;
  priority?: string;
}) => {
  const response = await publicApi.post("/support/contact", payload);
  return response.data;
};

/**
 * Admin: Get all tickets with pagination & filters
 */
export const getSupportTickets = async (params?: SupportQueryParams) => {
  const response = await authApi().get("/support/tickets", { params });
  return response.data;
};

/**
 * Admin: Get ticket details
 */
export const getSupportTicketById = async (id: string) => {
  const response = await authApi().get(`/support/tickets/${id}`);
  return response.data;
};

/**
 * Admin: Update ticket status and/or priority
 */
export const updateSupportTicketStatus = async (
  id: string,
  payload: { status?: string; priority?: string }
) => {
  const response = await authApi().put(`/support/tickets/${id}/status`, payload);
  return response.data;
};

/**
 * Admin: Reply to ticket
 */
export const replySupportTicket = async (
  id: string,
  payload: { adminReply: string; markResolved?: boolean }
) => {
  const response = await authApi().put(`/support/tickets/${id}/reply`, payload);
  return response.data;
};

/**
 * Admin: Delete single ticket
 */
export const deleteSupportTicket = async (id: string) => {
  const response = await authApi().delete(`/support/tickets/${id}`);
  return response.data;
};

/**
 * Admin: Bulk delete tickets
 */
export const bulkDeleteSupportTickets = async (ids: string[]) => {
  const response = await authApi().post("/support/bulk-delete", { ids });
  return response.data;
};
