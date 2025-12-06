// Student-specific API
import api from './axiosConfig';

export const studentAPI = {
  // Dashboard
  getDashboardStats: () => api.get('/student/dashboard'),
  
  // Courses
  getEnrolledCourses: () => api.get('/student/courses'),
  getCourseDetails: (id) => api.get(`/student/courses/${id}`),
  enrollCourse: (courseId) => api.post('/student/enroll', { courseId }),
  unenrollCourse: (enrollmentId) => api.delete(`/student/enrollments/${enrollmentId}`),
  
  // Assignments
  getMyAssignments: (params) => api.get('/student/assignments', { params }),
  getAssignmentDetails: (id) => api.get(`/student/assignments/${id}`),
  submitAssignment: (id, formData) => api.post(`/student/assignments/${id}/submit`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getMySubmissions: () => api.get('/student/submissions'),
  
  // Grades
  getMyGrades: (params) => api.get('/student/grades', { params }),
  getCourseGrades: (courseId) => api.get(`/student/courses/${courseId}/grades`),
  
  // Attendance
  getMyAttendance: (params) => api.get('/student/attendance', { params }),
  getCourseAttendance: (courseId) => api.get(`/student/courses/${courseId}/attendance`),
  
  // Resources
  getCourseResources: (courseId) => api.get(`/student/courses/${courseId}/resources`),
  downloadResource: (resourceId) => api.get(`/student/resources/${resourceId}/download`, { responseType: 'blob' }),
  
  // Announcements
  getAnnouncements: (params) => api.get('/student/announcements', { params }),
  markAnnouncementRead: (id) => api.put(`/student/announcements/${id}/read`),
  
  // Schedule
  getMySchedule: () => api.get('/student/schedule'),
  
  // Profile
  getProfile: () => api.get('/student/profile'),
  updateProfile: (data) => api.put('/student/profile', data),
  
  // Notifications
  getNotifications: () => api.get('/student/notifications'),
  markNotificationRead: (id) => api.put(`/student/notifications/${id}/read`),
  
  // Performance
  getPerformanceReport: () => api.get('/student/performance'),
};

export default studentAPI;
