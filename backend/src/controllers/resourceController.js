const mongoose = require('mongoose');
const { Resource, Course, User } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/ErrorResponse');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

// @desc    Get all resources
// @route   GET /api/v1/resources
// @access  Private
exports.getResources = asyncHandler(async (req, res, next) => {
  let query;

  // Admin sees all resources
  if (req.user.role === 'admin') {
    query = Resource.find();
  } 
  // Faculty sees resources for their courses
  else if (req.user.role === 'faculty') {
    const facultyCourses = await Course.find({ faculty: req.user.id }).distinct('_id');
    query = Resource.find({ course: { $in: facultyCourses } });
  }
  // Students see resources for courses they're enrolled in
  else if (req.user.role === 'student') {
    const enrolledCourses = await Course.find({
      enrolledStudents: req.user.id
    }).distinct('_id');
    
    query = Resource.find({ 
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

  // Search by title or description
  if (req.query.search) {
    query = query.find({
      $or: [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ]
    });
  }

  // Filter by course
  if (req.query.course) {
    query = query.where('course').equals(req.query.course);
  }

  // Filter by type
  if (req.query.type) {
    query = query.where('type').equals(req.query.type);
  }

  // Filter by uploader
  if (req.query.uploadedBy && req.user.role !== 'student') {
    query = query.where('uploadedBy').equals(req.query.uploadedBy);
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
    query = query.sort('-uploadedAt');
  }

  // Populate course and uploader details
  query = query
    .populate('course', 'title code department')
    .populate('uploadedBy', 'name email');

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const startIndex = (page - 1) * limit;
  const total = await Resource.countDocuments(query);

  query = query.skip(startIndex).limit(limit);

  const resources = await query;

  res.status(200).json({
    success: true,
    count: resources.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    data: resources
  });
});

// @desc    Get single resource
// @route   GET /api/v1/resources/:id
// @access  Private
exports.getResource = asyncHandler(async (req, res, next) => {
  const resource = await Resource.findById(req.params.id)
    .populate('course', 'title code department faculty')
    .populate('uploadedBy', 'name email department');

  if (!resource) {
    return next(new ErrorResponse(`Resource not found with id of ${req.params.id}`, 404));
  }

  // Check authorization
  const isAdmin = req.user.role === 'admin';
  const isUploader = resource.uploadedBy._id.toString() === req.user.id;
  
  let hasAccess = false;
  if (req.user.role === 'faculty') {
    const course = await Course.findById(resource.course);
    hasAccess = course && course.faculty.toString() === req.user.id;
  } else if (req.user.role === 'student') {
    const course = await Course.findById(resource.course);
    hasAccess = course && course.enrolledStudents.includes(req.user.id);
  }

  if (!isAdmin && !isUploader && !hasAccess) {
    return next(new ErrorResponse('Not authorized to view this resource', 403));
  }

  res.status(200).json({
    success: true,
    data: resource
  });
});

// @desc    Create resource
// @route   POST /api/v1/resources
// @access  Private/Faculty or Admin
exports.createResource = asyncHandler(async (req, res, next) => {
  // Check authorization
  if (req.user.role !== 'faculty' && req.user.role !== 'admin') {
    return next(new ErrorResponse('Only faculty and admin can upload resources', 403));
  }

  const { course, title, description, type = 'document' } = req.body;

  // Validate required fields
  if (!course || !title) {
    return next(new ErrorResponse('Please provide course and title', 400));
  }

  // Check if file is uploaded
  if (!req.file) {
    return next(new ErrorResponse('Please upload a file', 400));
  }

  // Validate course
  const courseObj = await Course.findById(course);
  if (!courseObj) {
    return next(new ErrorResponse('Course not found', 404));
  }

  // For faculty, check if they own the course
  if (req.user.role === 'faculty' && courseObj.faculty.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to upload resources for this course', 403));
  }

  // Validate file type
  const validTypes = ['document', 'video', 'audio', 'image', 'presentation', 'spreadsheet', 'code', 'archive', 'other'];
  if (!validTypes.includes(type)) {
    return next(new ErrorResponse(`Invalid resource type. Valid types: ${validTypes.join(', ')}`, 400));
  }

  // Upload to Cloudinary
  let uploadResult;
  try {
    uploadResult = await uploadToCloudinary(req.file.path, {
      folder: `resources/course_${course}`,
      resource_type: 'auto'
    });
  } catch (error) {
    return next(new ErrorResponse('Failed to upload file to Cloudinary', 500));
  }

  // Create resource record
  const resource = await Resource.create({
    course,
    title,
    description,
    type,
    fileUrl: uploadResult.secure_url,
    fileName: req.file.originalname,
    fileSize: req.file.size,
    mimeType: req.file.mimetype,
    publicId: uploadResult.public_id,
    uploadedBy: req.user.id
  });

  // Populate details for response
  await resource.populate('course', 'title code');
  await resource.populate('uploadedBy', 'name');

  res.status(201).json({
    success: true,
    data: resource
  });
});

// @desc    Update resource
// @route   PUT /api/v1/resources/:id
// @access  Private/Faculty or Admin
exports.updateResource = asyncHandler(async (req, res, next) => {
  let resource = await Resource.findById(req.params.id)
    .populate('course', 'faculty')
    .populate('uploadedBy');

  if (!resource) {
    return next(new ErrorResponse(`Resource not found with id of ${req.params.id}`, 404));
  }

  // Check authorization
  const isAdmin = req.user.role === 'admin';
  const isUploader = resource.uploadedBy._id.toString() === req.user.id;
  const isFaculty = req.user.role === 'faculty' && resource.course.faculty.toString() === req.user.id;

  if (!isAdmin && !isUploader && !isFaculty) {
    return next(new ErrorResponse('Not authorized to update this resource', 403));
  }

  // Handle file upload if provided
  if (req.file) {
    // Delete old file from Cloudinary
    if (resource.publicId) {
      try {
        await deleteFromCloudinary(resource.publicId);
      } catch (error) {
        console.error(`Failed to delete old file: ${resource.publicId}`, error);
      }
    }

    // Upload new file
    try {
      const uploadResult = await uploadToCloudinary(req.file.path, {
        folder: `resources/course_${resource.course}`,
        resource_type: 'auto'
      });

      req.body.fileUrl = uploadResult.secure_url;
      req.body.fileName = req.file.originalname;
      req.body.fileSize = req.file.size;
      req.body.mimeType = req.file.mimetype;
      req.body.publicId = uploadResult.public_id;
    } catch (error) {
      return next(new ErrorResponse('Failed to upload new file', 500));
    }
  }

  // Validate type if provided
  if (req.body.type) {
    const validTypes = ['document', 'video', 'audio', 'image', 'presentation', 'spreadsheet', 'code', 'archive', 'other'];
    if (!validTypes.includes(req.body.type)) {
      return next(new ErrorResponse(`Invalid resource type. Valid types: ${validTypes.join(', ')}`, 400));
    }
  }

  // Update resource
  resource = await Resource.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  })
    .populate('course', 'title code')
    .populate('uploadedBy', 'name');

  res.status(200).json({
    success: true,
    data: resource
  });
});

// @desc    Delete resource
// @route   DELETE /api/v1/resources/:id
// @access  Private/Faculty or Admin
exports.deleteResource = asyncHandler(async (req, res, next) => {
  const resource = await Resource.findById(req.params.id)
    .populate('course', 'faculty')
    .populate('uploadedBy');

  if (!resource) {
    return next(new ErrorResponse(`Resource not found with id of ${req.params.id}`, 404));
  }

  // Check authorization
  const isAdmin = req.user.role === 'admin';
  const isUploader = resource.uploadedBy._id.toString() === req.user.id;
  const isFaculty = req.user.role === 'faculty' && resource.course.faculty.toString() === req.user.id;

  if (!isAdmin && !isUploader && !isFaculty) {
    return next(new ErrorResponse('Not authorized to delete this resource', 403));
  }

  // Delete file from Cloudinary
  if (resource.publicId) {
    try {
      await deleteFromCloudinary(resource.publicId);
    } catch (error) {
      console.error(`Failed to delete file from Cloudinary: ${resource.publicId}`, error);
    }
  }

  await resource.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get course resources
// @route   GET /api/v1/resources/course/:courseId
// @access  Private
exports.getCourseResources = asyncHandler(async (req, res, next) => {
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
    return next(new ErrorResponse('Not authorized to view these resources', 403));
  }

  let query = Resource.find({ course: courseId });

  // Filter by type
  if (req.query.type) {
    query = query.where('type').equals(req.query.type);
  }

  // Search by title or description
  if (req.query.search) {
    query = query.find({
      $or: [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ]
    });
  }

  // Filter by uploader
  if (req.query.uploadedBy && req.user.role !== 'student') {
    query = query.where('uploadedBy').equals(req.query.uploadedBy);
  }

  // Sort
  const sortBy = req.query.sort || '-uploadedAt';
  query = query.sort(sortBy);

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const startIndex = (page - 1) * limit;
  const total = await Resource.countDocuments(query);

  query = query.skip(startIndex).limit(limit);

  // Populate uploader details
  query = query.populate('uploadedBy', 'name email department');

  const resources = await query;

  // Group resources by type for easier navigation
  const resourcesByType = {};
  resources.forEach(resource => {
    if (!resourcesByType[resource.type]) {
      resourcesByType[resource.type] = [];
    }
    resourcesByType[resource.type].push(resource);
  });

  // Get statistics for admin/faculty
  let statistics = null;
  if (req.user.role !== 'student') {
    const typeStats = await Resource.aggregate([
      {
        $match: { course: new mongoose.Types.ObjectId(courseId) }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalSize: { $sum: '$fileSize' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    const uploaderStats = await Resource.aggregate([
      {
        $match: { course: new mongoose.Types.ObjectId(courseId) }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'uploadedBy',
          foreignField: '_id',
          as: 'uploaderData'
        }
      },
      {
        $unwind: '$uploaderData'
      },
      {
        $group: {
          _id: '$uploadedBy',
          uploaderName: { $first: '$uploaderData.name' },
          uploaderEmail: { $first: '$uploaderData.email' },
          count: { $sum: 1 },
          totalSize: { $sum: '$fileSize' }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 5
      }
    ]);

    statistics = {
      typeStats,
      uploaderStats
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
      resources,
      resourcesByType,
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

// @desc    Download resource
// @route   GET /api/v1/resources/:id/download
// @access  Private
exports.downloadResource = asyncHandler(async (req, res, next) => {
  const resource = await Resource.findById(req.params.id)
    .populate('course');

  if (!resource) {
    return next(new ErrorResponse(`Resource not found with id of ${req.params.id}`, 404));
  }

  // Check authorization
  const isAdmin = req.user.role === 'admin';
  const isUploader = resource.uploadedBy.toString() === req.user.id;
  
  let hasAccess = false;
  if (req.user.role === 'faculty') {
    const course = await Course.findById(resource.course);
    hasAccess = course && course.faculty.toString() === req.user.id;
  } else if (req.user.role === 'student') {
    const course = await Course.findById(resource.course);
    hasAccess = course && course.enrolledStudents.includes(req.user.id);
  }

  if (!isAdmin && !isUploader && !hasAccess) {
    return next(new ErrorResponse('Not authorized to download this resource', 403));
  }

  // Track download
  resource.downloadCount = (resource.downloadCount || 0) + 1;
  resource.lastDownloadedAt = new Date();
  
  if (!resource.downloadedBy.includes(req.user.id)) {
    resource.downloadedBy.push(req.user.id);
  }
  
  await resource.save();

  // For Cloudinary files, redirect to the secure URL
  if (resource.fileUrl) {
    // Set appropriate headers for download
    res.setHeader('Content-Disposition', `attachment; filename="${resource.fileName}"`);
    res.setHeader('Content-Type', resource.mimeType || 'application/octet-stream');
    
    // Redirect to Cloudinary URL
    res.redirect(resource.fileUrl);
  } else {
    return next(new ErrorResponse('File URL not available', 404));
  }
});

// @desc    Get resource statistics
// @route   GET /api/v1/resources/statistics
// @access  Private/Admin or Faculty
exports.getResourceStatistics = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'faculty') {
    return next(new ErrorResponse('Not authorized to view resource statistics', 403));
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
    matchQuery.uploadedAt = { $gte: new Date(req.query.startDate) };
  }
  
  if (req.query.endDate) {
    matchQuery.uploadedAt = { ...matchQuery.uploadedAt, $lte: new Date(req.query.endDate) };
  }

  // Get overall statistics
  const overallStats = await Resource.aggregate([
    {
      $match: matchQuery
    },
    {
      $group: {
        _id: null,
        totalResources: { $sum: 1 },
        totalSize: { $sum: '$fileSize' },
        averageSize: { $avg: '$fileSize' },
        totalDownloads: { $sum: '$downloadCount' },
        averageDownloads: { $avg: '$downloadCount' }
      }
    },
    {
      $project: {
        totalResources: 1,
        totalSize: 1,
        averageSize: { $round: ['$averageSize', 2] },
        totalSizeGB: {
          $round: [{ $divide: ['$totalSize', 1073741824] }, 4] // Convert to GB
        },
        totalDownloads: 1,
        averageDownloads: { $round: ['$averageDownloads', 2] }
      }
    }
  ]);

  // Get statistics by type
  const typeStats = await Resource.aggregate([
    {
      $match: matchQuery
    },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        totalSize: { $sum: '$fileSize' },
        averageDownloads: { $avg: '$downloadCount' }
      }
    },
    {
      $project: {
        type: '$_id',
        count: 1,
        totalSize: 1,
        totalSizeMB: {
          $round: [{ $divide: ['$totalSize', 1048576] }, 2] // Convert to MB
        },
        averageDownloads: { $round: ['$averageDownloads', 2] },
        percentage: {
          $round: [{
            $multiply: [
              { $divide: ['$count', overallStats[0]?.totalResources || 1] },
              100
            ]
          }, 2]
        }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);

  // Get most downloaded resources
  const mostDownloaded = await Resource.find(matchQuery)
    .sort('-downloadCount')
    .limit(10)
    .populate('course', 'title code')
    .populate('uploadedBy', 'name')
    .select('title type fileSize downloadCount uploadedAt course uploadedBy');

  // Get recent uploads
  const recentUploads = await Resource.find(matchQuery)
    .sort('-uploadedAt')
    .limit(10)
    .populate('course', 'title code')
    .populate('uploadedBy', 'name')
    .select('title type fileSize uploadedAt course uploadedBy');

  // Get upload trends
  const uploadTrends = await Resource.aggregate([
    {
      $match: matchQuery
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$uploadedAt" }
        },
        count: { $sum: 1 },
        totalSize: { $sum: '$fileSize' }
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
        totalResources: 0,
        totalSize: 0,
        averageSize: 0,
        totalDownloads: 0,
        averageDownloads: 0
      },
      typeStats,
      mostDownloaded,
      recentUploads,
      uploadTrends
    }
  });
});

// @desc    Search resources
// @route   GET /api/v1/resources/search
// @access  Private
exports.searchResources = asyncHandler(async (req, res, next) => {
  const { q, type, course } = req.query;

  if (!q) {
    return next(new ErrorResponse('Please provide a search query', 400));
  }

  let query = Resource.find({
    $or: [
      { title: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } }
    ]
  });

  // Apply role-based filtering
  if (req.user.role === 'faculty') {
    const facultyCourses = await Course.find({ faculty: req.user.id }).distinct('_id');
    query = query.where('course').in(facultyCourses);
  } else if (req.user.role === 'student') {
    const enrolledCourses = await Course.find({
      enrolledStudents: req.user.id
    }).distinct('_id');
    query = query.where('course').in(enrolledCourses);
  }

  // Filter by type
  if (type) {
    query = query.where('type').equals(type);
  }

  // Filter by course
  if (course) {
    query = query.where('course').equals(course);
  }

  const resources = await query
    .populate('course', 'title code')
    .populate('uploadedBy', 'name')
    .limit(20)
    .sort('-uploadedAt');

  res.status(200).json({
    success: true,
    count: resources.length,
    data: resources
  });
});

// @desc    Increment view count
// @route   PUT /api/v1/resources/:id/view
// @access  Private
exports.incrementViewCount = asyncHandler(async (req, res, next) => {
  const resource = await Resource.findById(req.params.id);

  if (!resource) {
    return next(new ErrorResponse(`Resource not found with id of ${req.params.id}`, 404));
  }

  // Check authorization
  const isAdmin = req.user.role === 'admin';
  
  let hasAccess = false;
  if (req.user.role === 'faculty') {
    const course = await Course.findById(resource.course);
    hasAccess = course && course.faculty.toString() === req.user.id;
  } else if (req.user.role === 'student') {
    const course = await Course.findById(resource.course);
    hasAccess = course && course.enrolledStudents.includes(req.user.id);
  }

  if (!isAdmin && !hasAccess) {
    return next(new ErrorResponse('Not authorized to view this resource', 403));
  }

  // Increment view count
  resource.viewCount = (resource.viewCount || 0) + 1;
  resource.lastViewedAt = new Date();
  
  if (!resource.viewedBy.includes(req.user.id)) {
    resource.viewedBy.push(req.user.id);
  }
  
  await resource.save();

  res.status(200).json({
    success: true,
    data: {
      viewCount: resource.viewCount
    }
  });
});

// @desc    Bulk upload resources
// @route   POST /api/v1/resources/bulk-upload
// @access  Private/Faculty or Admin
exports.bulkUploadResources = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'faculty' && req.user.role !== 'admin') {
    return next(new ErrorResponse('Only faculty and admin can bulk upload resources', 403));
  }

  if (!req.files || req.files.length === 0) {
    return next(new ErrorResponse('Please upload at least one file', 400));
  }

  const { course, type = 'document' } = req.body;

  // Validate course
  const courseObj = await Course.findById(course);
  if (!courseObj) {
    return next(new ErrorResponse('Course not found', 404));
  }

  // For faculty, check if they own the course
  if (req.user.role === 'faculty' && courseObj.faculty.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to upload resources for this course', 403));
  }

  const results = {
    success: [],
    errors: []
  };

  // Process each file
  for (const file of req.files) {
    try {
      // Upload to Cloudinary
      const uploadResult = await uploadToCloudinary(file.path, {
        folder: `resources/course_${course}`,
        resource_type: 'auto'
      });

      // Create resource title from filename (remove extension)
      const title = file.originalname.replace(/\.[^/.]+$/, "");

      // Create resource record
      const resource = await Resource.create({
        course,
        title,
        type,
        fileUrl: uploadResult.secure_url,
        fileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        publicId: uploadResult.public_id,
        uploadedBy: req.user.id
      });

      results.success.push({
        fileName: file.originalname,
        resourceId: resource._id,
        fileSize: file.size
      });
    } catch (error) {
      results.errors.push({
        fileName: file.originalname,
        error: error.message
      });
    }
  }

  res.status(200).json({
    success: true,
    data: results,
    summary: {
      total: req.files.length,
      success: results.success.length,
      errors: results.errors.length
    }
  });
});