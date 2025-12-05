const { Grade, Assignment, Course, User } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/ErrorResponse');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

// @desc    Get all submissions (Admin/Faculty)
// @route   GET /api/v1/submissions
// @access  Private/Admin or Faculty
exports.getSubmissions = asyncHandler(async (req, res, next) => {
  let query;

  // Admin sees all submissions
  if (req.user.role === 'admin') {
    query = Grade.find();
  } 
  // Faculty sees submissions for their courses
  else if (req.user.role === 'faculty') {
    // Get courses taught by this faculty
    const facultyCourses = await Course.find({ faculty: req.user.id }).distinct('_id');
    
    // Get assignments for these courses
    const facultyAssignments = await Assignment.find({ 
      course: { $in: facultyCourses } 
    }).distinct('_id');
    
    query = Grade.find({ 
      assignment: { $in: facultyAssignments } 
    });
  }
  // Students see only their own submissions
  else if (req.user.role === 'student') {
    query = Grade.find({ student: req.user.id });
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

  // Search by assignment title or student name
  if (req.query.search) {
    const searchQuery = {
      $or: []
    };

    // For admin/faculty, search in student name
    if (req.user.role !== 'student') {
      const students = await User.find({
        name: { $regex: req.query.search, $options: 'i' },
        role: 'student'
      }).distinct('_id');
      
      searchQuery.$or.push({ student: { $in: students } });
    }

    // Search in assignment titles
    const assignments = await Assignment.find({
      title: { $regex: req.query.search, $options: 'i' }
    }).distinct('_id');
    
    searchQuery.$or.push({ assignment: { $in: assignments } });

    if (searchQuery.$or.length > 0) {
      query = query.find(searchQuery);
    }
  }

  // Filter by status
  if (req.query.status) {
    query = query.where('status').equals(req.query.status);
  }

  // Filter by late submissions
  if (req.query.isLate !== undefined) {
    query = query.where('isLate').equals(req.query.isLate === 'true');
  }

  // Filter by assignment
  if (req.query.assignment) {
    query = query.where('assignment').equals(req.query.assignment);
  }

  // Filter by course
  if (req.query.course) {
    query = query.where('course').equals(req.query.course);
  }

  // Filter by student
  if (req.query.student && req.user.role !== 'student') {
    query = query.where('student').equals(req.query.student);
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
    query = query.sort('-submittedAt');
  }

  // Populate details
  if (req.user.role === 'student') {
    // Students see assignment and course details
    query = query
      .populate('assignment', 'title dueDate maxPoints type')
      .populate('course', 'title code')
      .populate('gradedBy', 'name');
  } else {
    // Admin/Faculty see student and assignment details
    query = query
      .populate('student', 'name email studentId department')
      .populate('assignment', 'title dueDate maxPoints')
      .populate('course', 'title code')
      .populate('gradedBy', 'name');
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const startIndex = (page - 1) * limit;
  const total = await Grade.countDocuments(query);

  query = query.skip(startIndex).limit(limit);

  const submissions = await query;

  res.status(200).json({
    success: true,
    count: submissions.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    data: submissions
  });
});

// @desc    Get single submission
// @route   GET /api/v1/submissions/:id
// @access  Private
exports.getSubmission = asyncHandler(async (req, res, next) => {
  const submission = await Grade.findById(req.params.id)
    .populate('student', 'name email studentId department')
    .populate('assignment', 'title description dueDate maxPoints type weightage attachments')
    .populate('course', 'title code department')
    .populate('gradedBy', 'name email');

  if (!submission) {
    return next(new ErrorResponse(`Submission not found with id of ${req.params.id}`, 404));
  }

  // Check authorization
  const isAdmin = req.user.role === 'admin';
  const isStudent = req.user.role === 'student' && submission.student._id.toString() === req.user.id;
  
  let isFaculty = false;
  if (req.user.role === 'faculty') {
    const course = await Course.findById(submission.course);
    isFaculty = course && course.faculty.toString() === req.user.id;
  }

  if (!isAdmin && !isStudent && !isFaculty) {
    return next(new ErrorResponse('Not authorized to view this submission', 403));
  }

  // Get assignment details for comparison
  const assignment = await Assignment.findById(submission.assignment);

  // Calculate if submission would be late now (for display purposes)
  const now = new Date();
  const dueDate = new Date(assignment.dueDate);
  const wouldBeLate = now > dueDate;

  res.status(200).json({
    success: true,
    data: {
      ...submission.toObject(),
      assignment,
      wouldBeLate
    }
  });
});

// @desc    Create submission
// @route   POST /api/v1/submissions
// @access  Private/Student
exports.createSubmission = asyncHandler(async (req, res, next) => {
  // Only students can create submissions
  if (req.user.role !== 'student') {
    return next(new ErrorResponse('Only students can submit assignments', 403));
  }

  const { assignment, course, textSubmission } = req.body;

  // Validate required fields
  if (!assignment) {
    return next(new ErrorResponse('Please provide assignment ID', 400));
  }

  // Check if assignment exists and is published
  const assignmentObj = await Assignment.findById(assignment);
  if (!assignmentObj) {
    return next(new ErrorResponse('Assignment not found', 404));
  }

  if (!assignmentObj.isPublished) {
    return next(new ErrorResponse('Assignment is not available for submission', 400));
  }

  // Check if student is enrolled in the course
  const courseObj = await Course.findById(assignmentObj.course);
  if (!courseObj || !courseObj.enrolledStudents.includes(req.user.id)) {
    return next(new ErrorResponse('Not enrolled in this course', 403));
  }

  // Check due date
  const now = new Date();
  const dueDate = new Date(assignmentObj.dueDate);

  if (now > dueDate && !assignmentObj.allowLateSubmission) {
    return next(new ErrorResponse('Assignment submission deadline has passed', 400));
  }

  // Check if already submitted
  const existingSubmission = await Grade.findOne({
    student: req.user.id,
    assignment
  });

  if (existingSubmission && !assignmentObj.allowMultipleAttempts) {
    return next(new ErrorResponse('Already submitted this assignment', 400));
  }

  if (existingSubmission && assignmentObj.allowMultipleAttempts) {
    // Check max attempts
    const submissionCount = await Grade.countDocuments({
      student: req.user.id,
      assignment
    });

    if (submissionCount >= assignmentObj.maxAttempts) {
      return next(new ErrorResponse(`Maximum submission attempts (${assignmentObj.maxAttempts}) reached`, 400));
    }
  }

  // Check if file or text is provided
  if (!req.file && !textSubmission) {
    return next(new ErrorResponse('Please provide either a file or text submission', 400));
  }

  // Handle file upload if present
  let fileData = null;
  if (req.file) {
    try {
      const result = await uploadToCloudinary(req.file.path, {
        folder: `submissions/assignment_${assignment}`,
        resource_type: 'auto'
      });
      
      fileData = {
        fileName: req.file.originalname,
        fileUrl: result.secure_url,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        publicId: result.public_id,
        uploadedAt: new Date()
      };
    } catch (error) {
      return next(new ErrorResponse('Failed to upload file', 500));
    }
  }

  // Calculate late penalty if applicable
  let latePenalty = 0;
  let isLate = false;

  if (now > dueDate && assignmentObj.allowLateSubmission) {
    isLate = true;
    const lateDays = Math.ceil((now - dueDate) / (1000 * 60 * 60 * 24));
    latePenalty = Math.min(assignmentObj.latePenalty * lateDays, 100);
  }

  // Create or update submission
  const submissionData = {
    student: req.user.id,
    assignment,
    course: assignmentObj.course,
    submittedAt: now,
    status: 'submitted',
    textSubmission: textSubmission || null,
    files: fileData ? [fileData] : [],
    maxScore: assignmentObj.maxPoints,
    isLate,
    latePenalty
  };

  let submission;
  if (existingSubmission) {
    // Delete old files from Cloudinary
    if (existingSubmission.files && existingSubmission.files.length > 0) {
      for (const file of existingSubmission.files) {
        if (file.publicId) {
          try {
            await deleteFromCloudinary(file.publicId);
          } catch (error) {
            console.error(`Failed to delete old file: ${file.publicId}`, error);
          }
        }
      }
    }

    submission = await Grade.findByIdAndUpdate(
      existingSubmission._id,
      submissionData,
      { new: true, runValidators: true }
    );
  } else {
    submission = await Grade.create(submissionData);
  }

  // Populate details for response
  await submission.populate('assignment', 'title dueDate maxPoints');
  await submission.populate('course', 'title code');
  await submission.populate('student', 'name email');

  res.status(201).json({
    success: true,
    message: isLate ? 'Assignment submitted late' : 'Assignment submitted successfully',
    data: submission
  });
});

// @desc    Update submission (for students to update before deadline)
// @route   PUT /api/v1/submissions/:id
// @access  Private/Student
exports.updateSubmission = asyncHandler(async (req, res, next) => {
  let submission = await Grade.findById(req.params.id)
    .populate('assignment')
    .populate('course');

  if (!submission) {
    return next(new ErrorResponse(`Submission not found with id of ${req.params.id}`, 404));
  }

  // Check authorization - only the student who submitted can update
  if (req.user.role !== 'student' || submission.student.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to update this submission', 403));
  }

  // Check if submission can still be updated
  if (submission.status === 'graded') {
    return next(new ErrorResponse('Cannot update a graded submission', 400));
  }

  // Check assignment due date
  const assignment = await Assignment.findById(submission.assignment);
  const now = new Date();
  const dueDate = new Date(assignment.dueDate);

  if (now > dueDate && !assignment.allowLateSubmission) {
    return next(new ErrorResponse('Cannot update submission after deadline', 400));
  }

  // Handle file upload if present
  let fileData = [...submission.files];
  if (req.file) {
    try {
      const result = await uploadToCloudinary(req.file.path, {
        folder: `submissions/assignment_${submission.assignment}`,
        resource_type: 'auto'
      });
      
      fileData.push({
        fileName: req.file.originalname,
        fileUrl: result.secure_url,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        publicId: result.public_id,
        uploadedAt: new Date()
      });
    } catch (error) {
      return next(new ErrorResponse('Failed to upload file', 500));
    }
  }

  // Handle file deletions if specified
  if (req.body.removeFiles && Array.isArray(req.body.removeFiles)) {
    const filesToRemove = fileData.filter(file => 
      req.body.removeFiles.includes(file._id ? file._id.toString() : file.publicId)
    );
    
    // Delete files from Cloudinary
    for (const file of filesToRemove) {
      if (file.publicId) {
        try {
          await deleteFromCloudinary(file.publicId);
        } catch (error) {
          console.error(`Failed to delete file: ${file.publicId}`, error);
        }
      }
    }
    
    fileData = fileData.filter(file => 
      !req.body.removeFiles.includes(file._id ? file._id.toString() : file.publicId)
    );
  }

  // Update submission
  const updateData = {
    textSubmission: req.body.textSubmission !== undefined ? req.body.textSubmission : submission.textSubmission,
    files: fileData,
    submittedAt: new Date(),
    isLate: now > dueDate,
    ...(now > dueDate && {
      latePenalty: assignment.latePenalty * Math.ceil((now - dueDate) / (1000 * 60 * 60 * 24))
    })
  };

  submission = await Grade.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  )
    .populate('assignment', 'title dueDate maxPoints')
    .populate('course', 'title code')
    .populate('student', 'name email');

  res.status(200).json({
    success: true,
    data: submission
  });
});

// @desc    Delete submission
// @route   DELETE /api/v1/submissions/:id
// @access  Private/Student (before grading) or Admin/Faculty
exports.deleteSubmission = asyncHandler(async (req, res, next) => {
  const submission = await Grade.findById(req.params.id)
    .populate('assignment')
    .populate('course');

  if (!submission) {
    return next(new ErrorResponse(`Submission not found with id of ${req.params.id}`, 404));
  }

  // Check authorization
  const isAdmin = req.user.role === 'admin';
  const isStudent = req.user.role === 'student' && submission.student.toString() === req.user.id;
  
  let isFaculty = false;
  if (req.user.role === 'faculty') {
    const course = await Course.findById(submission.course);
    isFaculty = course && course.faculty.toString() === req.user.id;
  }

  if (!isAdmin && !isStudent && !isFaculty) {
    return next(new ErrorResponse('Not authorized to delete this submission', 403));
  }

  // Students can only delete their own submissions if not graded
  if (isStudent && submission.status === 'graded') {
    return next(new ErrorResponse('Cannot delete a graded submission', 400));
  }

  // Delete files from Cloudinary
  if (submission.files && submission.files.length > 0) {
    for (const file of submission.files) {
      if (file.publicId) {
        try {
          await deleteFromCloudinary(file.publicId);
        } catch (error) {
          console.error(`Failed to delete file: ${file.publicId}`, error);
        }
      }
    }
  }

  await submission.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Grade a submission
// @route   PUT /api/v1/submissions/:id/grade
// @access  Private/Faculty or Admin
exports.gradeSubmission = asyncHandler(async (req, res, next) => {
  const { score, feedback } = req.body;

  if (score === undefined) {
    return next(new ErrorResponse('Please provide a score', 400));
  }

  const submission = await Grade.findById(req.params.id)
    .populate('assignment')
    .populate('course');

  if (!submission) {
    return next(new ErrorResponse(`Submission not found with id of ${req.params.id}`, 404));
  }

  // Check authorization
  const isAdmin = req.user.role === 'admin';
  
  let isFaculty = false;
  if (req.user.role === 'faculty') {
    const course = await Course.findById(submission.course);
    isFaculty = course && course.faculty.toString() === req.user.id;
  }

  if (!isAdmin && !isFaculty) {
    return next(new ErrorResponse('Not authorized to grade this submission', 403));
  }

  // Validate score
  if (score < 0 || score > submission.assignment.maxPoints) {
    return next(new ErrorResponse(`Score must be between 0 and ${submission.assignment.maxPoints}`, 400));
  }

  // Check if already graded
  if (submission.status === 'graded') {
    return next(new ErrorResponse('Submission already graded', 400));
  }

  // Apply late penalty if applicable
  let finalScore = score;
  if (submission.isLate && submission.latePenalty > 0) {
    finalScore = score * (1 - submission.latePenalty / 100);
  }

  // Update submission
  submission.score = Math.max(0, finalScore);
  submission.feedback = feedback || submission.feedback;
  submission.gradedBy = req.user.id;
  submission.gradedAt = new Date();
  submission.status = 'graded';

  await submission.save();

  // Populate details for response
  await submission.populate('student', 'name email studentId');
  await submission.populate('assignment', 'title maxPoints');
  await submission.populate('gradedBy', 'name');

  res.status(200).json({
    success: true,
    data: submission
  });
});

// @desc    Add feedback to submission
// @route   PUT /api/v1/submissions/:id/feedback
// @access  Private/Faculty or Admin
exports.addFeedback = asyncHandler(async (req, res, next) => {
  const { feedback } = req.body;

  if (!feedback) {
    return next(new ErrorResponse('Please provide feedback', 400));
  }

  const submission = await Grade.findById(req.params.id)
    .populate('course');

  if (!submission) {
    return next(new ErrorResponse(`Submission not found with id of ${req.params.id}`, 404));
  }

  // Check authorization
  const isAdmin = req.user.role === 'admin';
  
  let isFaculty = false;
  if (req.user.role === 'faculty') {
    const course = await Course.findById(submission.course);
    isFaculty = course && course.faculty.toString() === req.user.id;
  }

  if (!isAdmin && !isFaculty) {
    return next(new ErrorResponse('Not authorized to add feedback to this submission', 403));
  }

  // Update feedback
  submission.feedback = feedback;
  submission.gradedBy = req.user.id;
  submission.gradedAt = new Date();

  await submission.save();

  // Populate details for response
  await submission.populate('student', 'name email');
  await submission.populate('assignment', 'title');
  await submission.populate('gradedBy', 'name');

  res.status(200).json({
    success: true,
    data: submission
  });
});

// @desc    Get student's submissions for a course
// @route   GET /api/v1/submissions/student/:studentId/course/:courseId
// @access  Private/Admin, Faculty, or Student Self
exports.getStudentCourseSubmissions = asyncHandler(async (req, res, next) => {
  const { studentId, courseId } = req.params;

  // Validate student
  const student = await User.findById(studentId);
  if (!student || student.role !== 'student') {
    return next(new ErrorResponse('Student not found', 404));
  }

  // Validate course
  const course = await Course.findById(courseId);
  if (!course) {
    return next(new ErrorResponse('Course not found', 404));
  }

  // Check authorization
  const isAdmin = req.user.role === 'admin';
  const isStudentSelf = req.user.role === 'student' && req.user.id === studentId;
  
  let isFaculty = false;
  if (req.user.role === 'faculty') {
    isFaculty = course.faculty.toString() === req.user.id;
  }

  if (!isAdmin && !isStudentSelf && !isFaculty) {
    return next(new ErrorResponse('Not authorized to view these submissions', 403));
  }

  // Get all submissions for this student in this course
  const submissions = await Grade.find({
    student: studentId,
    course: courseId
  })
    .populate('assignment', 'title type dueDate maxPoints weightage')
    .sort('assignment.dueDate');

  // Calculate course statistics
  const gradedSubmissions = submissions.filter(s => s.status === 'graded');
  
  let totalWeightedScore = 0;
  let totalWeight = 0;

  gradedSubmissions.forEach(submission => {
    if (submission.score !== null && submission.assignment) {
      const weight = submission.assignment.weightage || 1;
      const percentage = (submission.score / submission.assignment.maxPoints) * 100;
      totalWeightedScore += percentage * weight;
      totalWeight += weight;
    }
  });

  const currentGrade = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;

  // Get assignment statistics
  const assignments = await Assignment.find({
    course: courseId,
    isPublished: true
  }).select('title type dueDate maxPoints weightage');

  const assignmentStats = await Promise.all(
    assignments.map(async (assignment) => {
      const submission = await Grade.findOne({
        student: studentId,
        assignment: assignment._id
      });

      return {
        assignment: {
          id: assignment._id,
          title: assignment.title,
          type: assignment.type,
          dueDate: assignment.dueDate,
          maxPoints: assignment.maxPoints,
          weightage: assignment.weightage
        },
        submission: submission ? {
          id: submission._id,
          status: submission.status,
          score: submission.score,
          submittedAt: submission.submittedAt,
          isLate: submission.isLate
        } : null,
        status: submission ? submission.status : 'pending'
      };
    })
  );

  res.status(200).json({
    success: true,
    data: {
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        studentId: student.studentId,
        department: student.department
      },
      course: {
        id: course._id,
        title: course.title,
        code: course.code,
        department: course.department
      },
      submissions,
      assignmentStats,
      statistics: {
        totalAssignments: assignments.length,
        submitted: submissions.length,
        graded: gradedSubmissions.length,
        pending: assignments.length - submissions.length,
        currentGrade: Math.round(currentGrade * 100) / 100,
        letterGrade: getLetterGrade(currentGrade)
      }
    }
  });
});

// @desc    Download submission file
// @route   GET /api/v1/submissions/:id/download/:fileId
// @access  Private
exports.downloadSubmissionFile = asyncHandler(async (req, res, next) => {
  const submission = await Grade.findById(req.params.id);

  if (!submission) {
    return next(new ErrorResponse(`Submission not found with id of ${req.params.id}`, 404));
  }

  // Check authorization
  const isAdmin = req.user.role === 'admin';
  const isStudent = req.user.role === 'student' && submission.student.toString() === req.user.id;
  
  let isFaculty = false;
  if (req.user.role === 'faculty') {
    const course = await Course.findById(submission.course);
    isFaculty = course && course.faculty.toString() === req.user.id;
  }

  if (!isAdmin && !isStudent && !isFaculty) {
    return next(new ErrorResponse('Not authorized to download this file', 403));
  }

  // Find the file
  const file = submission.files.find(f => 
    (f._id && f._id.toString() === req.params.fileId) || 
    f.publicId === req.params.fileId
  );

  if (!file) {
    return next(new ErrorResponse('File not found', 404));
  }

  // For Cloudinary files, redirect to the secure URL
  if (file.fileUrl) {
    res.redirect(file.fileUrl);
  } else {
    return next(new ErrorResponse('File URL not available', 404));
  }
});

// @desc    Get submission analytics for student
// @route   GET /api/v1/submissions/analytics/student
// @access  Private/Student
exports.getStudentSubmissionAnalytics = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'student') {
    return next(new ErrorResponse('Only students can access this endpoint', 403));
  }

  // Get all submissions for the student
  const submissions = await Grade.find({ student: req.user.id })
    .populate('assignment', 'title type dueDate maxPoints course')
    .populate('course', 'title code department');

  // Calculate overall statistics
  const totalSubmissions = submissions.length;
  const gradedSubmissions = submissions.filter(s => s.status === 'graded');
  const lateSubmissions = submissions.filter(s => s.isLate);
  const onTimeSubmissions = submissions.filter(s => !s.isLate && s.status !== 'pending');

  // Calculate average score
  const averageScore = gradedSubmissions.length > 0
    ? gradedSubmissions.reduce((sum, s) => sum + s.score, 0) / gradedSubmissions.length
    : 0;

  // Calculate scores by course
  const scoresByCourse = {};
  submissions.forEach(submission => {
    if (submission.course && submission.score !== null) {
      const courseId = submission.course._id.toString();
      if (!scoresByCourse[courseId]) {
        scoresByCourse[courseId] = {
          course: submission.course,
          submissions: [],
          totalScore: 0,
          count: 0
        };
      }
      scoresByCourse[courseId].submissions.push(submission);
      scoresByCourse[courseId].totalScore += submission.score;
      scoresByCourse[courseId].count++;
    }
  });

  // Calculate average by course
  const courseAverages = Object.values(scoresByCourse).map(data => ({
    course: data.course,
    averageScore: Math.round((data.totalScore / data.count) * 100) / 100,
    submissionCount: data.count
  }));

  // Calculate submission timeline (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentSubmissions = submissions.filter(s => 
    new Date(s.submittedAt) >= thirtyDaysAgo
  );

  const submissionTimeline = [];
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);
    
    const count = recentSubmissions.filter(s => 
      new Date(s.submittedAt) >= dayStart && new Date(s.submittedAt) <= dayEnd
    ).length;
    
    submissionTimeline.unshift({
      date: dayStart.toISOString().split('T')[0],
      count
    });
  }

  // Calculate performance by assignment type
  const performanceByType = {};
  gradedSubmissions.forEach(submission => {
    if (submission.assignment && submission.assignment.type) {
      const type = submission.assignment.type;
      if (!performanceByType[type]) {
        performanceByType[type] = {
          count: 0,
          totalScore: 0,
          maxScore: 0
        };
      }
      performanceByType[type].count++;
      performanceByType[type].totalScore += submission.score;
      performanceByType[type].maxScore += submission.assignment.maxPoints;
    }
  });

  const typePerformance = Object.keys(performanceByType).map(type => ({
    type,
    averageScore: Math.round((performanceByType[type].totalScore / performanceByType[type].maxScore) * 10000) / 100,
    count: performanceByType[type].count
  }));

  res.status(200).json({
    success: true,
    data: {
      statistics: {
        totalSubmissions,
        graded: gradedSubmissions.length,
        pending: totalSubmissions - gradedSubmissions.length,
        lateSubmissions: lateSubmissions.length,
        onTimeSubmissions: onTimeSubmissions.length,
        averageScore: Math.round(averageScore * 100) / 100,
        lateSubmissionRate: totalSubmissions > 0 ? Math.round((lateSubmissions.length / totalSubmissions) * 100) : 0
      },
      courseAverages,
      submissionTimeline,
      performanceByType: typePerformance
    }
  });
});

// Helper function for letter grade
function getLetterGrade(percentage) {
  if (percentage >= 90) return 'A';
  if (percentage >= 80) return 'B';
  if (percentage >= 70) return 'C';
  if (percentage >= 60) return 'D';
  return 'F';
}