// Users API
import api from './axiosConfig';

export const usersAPI = {
  // Get all users (Admin)
  getAllUsers: (params) => api.get('/users', { params }),
  
  // Get user by ID
  getUserById: (id) => api.get(`/users/${id}`),
  
  // Create user (Admin)
  createUser: (userData) => api.post('/users', userData),
  
  // Update user (Admin)
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  
  // Delete user (Admin)
  deleteUser: (id) => api.delete(`/users/${id}`),
  
  // Get users by role
  getUsersByRole: (role) => api.get(`/users/role/${role}`),
  
  // Search users
  searchUsers: (query) => api.get('/users/search', { params: { q: query } }),
  
  // Update user status (Admin)
  updateUserStatus: (id, status) => api.put(`/users/${id}/status`, { status }),
  
  // Get user statistics (Admin)
  getUserStats: () => api.get('/users/stats'),
  
  // Bulk import users (Admin)
  bulkImportUsers: (formData) => api.post('/users/bulk-import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

export default usersAPI;
