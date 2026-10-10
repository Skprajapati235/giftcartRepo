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
