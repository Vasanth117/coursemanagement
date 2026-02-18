const express = require('express');
const { studentController } = require('../../../controllers');
const { auth, role, validation } = require('../../../middleware');

const router = express.Router();

// @route   GET /api/v1/student/dashboard
// @desc    Get student dashboard
// @access  Private/Student
router.get('/dashboard',
  auth.protect,
  role.studentOnly,
  studentController.getDashboard
);

// @route   GET /api/v1/student/courses
// @desc    Get student courses
// @access  Private/Student
router.get('/courses',
  auth.protect,
  role.studentOnly,
  validation.validatePagination,
  validation.handleValidationErrors,
  studentController.getCourses
);

// @route   GET /api/v1/student/courses/available
// @desc    Get available courses for enrollment
// @access  Private/Student
router.get('/courses/available',
  auth.protect,
  role.studentOnly,
  studentController.getAvailableCourses
);

// @route   GET /api/v1/student/courses/:id/preview
// @desc    Get course preview for enrollment
// @access  Private/Student
router.get('/courses/:id/preview',
  auth.protect,
  role.studentOnly,
  studentController.getCoursePreview
);

// @route   GET /api/v1/student/courses/:id
// @desc    Get single course details
// @access  Private/Student
router.get('/courses/:id',
  auth.protect,
  role.studentOnly,
  studentController.getCourseDetails
);

// @route   POST /api/v1/student/enroll
// @desc    Request course enrollment
// @access  Private/Student
router.post('/enroll',
  auth.protect,
  role.studentOnly,
  validation.validateEnrollment,
  validation.handleValidationErrors,
  studentController.requestEnrollment
);

// @route   GET /api/v1/student/assignments
// @desc    Get student assignments
// @access  Private/Student
router.get('/assignments',
  auth.protect,
  role.studentOnly,
  validation.validatePagination,
  validation.handleValidationErrors,
  studentController.getAssignments
);

// @route   GET /api/v1/student/assignments/:id
// @desc    Get single assignment details
// @access  Private/Student
router.get('/assignments/:id',
  auth.protect,
  role.studentOnly,
  studentController.getAssignmentDetails
);

// @route   POST /api/v1/student/assignments/:id/submit
// @desc    Submit assignment
// @access  Private/Student
router.post('/assignments/:id/submit',
  auth.protect,
  role.studentOnly,
  studentController.submitAssignment
);

// @route   GET /api/v1/student/grades
// @desc    Get student grades
// @access  Private/Student
router.get('/grades',
  auth.protect,
  role.studentOnly,
  validation.validatePagination,
  validation.handleValidationErrors,
  studentController.getGrades
);

// @route   GET /api/v1/student/attendance
// @desc    Get student attendance
// @access  Private/Student
router.get('/attendance',
  auth.protect,
  role.studentOnly,
  studentController.getAttendance
);

// @route   GET /api/v1/student/transcript
// @desc    Get student transcript
// @access  Private/Student
router.get('/transcript',
  auth.protect,
  role.studentOnly,
  studentController.getTranscript
);

// @route   PUT /api/v1/student/profile
// @desc    Update student profile
// @access  Private/Student
router.put('/profile',
  auth.protect,
  role.studentOnly,
  studentController.updateProfile
);

// @route   GET /api/v1/student/schedule
// @desc    Get student schedule
// @access  Private/Student
router.get('/schedule',
  auth.protect,
  role.studentOnly,
  studentController.getSchedule
);

module.exports = router;