export const API_BASE_URL = 'http://localhost:5001/api/v1';

export const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  PROFILE: '/auth/profile',
  CHANGE_PASSWORD: '/auth/change-password',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password'
};

export const COURSE_ENDPOINTS = {
  BASE: '/courses',
  BY_ID: (id) => `/courses/${id}`,
  FACULTY: (id) => `/courses/faculty/${id}`,
  ENROLLED: '/courses/enrolled'
};

export const ASSIGNMENT_ENDPOINTS = {
  BASE: '/assignments',
  BY_ID: (id) => `/assignments/${id}`,
  SUBMIT: (id) => `/assignments/${id}/submit`,
  SUBMISSIONS: (id) => `/assignments/${id}/submissions`,
  GRADE: (id, sid) => `/assignments/${id}/submissions/${sid}/grade`
};

export const ADMIN_ENDPOINTS = {
  DASHBOARD: '/admin/dashboard',
  USERS: '/admin/users',
  USER_BY_ID: (id) => `/admin/users/${id}`,
  COURSES: '/admin/courses',
  ANALYTICS: '/admin/analytics',
  REPORTS: '/admin/reports'
};

export const FACULTY_ENDPOINTS = {
  DASHBOARD: '/faculty/dashboard',
  COURSES: '/faculty/courses',
  ASSIGNMENTS: '/faculty/assignments',
  STUDENTS: '/faculty/students',
  GRADEBOOK: (id) => `/faculty/courses/${id}/gradebook`,
  ATTENDANCE: (id) => `/faculty/courses/${id}/attendance`
};

export const STUDENT_ENDPOINTS = {
  DASHBOARD: '/student/dashboard',
  COURSES: '/student/courses',
  ENROLL: '/student/enroll',
  ASSIGNMENTS: '/student/assignments',
  GRADES: '/student/grades',
  SCHEDULE: '/student/schedule',
  NOTIFICATIONS: '/student/notifications'
};
