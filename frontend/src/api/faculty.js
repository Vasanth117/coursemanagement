import api from './axiosConfig';

export const facultyAPI = {
  // Dashboard
  getDashboardStats: async () => {
    const response = await api.get('/faculty/dashboard/stats');
    return response.data;
  },

  // Courses
  getCourses: async (params = {}) => {
    const response = await api.get('/faculty/courses', { params });
    return response.data;
  },

  getCourseById: async (id) => {
    const response = await api.get(`/faculty/courses/${id}`);
    return response.data;
  },

  createCourse: async (courseData) => {
    const response = await api.post('/faculty/courses', courseData);
    return response.data;
  },

  updateCourse: async (id, courseData) => {
    const response = await api.put(`/faculty/courses/${id}`, courseData);
    return response.data;
  },

  deleteCourse: async (id) => {
    const response = await api.delete(`/faculty/courses/${id}`);
    return response.data;
  },

  // Assignments
  getAssignments: async (params = {}) => {
    const response = await api.get('/faculty/assignments', { params });
    return response.data;
  },

  getAssignmentById: async (id) => {
    const response = await api.get(`/faculty/assignments/${id}`);
    return response.data;
  },

  createAssignment: async (assignmentData) => {
    const response = await api.post('/faculty/assignments', assignmentData);
    return response.data;
  },

  updateAssignment: async (id, assignmentData) => {
    const response = await api.put(`/faculty/assignments/${id}`, assignmentData);
    return response.data;
  },

  deleteAssignment: async (id) => {
    const response = await api.delete(`/faculty/assignments/${id}`);
    return response.data;
  },

  getSubmissions: async (assignmentId) => {
    const response = await api.get(`/faculty/assignments/${assignmentId}/submissions`);
    return response.data;
  },

  gradeSubmission: async (submissionId, gradeData) => {
    const response = await api.put(`/faculty/submissions/${submissionId}/grade`, gradeData);
    return response.data;
  },

  // Students
  getStudents: async (params = {}) => {
    const response = await api.get('/faculty/students', { params });
    return response.data;
  },

  getStudentById: async (id) => {
    const response = await api.get(`/faculty/students/${id}`);
    return response.data;
  },

  updateAttendance: async (data) => {
    const response = await api.post('/faculty/attendance', data);
    return response.data;
  },

  // Gradebook
  getGradebook: async (courseId) => {
    const response = await api.get(`/faculty/courses/${courseId}/gradebook`);
    return response.data;
  },

  updateGrades: async (courseId, grades) => {
    const response = await api.put(`/faculty/courses/${courseId}/grades`, { grades });
    return response.data;
  },

  // Announcements
  getAnnouncements: async (params = {}) => {
    const response = await api.get('/faculty/announcements', { params });
    return response.data;
  },

  createAnnouncement: async (announcementData) => {
    const response = await api.post('/faculty/announcements', announcementData);
    return response.data;
  },

  // Resources
  getResources: async (courseId) => {
    const response = await api.get(`/faculty/courses/${courseId}/resources`);
    return response.data;
  },

  uploadResource: async (courseId, formData) => {
    const response = await api.post(`/faculty/courses/${courseId}/resources`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteResource: async (resourceId) => {
    const response = await api.delete(`/faculty/resources/${resourceId}`);
    return response.data;
  },
};

export default facultyAPI;
