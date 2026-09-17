import api, { handleApiError } from '../api/apiClient';

const deliveryHoursService = {
  /**
   * Get store operating and delivery hours status
   * Returns: { success: true, data: { isRestricted, isCurrentlyRestricted, dailyStart, dailyEnd, nextAvailableTime, message, blockOrders, allowBrowsing } }
   */
  getDeliveryHours: async () => {
    try {
      const response = await api.get('/store-settings/delivery-hours');
      return response.data;
    } catch (error) {
      console.warn('Could not fetch delivery hours:', error?.message);
      return {
        success: false,
        data: {
          isRestricted: false,
          isCurrentlyRestricted: false,
          nextAvailableTime: null,
          message: 'Delivery is operating normally.',
          blockOrders: false,
          allowBrowsing: true,
        },
      };
    }
  },
};

export default deliveryHoursService;
