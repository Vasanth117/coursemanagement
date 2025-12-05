const express = require('express');
const { courseController } = require('../../../controllers');
const { auth, role, validation } = require('../../../middleware');

const router = express.Router();

// @route   GET /api/v1/courses
// @desc    Get all courses
// @access  Public
router.get('/', courseController.getCourses);

// @route   GET /api/v1/courses/search
// @desc    Search courses
// @access  Public
router.get('/search', courseController.searchCourses);

// @route   GET /api/v1/courses/department/:department
// @desc    Get courses by department
// @access  Public
router.get('/department/:department', courseController.getDepartmentCourses);

// @route   GET /api/v1/courses/faculty/:facultyId
// @desc    Get courses by faculty
// @access  Private/Admin or Faculty Self
router.get('/faculty/:facultyId',
  auth.protect,
  validation.validateObjectId('facultyId'),
  validation.handleValidationErrors,
  courseController.getFacultyCourses
);

// @route   GET /api/v1/courses/:id
// @desc    Get single course
// @access  Public
router.get('/:id',
  validation.validateObjectId('id'),
  validation.handleValidationErrors,
  courseController.getCourse
);

// @route   POST /api/v1/courses
// @desc    Create course
// @access  Private/Admin
router.post('/',
  auth.protect,
  role.adminOnly,
  validation.validateCourse,
  validation.handleValidationErrors,
  courseController.createCourse
);

// @route   PUT /api/v1/courses/:id
// @desc    Update course
// @access  Private/Admin or Course Faculty
router.put('/:id',
  auth.protect,
  validation.validateObjectId('id'),
  validation.handleValidationErrors,
  courseController.updateCourse
);

// @route   DELETE /api/v1/courses/:id
// @desc    Delete course
// @access  Private/Admin
router.delete('/:id',
  auth.protect,
  role.adminOnly,
  validation.validateObjectId('id'),
  validation.handleValidationErrors,
  courseController.deleteCourse
);

// @route   PUT /api/v1/courses/:id/toggle-status
// @desc    Toggle course status
// @access  Private/Admin
router.put('/:id/toggle-status',
  auth.protect,
  role.adminOnly,
  validation.validateObjectId('id'),
  validation.handleValidationErrors,
  courseController.toggleCourseStatus
);

// @route   GET /api/v1/courses/:id/analytics
// @desc    Get course analytics
// @access  Private/Admin or Course Faculty
router.get('/:id/analytics',
  auth.protect,
  validation.validateObjectId('id'),
  validation.handleValidationErrors,
  courseController.getCourseAnalytics
);

module.exports = router;