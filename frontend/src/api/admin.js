import api from './axiosConfig';

export const adminAPI = {
  // Dashboard
  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard/stats');
    return response.data;
  },

  // Users Management
  getUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  getUserById: async (id) => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },

  createUser: async (userData) => {
    const response = await api.post('/admin/users', userData);
    return response.data;
  },

  updateUser: async (id, userData) => {
    const response = await api.put(`/admin/users/${id}`, userData);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },

  // Courses Management
  getAllCourses: async (params = {}) => {
    const response = await api.get('/admin/courses', { params });
    return response.data;
  },

  getCourseById: async (id) => {
    const response = await api.get(`/admin/courses/${id}`);
    return response.data;
  },

  approveCourse: async (id) => {
    const response = await api.put(`/admin/courses/${id}/approve`);
    return response.data;
  },

  rejectCourse: async (id, reason) => {
    const response = await api.put(`/admin/courses/${id}/reject`, { reason });
    return response.data;
  },

  // Analytics
  getUserAnalytics: async (params = {}) => {
    const response = await api.get('/admin/analytics/users', { params });
    return response.data;
  },

  getCourseAnalytics: async (params = {}) => {
    const response = await api.get('/admin/analytics/courses', { params });
    return response.data;
  },

  getSystemAnalytics: async (params = {}) => {
    const response = await api.get('/admin/analytics/system', { params });
    return response.data;
  },

  // Reports
  generateReport: async (reportType, params = {}) => {
    const response = await api.post('/admin/reports/generate', { reportType, ...params });
    return response.data;
  },

  // Settings
  getSettings: async () => {
    const response = await api.get('/admin/settings');
    return response.data;
  },

  updateSettings: async (settings) => {
    const response = await api.put('/admin/settings', settings);
    return response.data;
  },
};

export default adminAPI;
