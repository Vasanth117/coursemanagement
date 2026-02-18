const express = require('express');
const { facultyController } = require('../../../controllers');
const { auth, role, validation } = require('../../../middleware');

const router = express.Router();

// @route   GET /api/v1/faculty/dashboard
// @desc    Get faculty dashboard
// @access  Private/Faculty
router.get('/dashboard',
  auth.protect,
  role.facultyOnly,
  facultyController.getDashboard
);

// @route   GET /api/v1/faculty/courses
// @desc    Get faculty courses
// @access  Private/Faculty
router.get('/courses',
  auth.protect,
  role.facultyOnly,
  validation.validatePagination,
  validation.handleValidationErrors,
  facultyController.getCourses
);

// @route   GET /api/v1/faculty/courses/:id
// @desc    Get single faculty course
// @access  Private/Faculty
router.get('/courses/:id',
  auth.protect,
  role.facultyOnly,
  facultyController.getFacultyCourse
);

// @route   POST /api/v1/faculty/courses
// @desc    Create new course
// @access  Private/Faculty
router.post('/courses',
  auth.protect,
  role.facultyOnly,
  facultyController.createCourse
);

// @route   GET /api/v1/faculty/students
// @desc    Get faculty students
// @access  Private/Faculty
router.get('/students',
  auth.protect,
  role.facultyOnly,
  validation.validatePagination,
  validation.handleValidationErrors,
  facultyController.getStudents
);

// @route   GET /api/v1/faculty/assignments
// @desc    Get faculty assignments
// @access  Private/Faculty
router.get('/assignments',
  auth.protect,
  role.facultyOnly,
  validation.validatePagination,
  validation.handleValidationErrors,
  facultyController.getAssignments
);

// @route   POST /api/v1/faculty/assignments
// @desc    Create new assignment
// @access  Private/Faculty
router.post('/assignments',
  auth.protect,
  role.facultyOnly,
  facultyController.createAssignment
);

// @route   GET /api/v1/faculty/submissions
// @desc    Get pending submissions
// @access  Private/Faculty
router.get('/submissions',
  auth.protect,
  role.facultyOnly,
  validation.validatePagination,
  validation.handleValidationErrors,
  facultyController.getSubmissions
);

// @route   GET /api/v1/faculty/grades
// @desc    Get grading overview
// @access  Private/Faculty
router.get('/grades',
  auth.protect,
  role.facultyOnly,
  facultyController.getGrades
);

// @route   PUT /api/v1/faculty/profile
// @desc    Update faculty profile
// @access  Private/Faculty
router.put('/profile',
  auth.protect,
  role.facultyOnly,
  facultyController.updateProfile
);

// @route   GET /api/v1/faculty/analytics
// @desc    Get faculty analytics
// @access  Private/Faculty
router.get('/analytics',
  auth.protect,
  role.facultyOnly,
  facultyController.getAnalytics
);

module.exports = router;