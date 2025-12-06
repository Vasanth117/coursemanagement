// Export all API modules
export { default as api } from './axiosConfig';
export { default as authAPI } from './auth';
export { default as coursesAPI } from './courses';
export { default as assignmentsAPI } from './assignments';
export { default as enrollmentsAPI } from './enrollments';
export { default as usersAPI } from './users';
export { default as facultyAPI } from './faculty';
export { default as studentAPI } from './student';
export { default as adminAPI } from './admin';

// Re-export for convenience
export * from './auth';
export * from './courses';
export * from './assignments';
export * from './enrollments';
export * from './users';
export * from './faculty';
export * from './student';
export * from './admin';
