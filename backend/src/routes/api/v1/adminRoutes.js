const express = require('express');
const { adminController } = require('../../../controllers');
const { auth, role, validation } = require('../../../middleware');

const router = express.Router();

// @route   GET /api/v1/admin/dashboard
// @desc    Get admin dashboard data
// @access  Private/Admin
router.get('/dashboard',
  auth.protect,
  role.adminOnly,
  adminController.getDashboard
);

// @route   GET /api/v1/admin/users
// @desc    Get all users
// @access  Private/Admin
router.get('/users',
  auth.protect,
  role.adminOnly,
  validation.validatePagination,
  validation.handleValidationErrors,
  adminController.getUsers
);

// @route   POST /api/v1/admin/users
// @desc    Create user
// @access  Private/Admin
router.post('/users',
  auth.protect,
  role.adminOnly,
  validation.validateUser,
  validation.handleValidationErrors,
  adminController.createUser
);

// @route   PUT /api/v1/admin/users/:id
// @desc    Update user
// @access  Private/Admin
router.put('/users/:id',
  auth.protect,
  role.adminOnly,
  validation.validateObjectId('id'),
  validation.handleValidationErrors,
  adminController.updateUser
);

// @route   DELETE /api/v1/admin/users/:id
// @desc    Delete user
// @access  Private/Admin
router.delete('/users/:id',
  auth.protect,
  role.adminOnly,
  validation.validateObjectId('id'),
  validation.handleValidationErrors,
  adminController.deleteUser
);

// @route   PUT /api/v1/admin/users/:id/toggle-status
// @desc    Toggle user status
// @access  Private/Admin
router.put('/users/:id/toggle-status',
  auth.protect,
  role.adminOnly,
  validation.validateObjectId('id'),
  validation.handleValidationErrors,
  adminController.toggleUserStatus
);

// @route   GET /api/v1/admin/reports
// @desc    Get system reports
// @access  Private/Admin
router.get('/reports',
  auth.protect,
  role.adminOnly,
  adminController.getReports
);

// @route   GET /api/v1/admin/analytics
// @desc    Get system analytics
// @access  Private/Admin
router.get('/analytics',
  auth.protect,
  role.adminOnly,
  adminController.getAnalytics
);

module.exports = router;