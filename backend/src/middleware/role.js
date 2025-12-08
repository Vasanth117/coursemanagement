const ErrorResponse = require('../utils/ErrorResponse');

// Admin only access
exports.adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return next(new ErrorResponse('Access denied. Admin privileges required', 403));
  }
  next();
};

// Faculty only access
exports.facultyOnly = (req, res, next) => {
  if (req.user.role !== 'faculty') {
    return next(new ErrorResponse('Access denied. Faculty privileges required', 403));
  }
  next();
};

// Student only access
exports.studentOnly = (req, res, next) => {
  if (req.user.role !== 'student') {
    return next(new ErrorResponse('Access denied. Student privileges required', 403));
  }
  next();
};

// Admin or Faculty access
exports.adminOrFaculty = (req, res, next) => {
  if (!['admin', 'faculty'].includes(req.user.role)) {
    return next(new ErrorResponse('Access denied. Admin or Faculty privileges required', 403));
  }
  next();
};

// Admin or Student access
exports.adminOrStudent = (req, res, next) => {
  if (!['admin', 'student'].includes(req.user.role)) {
    return next(new ErrorResponse('Access denied. Admin or Student privileges required', 403));
  }
  next();
};

// Faculty or Student access
exports.facultyOrStudent = (req, res, next) => {
  if (!['faculty', 'student'].includes(req.user.role)) {
    return next(new ErrorResponse('Access denied. Faculty or Student privileges required', 403));
  }
  next();
};