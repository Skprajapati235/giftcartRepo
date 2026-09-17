import api, { handleApiError } from '../api/apiClient';

const supportService = {
  /**
   * Submit a customer support inquiry / ticket
   * @param {Object} data { name, email, mobileNumber, subject, orderId, message, priority }
   */
  createTicket: async (data) => {
    try {
      const response = await api.post('/support/contact', data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

export default supportService;
