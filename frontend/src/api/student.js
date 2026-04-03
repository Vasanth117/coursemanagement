// Student-specific API
import api from './axiosConfig';

export const studentAPI = {
  // Dashboard
  getDashboardStats: () => api.get('/student/dashboard'),
  getUpcomingAssignments: () => api.get('/student/assignments?status=pending&limit=5'),
  
  // Courses
  getEnrolledCourses: async () => {
    const response = await api.get('/student/courses');
    return Array.isArray(response.data) ? response.data : response.data?.data || [];
  },
  getAvailableCourses: async () => {
    const response = await api.get('/student/courses/available');
    return Array.isArray(response.data) ? response.data : response.data?.data || [];
  },
  // Course preview (for enrollment)
  getCoursePreview: (id) => api.get(`/student/courses/${id}/preview`),
  getCourseDetails: (id) => api.get(`/student/courses/${id}`),
  enrollCourse: (courseId) => api.post('/student/enroll', { courseId }),
  unenrollCourse: (enrollmentId) => api.delete(`/student/enrollments/${enrollmentId}`),
  
  // Assignments
  getMyAssignments: async (params) => {
    const response = await api.get('/student/assignments', { params });
    return Array.isArray(response.data) ? response.data : response.data?.data || [];
  },
  getAssignmentDetails: (id) => api.get(`/student/assignments/${id}`),
  submitAssignment: (id, formData) => api.post(`/student/assignments/${id}/submit`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getCourseAssignments: async (id) => {
    const response = await api.get(`/student/courses/${id}/assignments`);
    return response.data?.assignments || response.data?.data || response.data || [];
  },
  getMySubmissions: async () => {
    const response = await api.get('/student/submissions');
    return Array.isArray(response.data) ? response.data : response.data?.data || [];
  },
  
  // Grades
  getMyGrades: async (params) => {
    const response = await api.get('/student/grades', { params });
    return Array.isArray(response.data) ? response.data : response.data?.data || [];
  },
  getCourseGrades: (courseId) => api.get(`/student/courses/${courseId}/grades`),
  
  // Attendance
  getMyAttendance: async (params) => {
    const response = await api.get('/student/attendance', { params });
    return Array.isArray(response.data) ? response.data : response.data?.data || [];
  },
  getCourseAttendance: (courseId) => api.get(`/student/courses/${courseId}/attendance`),
  
  // Resources
  getCourseResources: async (courseId) => {
    const response = await api.get(`/student/courses/${courseId}/resources`);
    return response.data?.resources || response.data?.data || response.data || [];
  },
  downloadResource: (resourceId) => api.get(`/student/resources/${resourceId}/download`, { responseType: 'blob' }),
  
  // Announcements
  getAnnouncements: (params) => api.get('/announcements', { params }),
  markAnnouncementRead: (id) => api.put(`/announcements/${id}/read`),
  
  // Schedule
  getMySchedule: () => api.get('/student/schedule'),
  
  // Profile
  getProfile: () => api.get('/student/profile'),
  updateProfile: (data) => api.put('/student/profile', data),
  
  // Notifications
  getNotifications: () => api.get('/notifications'),
  markNotificationRead: (id) => api.put(`/notifications/${id}/read`),
  
  // Performance
  getPerformanceReport: () => api.get('/student/performance'),
};

export default studentAPI;
