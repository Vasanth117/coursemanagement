// Courses API
import api from './axiosConfig';

export const coursesAPI = {
  // Get all courses
  getAllCourses: (params) => api.get('/courses', { params }),
  
  // Get course by ID
  getCourseById: (id) => api.get(`/courses/${id}`),
  
  // Create new course (Faculty/Admin)
  createCourse: (courseData) => api.post('/courses', courseData),
  
  // Update course (Faculty/Admin)
  updateCourse: (id, courseData) => api.put(`/courses/${id}`, courseData),
  
  // Delete course (Admin)
  deleteCourse: (id) => api.delete(`/courses/${id}`),
  
  // Get courses by faculty
  getCoursesByFaculty: (facultyId) => api.get(`/courses/faculty/${facultyId}`),
  
  // Get enrolled courses (Student)
  getEnrolledCourses: () => api.get('/courses/enrolled'),
  
  // Search courses
  searchCourses: (query) => api.get('/courses/search', { params: { q: query } }),
  
  // Get course statistics
  getCourseStats: (id) => api.get(`/courses/${id}/stats`),
  
  // Get course materials
  getCourseMaterials: (id) => api.get(`/courses/${id}/materials`),
  
  // Upload course material
  uploadMaterial: (id, formData) => api.post(`/courses/${id}/materials`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  // Delete course material
  deleteMaterial: (courseId, materialId) => api.delete(`/courses/${courseId}/materials/${materialId}`),
};

export default coursesAPI;
