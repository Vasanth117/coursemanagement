const express = require('express');
const { authController } = require('../../../controllers');
const { auth, validation, rateLimiter } = require('../../../middleware');

const router = express.Router();

// Test route
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Auth routes working' });
});

// Test POST route
router.post('/test-post', (req, res) => {
  res.json({ 
    success: true, 
    message: 'POST working',
    body: req.body,
    headers: req.headers['content-type']
  });
});

// @route   POST /api/v1/auth/register
// @desc    Register user
// @access  Public
router.post('/register', 
  (req, res, next) => {
    console.log('Request body:', req.body);
    console.log('Content-Type:', req.headers['content-type']);
    next();
  },
  authController.register
);

// @route   POST /api/v1/auth/login
// @desc    Login user
// @access  Public
router.post('/login',
  authController.login
);

// @route   POST /api/v1/auth/google-login
// @desc    Google login
// @access  Public
router.post('/google-login', authController.googleLogin);

// @route   GET /api/v1/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth.protect, authController.getMe);

// @route   PUT /api/v1/auth/updatedetails
// @desc    Update user details
// @access  Private
router.put('/updatedetails', auth.protect, authController.updateDetails);

// @route   PUT /api/v1/auth/updatepassword
// @desc    Update password
// @access  Private
router.put('/updatepassword', auth.protect, authController.updatePassword);

// @route   POST /api/v1/auth/forgotpassword
// @desc    Forgot password
// @access  Public
router.post('/forgotpassword',
  rateLimiter.passwordResetLimiter,
  authController.forgotPassword
);

// @route   PUT /api/v1/auth/resetpassword/:resettoken
// @desc    Reset password
// @access  Public
router.put('/resetpassword/:resettoken', authController.resetPassword);

// @route   GET /api/v1/auth/logout
// @desc    Log user out / clear cookie
// @access  Private
router.get('/logout', authController.logout);

module.exports = router;