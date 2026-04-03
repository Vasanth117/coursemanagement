const { Course, Assignment, Enrollment, Grade, User, Resource, Announcement, Notification, Submission, Attendance } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/ErrorResponse');
const { uploadToCloudinary } = require('../config/cloudinary');
const mongoose = require('mongoose');

// @desc    Get faculty dashboard
// @route   GET /api/v1/faculty/dashboard
// @access  Private/Faculty
exports.getDashboard = asyncHandler(async (req, res, next) => {
  const facultyId = req.user.id;

  // Get faculty statistics
  const [
    totalCourses,
    activeCourses,
    totalAssignments,
    totalStudents,
    recentCourses,
    upcomingAssignments,
    pendingSubmissions
  ] = await Promise.all([
    Course.countDocuments({ faculty: facultyId }),
    Course.countDocuments({ faculty: facultyId, isActive: true }),
    Assignment.countDocuments({ createdBy: facultyId }),
    Enrollment.countDocuments({ 
      course: { $in: await Course.find({ faculty: facultyId }).distinct('_id') }
    }),
    Course.find({ faculty: facultyId })
      .sort('-createdAt')
      .limit(5)
      .select('title code enrolledStudents department'),
    Assignment.find({ 
      createdBy: facultyId,
      dueDate: { $gte: new Date() }
    })
      .sort('dueDate')
      .limit(5)
      .populate('course', 'title code'),
    Grade.countDocuments({
      assignment: { $in: await Assignment.find({ createdBy: facultyId }).distinct('_id') },
      status: 'submitted',
      grade: null
    })
  ]);

  res.status(200).json({
    success: true,
    data: {
      counts: {
        totalCourses,
        activeCourses,
        totalAssignments,
        totalStudents,
        pendingSubmissions
      },
      recentCourses,
      upcomingAssignments
    }
  });
});

// @desc    Get faculty courses
// @route   GET /api/v1/faculty/courses
// @access  Private/Faculty
exports.getCourses = asyncHandler(async (req, res, next) => {
  const facultyId = req.user.id;

  // Build query
  let query = Course.find({ faculty: facultyId });

  // Filter by active status
  if (req.query.active) {
    query = query.where('isActive').equals(req.query.active === 'true');
  }

  // Filter by department
  if (req.query.department) {
    query = query.where('department').equals(req.query.department);
  }

  // Filter by semester
  if (req.query.semester) {
    query = query.where('semester').equals(req.query.semester);
  }

  // Filter by year
  if (req.query.year) {
    query = query.where('year').equals(parseInt(req.query.year));
  }

  // Search by title or code
  if (req.query.search) {
    query = query.find({
      $or: [
        { title: { $regex: req.query.search, $options: 'i' } },
        { code: { $regex: req.query.search, $options: 'i' } }
      ]
    });
  }

  // Sort
  const sortBy = req.query.sort || '-createdAt';
  query = query.sort(sortBy);

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const total = await Course.countDocuments(query);

  query = query.skip(startIndex).limit(limit);

  // Populate enrollments count
  query = query.populate({
    path: 'enrolledStudents',
    select: 'name email',
    options: { limit: 5 }
  });

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

// @desc    Get single faculty course
// @route   GET /api/v1/faculty/courses/:id
// @access  Private/Faculty
exports.getFacultyCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findOne({
    _id: req.params.id,
    faculty: req.user.id
  })
    .populate({
      path: 'enrolledStudents',
      select: 'name email studentId department'
    })
    .populate({
      path: 'assignments',
      select: 'title dueDate type maxPoints'
    });

  if (!course) {
    return next(new ErrorResponse('Course not found or not authorized', 404));
  }

  // Get course statistics
  const enrolledCount = course.enrolledStudents.length;
  const assignmentCount = await Assignment.countDocuments({ course: course._id });
  const averageGrade = await Grade.aggregate([
    {
      $match: {
        course: course._id
      }
    },
    {
      $group: {
        _id: null,
        average: { $avg: '$score' }
      }
    }
  ]);

  const courseStats = {
    enrolledCount,
    assignmentCount,
    averageGrade: averageGrade[0] ? averageGrade[0].average : 0,
    enrollmentPercentage: Math.round((enrolledCount / course.maxStudents) * 100)
  };

  res.status(200).json({
    success: true,
    data: {
      course,
      stats: courseStats
    }
  });
});

// @desc    Create course
// @route   POST /api/v1/faculty/courses
// @access  Private/Faculty
exports.createCourse = asyncHandler(async (req, res, next) => {
  // Add faculty ID and createdBy to request body
  req.body.faculty = req.user.id;
  req.body.createdBy = req.user.id;

  // Validate schedule
  if (req.body.schedule) {
    const { startTime, endTime } = req.body.schedule;
    if (startTime && endTime) {
      const start = parseInt(startTime.replace(':', ''));
      const end = parseInt(endTime.replace(':', ''));
      if (end <= start) {
        return next(new ErrorResponse('End time must be after start time', 400));
      }
    }
  }

  // Check if course code already exists
  const existingCourse = await Course.findOne({ code: req.body.code });
  if (existingCourse) {
    return next(new ErrorResponse('Course code already exists', 400));
  }

  // Check if faculty has reached course limit (optional)
  const facultyCourseCount = await Course.countDocuments({ faculty: req.user.id });
  const MAX_COURSES_PER_FACULTY = process.env.MAX_COURSES_PER_FACULTY || 10;
  
  if (facultyCourseCount >= MAX_COURSES_PER_FACULTY) {
    return next(new ErrorResponse(`Cannot create more than ${MAX_COURSES_PER_FACULTY} courses`, 400));
  }

  const course = await Course.create(req.body);

  res.status(201).json({
    success: true,
    data: course
  });
});

// @desc    Update course
// @route   PUT /api/v1/faculty/courses/:id
// @access  Private/Faculty
exports.updateCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.findOne({
    _id: req.params.id,
    faculty: req.user.id
  });

  if (!course) {
    return next(new ErrorResponse('Course not found or not authorized', 404));
  }

  // Check if course is active (some fields shouldn't be updated if course is active)
  if (course.isActive) {
    // Prevent updating certain fields when course is active
    const restrictedFields = ['code', 'credits', 'department'];
    restrictedFields.forEach(field => {
      if (req.body[field] && req.body[field] !== course[field]) {
        return next(new ErrorResponse(`Cannot update ${field} when course is active`, 400));
      }
    });
  }

  // Check if updating course code
  if (req.body.code && req.body.code !== course.code) {
    const existingCourse = await Course.findOne({ code: req.body.code });
    if (existingCourse) {
      return next(new ErrorResponse('Course code already exists', 400));
    }
  }

  // Update course
  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: course
  });
});

// @desc    Delete course
// @route   DELETE /api/v1/faculty/courses/:id
// @access  Private/Faculty
exports.deleteCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findOne({
    _id: req.params.id,
    faculty: req.user.id
  });

  if (!course) {
    return next(new ErrorResponse('Course not found or not authorized', 404));
  }

  // Check if course has enrollments
  const enrollmentCount = await Enrollment.countDocuments({ course: course._id });
  if (enrollmentCount > 0) {
    return next(new ErrorResponse('Cannot delete course with enrolled students', 400));
  }

  // Check if course has assignments
  const assignmentCount = await Assignment.countDocuments({ course: course._id });
  if (assignmentCount > 0) {
    return next(new ErrorResponse('Cannot delete course with assignments. Delete assignments first.', 400));
  }

  await course.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Toggle course active status
// @route   PUT /api/v1/faculty/courses/:id/toggle-active
// @access  Private/Faculty
exports.toggleCourseActive = asyncHandler(async (req, res, next) => {
  const course = await Course.findOne({
    _id: req.params.id,
    faculty: req.user.id
  });

  if (!course) {
    return next(new ErrorResponse('Course not found or not authorized', 404));
  }

  // Cannot deactivate course with upcoming assignments
  if (course.isActive) {
    const upcomingAssignments = await Assignment.countDocuments({
      course: course._id,
      dueDate: { $gte: new Date() }
    });

    if (upcomingAssignments > 0) {
      return next(new ErrorResponse('Cannot deactivate course with upcoming assignments', 400));
    }
  }

  course.isActive = !course.isActive;
  await course.save();

  res.status(200).json({
    success: true,
    data: course
  });
});

// @desc    Get course students
// @route   GET /api/v1/faculty/courses/:id/students
// @access  Private/Faculty
exports.getCourseStudents = asyncHandler(async (req, res, next) => {
  const course = await Course.findOne({
    _id: req.params.id,
    faculty: req.user.id
  });

  if (!course) {
    return next(new ErrorResponse('Course not found or not authorized', 404));
  }

  const students = await User.find({
    _id: { $in: course.enrolledStudents },
    role: 'student'
  })
    .select('name email studentId department phone')
    .sort('name');

  // Get student grades and attendance
  const studentData = await Promise.all(
    students.map(async (student) => {
      const grades = await Grade.find({
        student: student._id,
        course: course._id
      }).select('assignment score maxScore submittedAt');

      const totalScore = grades.reduce((sum, grade) => sum + (grade.score || 0), 0);
      const maxScore = grades.reduce((sum, grade) => sum + (grade.maxScore || 0), 0);
      const averageGrade = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

      return {
        ...student.toObject(),
        grades,
        averageGrade,
        assignmentsSubmitted: grades.length
      };
    })
  );

  res.status(200).json({
    success: true,
    count: studentData.length,
    data: studentData
  });
});

// @desc    Get course assignments
// @route   GET /api/v1/faculty/courses/:id/assignments
// @access  Private/Faculty
exports.getCourseAssignments = asyncHandler(async (req, res, next) => {
  const course = await Course.findOne({
    _id: req.params.id,
    faculty: req.user.id
  });

  if (!course) {
    return next(new ErrorResponse('Course not found or not authorized', 404));
  }

  const assignments = await Assignment.find({ course: course._id })
    .sort('-createdAt')
    .populate({
      path: 'submissions',
      select: 'student submittedAt grade status'
    });

  // Calculate statistics for each assignment
  const assignmentsWithStats = await Promise.all(
    assignments.map(async (assignment) => {
      const submissions = await Grade.countDocuments({ assignment: assignment._id });
      const graded = await Grade.countDocuments({ 
        assignment: assignment._id,
        grade: { $ne: null }
      });
      const averageScore = await Grade.aggregate([
        {
          $match: {
            assignment: assignment._id,
            grade: { $ne: null }
          }
        },
        {
          $group: {
            _id: null,
            average: { $avg: '$score' }
          }
        }
      ]);

      return {
        ...assignment.toObject(),
        stats: {
          submissions,
          graded,
          pending: submissions - graded,
          averageScore: averageScore[0] ? averageScore[0].average : 0
        }
      };
    })
  );

  res.status(200).json({
    success: true,
    count: assignmentsWithStats.length,
    data: assignmentsWithStats
  });
});

// @desc    Create assignment
// @route   POST /api/v1/faculty/assignments
// @access  Private/Faculty
exports.createAssignment = asyncHandler(async (req, res, next) => {
  // Check if course exists and faculty owns it
  const course = await Course.findOne({
    _id: req.body.course,
    faculty: req.user.id
  });

  if (!course) {
    return next(new ErrorResponse('Course not found or not authorized', 404));
  }

  // Check if due date is valid (must be today or in the future)
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Start of today
  if (new Date(req.body.dueDate) < today) {
    return next(new ErrorResponse('Due date cannot be in the past', 400));
  }

  // Handle file upload if present
  if (req.file) {
    try {
      const result = await uploadToCloudinary(req.file.path, {
        folder: `assignments/course_${course._id}`,
        resource_type: 'auto'
      });
      req.body.attachments = [{
        filename: req.file.originalname,
        originalName: req.file.originalname,
        path: result.secure_url,
        size: req.file.size
      }];
    } catch (error) {
      return next(new ErrorResponse('Failed to upload file', 500));
    }
  }

  // Set creator and publish by default
  req.body.createdBy = req.user.id;
  req.body.isPublished = true;

  const assignment = await Assignment.create(req.body);

  // Send notifications and broadcast to enrolled students
  try {
    const studentIds = course.enrolledStudents;
    
    if (studentIds && studentIds.length > 0) {
      // 1. Create notifications in DB
      const notifications = studentIds.map(studentId => ({
        recipient: studentId,
        sender: req.user.id,
        title: 'New Assignment Posted',
        message: `A new assignment "${assignment.title}" has been posted in ${course.code}.`,
        type: 'assignment',
        link: `/student/assignments/${assignment._id}`
      }));
      
      await Notification.insertMany(notifications);
      
      // 2. Broadcast via WebSocket
      const wsService = req.app.get('wsService');
      if (wsService) {
        wsService.broadcastNewAssignment(assignment, studentIds);
      }
    }
  } catch (err) {
    console.error('Error sending assignment notifications:', err);
    // Continue anyway, assignment is already created
  }

  res.status(201).json({
    success: true,
    data: assignment
  });
});

// @desc    Grade submission
// @route   PUT /api/v1/faculty/grades/:id
// @access  Private/Faculty
exports.gradeSubmission = asyncHandler(async (req, res, next) => {
  const { score, feedback } = req.body;

  // Find the submission/grade
  const grade = await Grade.findById(req.params.id)
    .populate('assignment')
    .populate('course')
    .populate('student', 'name email');

  if (!grade) {
    return next(new ErrorResponse('Submission not found', 404));
  }

  // Check if faculty owns the course
  const course = await Course.findOne({
    _id: grade.course._id,
    faculty: req.user.id
  });

  if (!course) {
    return next(new ErrorResponse('Not authorized to grade this submission', 403));
  }

  // Validate score
  if (score < 0 || score > grade.assignment.maxPoints) {
    return next(new ErrorResponse(`Score must be between 0 and ${grade.assignment.maxPoints}`, 400));
  }

  // Update grade
  grade.score = score;
  grade.feedback = feedback;
  grade.gradedBy = req.user.id;
  grade.gradedAt = new Date();
  grade.status = 'graded';

  await grade.save();

  res.status(200).json({
    success: true,
    data: grade
  });
});

// @desc    Get assignment submissions
// @route   GET /api/v1/faculty/assignments/:id/submissions
// @access  Private/Faculty
exports.getAssignmentSubmissions = asyncHandler(async (req, res, next) => {
  const assignment = await Assignment.findById(req.params.id)
    .populate('course');

  if (!assignment) {
    return next(new ErrorResponse('Assignment not found', 404));
  }

  // Check if faculty owns the course
  const course = await Course.findOne({
    _id: assignment.course._id,
    faculty: req.user.id
  });

  if (!course) {
    return next(new ErrorResponse('Not authorized to view these submissions', 403));
  }

  // Get all submissions for this assignment
  const submissions = await Grade.find({ assignment: assignment._id })
    .populate('student', 'name email studentId')
    .sort('submittedAt');

  // Calculate statistics
  const totalStudents = course.enrolledStudents.length;
  const submittedCount = submissions.length;
  const gradedCount = submissions.filter(s => s.status === 'graded').length;
  const averageScore = submissions.length > 0
    ? submissions.reduce((sum, s) => sum + (s.score || 0), 0) / submissions.length
    : 0;

  res.status(200).json({
    success: true,
    data: {
      assignment: {
        id: assignment._id,
        title: assignment.title,
        maxPoints: assignment.maxPoints,
        dueDate: assignment.dueDate
      },
      stats: {
        totalStudents,
        submittedCount,
        notSubmitted: totalStudents - submittedCount,
        gradedCount,
        pendingGrading: submittedCount - gradedCount,
        averageScore: Math.round(averageScore * 100) / 100
      },
      submissions
    }
  });
});

// @desc    Create announcement
// @route   POST /api/v1/faculty/announcements
// @access  Private/Faculty
exports.createAnnouncement = asyncHandler(async (req, res, next) => {
  const { course, title, content, priority } = req.body;

  // Check if course exists and faculty owns it
  const courseExists = await Course.findOne({
    _id: course,
    faculty: req.user.id
  });

  if (!courseExists) {
    return next(new ErrorResponse('Course not found or not authorized', 404));
  }

  const announcement = await Announcement.create({
    course,
    title,
    content,
    priority: priority || 'normal',
    createdBy: req.user.id
  });

  // Populate course and creator details
  await announcement.populate('course', 'title code');
  await announcement.populate('createdBy', 'name');

  res.status(201).json({
    success: true,
    data: announcement
  });
});

// @desc    Upload course resource
// @route   POST /api/v1/faculty/courses/:id/resources
// @access  Private/Faculty
exports.uploadResource = asyncHandler(async (req, res, next) => {
  console.log('--- Upload Resource Debug ---');
  console.log('Request Params:', req.params);
  console.log('Request Body:', req.body);
  console.log('Files received:', req.files?.length || 0);
  
  const { title, description, type } = req.body;
  const courseId = req.body.course || req.params.id;
  console.log('Detected Course ID:', courseId);

  if (!courseId || !title) {
    console.error('Validation failed: Course ID or Title missing');
    return next(new ErrorResponse('Please provide course ID and title', 400));
  }

  // Check if course exists and faculty owns it
  const course = await Course.findOne({
    _id: courseId,
    faculty: req.user.id
  });

  if (!course) {
    console.error(`Authorization failed: Course ${courseId} not found for faculty ${req.user.id}`);
    return next(new ErrorResponse('Course not found or not authorized', 404));
  }

  // Check if files are uploaded
  if (!req.files || req.files.length === 0) {
    console.error('Validation failed: No files uploaded');
    return next(new ErrorResponse('Please upload at least one file', 400));
  }

  // Upload all files to Cloudinary
  const uploadedFiles = [];
  for (const file of req.files) {
    try {
      const uploadResult = await uploadToCloudinary(file.path, {
        folder: `resources/course_${courseId}`,
        resource_type: 'auto'
      });
      
      uploadedFiles.push({
        name: file.originalname,
        url: uploadResult.secure_url,
        size: file.size,
        mimeType: file.mimetype,
        publicId: uploadResult.public_id,
        uploadedAt: new Date()
      });
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      return next(new ErrorResponse(`Failed to upload file: ${file.originalname}`, 500));
    }
  }

  if (uploadedFiles.length === 0) {
    return next(new ErrorResponse('Failed to upload any files', 500));
  }

  // Create resource record
  const resource = await Resource.create({
    course: courseId,
    title,
    description,
    type: type || 'document',
    files: uploadedFiles,
    // Add single file fields for backward compatibility
    fileUrl: uploadedFiles[0].url,
    fileName: uploadedFiles[0].name,
    fileSize: uploadedFiles[0].size,
    mimeType: uploadedFiles[0].mimeType,
    publicId: uploadedFiles[0].publicId,
    uploadedBy: req.user.id
  });

  // Create notifications for enrolled students
  try {
    const students = course.enrolledStudents || [];
    if (students.length > 0) {
      const notifications = students.map(studentId => ({
        recipient: studentId,
        sender: req.user.id,
        title: 'New Course Resource',
        message: `A new resource "${title}" has been uploaded to ${course.title}`,
        type: 'info',
        link: `/student/courses/${courseId}/resources`
      }));
      await Notification.insertMany(notifications);
    }
  } catch (error) {
    console.error('Failed to create notifications for resource upload:', error);
    // Don't fail the request if notifications fail
  }

  res.status(201).json({
    success: true,
    data: resource
  });
});

// @desc    Get faculty gradebook
// @route   GET /api/v1/faculty/gradebook
// @access  Private/Faculty
exports.getGrades = asyncHandler(async (req, res, next) => {
  const facultyId = req.user.id;

  // Get all courses taught by faculty
  const courses = await Course.find({ faculty: facultyId, isActive: true })
    .select('title code department semester year');

  // Get grades for all courses
  const gradebook = await Promise.all(
    courses.map(async (course) => {
      // Get all students enrolled in this course
      const students = await User.find({
        _id: { $in: course.enrolledStudents },
        role: 'student'
      }).select('name email studentId');

      // Get all assignments for this course
      const assignments = await Assignment.find({ course: course._id })
        .select('title type dueDate maxPoints weightage');

      // Get grades for each student
      const studentGrades = await Promise.all(
        students.map(async (student) => {
          const grades = await Grade.find({
            student: student._id,
            course: course._id
          }).select('assignment score maxScore');

          // Calculate weighted average
          let totalWeightedScore = 0;
          let totalWeight = 0;

          grades.forEach(grade => {
            const assignment = assignments.find(a => a._id.equals(grade.assignment));
            if (assignment && grade.score !== null && grade.score !== undefined) {
              const weight = assignment.weightage || 0;
              const percentage = (grade.score / grade.maxScore) * 100;
              totalWeightedScore += percentage * weight;
              totalWeight += weight;
            }
          });

          const finalGrade = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;

          return {
            student: {
              id: student._id,
              name: student.name,
              email: student.email,
              studentId: student.studentId
            },
            grades: grades.map(grade => ({
              assignment: grade.assignment,
              score: grade.score,
              maxScore: grade.maxScore,
              percentage: grade.maxScore > 0 ? (grade.score / grade.maxScore) * 100 : 0
            })),
            finalGrade: Math.round(finalGrade * 100) / 100,
            letterGrade: getLetterGrade(finalGrade)
          };
        })
      );

      return {
        course: {
          id: course._id,
          title: course.title,
          code: course.code,
          department: course.department,
          semester: course.semester,
          year: course.year
        },
        assignments,
        studentGrades
      };
    })
  );

  res.status(200).json({
    success: true,
    data: gradebook
  });
});

// Helper function to get letter grade
function getLetterGrade(percentage) {
  if (percentage >= 90) return 'A';
  if (percentage >= 80) return 'B';
  if (percentage >= 70) return 'C';
  if (percentage >= 60) return 'D';
  return 'F';
}

// @desc    Export gradebook to CSV
// @route   GET /api/v1/faculty/gradebook/export
// @access  Private/Faculty
exports.exportGradebook = asyncHandler(async (req, res, next) => {
  const { courseId } = req.query;
  const facultyId = req.user.id;

  // Validate course ownership
  if (courseId) {
    const course = await Course.findOne({
      _id: courseId,
      faculty: facultyId
    });

    if (!course) {
      return next(new ErrorResponse('Course not found or not authorized', 404));
    }
  }

  // Get courses to export
  const query = courseId 
    ? { _id: courseId, faculty: facultyId }
    : { faculty: facultyId, isActive: true };
  
  const courses = await Course.find(query)
    .select('title code')
    .populate({
      path: 'enrolledStudents',
      select: 'name email studentId',
      match: { role: 'student' }
    });

  // Generate CSV data
  let csvData = 'Course,Student Name,Student ID,Email,Assignment,Score,Max Score,Percentage,Grade\n';

  for (const course of courses) {
    const assignments = await Assignment.find({ course: course._id })
      .select('title maxPoints');

    for (const student of course.enrolledStudents) {
      for (const assignment of assignments) {
        const grade = await Grade.findOne({
          student: student._id,
          course: course._id,
          assignment: assignment._id
        });

        const score = grade ? grade.score || 0 : 0;
        const maxScore = assignment.maxPoints;
        const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
        const letterGrade = getLetterGrade(percentage);

        csvData += `"${course.title}","${student.name}","${student.studentId}","${student.email}","${assignment.title}",${score},${maxScore},${percentage.toFixed(2)},${letterGrade}\n`;
      }
    }
  }

  // Set response headers for CSV download
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=gradebook.csv');

  res.status(200).send(csvData);
});

// @desc    Get faculty students
// @route   GET /api/v1/faculty/students
// @access  Private/Faculty
exports.getStudents = asyncHandler(async (req, res, next) => {
  const facultyId = req.user.id;
  
  const courses = await Course.find({ faculty: facultyId })
    .populate('enrolledStudents', 'name email studentId department')
    .select('title code enrolledStudents');
  
  const allStudents = [];
  courses.forEach(course => {
    course.enrolledStudents.forEach(student => {
      if (!allStudents.find(s => s._id.equals(student._id))) {
        allStudents.push({
          ...student.toObject(),
          courses: [{ id: course._id, title: course.title, code: course.code }]
        });
      } else {
        const existingStudent = allStudents.find(s => s._id.equals(student._id));
        existingStudent.courses.push({ id: course._id, title: course.title, code: course.code });
      }
    });
  });
  
  res.status(200).json({
    success: true,
    count: allStudents.length,
    data: allStudents
  });
});

// @desc    Get single student details for faculty
// @route   GET /api/v1/faculty/students/:id
// @access  Private/Faculty
exports.getStudentById = asyncHandler(async (req, res, next) => {
  const facultyId = req.user.id;
  const studentId = req.params.id;

  // Check if student exists and is a student
  const student = await User.findById(studentId).select('name email role studentId department phone bio profileImage');
  
  if (!student || student.role !== 'student') {
    return next(new ErrorResponse('Student not found', 404));
  }

  // Get courses where THIS faculty teaches and THIS student is enrolled
  const courses = await Course.find({ 
    faculty: facultyId,
    enrolledStudents: studentId 
  }).select('title code department semester year');

  if (courses.length === 0) {
    return next(new ErrorResponse('Not authorized to view this student details', 403));
  }

  const courseIds = courses.map(c => c._id);

  // Get student performance in these courses
  const coursePerformance = await Promise.all(courses.map(async (course) => {
    const grades = await Grade.find({
      student: studentId,
      course: course._id
    }).populate('assignment', 'title maxPoints type weightage');

    const totalScore = grades.reduce((sum, g) => sum + (g.score || 0), 0);
    const totalMax = grades.reduce((sum, g) => sum + (g.maxScore || 0), 0);
    const average = totalMax > 0 ? (totalScore / totalMax) * 100 : 0;

    return {
      courseId: course._id,
      courseTitle: course.title,
      courseCode: course.code,
      average: Math.round(average * 100) / 100,
      gradeCount: grades.length,
      grades
    };
  }));

  // Aggregate all assignments from these courses
  const allGrades = await Grade.find({
    student: studentId,
    course: { $in: courseIds }
  }).populate('assignment', 'title maxPoints type')
    .populate('course', 'title code');

  const assignmentsList = allGrades.map(g => ({
    _id: g._id,
    title: g.assignment?.title || 'Unknown Assignment',
    course: g.course?.code || 'N/A',
    submittedAt: g.submittedAt,
    grade: g.score,
    totalMarks: g.maxScore || g.assignment?.maxPoints || 100,
    status: g.status
  }));

  // Get attendance records
  const attendanceRecords = await Attendance.find({
    student: studentId,
    course: { $in: courseIds }
  }).populate('course', 'title code').sort('-date');

  const attendanceList = attendanceRecords.map(a => ({
    course: a.course?.code || 'N/A',
    date: a.date,
    status: a.status
  }));

  // Calculate summary stats
  const totalAssignments = await Assignment.countDocuments({ course: { $in: courseIds } });
  const completedAssignments = assignmentsList.length;
  const assignmentCompletion = totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0;

  const totalPossibleClasses = attendanceRecords.length;
  const presentClasses = attendanceRecords.filter(a => ['present', 'late'].includes(a.status)).length;
  const attendanceRate = totalPossibleClasses > 0 ? Math.round((presentClasses / totalPossibleClasses) * 100) : 0;

  const averageGrade = coursePerformance.length > 0 
    ? Math.round(coursePerformance.reduce((sum, cp) => sum + cp.average, 0) / coursePerformance.length)
    : 0;

  const performanceSummary = {
    averageGrade: averageGrade + '%',
    totalAssignments,
    completedAssignments,
    assignmentCompletion,
    attendanceRate,
    overallProgress: Math.round((assignmentCompletion + attendanceRate) / 2),
    assignments: assignmentsList,
    attendance: attendanceList
  };

  res.status(200).json({
    success: true,
    data: {
      ...student.toObject(),
      enrolledCourses: courses,
      coursePerformance,
      performance: performanceSummary
    }
  });
});

// @desc    Get faculty assignments
// @route   GET /api/v1/faculty/assignments
// @access  Private/Faculty
exports.getAssignments = asyncHandler(async (req, res, next) => {
  const facultyId = req.user.id;
  
  const assignments = await Assignment.find({ createdBy: facultyId })
    .populate('course', 'title code')
    .sort('-createdAt');
  
  res.status(200).json({
    success: true,
    count: assignments.length,
    data: assignments
  });
});

// @desc    Get faculty submissions
// @route   GET /api/v1/faculty/submissions
// @access  Private/Faculty
exports.getSubmissions = asyncHandler(async (req, res, next) => {
  const facultyId = req.user.id;
  
  const assignments = await Assignment.find({ createdBy: facultyId }).select('_id');
  const assignmentIds = assignments.map(a => a._id);
  
  const submissions = await Grade.find({ 
    assignment: { $in: assignmentIds },
    status: 'submitted'
  })
    .populate('student', 'name email studentId')
    .populate('assignment', 'title dueDate maxPoints')
    .populate('course', 'title code')
    .sort('-submittedAt');
  
  res.status(200).json({
    success: true,
    count: submissions.length,
    data: submissions
  });
});

// @desc    Update faculty profile
// @route   PUT /api/v1/faculty/profile
// @access  Private/Faculty
exports.updateProfile = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    phone: req.body.phone,
    bio: req.body.bio,
    office: req.body.office,
    officeHours: req.body.officeHours
  };
  
  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  }).select('-password');
  
  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Get faculty analytics
// @route   GET /api/v1/faculty/analytics
// @access  Private/Faculty
exports.getAnalytics = asyncHandler(async (req, res, next) => {
  const facultyId = req.user.id;
  
  const courses = await Course.find({ faculty: facultyId });
  const courseIds = courses.map(c => c._id);
  
  const analytics = {
    totalCourses: courses.length,
    activeCourses: courses.filter(c => c.isActive).length,
    totalStudents: courses.reduce((sum, c) => sum + c.enrolledStudents.length, 0),
    averageEnrollment: courses.length > 0 ? 
      courses.reduce((sum, c) => sum + c.enrolledStudents.length, 0) / courses.length : 0
  };
  
  res.status(200).json({
    success: true,
    data: analytics
  });
});