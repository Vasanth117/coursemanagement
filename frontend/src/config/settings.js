export const settings = {
  app: {
    name: 'SECE Course Management System',
    shortName: 'SECE CMS',
    version: '1.0.0',
    description: 'Sri Eshwar College of Engineering Course Management System',
    logo: '/images/sece-logo.png'
  },
  
  api: {
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001/api/v1',
    timeout: 30000,
    retries: 3
  },

  auth: {
    tokenKey: 'token',
    userKey: 'user',
    tokenExpiry: 7 * 24 * 60 * 60 * 1000, // 7 days
    refreshTokenKey: 'refreshToken'
  },

  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [5, 10, 20, 50, 100]
  },

  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedFileTypes: ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.zip', '.jpg', '.jpeg', '.png'],
    maxFiles: 5
  },

  notifications: {
    position: 'top-right',
    duration: 3000,
    maxNotifications: 5
  },

  dateFormat: {
    short: 'MMM DD, YYYY',
    long: 'MMMM DD, YYYY',
    time: 'hh:mm A',
    dateTime: 'MMM DD, YYYY hh:mm A'
  },

  roles: {
    admin: 'admin',
    faculty: 'faculty',
    student: 'student'
  },

  departments: [
    { value: 'CSE', label: 'Computer Science' },
    { value: 'ECE', label: 'Electronics' },
    { value: 'EEE', label: 'Electrical' },
    { value: 'MECH', label: 'Mechanical' },
    { value: 'CIVIL', label: 'Civil' }
  ],

  semesters: [
    { value: 1, label: 'Semester 1' },
    { value: 2, label: 'Semester 2' },
    { value: 3, label: 'Semester 3' },
    { value: 4, label: 'Semester 4' },
    { value: 5, label: 'Semester 5' },
    { value: 6, label: 'Semester 6' },
    { value: 7, label: 'Semester 7' },
    { value: 8, label: 'Semester 8' }
  ],

  gradeScale: {
    A: { min: 90, max: 100, points: 10 },
    B: { min: 80, max: 89, points: 8 },
    C: { min: 70, max: 79, points: 6 },
    D: { min: 60, max: 69, points: 4 },
    F: { min: 0, max: 59, points: 0 }
  },

  features: {
    enableNotifications: true,
    enableFileUpload: true,
    enableChat: false,
    enableVideoConference: false,
    enableAnalytics: true
  },

  cache: {
    enabled: true,
    ttl: 5 * 60 * 1000, // 5 minutes
    maxSize: 100
  }
};

export default settings;
