// Assignments API
import api from './axiosConfig';

export const assignmentsAPI = {
  // Get all assignments
  getAllAssignments: (params) => api.get('/assignments', { params }),
  
  // Get assignment by ID
  getAssignmentById: (id) => api.get(`/assignments/${id}`),
  
  // Create assignment (Faculty)
  createAssignment: (assignmentData) => api.post('/assignments', assignmentData),
  
  // Update assignment (Faculty)
  updateAssignment: (id, assignmentData) => api.put(`/assignments/${id}`, assignmentData),
  
  // Delete assignment (Faculty)
  deleteAssignment: (id) => api.delete(`/assignments/${id}`),
  
  // Get assignments by course
  getAssignmentsByCourse: (courseId) => api.get(`/assignments/course/${courseId}`),
  
  // Get student assignments
  getStudentAssignments: () => api.get('/assignments/student'),
  
  // Submit assignment (Student)
  submitAssignment: (id, formData) => api.post(`/assignments/${id}/submit`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  // Get assignment submissions (Faculty)
  getSubmissions: (id) => api.get(`/assignments/${id}/submissions`),
  
  // Get single submission
  getSubmissionById: (assignmentId, submissionId) => api.get(`/assignments/${assignmentId}/submissions/${submissionId}`),
  
  // Grade submission (Faculty)
  gradeSubmission: (assignmentId, submissionId, gradeData) => 
    api.put(`/assignments/${assignmentId}/submissions/${submissionId}/grade`, gradeData),
  
  // Download submission
  downloadSubmission: (assignmentId, submissionId) => 
    api.get(`/assignments/${assignmentId}/submissions/${submissionId}/download`, { responseType: 'blob' }),
  
  // Get assignment statistics
  getAssignmentStats: (id) => api.get(`/assignments/${id}/stats`),
};

export default assignmentsAPI;
