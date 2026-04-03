const { Announcement, Course, User } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/ErrorResponse');
const mongoose = require('mongoose');

// @desc    Get all announcements
// @route   GET /api/v1/announcements
// @access  Private
exports.getAnnouncements = asyncHandler(async (req, res, next) => {
  let query;

  // Admin sees all announcements
  if (req.user.role === 'admin') {
    query = Announcement.find();
  } 
  // Faculty sees announcements for their courses
  else if (req.user.role === 'faculty') {
    // Get courses taught by this faculty
    const facultyCourses = await Course.find({ faculty: req.user.id }).distinct('_id');
    query = Announcement.find({ course: { $in: facultyCourses } });
  }
  // Students see announcements for courses they're enrolled in
  else if (req.user.role === 'student') {
    // Get courses the student is enrolled in
    const enrolledCourses = await Course.find({
      enrolledStudents: req.user.id
    }).distinct('_id');
    
    query = Announcement.find({ 
      course: { $in: enrolledCourses } 
    });
  } else {
    return next(new ErrorResponse('Not authorized', 401));
  }

  // Apply filters from query parameters
  const reqQuery = { ...req.query };
  const removeFields = ['select', 'sort', 'page', 'limit', 'search'];
  removeFields.forEach(param => delete reqQuery[param]);

  // Create query string
  let queryStr = JSON.stringify(reqQuery);
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  query = query.find(JSON.parse(queryStr));

  // Search by title or content
  if (req.query.search) {
    query = query.find({
      $or: [
        { title: { $regex: req.query.search, $options: 'i' } },
        { content: { $regex: req.query.search, $options: 'i' } }
      ]
    });
  }

  // Filter by course
  if (req.query.course) {
    query = query.where('course').equals(req.query.course);
  }

  // Filter by priority
  if (req.query.priority) {
    query = query.where('priority').equals(req.query.priority);
  }

  // Filter by date range
  if (req.query.startDate) {
    query = query.where('createdAt').gte(new Date(req.query.startDate));
  }
  
  if (req.query.endDate) {
    query = query.where('createdAt').lte(new Date(req.query.endDate));
  }

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

  // Populate course and creator details
  query = query
    .populate('course', 'title code department')
    .populate('createdBy', 'name email');

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const startIndex = (page - 1) * limit;
  const total = await Announcement.countDocuments(query);

  query = query.skip(startIndex).limit(limit);

  const announcements = await query;

  res.status(200).json({
    success: true,
    count: announcements.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    data: announcements
  });
});

// @desc    Get single announcement
// @route   GET /api/v1/announcements/:id
// @access  Private
exports.getAnnouncement = asyncHandler(async (req, res, next) => {
  const announcement = await Announcement.findById(req.params.id)
    .populate('course', 'title code department faculty')
    .populate('createdBy', 'name email department');

  if (!announcement) {
    return next(new ErrorResponse(`Announcement not found with id of ${req.params.id}`, 404));
  }

  // Check authorization
  const isAdmin = req.user.role === 'admin';
  const isCreator = announcement.createdBy._id.toString() === req.user.id;
  
  let hasAccess = false;
  if (req.user.role === 'faculty') {
    const course = await Course.findById(announcement.course);
    hasAccess = course && course.faculty.toString() === req.user.id;
  } else if (req.user.role === 'student') {
    const course = await Course.findById(announcement.course);
    hasAccess = course && course.enrolledStudents.includes(req.user.id);
  }

  if (!isAdmin && !isCreator && !hasAccess) {
    return next(new ErrorResponse('Not authorized to view this announcement', 403));
  }

  res.status(200).json({
    success: true,
    data: announcement
  });
});

// @desc    Create announcement
// @route   POST /api/v1/announcements
// @access  Private/Faculty or Admin
exports.createAnnouncement = asyncHandler(async (req, res, next) => {
  // Check authorization
  if (req.user.role !== 'faculty' && req.user.role !== 'admin') {
    return next(new ErrorResponse('Only faculty and admin can create announcements', 403));
  }

  const { course, title, content, priority = 'normal' } = req.body;

  // Validate required fields
  if (!course || !title || !content) {
    return next(new ErrorResponse('Please provide course, title, and content', 400));
  }

  // Validate course
  const courseObj = await Course.findById(course);
  if (!courseObj) {
    return next(new ErrorResponse('Course not found', 404));
  }

  // For faculty, check if they own the course
  if (req.user.role === 'faculty' && courseObj.faculty.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to create announcement for this course', 403));
  }

  // Validate priority
  const validPriorities = ['low', 'normal', 'high', 'urgent'];
  if (!validPriorities.includes(priority)) {
    return next(new ErrorResponse(`Priority must be one of: ${validPriorities.join(', ')}`, 400));
  }

  // Create announcement
  const announcement = await Announcement.create({
    course,
    title,
    content,
    priority,
    createdBy: req.user.id
  });

  // Populate details for response
  await announcement.populate('course', 'title code');
  await announcement.populate('createdBy', 'name');

  res.status(201).json({
    success: true,
    data: announcement
  });
});

// @desc    Update announcement
// @route   PUT /api/v1/announcements/:id
// @access  Private/Faculty or Admin
exports.updateAnnouncement = asyncHandler(async (req, res, next) => {
  let announcement = await Announcement.findById(req.params.id)
    .populate('course', 'faculty')
    .populate('createdBy');

  if (!announcement) {
    return next(new ErrorResponse(`Announcement not found with id of ${req.params.id}`, 404));
  }

  // Check authorization
  const isAdmin = req.user.role === 'admin';
  const isCreator = announcement.createdBy._id.toString() === req.user.id;
  const isFaculty = req.user.role === 'faculty' && announcement.course.faculty.toString() === req.user.id;

  if (!isAdmin && !isCreator && !isFaculty) {
    return next(new ErrorResponse('Not authorized to update this announcement', 403));
  }

  // Validate priority if provided
  if (req.body.priority) {
    const validPriorities = ['low', 'normal', 'high', 'urgent'];
    if (!validPriorities.includes(req.body.priority)) {
      return next(new ErrorResponse(`Priority must be one of: ${validPriorities.join(', ')}`, 400));
    }
  }

  // Update announcement
  announcement = await Announcement.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  })
    .populate('course', 'title code')
    .populate('createdBy', 'name');

  res.status(200).json({
    success: true,
    data: announcement
  });
});

// @desc    Delete announcement
// @route   DELETE /api/v1/announcements/:id
// @access  Private/Faculty or Admin
exports.deleteAnnouncement = asyncHandler(async (req, res, next) => {
  const announcement = await Announcement.findById(req.params.id)
    .populate('course', 'faculty')
    .populate('createdBy');

  if (!announcement) {
    return next(new ErrorResponse(`Announcement not found with id of ${req.params.id}`, 404));
  }

  // Check authorization
  const isAdmin = req.user.role === 'admin';
  const isCreator = announcement.createdBy._id.toString() === req.user.id;
  const isFaculty = req.user.role === 'faculty' && announcement.course.faculty.toString() === req.user.id;

  if (!isAdmin && !isCreator && !isFaculty) {
    return next(new ErrorResponse('Not authorized to delete this announcement', 403));
  }

  await announcement.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get course announcements
// @route   GET /api/v1/announcements/course/:courseId
// @access  Private
exports.getCourseAnnouncements = asyncHandler(async (req, res, next) => {
  const { courseId } = req.params;

  // Validate course
  const course = await Course.findById(courseId);
  if (!course) {
    return next(new ErrorResponse('Course not found', 404));
  }

  // Check authorization
  const isAdmin = req.user.role === 'admin';
  const isFaculty = req.user.role === 'faculty' && course.faculty.toString() === req.user.id;
  const isStudent = req.user.role === 'student' && course.enrolledStudents.includes(req.user.id);

  if (!isAdmin && !isFaculty && !isStudent) {
    return next(new ErrorResponse('Not authorized to view these announcements', 403));
  }

  let query = Announcement.find({ course: courseId });

  // Filter by priority
  if (req.query.priority) {
    query = query.where('priority').equals(req.query.priority);
  }

  // Search by title or content
  if (req.query.search) {
    query = query.find({
      $or: [
        { title: { $regex: req.query.search, $options: 'i' } },
        { content: { $regex: req.query.search, $options: 'i' } }
      ]
    });
  }

  // Filter by date range
  if (req.query.startDate) {
    query = query.where('createdAt').gte(new Date(req.query.startDate));
  }
  
  if (req.query.endDate) {
    query = query.where('createdAt').lte(new Date(req.query.endDate));
  }

  // Sort
  const sortBy = req.query.sort || '-createdAt';
  query = query.sort(sortBy);

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const total = await Announcement.countDocuments(query);

  query = query.skip(startIndex).limit(limit);

  // Populate creator details
  query = query.populate('createdBy', 'name email department');

  const announcements = await query;

  // Get statistics for admin/faculty
  let statistics = null;
  if (req.user.role !== 'student') {
    const priorityStats = await Announcement.aggregate([
      {
        $match: { course: new mongoose.Types.ObjectId(courseId) }
      },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    const recentActivity = await Announcement.aggregate([
      {
        $match: { 
          course: new mongoose.Types.ObjectId(courseId),
          createdAt: { 
            $gte: new Date(new Date().setDate(new Date().getDate() - 30))
          }
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

    statistics = {
      priorityStats,
      recentActivity
    };
  }

  res.status(200).json({
    success: true,
    data: {
      course: {
        id: course._id,
        title: course.title,
        code: course.code,
        department: course.department
      },
      announcements,
      statistics
    },
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Get recent announcements
// @route   GET /api/v1/announcements/recent
// @access  Private
exports.getRecentAnnouncements = asyncHandler(async (req, res, next) => {
  const { limit = 10 } = req.query;

  let query;

  // Admin sees all recent announcements
  if (req.user.role === 'admin') {
    query = Announcement.find();
  } 
  // Faculty sees recent announcements for their courses
  else if (req.user.role === 'faculty') {
    const facultyCourses = await Course.find({ faculty: req.user.id }).distinct('_id');
    query = Announcement.find({ course: { $in: facultyCourses } });
  }
  // Students see recent announcements for courses they're enrolled in
  else if (req.user.role === 'student') {
    const enrolledCourses = await Course.find({
      enrolledStudents: req.user.id
    }).distinct('_id');
    
    query = Announcement.find({ 
      course: { $in: enrolledCourses } 
    });
  } else {
    return next(new ErrorResponse('Not authorized', 401));
  }

  // Filter by priority if specified
  if (req.query.priority) {
    query = query.where('priority').equals(req.query.priority);
  }

  // Sort by creation date (newest first)
  query = query.sort('-createdAt');

  // Limit results
  query = query.limit(parseInt(limit));

  // Populate course and creator details
  query = query
    .populate('course', 'title code department')
    .populate('createdBy', 'name');

  const announcements = await query;

  // Categorize by priority
  const categorized = {
    urgent: announcements.filter(a => a.priority === 'urgent'),
    high: announcements.filter(a => a.priority === 'high'),
    normal: announcements.filter(a => a.priority === 'normal'),
    low: announcements.filter(a => a.priority === 'low')
  };

  res.status(200).json({
    success: true,
    data: {
      announcements,
      categorized,
      counts: {
        total: announcements.length,
        urgent: categorized.urgent.length,
        high: categorized.high.length,
        normal: categorized.normal.length,
        low: categorized.low.length
      }
    }
  });
});

// @desc    Mark announcement as read
// @route   POST /api/v1/announcements/:id/read
// @access  Private
exports.markAsRead = asyncHandler(async (req, res, next) => {
  const announcement = await Announcement.findById(req.params.id);

  if (!announcement) {
    return next(new ErrorResponse(`Announcement not found with id of ${req.params.id}`, 404));
  }

  // Check if user has access to this announcement
  const course = await Course.findById(announcement.course);
  let hasAccess = false;

  if (req.user.role === 'admin') {
    hasAccess = true;
  } else if (req.user.role === 'faculty') {
    hasAccess = course && course.faculty.toString() === req.user.id;
  } else if (req.user.role === 'student') {
    hasAccess = course && course.enrolledStudents.includes(req.user.id);
  }

  if (!hasAccess) {
    return next(new ErrorResponse('Not authorized to mark this announcement as read', 403));
  }

  // Add user to readBy array if not already there
  if (!announcement.readBy.includes(req.user.id)) {
    announcement.readBy.push(req.user.id);
    await announcement.save();
  }

  res.status(200).json({
    success: true,
    message: 'Announcement marked as read'
  });
});

// @desc    Get unread announcements
// @route   GET /api/v1/announcements/unread
// @access  Private
exports.getUnreadAnnouncements = asyncHandler(async (req, res, next) => {
  let courseQuery = {};

  // Build course query based on user role
  if (req.user.role === 'faculty') {
    courseQuery.faculty = req.user.id;
  } else if (req.user.role === 'student') {
    courseQuery.enrolledStudents = req.user.id;
  }

  // Get relevant courses
  const courses = await Course.find(courseQuery).distinct('_id');

  if (courses.length === 0) {
    return res.status(200).json({
      success: true,
      data: {
        announcements: [],
        counts: {
          total: 0,
          urgent: 0,
          high: 0,
          normal: 0,
          low: 0
        }
      }
    });
  }

  // Get announcements for these courses that user hasn't read
  const unreadAnnouncements = await Announcement.find({
    course: { $in: courses },
    readBy: { $ne: req.user.id }
  })
    .sort('-createdAt')
    .populate('course', 'title code')
    .populate('createdBy', 'name');

  // Categorize by priority
  const categorized = {
    urgent: unreadAnnouncements.filter(a => a.priority === 'urgent'),
    high: unreadAnnouncements.filter(a => a.priority === 'high'),
    normal: unreadAnnouncements.filter(a => a.priority === 'normal'),
    low: unreadAnnouncements.filter(a => a.priority === 'low')
  };

  res.status(200).json({
    success: true,
    data: {
      announcements: unreadAnnouncements,
      categorized,
      counts: {
        total: unreadAnnouncements.length,
        urgent: categorized.urgent.length,
        high: categorized.high.length,
        normal: categorized.normal.length,
        low: categorized.low.length
      }
    }
  });
});

// @desc    Get announcement statistics
// @route   GET /api/v1/announcements/statistics
// @access  Private/Admin or Faculty
exports.getAnnouncementStatistics = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'faculty') {
    return next(new ErrorResponse('Not authorized to view announcement statistics', 403));
  }

  let matchQuery = {};

  // For faculty, only show statistics for their courses
  if (req.user.role === 'faculty') {
    const facultyCourses = await Course.find({ faculty: req.user.id }).distinct('_id');
    matchQuery.course = { $in: facultyCourses };
  }

  // Filter by course if specified
  if (req.query.course) {
    matchQuery.course = req.query.course;
  }

  // Filter by date range
  if (req.query.startDate) {
    matchQuery.createdAt = { $gte: new Date(req.query.startDate) };
  }
  
  if (req.query.endDate) {
    matchQuery.createdAt = { ...matchQuery.createdAt, $lte: new Date(req.query.endDate) };
  }

  // Get overall statistics
  const overallStats = await Announcement.aggregate([
    {
      $match: matchQuery
    },
    {
      $group: {
        _id: null,
        totalAnnouncements: { $sum: 1 },
        averageReadRate: {
          $avg: {
            $divide: [
              { $size: '$readBy' },
              { $add: [
                { $size: { $ifNull: ['$readBy', []] } },
                1 // Avoid division by zero
              ]}
            ]
          }
        }
      }
    }
  ]);

  // Get statistics by priority
  const priorityStats = await Announcement.aggregate([
    {
      $match: matchQuery
    },
    {
      $group: {
        _id: '$priority',
        count: { $sum: 1 },
        averageReadCount: { $avg: { $size: '$readBy' } }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);

  // Get statistics by course
  const courseStats = await Announcement.aggregate([
    {
      $match: matchQuery
    },
    {
      $lookup: {
        from: 'courses',
        localField: 'course',
        foreignField: '_id',
        as: 'courseData'
      }
    },
    {
      $unwind: '$courseData'
    },
    {
      $group: {
        _id: '$course',
        courseTitle: { $first: '$courseData.title' },
        courseCode: { $first: '$courseData.code' },
        announcementCount: { $sum: 1 },
        averageReadCount: { $avg: { $size: '$readBy' } }
      }
    },
    {
      $sort: { announcementCount: -1 }
    },
    {
      $limit: 10
    }
  ]);

  // Get creation trends
  const creationTrends = await Announcement.aggregate([
    {
      $match: matchQuery
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
    },
    {
      $limit: 30
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      overall: overallStats[0] || {
        totalAnnouncements: 0,
        averageReadRate: 0
      },
      priorityStats,
      courseStats,
      creationTrends
    }
  });
});

// @desc    Get urgent announcements
// @route   GET /api/v1/announcements/urgent
// @access  Private
exports.getUrgentAnnouncements = asyncHandler(async (req, res, next) => {
  let courseQuery = {};
  
  if (req.user.role === 'faculty') {
    courseQuery.faculty = req.user.id;
  } else if (req.user.role === 'student') {
    courseQuery.enrolledStudents = req.user.id;
  }
  
  const courses = await Course.find(courseQuery).distinct('_id');
  
  const urgentAnnouncements = await Announcement.find({
    course: { $in: courses },
    priority: 'urgent'
  })
    .sort('-createdAt')
    .populate('course', 'title code')
    .populate('createdBy', 'name');
  
  res.status(200).json({
    success: true,
    count: urgentAnnouncements.length,
    data: urgentAnnouncements
  });
});

// @desc    Publish announcement
// @route   PUT /api/v1/announcements/:id/publish
// @access  Private/Admin or Creator
exports.publishAnnouncement = asyncHandler(async (req, res, next) => {
  const announcement = await Announcement.findById(req.params.id);
  
  if (!announcement) {
    return next(new ErrorResponse('Announcement not found', 404));
  }
  
  const isAdmin = req.user.role === 'admin';
  const isCreator = announcement.createdBy.toString() === req.user.id;
  
  if (!isAdmin && !isCreator) {
    return next(new ErrorResponse('Not authorized', 403));
  }
  
  announcement.isPublished = true;
  announcement.publishedAt = new Date();
  await announcement.save();
  
  res.status(200).json({
    success: true,
    data: announcement
  });
});