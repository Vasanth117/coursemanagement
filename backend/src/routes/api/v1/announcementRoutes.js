const express = require('express');
const { announcementController } = require('../../../controllers');
const { auth, role, validation, upload } = require('../../../middleware');

const router = express.Router();

// @route   GET /api/v1/announcements
// @desc    Get all announcements
// @access  Private
router.get('/',
  auth.protect,
  validation.validatePagination,
  validation.handleValidationErrors,
  announcementController.getAnnouncements
);

// @route   GET /api/v1/announcements/course/:courseId
// @desc    Get course announcements
// @access  Private
router.get('/course/:courseId',
  auth.protect,
  validation.validateObjectId('courseId'),
  validation.validatePagination,
  validation.handleValidationErrors,
  announcementController.getCourseAnnouncements
);

// @route   GET /api/v1/announcements/urgent
// @desc    Get urgent announcements
// @access  Private
router.get('/urgent',
  auth.protect,
  announcementController.getUrgentAnnouncements
);

// @route   GET /api/v1/announcements/:id
// @desc    Get single announcement
// @access  Private
router.get('/:id',
  auth.protect,
  validation.validateObjectId('id'),
  validation.handleValidationErrors,
  announcementController.getAnnouncement
);

// @route   POST /api/v1/announcements
// @desc    Create announcement
// @access  Private/Admin or Faculty
router.post('/',
  auth.protect,
  role.adminOrFaculty,
  upload.uploadMultipleResources,
  upload.handleUploadError,
  announcementController.createAnnouncement
);

// @route   PUT /api/v1/announcements/:id
// @desc    Update announcement
// @access  Private/Admin or Creator
router.put('/:id',
  auth.protect,
  upload.uploadMultipleResources,
  upload.handleUploadError,
  validation.validateObjectId('id'),
  validation.handleValidationErrors,
  announcementController.updateAnnouncement
);

// @route   DELETE /api/v1/announcements/:id
// @desc    Delete announcement
// @access  Private/Admin or Creator
router.delete('/:id',
  auth.protect,
  validation.validateObjectId('id'),
  validation.handleValidationErrors,
  announcementController.deleteAnnouncement
);

// @route   PUT /api/v1/announcements/:id/publish
// @desc    Publish announcement
// @access  Private/Admin or Creator
router.put('/:id/publish',
  auth.protect,
  validation.validateObjectId('id'),
  validation.handleValidationErrors,
  announcementController.publishAnnouncement
);

// @route   PUT /api/v1/announcements/:id/read
// @desc    Mark announcement as read
// @access  Private
router.put('/:id/read',
  auth.protect,
  validation.validateObjectId('id'),
  validation.handleValidationErrors,
  announcementController.markAsRead
);

module.exports = router;