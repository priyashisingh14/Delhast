import apiClient from './apiClient';

export const bookingApi = {
  /**
   * Create a new food order booking
   */
  createBooking: async (bookingData) => {
    const response = await apiClient.post('/bookings', bookingData);
    return response.data;
  },

  /**
   * Get list of bookings with filter type: 'available' | 'my_orders' | 'my_deliveries'
   */
  getBookings: async (type = 'available') => {
    const response = await apiClient.get('/bookings', {
      params: { type }
    });
    return response.data;
  },

  /**
   * Get single booking details by ID
   */
  getBookingById: async (orderId) => {
    const response = await apiClient.get(`/bookings/${orderId}`);
    return response.data;
  },

  /**
   * Accept an available order (Become Delivery Partner)
   */
  acceptBooking: async (orderId) => {
    const response = await apiClient.post(`/bookings/${orderId}/accept`);
    return response.data;
  },

  /**
   * Update order status (e.g. DELIVERY_IN_PROGRESS)
   */
  updateBookingStatus: async (orderId, status) => {
    const response = await apiClient.patch(`/bookings/${orderId}/status`, { status });
    return response.data;
  },

  /**
   * Mark order as RECEIVED (Customer only)
   */
  markBookingReceived: async (orderId) => {
    const response = await apiClient.post(`/bookings/${orderId}/received`);
    return response.data;
  },

  /**
   * Get chronological chat messages for an order
   */
  getMessages: async (orderId) => {
    const response = await apiClient.get(`/bookings/${orderId}/messages`);
    return response.data;
  },

  /**
   * Cancel/Remove an available order (Customer only)
   */
  cancelBooking: async (orderId) => {
    const response = await apiClient.delete(`/bookings/${orderId}`);
    return response.data;
  },

  /**
   * Send a chat message (HTTP fallback)
   */
  sendMessage: async (orderId, message) => {
    const response = await apiClient.post(`/bookings/${orderId}/messages`, { message });
    return response.data;
  }
};
