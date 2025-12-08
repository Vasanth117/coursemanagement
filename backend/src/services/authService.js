const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const ErrorResponse = require('../utils/ErrorResponse');
const emailService = require('./emailService');

class AuthService {
  // Generate JWT token
  generateToken(userId) {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE
    });
  }

  // Register user
  async register(userData) {
    const { name, email, password, role, department, studentId, employeeId } = userData;

    // Check if required fields are provided
    if (!name) throw new ErrorResponse('Name is required', 400);
    if (!email) throw new ErrorResponse('Email is required', 400);
    if (!password) throw new ErrorResponse('Password is required', 400);
    if (!role) throw new ErrorResponse('Role is required', 400);

    // Validate college ID format if provided
    if (role === 'student' && studentId && !/^\d{6,10}$/.test(studentId)) {
      throw new ErrorResponse('Valid student ID required (6-10 digits)', 400);
    }
    
    if ((role === 'faculty' || role === 'admin') && employeeId && !/^EMP\d{4,6}$/.test(employeeId)) {
      throw new ErrorResponse('Valid employee ID required (EMP + 4-6 digits)', 400);
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ErrorResponse('User already exists with this email', 400);
    }

    // Check if college ID already exists
    if (studentId) {
      const existingStudent = await User.findOne({ studentId });
      if (existingStudent) {
        throw new ErrorResponse('Student ID already exists', 400);
      }
    }
    
    if (employeeId) {
      const existingEmployee = await User.findOne({ employeeId });
      if (existingEmployee) {
        throw new ErrorResponse('Employee ID already exists', 400);
      }
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
      department,
      studentId,
      employeeId
    });

    // Generate token
    const token = this.generateToken(user._id);

    // Send welcome email (disabled)
    // await emailService.sendWelcomeEmail(user.email, user.name);

    return {
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    };
  }

  // Login user
  async login(email, password) {
    // Validate email & password
    if (!email || !password) {
      throw new ErrorResponse('Please provide an email and password', 400);
    }

    // Check for user
    const user = await User.findOne({ 
      email,
      isActive: true
    }).select('+password');
    
    if (!user) {
      throw new ErrorResponse('Invalid email or password', 401);
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      throw new ErrorResponse('Invalid credentials', 401);
    }

    // Check if user is active
    if (!user.isActive) {
      throw new ErrorResponse('Account is deactivated', 401);
    }

    // Generate token
    const token = this.generateToken(user._id);

    return {
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    };
  }

  // Get user by token
  async getUserByToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      
      if (!user || !user.isActive) {
        throw new ErrorResponse('User not found or inactive', 401);
      }

      return user;
    } catch (error) {
      throw new ErrorResponse('Invalid token', 401);
    }
  }

  // Forgot password
  async forgotPassword(email) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new ErrorResponse('There is no user with that email', 404);
    }

    // Get reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set expire
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save({ validateBeforeSave: false });

    // Send reset email
    await emailService.sendPasswordResetEmail(user.email, resetToken);

    return {
      success: true,
      message: 'Email sent'
    };
  }

  // Reset password
  async resetPassword(resetToken, newPassword) {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      throw new ErrorResponse('Invalid token', 400);
    }

    // Set new password
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Generate token
    const token = this.generateToken(user._id);

    return {
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    };
  }

  // Update password
  async updatePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select('+password');

    // Check current password
    if (!(await user.matchPassword(currentPassword))) {
      throw new ErrorResponse('Password is incorrect', 401);
    }

    user.password = newPassword;
    await user.save();

    // Generate new token
    const token = this.generateToken(user._id);

    return {
      success: true,
      token,
      message: 'Password updated successfully'
    };
  }

  // Verify user role
  verifyRole(user, allowedRoles) {
    if (!allowedRoles.includes(user.role)) {
      throw new ErrorResponse(`Access denied. Required role: ${allowedRoles.join(' or ')}`, 403);
    }
    return true;
  }

  // Check if user can access resource
  canAccessResource(user, resourceOwnerId, allowedRoles = []) {
    // Admin can access everything
    if (user.role === 'admin') return true;
    
    // Check if user has required role
    if (allowedRoles.length > 0 && allowedRoles.includes(user.role)) return true;
    
    // Check if user owns the resource
    if (resourceOwnerId && user._id.toString() === resourceOwnerId.toString()) return true;
    
    return false;
  }
}

module.exports = new AuthService();