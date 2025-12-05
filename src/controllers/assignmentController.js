const { Assignment, Course, Grade, User, Resource } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/ErrorResponse');
const mongoose = require('mongoose');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

// @desc    Get all assignments
// @route   GET /api/v1/assignments
// @access  Private (Admin sees all, Faculty sees theirs, Students see published)
exports.getAssignments = asyncHandler(async (req, res, next) => {
  let query;

  // Copy req.query
  const reqQuery = { ...req.query };

  // Fields to exclude
  const removeFields = ['select', 'sort', 'page', 'limit', 'search'];
  removeFields.forEach(param => delete reqQuery[param]);

  // Create query string
  let queryStr = JSON.stringify(reqQuery);

  // Create operators ($gt, $gte, etc)
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  // Base query based on user role
  if (req.user.role === 'admin') {
    // Admin sees all assignments
    query = Assignment.find(JSON.parse(queryStr));
  } else if (req.user.role === 'faculty') {
    // Faculty sees their own assignments
    query = Assignment.find({
      ...JSON.parse(queryStr),
      createdBy: req.user.id
    });
  } else if (req.user.role === 'student') {
    // Students see only published assignments for courses they're enrolled in
    const enrolledCourses = await Course.find({
      enrolledStudents: req.user.id
    }).distinct('_id');
    
    query = Assignment.find({
      ...JSON.parse(queryStr),
      course: { $in: enrolledCourses },
      isPublished: true
    });
  } else {
    return next(new ErrorResponse('Not authorized', 401));
  }

  // Search functionality
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

  // Filter by status (upcoming, active, past)
  if (req.query.status) {
    const now = new Date();
    switch (req.query.status) {
      case 'upcoming':
        query = query.where('dueDate').gt(now);
        break;
      case 'active':
        query = query.where('dueDate').gte(now);
        break;
      case 'past':
        query = query.where('dueDate').lt(now);
        break;
    }
  }

  // Filter by published status (for faculty/admin)
  if (req.user.role !== 'student' && req.query.isPublished !== undefined) {
    query = query.where('isPublished').equals(req.query.isPublished === 'true');
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
    query = query.sort('dueDate');
  }

  // Populate course details
  query = query.populate('course', 'title code department');

  // For students, also populate submission status
  if (req.user.role === 'student') {
    query = query.populate({
      path: 'submissions',
      match: { student: req.user.id },
      select: 'status score submittedAt'
    });
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const total = await Assignment.countDocuments(query);

  query = query.skip(startIndex).limit(limit);

  const assignments = await query;

  // Calculate additional data for each assignment
  const assignmentsWithStats = await Promise.all(
    assignments.map(async (assignment) => {
      const assignmentData = assignment.toObject();
      
      // Get submission count
      const submissionCount = await Grade.countDocuments({ 
        assignment: assignment._id,
        status: { $in: ['submitted', 'graded'] }
      });

      // Get enrolled student count
      const course = await Course.findById(assignment.course).select('enrolledStudents');
      const enrolledCount = course ? course.enrolledStudents.length : 0;

      // Calculate days remaining
      const now = new Date();
      const dueDate = new Date(assignment.dueDate);
      const daysRemaining = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));

      return {
        ...assignmentData,
        stats: {
          submissionCount,
          enrolledCount,
          submissionRate: enrolledCount > 0 ? Math.round((submissionCount / enrolledCount) * 100) : 0,
          daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
          isOverdue: now > dueDate
        }
      };
    })
  );

  res.status(200).json({
    success: true,
    count: assignmentsWithStats.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    data: assignmentsWithStats
  });
});

// @desc    Get single assignment
// @route   GET /api/v1/assignments/:id
// @access  Private
exports.getAssignment = asyncHandler(async (req, res, next) => {
  let assignment = await Assignment.findById(req.params.id)
    .populate('course', 'title code department faculty')
    .populate('createdBy', 'name email');

  if (!assignment) {
    return next(new ErrorResponse(`Assignment not found with id of ${req.params.id}`, 404));
  }

  // Check authorization
  const isAdmin = req.user.role === 'admin';
  const isCreator = assignment.createdBy && assignment.createdBy._id.toString() === req.user.id;
  
  if (req.user.role === 'student') {
    // Check if student is enrolled in the course
    const course = await Course.findById(assignment.course);
    if (!course || !course.enrolledStudents.includes(req.user.id)) {
      return next(new ErrorResponse('Not enrolled in this course', 403));
    }
    
    // Check if assignment is published
    if (!assignment.isPublished) {
      return next(new ErrorResponse('Assignment not available', 403));
    }
  }

  if (!isAdmin && !isCreator && req.user.role !== 'student') {
    return next(new ErrorResponse('Not authorized to view this assignment', 403));
  }

  // Get submission data for the current user
  let userSubmission = null;
  if (req.user.role === 'student') {
    userSubmission = await Grade.findOne({
      assignment: assignment._id,
      student: req.user.id
    });
  }

  // Get statistics for faculty/admin
  let statistics = null;
  if (req.user.role === 'admin' || req.user.role === 'faculty') {
    const submissions = await Grade.find({ assignment: assignment._id });
    const course = await Course.findById(assignment.course);
    const enrolledCount = course ? course.enrolledStudents.length : 0;

    const submittedCount = submissions.filter(s => s.status !== 'pending').length;
    const gradedCount = submissions.filter(s => s.status === 'graded').length;
    const averageScore = submittedCount > 0
      ? submissions.filter(s => s.score).reduce((sum, s) => sum + s.score, 0) / submittedCount
      : 0;

    statistics = {
      enrolledCount,
      submittedCount,
      notSubmitted: enrolledCount - submittedCount,
      gradedCount,
      pendingGrading: submittedCount - gradedCount,
      averageScore: Math.round(averageScore * 100) / 100,
      submissionRate: enrolledCount > 0 ? Math.round((submittedCount / enrolledCount) * 100) : 0
    };
  }

  // Calculate days remaining
  const now = new Date();
  const dueDate = new Date(assignment.dueDate);
  const daysRemaining = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));

  const assignmentData = {
    ...assignment.toObject(),
    daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
    isOverdue: now > dueDate,
    userSubmission,
    statistics
  };

  res.status(200).json({
    success: true,
    data: assignmentData
  });
});

// @desc    Create assignment
// @route   POST /api/v1/assignments
// @access  Private/Faculty or Admin
exports.createAssignment = asyncHandler(async (req, res, next) => {
  // Check authorization
  if (req.user.role !== 'faculty' && req.user.role !== 'admin') {
    return next(new ErrorResponse('Only faculty and admin can create assignments', 403));
  }

  // Validate required fields
  const requiredFields = ['title', 'description', 'course', 'dueDate', 'maxPoints'];
  for (const field of requiredFields) {
    if (!req.body[field]) {
      return next(new ErrorResponse(`Please provide ${field}`, 400));
    }
  }

  // Check if course exists
  const course = await Course.findById(req.body.course);
  if (!course) {
    return next(new ErrorResponse('Course not found', 404));
  }

  // Check if faculty owns the course (unless admin)
  if (req.user.role === 'faculty' && course.faculty.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to create assignment for this course', 403));
  }

  // Validate due date
  if (new Date(req.body.dueDate) <= new Date()) {
    return next(new ErrorResponse('Due date must be in the future', 400));
  }

  // Validate max points
  if (req.body.maxPoints <= 0) {
    return next(new ErrorResponse('Max points must be greater than 0', 400));
  }

  // Handle file uploads if present
  const attachments = [];
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      try {
        const result = await uploadToCloudinary(file.path, {
          folder: `assignments/course_${course._id}`,
          resource_type: 'auto'
        });

        attachments.push({
          fileName: file.originalname,
          fileUrl: result.secure_url,
          fileSize: file.size,
          mimeType: file.mimetype,
          publicId: result.public_id,
          uploadedAt: new Date()
        });
      } catch (error) {
        return next(new ErrorResponse(`Failed to upload file: ${file.originalname}`, 500));
      }
    }
  }

  // Create assignment
  const assignmentData = {
    ...req.body,
    createdBy: req.user.id,
    ...(attachments.length > 0 && { attachments })
  };

  const assignment = await Assignment.create(assignmentData);

  // Populate details for response
  await assignment.populate('course', 'title code');
  await assignment.populate('createdBy', 'name');

  res.status(201).json({
    success: true,
    data: assignment
  });
});

// @desc    Update assignment
// @route   PUT /api/v1/assignments/:id
// @access  Private/Faculty or Admin
exports.updateAssignment = asyncHandler(async (req, res, next) => {
  let assignment = await Assignment.findById(req.params.id);

  if (!assignment) {
    return next(new ErrorResponse(`Assignment not found with id of ${req.params.id}`, 404));
  }

  // Check authorization
  const isAdmin = req.user.role === 'admin';
  const isCreator = assignment.createdBy.toString() === req.user.id;

  if (!isAdmin && !isCreator) {
    return next(new ErrorResponse('Not authorized to update this assignment', 403));
  }

  // Check if assignment has submissions (some fields shouldn't be updated)
  const hasSubmissions = await Grade.exists({ 
    assignment: assignment._id,
    status: { $in: ['submitted', 'graded'] }
  });

  if (hasSubmissions) {
    // Fields that cannot be updated after submissions
    const restrictedFields = ['maxPoints', 'type', 'weightage'];
    restrictedFields.forEach(field => {
      if (req.body[field] && req.body[field] !== assignment[field]) {
        return next(new ErrorResponse(`Cannot update ${field} after submissions have been made`, 400));
      }
    });
  }

  // Handle file uploads if present
  if (req.files && req.files.length > 0) {
    const attachments = [...assignment.attachments];
    
    for (const file of req.files) {
      try {
        const result = await uploadToCloudinary(file.path, {
          folder: `assignments/course_${assignment.course}`,
          resource_type: 'auto'
        });

        attachments.push({
          fileName: file.originalname,
          fileUrl: result.secure_url,
          fileSize: file.size,
          mimeType: file.mimetype,
          publicId: result.public_id,
          uploadedAt: new Date()
        });
      } catch (error) {
        return next(new ErrorResponse(`Failed to upload file: ${file.originalname}`, 500));
      }
    }
    
    req.body.attachments = attachments;
  }

  // Handle file deletions if specified
  if (req.body.removeAttachments && Array.isArray(req.body.removeAttachments)) {
    const attachments = assignment.attachments.filter(attachment => 
      !req.body.removeAttachments.includes(attachment._id.toString())
    );
    
    // Delete files from Cloudinary
    for (const attachmentId of req.body.removeAttachments) {
      const attachment = assignment.attachments.find(a => a._id.toString() === attachmentId);
      if (attachment && attachment.publicId) {
        try {
          await deleteFromCloudinary(attachment.publicId);
        } catch (error) {
          console.error(`Failed to delete file from Cloudinary: ${attachment.publicId}`, error);
        }
      }
    }
    
    req.body.attachments = attachments;
  }

  // Update assignment
  assignment = await Assignment.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  })
    .populate('course', 'title code')
    .populate('createdBy', 'name');

  res.status(200).json({
    success: true,
    data: assignment
  });
});

// @desc    Delete assignment
// @route   DELETE /api/v1/assignments/:id
// @access  Private/Faculty or Admin
exports.deleteAssignment = asyncHandler(async (req, res, next) => {
  const assignment = await Assignment.findById(req.params.id);

  if (!assignment) {
    return next(new ErrorResponse(`Assignment not found with id of ${req.params.id}`, 404));
  }

  // Check authorization
  const isAdmin = req.user.role === 'admin';
  const isCreator = assignment.createdBy.toString() === req.user.id;

  if (!isAdmin && !isCreator) {
    return next(new ErrorResponse('Not authorized to delete this assignment', 403));
  }

  // Check if assignment has submissions
  const submissionCount = await Grade.countDocuments({ assignment: assignment._id });
  if (submissionCount > 0) {
    return next(new ErrorResponse('Cannot delete assignment with submissions. Delete submissions first.', 400));
  }

  // Delete attached files from Cloudinary
  if (assignment.attachments && assignment.attachments.length > 0) {
    for (const attachment of assignment.attachments) {
      if (attachment.publicId) {
        try {
          await deleteFromCloudinary(attachment.publicId);
        } catch (error) {
          console.error(`Failed to delete file from Cloudinary: ${attachment.publicId}`, error);
        }
      }
    }
  }

  await assignment.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Toggle assignment publish status
// @route   PUT /api/v1/assignments/:id/toggle-publish
// @access  Private/Faculty or Admin
exports.togglePublishAssignment = asyncHandler(async (req, res, next) => {
  const assignment = await Assignment.findById(req.params.id);

  if (!assignment) {
    return next(new ErrorResponse(`Assignment not found with id of ${req.params.id}`, 404));
  }

  // Check authorization
  const isAdmin = req.user.role === 'admin';
  const isCreator = assignment.createdBy.toString() === req.user.id;

  if (!isAdmin && !isCreator) {
    return next(new ErrorResponse('Not authorized to update this assignment', 403));
  }

  // Toggle publish status
  assignment.isPublished = !assignment.isPublished;
  await assignment.save();

  res.status(200).json({
    success: true,
    message: `Assignment ${assignment.isPublished ? 'published' : 'unpublished'} successfully`,
    data: assignment
  });
});

// @desc    Get assignment submissions
// @route   GET /api/v1/assignments/:id/submissions
// @access  Private/Faculty or Admin
exports.getAssignmentSubmissions = asyncHandler(async (req, res, next) => {
  const assignment = await Assignment.findById(req.params.id)
    .populate('course', 'title code faculty');

  if (!assignment) {
    return next(new ErrorResponse(`Assignment not found with id of ${req.params.id}`, 404));
  }

  // Check authorization
  const isAdmin = req.user.role === 'admin';
  const isFaculty = req.user.role === 'faculty' && assignment.course.faculty.toString() === req.user.id;

  if (!isAdmin && !isFaculty) {
    return next(new ErrorResponse('Not authorized to view these submissions', 403));
  }

  // Get all submissions for this assignment
  let query = Grade.find({ assignment: assignment._id });

  // Filter by status
  if (req.query.status) {
    query = query.where('status').equals(req.query.status);
  }

  // Filter by late submissions
  if (req.query.isLate !== undefined) {
    query = query.where('isLate').equals(req.query.isLate === 'true');
  }

  // Sort
  const sortBy = req.query.sort || 'submittedAt';
  query = query.sort(sortBy);

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const startIndex = (page - 1) * limit;
  const total = await Grade.countDocuments(query);

  query = query.skip(startIndex).limit(limit);

  // Populate student details
  query = query.populate('student', 'name email studentId department');

  const submissions = await query;

  // Get enrolled students who haven't submitted
  const course = await Course.findById(assignment.course);
  const enrolledStudents = course ? course.enrolledStudents : [];
  
  const submittedStudentIds = submissions.map(s => s.student._id.toString());
  const notSubmittedStudents = await User.find({
    _id: { $in: enrolledStudents.filter(id => !submittedStudentIds.includes(id.toString())) },
    role: 'student'
  }).select('name email studentId department');

  // Calculate statistics
  const enrolledCount = enrolledStudents.length;
  const submittedCount = submissions.length;
  const gradedCount = submissions.filter(s => s.status === 'graded').length;
  
  const totalScore = submissions.filter(s => s.score).reduce((sum, s) => sum + s.score, 0);
  const averageScore = submittedCount > 0 ? totalScore / submittedCount : 0;

  res.status(200).json({
    success: true,
    data: {
      assignment: {
        id: assignment._id,
        title: assignment.title,
        dueDate: assignment.dueDate,
        maxPoints: assignment.maxPoints,
        course: assignment.course
      },
      statistics: {
        enrolledCount,
        submittedCount,
        notSubmitted: enrolledCount - submittedCount,
        gradedCount,
        pendingGrading: submittedCount - gradedCount,
        averageScore: Math.round(averageScore * 100) / 100,
        submissionRate: Math.round((submittedCount / enrolledCount) * 100)
      },
      submissions,
      notSubmittedStudents
    },
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Download assignment submissions as CSV
// @route   GET /api/v1/assignments/:id/submissions/export
// @access  Private/Faculty or Admin
exports.exportSubmissions = asyncHandler(async (req, res, next) => {
  const assignment = await Assignment.findById(req.params.id)
    .populate('course', 'title code faculty');

  if (!assignment) {
    return next(new ErrorResponse(`Assignment not found with id of ${req.params.id}`, 404));
  }

  // Check authorization
  const isAdmin = req.user.role === 'admin';
  const isFaculty = req.user.role === 'faculty' && assignment.course.faculty.toString() === req.user.id;

  if (!isAdmin && !isFaculty) {
    return next(new ErrorResponse('Not authorized to export these submissions', 403));
  }

  // Get all submissions
  const submissions = await Grade.find({ assignment: assignment._id })
    .populate('student', 'name email studentId department')
    .sort('student.name');

  // Generate CSV data
  let csvData = 'Student Name,Student ID,Email,Department,Submitted At,Status,Score,Max Score,Percentage,Feedback,Is Late,Late Penalty\n';

  submissions.forEach(submission => {
    const percentage = submission.maxScore > 0 
      ? ((submission.score || 0) / submission.maxScore * 100).toFixed(2)
      : '0.00';

    csvData += `"${submission.student.name}","${submission.student.studentId}","${submission.student.email}","${submission.student.department}",`;
    csvData += `"${submission.submittedAt}","${submission.status}",${submission.score || ''},${submission.maxScore},`;
    csvData += `${percentage},"${submission.feedback || ''}",${submission.isLate},${submission.latePenalty || 0}\n`;
  });

  // Set response headers for CSV download
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${assignment.title.replace(/\s+/g, '_')}_submissions.csv"`);

  res.status(200).send(csvData);
});

// @desc    Bulk grade submissions
// @route   PUT /api/v1/assignments/:id/bulk-grade
// @access  Private/Faculty or Admin
exports.bulkGradeSubmissions = asyncHandler(async (req, res, next) => {
  const assignment = await Assignment.findById(req.params.id)
    .populate('course', 'faculty');

  if (!assignment) {
    return next(new ErrorResponse(`Assignment not found with id of ${req.params.id}`, 404));
  }

  // Check authorization
  const isAdmin = req.user.role === 'admin';
  const isFaculty = req.user.role === 'faculty' && assignment.course.faculty.toString() === req.user.id;

  if (!isAdmin && !isFaculty) {
    return next(new ErrorResponse('Not authorized to grade these submissions', 403));
  }

  const { grades } = req.body;

  if (!Array.isArray(grades) || grades.length === 0) {
    return next(new ErrorResponse('Please provide an array of grades', 400));
  }

  const results = {
    success: [],
    errors: []
  };

  // Process each grade
  for (const gradeData of grades) {
    try {
      const { submissionId, score, feedback } = gradeData;

      if (!submissionId) {
        results.errors.push({
          error: 'Missing submission ID'
        });
        continue;
      }

      // Find the submission
      const submission = await Grade.findById(submissionId);

      if (!submission) {
        results.errors.push({
          submissionId,
          error: 'Submission not found'
        });
        continue;
      }

      // Validate submission belongs to this assignment
      if (submission.assignment.toString() !== assignment._id.toString()) {
        results.errors.push({
          submissionId,
          error: 'Submission does not belong to this assignment'
        });
        continue;
      }

      // Validate score
      if (score < 0 || score > assignment.maxPoints) {
        results.errors.push({
          submissionId,
          error: `Score must be between 0 and ${assignment.maxPoints}`
        });
        continue;
      }

      // Update grade
      submission.score = score;
      submission.feedback = feedback || submission.feedback;
      submission.gradedBy = req.user.id;
      submission.gradedAt = new Date();
      submission.status = 'graded';

      await submission.save();

      results.success.push({
        submissionId,
        studentId: submission.student,
        score,
        status: 'graded'
      });
    } catch (error) {
      results.errors.push({
        error: error.message
      });
    }
  }

  res.status(200).json({
    success: true,
    data: results,
    summary: {
      total: grades.length,
      success: results.success.length,
      errors: results.errors.length
    }
  });
});

// @desc    Get assignment analytics
// @route   GET /api/v1/assignments/:id/analytics
// @access  Private/Faculty or Admin
exports.getAssignmentAnalytics = asyncHandler(async (req, res, next) => {
  const assignment = await Assignment.findById(req.params.id)
    .populate('course', 'title code faculty');

  if (!assignment) {
    return next(new ErrorResponse(`Assignment not found with id of ${req.params.id}`, 404));
  }

  // Check authorization
  const isAdmin = req.user.role === 'admin';
  const isFaculty = req.user.role === 'faculty' && assignment.course.faculty.toString() === req.user.id;

  if (!isAdmin && !isFaculty) {
    return next(new ErrorResponse('Not authorized to view these analytics', 403));
  }

  // Get all submissions
  const submissions = await Grade.find({ assignment: assignment._id })
    .populate('student', 'name department');

  // Calculate grade distribution
  const gradeRanges = [
    { range: '90-100', min: 90, max: 100, count: 0 },
    { range: '80-89', min: 80, max: 89, count: 0 },
    { range: '70-79', min: 70, max: 79, count: 0 },
    { range: '60-69', min: 60, max: 69, count: 0 },
    { range: '0-59', min: 0, max: 59, count: 0 }
  ];

  const gradedSubmissions = submissions.filter(s => s.status === 'graded' && s.score !== null);

  gradedSubmissions.forEach(submission => {
    const percentage = (submission.score / assignment.maxPoints) * 100;
    
    for (const range of gradeRanges) {
      if (percentage >= range.min && percentage <= range.max) {
        range.count++;
        break;
      }
    }
  });

  // Calculate submission timeline
  const submissionTimeline = [];
  const dueDate = new Date(assignment.dueDate);
  
  // Get submissions for each day in the week before and after due date
  for (let i = -7; i <= 7; i++) {
    const date = new Date(dueDate);
    date.setDate(date.getDate() + i);
    
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);
    
    const count = await Grade.countDocuments({
      assignment: assignment._id,
      submittedAt: { $gte: dayStart, $lte: dayEnd }
    });
    
    submissionTimeline.push({
      date: dayStart.toISOString().split('T')[0],
      count,
      isDueDate: i === 0
    });
  }

  // Calculate average scores by department
  const scoresByDepartment = {};
  gradedSubmissions.forEach(submission => {
    const department = submission.student.department;
    if (!scoresByDepartment[department]) {
      scoresByDepartment[department] = {
        count: 0,
        totalScore: 0
      };
    }
    
    scoresByDepartment[department].count++;
    scoresByDepartment[department].totalScore += submission.score;
  });

  const departmentAverages = Object.keys(scoresByDepartment).map(dept => ({
    department: dept,
    averageScore: Math.round((scoresByDepartment[dept].totalScore / scoresByDepartment[dept].count) * 100) / 100,
    count: scoresByDepartment[dept].count
  }));

  // Get late submission statistics
  const lateSubmissions = submissions.filter(s => s.isLate);
  const onTimeSubmissions = submissions.filter(s => !s.isLate && s.status !== 'pending');

  res.status(200).json({
    success: true,
    data: {
      assignment: {
        id: assignment._id,
        title: assignment.title,
        maxPoints: assignment.maxPoints,
        dueDate: assignment.dueDate
      },
      statistics: {
        totalSubmissions: submissions.length,
        graded: gradedSubmissions.length,
        pendingGrading: submissions.length - gradedSubmissions.length,
        averageScore: gradedSubmissions.length > 0
          ? Math.round(gradedSubmissions.reduce((sum, s) => sum + s.score, 0) / gradedSubmissions.length * 100) / 100
          : 0,
        lateSubmissions: lateSubmissions.length,
        onTimeSubmissions: onTimeSubmissions.length,
        lateSubmissionRate: submissions.length > 0
          ? Math.round((lateSubmissions.length / submissions.length) * 100)
          : 0
      },
      gradeDistribution: gradeRanges,
      submissionTimeline,
      departmentAverages
    }
  });
});