const { body, param, query, validationResult } = require('express-validator');
const ErrorResponse = require('../utils/ErrorResponse');

// Handle validation errors
exports.handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return next(new ErrorResponse(errorMessages.join(', '), 400));
  }
  next();
};

// User validation rules
exports.validateUser = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email')
    .isEmail().withMessage('Please provide a valid email')
    .custom((email, { req }) => {
      const domain = email.split('@')[1];
      const allowedDomains = {
        admin: ['admin.college.edu', 'college.edu'],
        faculty: ['faculty.college.edu', 'college.edu'],
        student: ['student.college.edu', 'college.edu']
      };
      if (!allowedDomains[req.body.role]?.includes(domain)) {
        throw new Error('Please use official college email domain');
      }
      return true;
    }),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['admin', 'faculty', 'student']).withMessage('Invalid role'),
  body('studentId')
    .if(body('role').equals('student'))
    .notEmpty().withMessage('Student ID is required for students')
    .matches(/^\d{6,10}$/).withMessage('Student ID must be 6-10 digits'),
  body('employeeId')
    .if(body('role').isIn(['admin', 'faculty']))
    .notEmpty().withMessage('Employee ID is required for admin/faculty')
    .matches(/^EMP\d{4,6}$/).withMessage('Employee ID must be EMP followed by 4-6 digits')
];

// Course validation rules
exports.validateCourse = [
  body('title').notEmpty().withMessage('Course title is required'),
  body('code').notEmpty().withMessage('Course code is required'),
  body('credits').isInt({ min: 1, max: 6 }).withMessage('Credits must be between 1 and 6'),
  body('department').notEmpty().withMessage('Department is required'),
  body('faculty').isMongoId().withMessage('Valid faculty ID is required'),
  body('maxStudents').isInt({ min: 1 }).withMessage('Max students must be at least 1')
];

// Enrollment validation rules
exports.validateEnrollment = [
  body('student').isMongoId().withMessage('Valid student ID is required'),
  body('course').isMongoId().withMessage('Valid course ID is required'),
  body('status').optional().isIn(['pending', 'enrolled', 'completed', 'dropped', 'rejected']).withMessage('Invalid status')
];

// Assignment validation rules
exports.validateAssignment = [
  body('title').notEmpty().withMessage('Assignment title is required'),
  body('description').notEmpty().withMessage('Assignment description is required'),
  body('course').isMongoId().withMessage('Valid course ID is required'),
  body('dueDate').isISO8601().withMessage('Valid due date is required'),
  body('maxPoints').isInt({ min: 1 }).withMessage('Max points must be at least 1'),
  body('type').isIn(['homework', 'quiz', 'exam', 'project']).withMessage('Invalid assignment type')
];

// Grade validation rules
exports.validateGrade = [
  body('student').isMongoId().withMessage('Valid student ID is required'),
  body('course').isMongoId().withMessage('Valid course ID is required'),
  body('assignment').isMongoId().withMessage('Valid assignment ID is required'),
  body('score').isFloat({ min: 0 }).withMessage('Score must be a positive number')
];

// Attendance validation rules
exports.validateAttendance = [
  body('student').isMongoId().withMessage('Valid student ID is required'),
  body('course').isMongoId().withMessage('Valid course ID is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('status').isIn(['present', 'absent', 'late', 'excused']).withMessage('Invalid attendance status')
];

// MongoDB ObjectId validation
exports.validateObjectId = (field) => [
  param(field).isMongoId().withMessage(`Valid ${field} ID is required`)
];

// Pagination validation
exports.validatePagination = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
];