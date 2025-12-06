export const AUTH_ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  RESET_PASSWORD: '/reset-password'
};

export const ADMIN_ROUTES = {
  DASHBOARD: '/admin/dashboard',
  USERS: '/admin/users',
  CREATE_USER: '/admin/users/create',
  EDIT_USER: (id) => `/admin/users/${id}/edit`,
  USER_DETAILS: (id) => `/admin/users/${id}`,
  COURSES: '/admin/courses',
  ANALYTICS: '/admin/analytics',
  SETTINGS: '/admin/settings',
  REPORTS: '/admin/reports'
};

export const FACULTY_ROUTES = {
  DASHBOARD: '/faculty/dashboard',
  COURSES: '/faculty/courses',
  CREATE_COURSE: '/faculty/courses/create',
  COURSE_DETAILS: (id) => `/faculty/courses/${id}`,
  EDIT_COURSE: (id) => `/faculty/courses/${id}/edit`,
  ASSIGNMENTS: '/faculty/assignments',
  CREATE_ASSIGNMENT: '/faculty/assignments/create',
  ASSIGNMENT_DETAILS: (id) => `/faculty/assignments/${id}`,
  SUBMISSIONS: (id) => `/faculty/assignments/${id}/submissions`,
  GRADE_SUBMISSION: (id, sid) => `/faculty/assignments/${id}/grade/${sid}`,
  STUDENTS: '/faculty/students',
  STUDENT_DETAILS: (id) => `/faculty/students/${id}`,
  ATTENDANCE: '/faculty/attendance',
  GRADEBOOK: '/faculty/gradebook',
  ANNOUNCEMENTS: '/faculty/announcements',
  RESOURCES: '/faculty/resources'
};

export const STUDENT_ROUTES = {
  DASHBOARD: '/student/dashboard',
  COURSES: '/student/courses',
  MY_COURSES: '/student/courses/my-courses',
  COURSE_DETAILS: (id) => `/student/courses/${id}`,
  ENROLL_COURSE: (id) => `/student/courses/${id}/enroll`,
  ASSIGNMENTS: '/student/assignments',
  ASSIGNMENT_DETAILS: (id) => `/student/assignments/${id}`,
  SUBMIT_ASSIGNMENT: (id) => `/student/assignments/${id}/submit`,
  GRADES: '/student/grades',
  SCHEDULE: '/student/schedule',
  PROFILE: '/student/profile',
  NOTIFICATIONS: '/student/notifications'
};
