// Enrollments API
import api from './axiosConfig';

export const enrollmentsAPI = {
  // Enroll in course (Student)
  enrollCourse: (courseId) => api.post('/enrollments', { courseId }),
  
  // Unenroll from course (Student)
  unenrollCourse: (enrollmentId) => api.delete(`/enrollments/${enrollmentId}`),
  
  // Get student enrollments
  getStudentEnrollments: () => api.get('/enrollments/student'),
  
  // Get course enrollments (Faculty)
  getCourseEnrollments: (courseId) => api.get(`/enrollments/course/${courseId}`),
  
  // Get enrollment by ID
  getEnrollmentById: (id) => api.get(`/enrollments/${id}`),
  
  // Update enrollment status (Faculty/Admin)
  updateEnrollmentStatus: (id, status) => api.put(`/enrollments/${id}/status`, { status }),
  
  // Bulk enroll students (Admin)
  bulkEnroll: (data) => api.post('/enrollments/bulk', data),
  
  // Get enrollment statistics
  getEnrollmentStats: (courseId) => api.get(`/enrollments/course/${courseId}/stats`),
};

export default enrollmentsAPI;
