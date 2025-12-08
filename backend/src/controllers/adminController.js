const { User, Course, Enrollment, Assignment, Grade } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/ErrorResponse');

// @desc    Get all users (with filtering, sorting, pagination)
// @route   GET /api/v1/admin/users
// @access  Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
  // Build query
  let query;

  // Copy req.query
  const reqQuery = { ...req.query };

  // Fields to exclude
  const removeFields = ['select', 'sort', 'page', 'limit'];
  removeFields.forEach(param => delete reqQuery[param]);

  // Create query string
  let queryStr = JSON.stringify(reqQuery);

  // Create operators ($gt, $gte, etc)
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  // Finding resource
  query = User.find(JSON.parse(queryStr));

  // Select fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await User.countDocuments(JSON.parse(queryStr));

  query = query.skip(startIndex).limit(limit);

  // Execute query
  const users = await query;

  // Pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.status(200).json({
    success: true,
    count: users.length,
    pagination,
    data: users
  });
});

// @desc    Get single user by ID
// @route   GET /api/v1/admin/users/:id
// @access  Private/Admin
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id)
    .populate({
      path: 'courses',
      select: 'title code department'
    })
    .populate({
      path: 'enrollments',
      select: 'course status grade',
      populate: {
        path: 'course',
        select: 'title code'
      }
    });

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Create user (admin only)
// @route   POST /api/v1/admin/users
// @access  Private/Admin
exports.createUser = asyncHandler(async (req, res, next) => {
  const { name, email, password, role, department, studentId, facultyId } = req.body;

  // Check for existing user
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ErrorResponse('User already exists with this email', 400));
  }

  // Validate role
  const allowedRoles = ['admin', 'faculty', 'student'];
  if (!allowedRoles.includes(role)) {
    return next(new ErrorResponse(`Invalid role. Allowed roles: ${allowedRoles.join(', ')}`, 400));
  }

  // Role-specific validations
  if (role === 'student' && !studentId) {
    return next(new ErrorResponse('Student ID is required for student role', 400));
  }

  if (role === 'faculty' && !facultyId) {
    return next(new ErrorResponse('Faculty ID is required for faculty role', 400));
  }

  // Check unique IDs
  if (studentId) {
    const existingStudent = await User.findOne({ studentId });
    if (existingStudent) {
      return next(new ErrorResponse('Student ID already in use', 400));
    }
  }

  if (facultyId) {
    const existingFaculty = await User.findOne({ facultyId });
    if (existingFaculty) {
      return next(new ErrorResponse('Faculty ID already in use', 400));
    }
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role,
    department,
    studentId: role === 'student' ? studentId : undefined,
    facultyId: role === 'faculty' ? facultyId : undefined,
    isEmailVerified: true, // Admin created users are auto-verified
    createdBy: req.user.id
  });

  res.status(201).json({
    success: true,
    data: user
  });
});

// @desc    Update user
// @route   PUT /api/v1/admin/users/:id
// @access  Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  let user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  // Prevent self-deactivation
  if (req.body.isActive === false && user._id.toString() === req.user.id) {
    return next(new ErrorResponse('Cannot deactivate your own account', 400));
  }

  // Update user
  user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Delete user
// @route   DELETE /api/v1/admin/users/:id
// @access  Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  // Prevent self-deletion
  if (user._id.toString() === req.user.id) {
    return next(new ErrorResponse('Cannot delete your own account', 400));
  }

  // Check if user has related data (courses, enrollments, etc.)
  if (user.role === 'faculty') {
    const facultyCourses = await Course.countDocuments({ faculty: user._id });
    if (facultyCourses > 0) {
      return next(new ErrorResponse('Cannot delete faculty with assigned courses. Reassign courses first.', 400));
    }
  }

  if (user.role === 'student') {
    const studentEnrollments = await Enrollment.countDocuments({ student: user._id });
    if (studentEnrollments > 0) {
      return next(new ErrorResponse('Cannot delete student with course enrollments. Remove enrollments first.', 400));
    }
  }

  await user.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get dashboard statistics
// @route   GET /api/v1/admin/dashboard
// @access  Private/Admin
exports.getDashboard = asyncHandler(async (req, res, next) => {
  // Get counts for all entities
  const [
    totalUsers,
    totalAdmins,
    totalFaculty,
    totalStudents,
    totalCourses,
    activeCourses,
    totalAssignments,
    totalEnrollments,
    recentUsers,
    recentCourses
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'admin' }),
    User.countDocuments({ role: 'faculty' }),
    User.countDocuments({ role: 'student' }),
    Course.countDocuments(),
    Course.countDocuments({ isActive: true }),
    Assignment.countDocuments(),
    Enrollment.countDocuments(),
    User.find().sort('-createdAt').limit(5).select('name email role createdAt'),
    Course.find().sort('-createdAt').limit(5).select('title code faculty createdAt').populate('faculty', 'name')
  ]);

  // Calculate enrollment rate
  const enrollmentRate = totalStudents > 0 ? (totalEnrollments / totalStudents).toFixed(2) : 0;

  res.status(200).json({
    success: true,
    data: {
      counts: {
        totalUsers,
        totalAdmins,
        totalFaculty,
        totalStudents,
        totalCourses,
        activeCourses,
        totalAssignments,
        totalEnrollments
      },
      metrics: {
        enrollmentRate: parseFloat(enrollmentRate),
        activeCoursePercentage: totalCourses > 0 ? Math.round((activeCourses / totalCourses) * 100) : 0
      },
      recent: {
        users: recentUsers,
        courses: recentCourses
      }
    }
  });
});

// @desc    Get system analytics
// @route   GET /api/v1/admin/analytics
// @access  Private/Admin
exports.getAnalytics = asyncHandler(async (req, res, next) => {
  const { period = 'month' } = req.query; // day, week, month, year

  // Calculate date range based on period
  let startDate = new Date();
  switch (period) {
    case 'day':
      startDate.setDate(startDate.getDate() - 1);
      break;
    case 'week':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(startDate.getMonth() - 1);
      break;
    case 'year':
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
    default:
      startDate.setMonth(startDate.getMonth() - 1);
  }

  // Get user registration trends
  const userRegistrations = await User.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
        },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  // Get course creation trends
  const courseCreations = await Course.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
        },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  // Get enrollment trends
  const enrollmentTrends = await Enrollment.aggregate([
    {
      $match: {
        enrolledAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$enrolledAt" }
        },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  // Get assignment submission trends
  const assignmentSubmissions = await Grade.aggregate([
    {
      $match: {
        submittedAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$submittedAt" }
        },
        count: { $sum: 1 },
        avgScore: { $avg: "$score" }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  // Get user distribution by role
  const userDistribution = await User.aggregate([
    {
      $group: {
        _id: "$role",
        count: { $sum: 1 }
      }
    }
  ]);

  // Get department statistics
  const departmentStats = await Course.aggregate([
    {
      $group: {
        _id: "$department",
        courseCount: { $sum: 1 },
        avgEnrollment: { $avg: { $size: "$enrolledStudents" } }
      }
    },
    {
      $sort: { courseCount: -1 }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      period,
      startDate,
      endDate: new Date(),
      trends: {
        userRegistrations,
        courseCreations,
        enrollmentTrends,
        assignmentSubmissions
      },
      distributions: {
        userDistribution,
        departmentStats
      }
    }
  });
});

// @desc    Toggle user active status
// @route   PUT /api/v1/admin/users/:id/toggle-status
// @access  Private/Admin
exports.toggleUserStatus = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  // Prevent self-deactivation
  if (user._id.toString() === req.user.id) {
    return next(new ErrorResponse('Cannot deactivate your own account', 400));
  }

  // Toggle active status
  user.isActive = !user.isActive;
  await user.save();

  const status = user.isActive ? 'activated' : 'deactivated';

  res.status(200).json({
    success: true,
    message: `User ${status} successfully`,
    data: {
      id: user._id,
      isActive: user.isActive
    }
  });
});

// @desc    Bulk create users from CSV
// @route   POST /api/v1/admin/users/bulk-create
// @access  Private/Admin
exports.bulkCreateUsers = asyncHandler(async (req, res, next) => {
  const { users } = req.body;

  if (!Array.isArray(users) || users.length === 0) {
    return next(new ErrorResponse('Please provide an array of users', 400));
  }

  // Limit batch size
  if (users.length > 100) {
    return next(new ErrorResponse('Cannot create more than 100 users at once', 400));
  }

  const results = {
    success: [],
    errors: []
  };

  // Process each user
  for (const userData of users) {
    try {
      // Validate required fields
      if (!userData.email || !userData.name || !userData.role) {
        results.errors.push({
          email: userData.email,
          error: 'Missing required fields (email, name, role)'
        });
        continue;
      }

      // Check if user exists
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        results.errors.push({
          email: userData.email,
          error: 'User already exists'
        });
        continue;
      }

      // Create user
      const user = await User.create({
        ...userData,
        password: userData.password || 'Default@123',
        isEmailVerified: true,
        createdBy: req.user.id
      });

      results.success.push({
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      });
    } catch (error) {
      results.errors.push({
        email: userData.email,
        error: error.message
      });
    }
  }

  res.status(200).json({
    success: true,
    data: results,
    summary: {
      total: users.length,
      success: results.success.length,
      errors: results.errors.length
    }
  });
});

// @desc    Search users
// @route   GET /api/v1/admin/users/search/:query
// @access  Private/Admin
exports.searchUsers = asyncHandler(async (req, res, next) => {
  const { query } = req.params;
  const { limit = 10 } = req.query;

  if (!query || query.length < 2) {
    return next(new ErrorResponse('Search query must be at least 2 characters', 400));
  }

  const users = await User.find({
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { email: { $regex: query, $options: 'i' } },
      { studentId: { $regex: query, $options: 'i' } },
      { facultyId: { $regex: query, $options: 'i' } }
    ]
  })
    .limit(parseInt(limit))
    .select('name email role department isActive createdAt');

  res.status(200).json({
    success: true,
    count: users.length,
    data: users
  });
});

// @desc    Get user activity log
// @route   GET /api/v1/admin/users/:id/activity
// @access  Private/Admin
exports.getUserActivity = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  // Get user's recent activities
  const activities = [];

  // Add login activity
  if (user.lastLogin) {
    activities.push({
      type: 'login',
      timestamp: user.lastLogin,
      description: 'Last login'
    });
  }

  // Add course activities (for faculty)
  if (user.role === 'faculty') {
    const courses = await Course.find({ faculty: user._id })
      .sort('-createdAt')
      .limit(5)
      .select('title code createdAt');
    
    courses.forEach(course => {
      activities.push({
        type: 'course_created',
        timestamp: course.createdAt,
        description: `Created course: ${course.title} (${course.code})`
      });
    });
  }

  // Add enrollment activities (for students)
  if (user.role === 'student') {
    const enrollments = await Enrollment.find({ student: user._id })
      .sort('-enrolledAt')
      .limit(5)
      .populate('course', 'title code');
    
    enrollments.forEach(enrollment => {
      activities.push({
        type: 'enrollment',
        timestamp: enrollment.enrolledAt,
        description: `Enrolled in: ${enrollment.course.title} (${enrollment.course.code})`
      });
    });
  }

  // Sort activities by timestamp
  activities.sort((a, b) => b.timestamp - a.timestamp);

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      activities: activities.slice(0, 20) // Return top 20 activities
    }
  });
});

// @desc    Get system reports
// @route   GET /api/v1/admin/reports
// @access  Private/Admin
exports.getReports = asyncHandler(async (req, res, next) => {
  const { type = 'summary' } = req.query;

  const reports = {
    summary: {
      totalUsers: await User.countDocuments(),
      totalCourses: await Course.countDocuments(),
      totalEnrollments: await Enrollment.countDocuments(),
      totalAssignments: await Assignment.countDocuments()
    },
    usersByRole: await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]),
    coursesByDepartment: await Course.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } }
    ])
  };

  res.status(200).json({
    success: true,
    data: reports
  });
});