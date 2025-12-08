const express = require('express');
const { attendanceController } = require('../../../controllers');
const { auth, role, validation } = require('../../../middleware');

const router = express.Router();

// @route   GET /api/v1/attendance
// @desc    Get all attendance records
// @access  Private/Faculty
router.get('/',
  auth.protect,
  role.facultyOnly,
  validation.validatePagination,
  validation.handleValidationErrors,
  attendanceController.getAttendance
);

// @route   GET /api/v1/attendance/course/:courseId
// @desc    Get course attendance
// @access  Private/Faculty
router.get('/course/:courseId',
  auth.protect,
  role.facultyOnly,
  validation.validateObjectId('courseId'),
  validation.validatePagination,
  validation.handleValidationErrors,
  attendanceController.getCourseAttendance
);

// @route   GET /api/v1/attendance/student/:studentId
// @desc    Get student attendance
// @access  Private/Student Self or Faculty
router.get('/student/:studentId',
  auth.protect,
  validation.validateObjectId('studentId'),
  validation.validatePagination,
  validation.handleValidationErrors,
  attendanceController.getStudentAttendance
);

// @route   GET /api/v1/attendance/:id
// @desc    Get single attendance record
// @access  Private/Student Self or Faculty
router.get('/:id',
  auth.protect,
  validation.validateObjectId('id'),
  validation.handleValidationErrors,
  attendanceController.getSingleAttendance
);

// @route   POST /api/v1/attendance
// @desc    Mark attendance
// @access  Private/Faculty
router.post('/',
  auth.protect,
  role.facultyOnly,
  validation.validateAttendance,
  validation.handleValidationErrors,
  attendanceController.markAttendance
);

// @route   PUT /api/v1/attendance/:id
// @desc    Update attendance
// @access  Private/Faculty
router.put('/:id',
  auth.protect,
  role.facultyOnly,
  validation.validateObjectId('id'),
  validation.handleValidationErrors,
  attendanceController.updateAttendance
);

// @route   DELETE /api/v1/attendance/:id
// @desc    Delete attendance record
// @access  Private/Faculty
router.delete('/:id',
  auth.protect,
  role.facultyOnly,
  validation.validateObjectId('id'),
  validation.handleValidationErrors,
  attendanceController.deleteAttendance
);

// @route   POST /api/v1/attendance/bulk
// @desc    Bulk mark attendance
// @access  Private/Faculty
router.post('/bulk',
  auth.protect,
  role.facultyOnly,
  attendanceController.bulkMarkAttendance
);

// @route   GET /api/v1/attendance/report/:courseId
// @desc    Get attendance report
// @access  Private/Faculty
router.get('/report/:courseId',
  auth.protect,
  role.facultyOnly,
  validation.validateObjectId('courseId'),
  validation.handleValidationErrors,
  attendanceController.getAttendanceReport
);

// @route   GET /api/v1/attendance/analytics/:courseId
// @desc    Get attendance analytics
// @access  Private/Faculty
router.get('/analytics/:courseId',
  auth.protect,
  role.facultyOnly,
  validation.validateObjectId('courseId'),
  validation.handleValidationErrors,
  attendanceController.getAttendanceAnalytics
);

module.exports = router;