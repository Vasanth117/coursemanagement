const express = require('express');
const { assignmentController } = require('../../../controllers');
const { auth, role, validation, upload } = require('../../../middleware');

const router = express.Router();

// @route   GET /api/v1/assignments
// @desc    Get all assignments
// @access  Private
router.get('/',
  auth.protect,
  validation.validatePagination,
  validation.handleValidationErrors,
  assignmentController.getAssignments
);

// @route   GET /api/v1/assignments/course/:courseId
// @desc    Get assignments by course
// @access  Private
router.get('/course/:courseId',
  auth.protect,
  validation.validateObjectId('courseId'),
  validation.validatePagination,
  validation.handleValidationErrors,
  assignmentController.getCourseAssignments
);

// @route   GET /api/v1/assignments/:id
// @desc    Get single assignment
// @access  Private
router.get('/:id',
  auth.protect,
  validation.validateObjectId('id'),
  validation.handleValidationErrors,
  assignmentController.getAssignment
);

// @route   POST /api/v1/assignments
// @desc    Create assignment
// @access  Private/Faculty
router.post('/',
  auth.protect,
  role.facultyOnly,
  upload.uploadAssignment,
  upload.handleUploadError,
  validation.validateAssignment,
  validation.handleValidationErrors,
  assignmentController.createAssignment
);

// @route   PUT /api/v1/assignments/:id
// @desc    Update assignment
// @access  Private/Faculty
router.put('/:id',
  auth.protect,
  role.facultyOnly,
  upload.uploadAssignment,
  upload.handleUploadError,
  validation.validateObjectId('id'),
  validation.handleValidationErrors,
  assignmentController.updateAssignment
);

// @route   DELETE /api/v1/assignments/:id
// @desc    Delete assignment
// @access  Private/Faculty
router.delete('/:id',
  auth.protect,
  role.facultyOnly,
  validation.validateObjectId('id'),
  validation.handleValidationErrors,
  assignmentController.deleteAssignment
);

// @route   PUT /api/v1/assignments/:id/publish
// @desc    Publish assignment
// @access  Private/Faculty
router.put('/:id/publish',
  auth.protect,
  role.facultyOnly,
  validation.validateObjectId('id'),
  validation.handleValidationErrors,
  assignmentController.publishAssignment
);

// @route   GET /api/v1/assignments/:id/submissions
// @desc    Get assignment submissions
// @access  Private/Faculty
router.get('/:id/submissions',
  auth.protect,
  role.facultyOnly,
  validation.validateObjectId('id'),
  validation.validatePagination,
  validation.handleValidationErrors,
  assignmentController.getAssignmentSubmissions
);

module.exports = router;