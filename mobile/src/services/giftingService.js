import api, { handleApiError } from '../api/apiClient';

/**
 * Fetch active delivery slots (Standard, Fixed Time, Midnight, Early Morning)
 */
export const fetchDeliverySlots = async () => {
  try {
    const res = await api.get('/delivery-slots');
    return res.data?.data || [];
  } catch (error) {
    console.error('fetchDeliverySlots error:', error);
    return [];
  }
};

/**
 * Fetch celebration add-ons (Candles, Greeting Cards, Confetti, Chocolates, Teddy)
 */
export const fetchAddons = async () => {
  try {
    const res = await api.get('/addons');
    return res.data?.data || [];
  } catch (error) {
    console.error('fetchAddons error:', error);
    return [];
  }
};

/**
 * Fetch Instagram-style Story Highlights for Home Screen
 */
export const fetchStories = async () => {
  try {
    const res = await api.get('/stories');
    return res.data?.data || [];
  } catch (error) {
    console.error('fetchStories error:', error);
    return [];
  }
};
