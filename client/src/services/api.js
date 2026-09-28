import api, { request } from './apiClient.js';

// Auth Endpoints
export const authService = {
  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    return res.data;
  },
  register: async (userData) => {
    const res = await api.post('/auth/register', userData);
    return res.data;
  },
  verifyOtp: async (data) => {
    const res = await api.post('/auth/verify-email', data);
    return res.data;
  },
  resendOtp: async (data) => {
    const res = await api.post('/auth/resend-verification-otp', data);
    return res.data;
  },
  forgotPassword: async (data) => {
    const res = await api.post('/auth/forgot-password', data);
    return res.data;
  },
  resendPasswordResetOtp: async (data) => {
    const res = await api.post('/auth/resend-reset-password-otp', data);
    return res.data;
  },
  verifyPasswordResetOtp: async (data) => {
    const res = await api.post('/auth/verify-reset-password-otp', data);
    return res.data;
  },
  changePassword: async (data) => {
    const res = await api.post('/auth/change-password', data);
    return res.data;
  },
  resetPassword: async (data) => {
    const res = await api.post('/auth/reset-password', data);
    return res.data;
  },
  refreshToken: async (refreshToken) => {
    const res = await api.post('/auth/refresh-token', { refreshToken });
    return res.data;
  },
  logout: async () => {
    try {
      const res = await api.post('/auth/logout');
      return res.data;
    } catch {
      return null;
    }
  },
  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
};

// Equipment Endpoints
export const equipmentService = {
  getAll: async (params = {}) => {
    const res = await api.get('/equipment', { params });
    return res.data?.data !== undefined ? res.data.data : res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/equipment/${id}`);
    return res.data?.data !== undefined ? res.data.data : res.data;
  },
  getMyEquipments: async () => {
    const res = await api.get('/equipment/owner/my');
    return res.data?.data !== undefined ? res.data.data : res.data;
  },
  create: async (equipmentData) => {
    const res = await api.post('/equipment', equipmentData);
    return res.data?.data !== undefined ? res.data.data : res.data;
  },
  update: async (id, equipmentData) => {
    const res = await api.put(`/equipment/${id}`, equipmentData);
    return res.data?.data !== undefined ? res.data.data : res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/equipment/${id}`);
    return res.data?.data !== undefined ? res.data.data : res.data;
  },
};

// Booking Endpoints
export const bookingService = {
  create: async (bookingData) => {
    const res = await api.post('/bookings', bookingData);
    return res.data?.data !== undefined ? res.data.data : res.data;
  },
  getMyBookings: async () => {
    const res = await api.get('/bookings/my');
    return res.data?.data !== undefined ? res.data.data : res.data;
  },
  getOwnerBookings: async () => {
    const res = await api.get('/bookings/owner');
    return res.data?.data !== undefined ? res.data.data : res.data;
  },
  accept: async (id) => {
    const res = await api.put(`/bookings/${id}/accept`);
    return res.data?.data !== undefined ? res.data.data : res.data;
  },
  reject: async (id) => {
    const res = await api.put(`/bookings/${id}/reject`);
    return res.data?.data !== undefined ? res.data.data : res.data;
  },
  cancel: async (id) => {
    const res = await api.put(`/bookings/${id}/cancel`);
    return res.data?.data !== undefined ? res.data.data : res.data;
  },
};

// Review & Rating Endpoints
export const reviewService = {
  getEquipmentReviews: async (equipmentId) => {
    const res = await api.get(`/equipment/${equipmentId}/reviews`);
    return res.data?.data !== undefined ? res.data.data : res.data;
  },
  createReview: async (equipmentId, reviewData) => {
    const res = await api.post(`/equipment/${equipmentId}/reviews`, reviewData);
    return res.data?.data !== undefined ? res.data.data : res.data;
  },
  deleteReview: async (equipmentId, reviewId) => {
    const res = await api.delete(`/equipment/${equipmentId}/reviews/${reviewId}`);
    return res.data?.data !== undefined ? res.data.data : res.data;
  },
};

export { api, request };
export default api;

