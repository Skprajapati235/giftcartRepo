import api from '../../api/apiClient.js';

/**
 * Service for customer booking & live status tracking in mobile app
 */

// Create customer venue booking
export const createDecorationBooking = async (bookingData) => {
  try {
    const res = await api.post('/decoration/bookings', {
      city: 'Faridabad',
      ...bookingData,
    });
    return res.data;
  } catch (error) {
    const msg =
      error.response?.data?.message || error.message || 'Failed to submit decoration booking';
    throw new Error(msg);
  }
};

// Customer live booking tracking
export const trackDecorationBooking = async (bookingId, phone = '') => {
  try {
    const trimmed = (bookingId || '').trim();
    const res = await api.get(`/decoration/bookings/track/${encodeURIComponent(trimmed)}`, {
      params: phone ? { phone } : undefined,
    });
    return res.data?.data || res.data?.tracking || null;
  } catch (error) {
    const msg =
      error.response?.data?.message || error.message || 'Could not find booking status';
    throw new Error(msg);
  }
};

const apiError = (error, fallback) =>
  error.response?.data?.message || error.message || fallback;

// ── Logged-in customer: my bookings, pay, verify, cancel ─────────────────────

// All bookings of the logged-in customer (newest first)
export const getMyDecorationBookings = async () => {
  try {
    const res = await api.get('/decoration/bookings/my');
    return res.data?.data || res.data?.bookings || [];
  } catch (error) {
    throw new Error(apiError(error, 'Could not load your bookings'));
  }
};

// Step 2 of an online booking: Razorpay order for an EXISTING booking (amount is decided by the server)
export const createDecorationPaymentOrder = async (bookingId) => {
  try {
    const res = await api.post(`/decoration/bookings/my/${encodeURIComponent(bookingId)}/pay`);
    return res.data?.data || res.data;
  } catch (error) {
    throw new Error(apiError(error, 'Could not start the payment'));
  }
};

// Step 3: the server verifies the payment and confirms the booking
export const verifyDecorationPayment = async (payload) => {
  try {
    const res = await api.post('/decoration/bookings/verify-payment', payload);
    return res.data?.data || res.data?.booking;
  } catch (error) {
    throw new Error(apiError(error, 'Payment verification failed'));
  }
};

export const cancelMyDecorationBooking = async (bookingId, reason = '') => {
  try {
    const res = await api.post(`/decoration/bookings/my/${encodeURIComponent(bookingId)}/cancel`, { reason });
    return res.data?.data || res.data?.booking;
  } catch (error) {
    throw new Error(apiError(error, 'Could not cancel this booking'));
  }
};

// What the booking form offers — venue types, time slots, colour themes and rules. Managed by the admin
// (Decoration Dashboard → Booking Setup). With a date, each slot also says whether it can still be booked.
export const getDecorationOptions = async (date) => {
  try {
    const res = await api.get('/decoration/options', { params: date ? { date } : undefined });
    const data = res.data?.data;
    if (!data) throw new Error('empty');
    return data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Could not load the booking options. Please check your connection and try again.'
    );
  }
};
