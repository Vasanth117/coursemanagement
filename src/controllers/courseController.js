// Course controller 
const { Course, User, Enrollment, Grade } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/ErrorResponse');
const mongoose = require('mongoose');

// @desc    Get all courses
// @route   GET /api/v1/courses
// @access  Public
exports.getCourses = asyncHandler(async (req, res, next) => {
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

  // Base query
  query = Course.find(JSON.parse(queryStr));

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

  // Populate faculty details
  query = query.populate('faculty', 'name email department');

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const total = await Course.countDocuments(JSON.parse(queryStr));

  query = query.skip(startIndex).limit(limit);

  const courses = await query;

  res.status(200).json({
    success: true,
    count: courses.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    data: courses
  });
});

// @desc    Get single course
// @route   GET /api/v1/courses/:id
// @access  Public
exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id)
    .populate('faculty', 'name email phone department')
    .populate('prerequisites', 'title code')
    .populate('enrolledStudents', 'name email studentId');

  if (!course) {
    return next(new ErrorResponse(`Course not found with id of ${req.params.id}`, 404));
  }

  // Get enrollment statistics
  const enrollmentStats = await Enrollment.aggregate([
    {
      $match: { course: new mongoose.Types.ObjectId(req.params.id) }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      course,
      enrollmentStats: enrollmentStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
      availableSeats: course.maxStudents - course.enrolledStudents.length
    }
  });
});

// @desc    Create course
// @route   POST /api/v1/courses
// @access  Private/Admin
exports.createCourse = asyncHandler(async (req, res, next) => {
  const {
    title,
    code,
    description,
    credits,
    department,
    faculty,
    maxStudents,
    semester,
    year,
    schedule,
    prerequisites
  } = req.body;

  // Validate faculty
  const facultyUser = await User.findById(faculty);
  if (!facultyUser || facultyUser.role !== 'faculty') {
    return next(new ErrorResponse('Faculty ID must belong to a faculty member', 400));
  }

  // Check if course code already exists
  const existingCourse = await Course.findOne({ code });
  if (existingCourse) {
    return next(new ErrorResponse('Course code already exists', 400));
  }

  // Validate prerequisites if any
  if (prerequisites && prerequisites.length > 0) {
    const validPrereqs = await Course.find({ _id: { $in: prerequisites } });
    if (validPrereqs.length !== prerequisites.length) {
      return next(new ErrorResponse('One or more prerequisites are invalid', 400));
    }
  }

  const course = await Course.create({
    title,
    code,
    description,
    credits,
    department,
    faculty,
    maxStudents,
    semester,
    year,
    schedule,
    prerequisites: prerequisites || [],
    createdBy: req.user.id
  });

  // Populate details
  await course.populate('faculty', 'name email department');
  await course.populate('prerequisites', 'title code');

  res.status(201).json({
    success: true,
    data: course
  });
});

// @desc    Update course
// @route   PUT /api/v1/courses/:id
// @access  Private/Admin or Course Faculty
exports.updateCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id);

  if (!course) {
    return next(new ErrorResponse(`Course not found with id of ${req.params.id}`, 404));
  }

  // Check authorization
  const isAdmin = req.user.role === 'admin';
  const isFaculty = req.user.role === 'faculty' && course.faculty.toString() === req.user.id;

  if (!isAdmin && !isFaculty) {
    return next(new ErrorResponse('Not authorized to update this course', 403));
  }

  // If updating faculty, validate new faculty
  if (req.body.faculty && req.body.faculty !== course.faculty.toString()) {
    const facultyUser = await User.findById(req.body.faculty);
    if (!facultyUser || facultyUser.role !== 'faculty') {
      return next(new ErrorResponse('Faculty ID must belong to a faculty member', 400));
    }
  }

  // If updating course code, check uniqueness
  if (req.body.code && req.body.code !== course.code) {
    const existingCourse = await Course.findOne({ code: req.body.code });
    if (existingCourse) {
      return next(new ErrorResponse('Course code already exists', 400));
    }
  }

  // If updating prerequisites, validate them
  if (req.body.prerequisites) {
    const validPrereqs = await Course.find({ _id: { $in: req.body.prerequisites } });
    if (validPrereqs.length !== req.body.prerequisites.length) {
      return next(new ErrorResponse('One or more prerequisites are invalid', 400));
    }
  }

  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  })
    .populate('faculty', 'name email department')
    .populate('prerequisites', 'title code');

  res.status(200).json({
    success: true,
    data: course
  });
});

// @desc    Delete course
// @route   DELETE /api/v1/courses/:id
// @access  Private/Admin
exports.deleteCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(new ErrorResponse(`Course not found with id of ${req.params.id}`, 404));
  }

  // Check if course has active enrollments
  const activeEnrollments = await Enrollment.countDocuments({
    course: req.params.id,
    status: { $in: ['enrolled', 'pending'] }
  });

  if (activeEnrollments > 0) {
    return next(new ErrorResponse('Cannot delete course with active enrollments', 400));
  }

  // Delete all related enrollments and grades
  await Enrollment.deleteMany({ course: req.params.id });
  await Grade.deleteMany({ course: req.params.id });

  await course.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get courses by faculty
// @route   GET /api/v1/courses/faculty/:facultyId
// @access  Private/Admin or Faculty Self
exports.getFacultyCourses = asyncHandler(async (req, res, next) => {
  const { facultyId } = req.params;

  // Check authorization
  const isAdmin = req.user.role === 'admin';
  const isFacultySelf = req.user.role === 'faculty' && req.user.id === facultyId;

  if (!isAdmin && !isFacultySelf) {
    return next(new ErrorResponse('Not authorized to view these courses', 403));
  }

  // Validate faculty exists
  const faculty = await User.findById(facultyId);
  if (!faculty || faculty.role !== 'faculty') {
    return next(new ErrorResponse('Faculty not found', 404));
  }

  let query = Course.find({ faculty: facultyId });

  // Filter by status
  if (req.query.status) {
    query = query.where('isActive').equals(req.query.status === 'active');
  }

  // Filter by semester/year
  if (req.query.semester) {
    query = query.where('semester').equals(req.query.semester);
  }
  if (req.query.year) {
    query = query.where('year').equals(parseInt(req.query.year));
  }

  // Sort
  const sortBy = req.query.sort || '-createdAt';
  query = query.sort(sortBy);

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const total = await Course.countDocuments({ faculty: facultyId });

  query = query.skip(startIndex).limit(limit);

  const courses = await query;

  // Get course statistics
  const courseStats = await Course.aggregate([
    {
      $match: { faculty: new mongoose.Types.ObjectId(facultyId) }
    },
    {
      $group: {
        _id: null,
        totalCourses: { $sum: 1 },
        activeCourses: { $sum: { $cond: ['$isActive', 1, 0] } },
        totalStudents: { $sum: { $size: '$enrolledStudents' } }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      faculty: {
        id: faculty._id,
        name: faculty.name,
        email: faculty.email,
        department: faculty.department
      },
      courses,
      statistics: courseStats.length > 0 ? courseStats[0] : {
        totalCourses: 0,
        activeCourses: 0,
        totalStudents: 0
      }
    },
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Get courses by department
// @route   GET /api/v1/courses/department/:department
// @access  Public
exports.getDepartmentCourses = asyncHandler(async (req, res, next) => {
  const { department } = req.params;

  let query = Course.find({ department, isActive: true });

  // Filter by semester/year
  if (req.query.semester) {
    query = query.where('semester').equals(req.query.semester);
  }
  if (req.query.year) {
    query = query.where('year').equals(parseInt(req.query.year));
  }

  // Sort
  const sortBy = req.query.sort || 'code';
  query = query.sort(sortBy);

  // Populate faculty
  query = query.populate('faculty', 'name email');

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const startIndex = (page - 1) * limit;
  const total = await Course.countDocuments({ department, isActive: true });

  query = query.skip(startIndex).limit(limit);

  const courses = await query;

  res.status(200).json({
    success: true,
    count: courses.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    data: courses
  });
});

// @desc    Search courses
// @route   GET /api/v1/courses/search
// @access  Public
exports.searchCourses = asyncHandler(async (req, res, next) => {
  const { q } = req.query;

  if (!q) {
    return next(new ErrorResponse('Please provide a search query', 400));
  }

  const searchRegex = new RegExp(q, 'i');

  let query = Course.find({
    $or: [
      { title: searchRegex },
      { code: searchRegex },
      { description: searchRegex },
      { department: searchRegex }
    ],
    isActive: true
  });

  // Sort by relevance (title matches first, then code, then description)
  query = query.sort({ title: 1, code: 1 });

  // Populate faculty
  query = query.populate('faculty', 'name email');

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 15;
  const startIndex = (page - 1) * limit;

  query = query.skip(startIndex).limit(limit);

  const courses = await query;

  res.status(200).json({
    success: true,
    count: courses.length,
    data: courses
  });
});

// @desc    Toggle course status
// @route   PUT /api/v1/courses/:id/toggle-status
// @access  Private/Admin
exports.toggleCourseStatus = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(new ErrorResponse(`Course not found with id of ${req.params.id}`, 404));
  }

  // If deactivating, check for active enrollments
  if (course.isActive) {
    const activeEnrollments = await Enrollment.countDocuments({
      course: req.params.id,
      status: { $in: ['enrolled', 'pending'] }
    });

    if (activeEnrollments > 0) {
      return next(new ErrorResponse('Cannot deactivate course with active enrollments', 400));
    }
  }

  course.isActive = !course.isActive;
  await course.save();

  res.status(200).json({
    success: true,
    message: `Course ${course.isActive ? 'activated' : 'deactivated'} successfully`,
    data: course
  });
});

// @desc    Get course analytics
// @route   GET /api/v1/courses/:id/analytics
// @access  Private/Admin or Course Faculty
exports.getCourseAnalytics = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(new ErrorResponse(`Course not found with id of ${req.params.id}`, 404));
  }

  // Check authorization
  const isAdmin = req.user.role === 'admin';
  const isFaculty = req.user.role === 'faculty' && course.faculty.toString() === req.user.id;

  if (!isAdmin && !isFaculty) {
    return next(new ErrorResponse('Not authorized to view course analytics', 403));
  }

  // Get enrollment analytics
  const enrollmentAnalytics = await Enrollment.aggregate([
    {
      $match: { course: new mongoose.Types.ObjectId(req.params.id) }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  // Get grade analytics for completed enrollments
  const gradeAnalytics = await Grade.aggregate([
    {
      $match: { course: new mongoose.Types.ObjectId(req.params.id) }
    },
    {
      $group: {
        _id: null,
        averageScore: { $avg: '$score' },
        totalAssignments: { $sum: 1 },
        passRate: {
          $avg: {
            $cond: [{ $gte: ['$score', 60] }, 1, 0]
          }
        }
      }
    }
  ]);

  // Get enrollment trend (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const enrollmentTrend = await Enrollment.aggregate([
    {
      $match: {
        course: new mongoose.Types.ObjectId(req.params.id),
        enrolledAt: { $gte: sixMonthsAgo }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$enrolledAt' },
          month: { $month: '$enrolledAt' }
        },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      course: {
        id: course._id,
        title: course.title,
        code: course.code,
        maxStudents: course.maxStudents,
        currentEnrollment: course.enrolledStudents.length
      },
      enrollmentStats: enrollmentAnalytics.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
      gradeStats: gradeAnalytics.length > 0 ? {
        averageScore: Math.round(gradeAnalytics[0].averageScore * 100) / 100,
        totalAssignments: gradeAnalytics[0].totalAssignments,
        passRate: Math.round(gradeAnalytics[0].passRate * 100)
      } : null,
      enrollmentTrend,
      utilizationRate: Math.round((course.enrolledStudents.length / course.maxStudents) * 100)
    }
  });
});