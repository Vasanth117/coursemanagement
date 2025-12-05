const express = require('express');
const { enrollmentController } = require('../../../controllers');
const { auth, role, validation } = require('../../../middleware');

const router = express.Router();

// @route   GET /api/v1/enrollments
// @desc    Get all enrollments
// @access  Private/Admin
router.get('/',
  auth.protect,
  role.adminOnly,
  validation.validatePagination,
  validation.handleValidationErrors,
  enrollmentController.getEnrollments
);

// @route   GET /api/v1/enrollments/pending
// @desc    Get pending enrollment requests
// @access  Private/Admin or Faculty
router.get('/pending',
  auth.protect,
  role.adminOrFaculty,
  validation.validatePagination,
  validation.handleValidationErrors,
  enrollmentController.getPendingEnrollments
);

// @route   POST /api/v1/enrollments/bulk
// @desc    Bulk enroll students
// @access  Private/Admin
router.post('/bulk',
  auth.protect,
  role.adminOnly,
  enrollmentController.bulkEnroll
);

// @route   GET /api/v1/enrollments/student/:studentId
// @desc    Get student's enrollments
// @access  Private/Admin or Student Self
router.get('/student/:studentId',
  auth.protect,
  validation.validateObjectId('studentId'),
  validation.validatePagination,
  validation.handleValidationErrors,
  enrollmentController.getStudentEnrollments
);

// @route   GET /api/v1/enrollments/course/:courseId
// @desc    Get course enrollments
// @access  Private/Admin or Course Faculty
router.get('/course/:courseId',
  auth.protect,
  validation.validateObjectId('courseId'),
  validation.validatePagination,
  validation.handleValidationErrors,
  enrollmentController.getCourseEnrollments
);

// @route   GET /api/v1/enrollments/:id
// @desc    Get single enrollment
// @access  Private/Admin or Related User
router.get('/:id',
  auth.protect,
  validation.validateObjectId('id'),
  validation.handleValidationErrors,
  enrollmentController.getEnrollment
);

// @route   POST /api/v1/enrollments
// @desc    Create enrollment
// @access  Private/Admin
router.post('/',
  auth.protect,
  role.adminOnly,
  validation.validateEnrollment,
  validation.handleValidationErrors,
  enrollmentController.createEnrollment
);

// @route   PUT /api/v1/enrollments/:id
// @desc    Update enrollment
// @access  Private/Admin or Course Faculty
router.put('/:id',
  auth.protect,
  validation.validateObjectId('id'),
  validation.handleValidationErrors,
  enrollmentController.updateEnrollment
);

// @route   PUT /api/v1/enrollments/:id/approve
// @desc    Approve enrollment request
// @access  Private/Admin or Course Faculty
router.put('/:id/approve',
  auth.protect,
  validation.validateObjectId('id'),
  validation.handleValidationErrors,
  enrollmentController.approveEnrollment
);

// @route   PUT /api/v1/enrollments/:id/reject
// @desc    Reject enrollment request
// @access  Private/Admin or Course Faculty
router.put('/:id/reject',
  auth.protect,
  validation.validateObjectId('id'),
  validation.handleValidationErrors,
  enrollmentController.rejectEnrollment
);

// @route   DELETE /api/v1/enrollments/:id
// @desc    Delete enrollment
// @access  Private/Admin
router.delete('/:id',
  auth.protect,
  role.adminOnly,
  validation.validateObjectId('id'),
  validation.handleValidationErrors,
  enrollmentController.deleteEnrollment
);

module.exports = router;