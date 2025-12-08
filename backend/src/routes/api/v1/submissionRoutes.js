const express = require('express');
const { submissionController } = require('../../../controllers');
const { auth, role, validation, upload, rateLimiter } = require('../../../middleware');

const router = express.Router();

// @route   GET /api/v1/submissions
// @desc    Get all submissions
// @access  Private/Faculty
router.get('/',
  auth.protect,
  role.facultyOnly,
  validation.validatePagination,
  validation.handleValidationErrors,
  submissionController.getSubmissions
);

// @route   GET /api/v1/submissions/student/:studentId
// @desc    Get student submissions
// @access  Private/Student Self or Faculty
router.get('/student/:studentId',
  auth.protect,
  validation.validateObjectId('studentId'),
  validation.validatePagination,
  validation.handleValidationErrors,
  submissionController.getStudentSubmissions
);

// @route   GET /api/v1/submissions/assignment/:assignmentId
// @desc    Get assignment submissions
// @access  Private/Faculty
router.get('/assignment/:assignmentId',
  auth.protect,
  role.facultyOnly,
  validation.validateObjectId('assignmentId'),
  validation.validatePagination,
  validation.handleValidationErrors,
  submissionController.getAssignmentSubmissions
);

// @route   GET /api/v1/submissions/:id
// @desc    Get single submission
// @access  Private/Student Self or Faculty
router.get('/:id',
  auth.protect,
  validation.validateObjectId('id'),
  validation.handleValidationErrors,
  submissionController.getSubmission
);

// @route   POST /api/v1/submissions
// @desc    Create submission
// @access  Private/Student
router.post('/',
  auth.protect,
  role.studentOnly,
  rateLimiter.uploadLimiter,
  upload.uploadSubmission,
  upload.handleUploadError,
  submissionController.createSubmission
);

// @route   PUT /api/v1/submissions/:id
// @desc    Update submission
// @access  Private/Student Self
router.put('/:id',
  auth.protect,
  role.studentOnly,
  upload.uploadSubmission,
  upload.handleUploadError,
  validation.validateObjectId('id'),
  validation.handleValidationErrors,
  submissionController.updateSubmission
);

// @route   PUT /api/v1/submissions/:id/submit
// @desc    Submit assignment
// @access  Private/Student Self
router.put('/:id/submit',
  auth.protect,
  role.studentOnly,
  validation.validateObjectId('id'),
  validation.handleValidationErrors,
  submissionController.submitAssignment
);

// @route   PUT /api/v1/submissions/:id/grade
// @desc    Grade submission
// @access  Private/Faculty
router.put('/:id/grade',
  auth.protect,
  role.facultyOnly,
  validation.validateObjectId('id'),
  validation.handleValidationErrors,
  submissionController.gradeSubmission
);

// @route   DELETE /api/v1/submissions/:id
// @desc    Delete submission
// @access  Private/Student Self or Faculty
router.delete('/:id',
  auth.protect,
  validation.validateObjectId('id'),
  validation.handleValidationErrors,
  submissionController.deleteSubmission
);

// @route   GET /api/v1/submissions/:id/download
// @desc    Download submission file
// @access  Private/Student Self or Faculty
router.get('/:id/download',
  auth.protect,
  validation.validateObjectId('id'),
  validation.handleValidationErrors,
  submissionController.downloadSubmission
);

module.exports = router;