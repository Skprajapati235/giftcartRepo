import { authApi, getAuthToken, api } from "../apiClient";

export const getDecorationBookings = async (params?: {
  status?: string;
  city?: string;
  date?: string;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  const response = await authApi(getAuthToken()).get("/decoration/bookings", { params });
  return response.data;
};

export const getDecorationBookingById = async (id: string) => {
  const response = await authApi(getAuthToken()).get(`/decoration/bookings/${id}`);
  return response.data;
};

export const createDecorationBooking = async (payload: any) => {
  const response = await authApi(getAuthToken()).post("/decoration/bookings", payload);
  return response.data;
};

export const updateDecorationBookingStatus = async (
  id: string,
  payload: { status?: string; adminNotes?: string }
) => {
  const response = await authApi(getAuthToken()).patch(`/decoration/bookings/${id}/status`, payload);
  return response.data;
};

export const assignDecorationDecorator = async (
  id: string,
  payload: { partnerId: string | null; decoratorPayout?: number }
) => {
  const response = await authApi(getAuthToken()).patch(`/decoration/bookings/${id}/assign-decorator`, payload);
  return response.data;
};

export const recordDecorationBalancePayment = async (
  id: string,
  payload: { balancePaymentMethod?: string; notes?: string }
) => {
  const response = await authApi(getAuthToken()).patch(`/decoration/bookings/${id}/balance-collection`, payload);
  return response.data;
};

export const updateDecorationBooking = async (
  id: string,
  payload: any
) => {
  const response = await authApi(getAuthToken()).patch(`/decoration/bookings/${id}`, payload);
  return response.data;
};

// Public Customer Tracking Endpoint
export const trackDecorationBooking = async (bookingId: string, phone?: string) => {
  const response = await api.get(`/decoration/bookings/track/${encodeURIComponent(bookingId)}`, {
    params: phone ? { phone } : undefined,
  });
  return response.data;
};
