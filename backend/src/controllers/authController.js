const { authService } = require('../services');
const { User } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/ErrorResponse');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public (Admin only in production)
exports.register = asyncHandler(async (req, res, next) => {
  const result = await authService.register(req.body);

  // Set JWT cookie
  const options = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res.status(201)
    .cookie('token', result.token, options)
    .json(result);
});

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorResponse('Please provide email and password', 400));
  }

  const result = await authService.login(email, password);

  // Set JWT cookie
  const options = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res.status(200)
    .cookie('token', result.token, options)
    .json(result);
});

// @desc    Google login
// @route   POST /api/v1/auth/google-login
// @access  Public
exports.googleLogin = asyncHandler(async (req, res, next) => {
  const { token, role } = req.body;

  if (!token) {
    return next(new ErrorResponse('Please provide Google token', 400));
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        role: role || 'student',
        avatar: picture,
        isEmailVerified: true,
        password: Math.random().toString(36).slice(-8),
      });
    }

    const jwtToken = user.getSignedJwtToken();

    const options = {
      expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
      httpOnly: true
    };

    if (process.env.NODE_ENV === 'production') {
      options.secure = true;
    }

    res.status(200)
      .cookie('token', jwtToken, options)
      .json({
        success: true,
        token: jwtToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        }
      });
  } catch (error) {
    return next(new ErrorResponse('Invalid Google token', 401));
  }
});

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = req.user;

  res.status(200).json({
    success: true,
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      studentId: user.studentId,
      employeeId: user.employeeId
    }
  });
});

// @desc    Update user details
// @route   PUT /api/v1/auth/updatedetails
// @access  Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    phone: req.body.phone,
    address: req.body.address
  };

  // Remove undefined fields
  Object.keys(fieldsToUpdate).forEach(key => 
    fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
  );

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Update password
// @route   PUT /api/v1/auth/updatepassword
// @access  Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next(new ErrorResponse('Please provide current and new password', 400));
  }

  const result = await authService.updatePassword(req.user.id, currentPassword, newPassword);

  // Set JWT cookie
  const options = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res.status(200)
    .cookie('token', result.token, options)
    .json(result);
});

// @desc    Forgot password
// @route   POST /api/v1/auth/forgotpassword
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new ErrorResponse('Please provide email address', 400));
  }

  // Validate college email domain
  const domain = email.split('@')[1];
  const allowedDomains = ['admin.college.edu', 'faculty.college.edu', 'student.college.edu', 'college.edu'];
  
  if (!allowedDomains.includes(domain)) {
    return next(new ErrorResponse('Only official college email addresses are supported', 400));
  }

  const result = await authService.forgotPassword(email);

  res.status(200).json(result);
});

// @desc    Reset password
// @route   PUT /api/v1/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const { newPassword } = req.body;
  const { resettoken } = req.params;

  if (!newPassword) {
    return next(new ErrorResponse('Please provide new password', 400));
  }

  const result = await authService.resetPassword(resettoken, newPassword);

  // Set JWT cookie
  const options = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res.status(200)
    .cookie('token', result.token, options)
    .json(result);
});

// @desc    Log user out / clear cookie
// @route   GET /api/v1/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: 'User logged out successfully'
  });
});