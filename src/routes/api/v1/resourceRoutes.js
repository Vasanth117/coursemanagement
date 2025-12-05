const express = require('express');
const { resourceController } = require('../../../controllers');
const { auth, role, validation, upload, rateLimiter } = require('../../../middleware');

const router = express.Router();

// @route   GET /api/v1/resources
// @desc    Get all resources
// @access  Private
router.get('/',
  auth.protect,
  validation.validatePagination,
  validation.handleValidationErrors,
  resourceController.getResources
);

// @route   GET /api/v1/resources/course/:courseId
// @desc    Get course resources
// @access  Private
router.get('/course/:courseId',
  auth.protect,
  validation.validateObjectId('courseId'),
  validation.validatePagination,
  validation.handleValidationErrors,
  resourceController.getCourseResources
);

// @route   GET /api/v1/resources/search
// @desc    Search resources
// @access  Private
router.get('/search',
  auth.protect,
  rateLimiter.searchLimiter,
  resourceController.searchResources
);

// @route   GET /api/v1/resources/:id
// @desc    Get single resource
// @access  Private
router.get('/:id',
  auth.protect,
  validation.validateObjectId('id'),
  validation.handleValidationErrors,
  resourceController.getResource
);

// @route   POST /api/v1/resources
// @desc    Create resource
// @access  Private/Faculty
router.post('/',
  auth.protect,
  role.facultyOnly,
  rateLimiter.uploadLimiter,
  upload.uploadResource,
  upload.handleUploadError,
  resourceController.createResource
);

// @route   PUT /api/v1/resources/:id
// @desc    Update resource
// @access  Private/Faculty
router.put('/:id',
  auth.protect,
  role.facultyOnly,
  upload.uploadResource,
  upload.handleUploadError,
  validation.validateObjectId('id'),
  validation.handleValidationErrors,
  resourceController.updateResource
);

// @route   DELETE /api/v1/resources/:id
// @desc    Delete resource
// @access  Private/Faculty
router.delete('/:id',
  auth.protect,
  role.facultyOnly,
  validation.validateObjectId('id'),
  validation.handleValidationErrors,
  resourceController.deleteResource
);

// @route   GET /api/v1/resources/:id/download
// @desc    Download resource
// @access  Private
router.get('/:id/download',
  auth.protect,
  validation.validateObjectId('id'),
  validation.handleValidationErrors,
  resourceController.downloadResource
);

// @route   PUT /api/v1/resources/:id/view
// @desc    Increment view count
// @access  Private
router.put('/:id/view',
  auth.protect,
  validation.validateObjectId('id'),
  validation.handleValidationErrors,
  resourceController.incrementViewCount
);

module.exports = router;