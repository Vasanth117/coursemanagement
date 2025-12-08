// User roles
const USER_ROLES = {
  ADMIN: 'admin',
  FACULTY: 'faculty',
  STUDENT: 'student'
};

// Enrollment statuses
const ENROLLMENT_STATUS = {
  PENDING: 'pending',
  ENROLLED: 'enrolled',
  COMPLETED: 'completed',
  DROPPED: 'dropped',
  REJECTED: 'rejected'
};

// Assignment types
const ASSIGNMENT_TYPES = {
  HOMEWORK: 'homework',
  QUIZ: 'quiz',
  EXAM: 'exam',
  PROJECT: 'project',
  LAB: 'lab'
};

// Attendance statuses
const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  EXCUSED: 'excused'
};

// Submission statuses
const SUBMISSION_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  GRADED: 'graded',
  RETURNED: 'returned'
};

// Announcement types
const ANNOUNCEMENT_TYPES = {
  GENERAL: 'general',
  URGENT: 'urgent',
  ASSIGNMENT: 'assignment',
  EXAM: 'exam',
  EVENT: 'event',
  SYSTEM: 'system'
};

// Priority levels
const PRIORITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

// Semesters
const SEMESTERS = {
  FALL: 'Fall',
  SPRING: 'Spring',
  SUMMER: 'Summer'
};

// Grade scale
const GRADE_SCALE = {
  A_PLUS: { min: 97, max: 100, points: 4.0 },
  A: { min: 93, max: 96, points: 4.0 },
  A_MINUS: { min: 90, max: 92, points: 3.7 },
  B_PLUS: { min: 87, max: 89, points: 3.3 },
  B: { min: 83, max: 86, points: 3.0 },
  B_MINUS: { min: 80, max: 82, points: 2.7 },
  C_PLUS: { min: 77, max: 79, points: 2.3 },
  C: { min: 73, max: 76, points: 2.0 },
  C_MINUS: { min: 70, max: 72, points: 1.7 },
  D_PLUS: { min: 67, max: 69, points: 1.3 },
  D: { min: 60, max: 66, points: 1.0 },
  F: { min: 0, max: 59, points: 0.0 }
};

// Letter grades
const LETTER_GRADES = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F'];

// Departments
const DEPARTMENTS = [
  'Computer Science',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'History',
  'Psychology',
  'Business',
  'Engineering',
  'Art',
  'Music',
  'Philosophy',
  'Sociology',
  'Political Science',
  'Economics'
];

// File types
const FILE_TYPES = {
  IMAGE: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'],
  DOCUMENT: ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'],
  PRESENTATION: ['ppt', 'pptx', 'odp'],
  SPREADSHEET: ['xls', 'xlsx', 'csv', 'ods'],
  ARCHIVE: ['zip', 'rar', '7z', 'tar', 'gz'],
  VIDEO: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv'],
  AUDIO: ['mp3', 'wav', 'ogg', 'aac', 'flac']
};

// Resource categories
const RESOURCE_CATEGORIES = {
  LECTURE: 'lecture',
  READING: 'reading',
  ASSIGNMENT: 'assignment',
  REFERENCE: 'reference',
  SUPPLEMENTARY: 'supplementary',
  EXAM: 'exam'
};

// Resource types
const RESOURCE_TYPES = {
  DOCUMENT: 'document',
  VIDEO: 'video',
  AUDIO: 'audio',
  IMAGE: 'image',
  LINK: 'link',
  PRESENTATION: 'presentation',
  SPREADSHEET: 'spreadsheet'
};

// Access levels
const ACCESS_LEVELS = {
  PUBLIC: 'public',
  ENROLLED: 'enrolled',
  FACULTY: 'faculty'
};

// Target audiences
const TARGET_AUDIENCES = {
  ALL: 'all',
  STUDENTS: 'students',
  FACULTY: 'faculty',
  COURSE_SPECIFIC: 'course-specific'
};

// Notification types
const NOTIFICATION_TYPES = {
  ENROLLMENT: 'enrollment',
  ASSIGNMENT: 'assignment',
  GRADE: 'grade',
  ANNOUNCEMENT: 'announcement',
  ATTENDANCE: 'attendance',
  SYSTEM: 'system'
};

// Days of week
const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

// Time slots
const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
  '20:00', '20:30', '21:00'
];

// Pagination defaults
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 25,
  MAX_LIMIT: 100
};

// File size limits (in bytes)
const FILE_SIZE_LIMITS = {
  PROFILE_IMAGE: 2 * 1024 * 1024, // 2MB
  ASSIGNMENT_FILE: 10 * 1024 * 1024, // 10MB
  SUBMISSION_FILE: 10 * 1024 * 1024, // 10MB
  RESOURCE_FILE: 50 * 1024 * 1024, // 50MB
  ANNOUNCEMENT_ATTACHMENT: 5 * 1024 * 1024 // 5MB
};

// Rate limiting
const RATE_LIMITS = {
  GENERAL: { windowMs: 15 * 60 * 1000, max: 100 }, // 100 requests per 15 minutes
  AUTH: { windowMs: 15 * 60 * 1000, max: 5 }, // 5 requests per 15 minutes
  UPLOAD: { windowMs: 60 * 60 * 1000, max: 20 }, // 20 uploads per hour
  SEARCH: { windowMs: 1 * 60 * 1000, max: 30 }, // 30 searches per minute
  PASSWORD_RESET: { windowMs: 60 * 60 * 1000, max: 3 } // 3 resets per hour
};

// JWT settings
const JWT_SETTINGS = {
  EXPIRES_IN: '30d',
  COOKIE_EXPIRE: 30 * 24 * 60 * 60 * 1000 // 30 days
};

// Email settings
const EMAIL_SETTINGS = {
  FROM_NAME: 'Course Management System',
  RESET_TOKEN_EXPIRE: 10 * 60 * 1000 // 10 minutes
};

// System settings
const SYSTEM_SETTINGS = {
  MIN_PASSWORD_LENGTH: 6,
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_TIME: 30 * 60 * 1000, // 30 minutes
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000 // 24 hours
};

// API response messages
const MESSAGES = {
  SUCCESS: {
    CREATED: 'Resource created successfully',
    UPDATED: 'Resource updated successfully',
    DELETED: 'Resource deleted successfully',
    RETRIEVED: 'Resource retrieved successfully'
  },
  ERROR: {
    NOT_FOUND: 'Resource not found',
    UNAUTHORIZED: 'Not authorized to access this resource',
    FORBIDDEN: 'Access denied',
    VALIDATION_ERROR: 'Validation error',
    SERVER_ERROR: 'Internal server error',
    DUPLICATE: 'Resource already exists'
  }
};

// HTTP status codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500
};

// College email domains
const COLLEGE_EMAIL_DOMAINS = {
  ADMIN: ['admin.college.edu', 'college.edu'],
  FACULTY: ['faculty.college.edu', 'college.edu'],
  STUDENT: ['student.college.edu', 'college.edu'],
  ALL: ['admin.college.edu', 'faculty.college.edu', 'student.college.edu', 'college.edu']
};

// Regular expressions
const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  COLLEGE_EMAIL: /^[^\s@]+@(admin\.college\.edu|faculty\.college\.edu|student\.college\.edu|college\.edu)$/,
  PHONE: /^\+?[\d\s\-\(\)]+$/,
  COURSE_CODE: /^[A-Z]{2,4}\d{3,4}$/,
  STUDENT_ID: /^\d{6,10}$/,
  EMPLOYEE_ID: /^EMP\d{4,6}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/
};

module.exports = {
  USER_ROLES,
  ENROLLMENT_STATUS,
  ASSIGNMENT_TYPES,
  ATTENDANCE_STATUS,
  SUBMISSION_STATUS,
  ANNOUNCEMENT_TYPES,
  PRIORITY_LEVELS,
  SEMESTERS,
  GRADE_SCALE,
  LETTER_GRADES,
  DEPARTMENTS,
  FILE_TYPES,
  RESOURCE_CATEGORIES,
  RESOURCE_TYPES,
  ACCESS_LEVELS,
  TARGET_AUDIENCES,
  NOTIFICATION_TYPES,
  DAYS_OF_WEEK,
  TIME_SLOTS,
  PAGINATION,
  FILE_SIZE_LIMITS,
  RATE_LIMITS,
  JWT_SETTINGS,
  EMAIL_SETTINGS,
  SYSTEM_SETTINGS,
  MESSAGES,
  HTTP_STATUS,
  COLLEGE_EMAIL_DOMAINS,
  REGEX
};