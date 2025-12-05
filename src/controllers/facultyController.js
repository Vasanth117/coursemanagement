const { Course, Assignment, Enrollment, Grade, User, Resource, Announcement } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/ErrorResponse');
const { uploadToCloudinary } = require('../config/cloudinary');

// @desc    Get faculty dashboard
// @route   GET /api/v1/faculty/dashboard
// @access  Private/Faculty
exports.getFacultyDashboard = asyncHandler(async (req, res, next) => {
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
exports.getFacultyCourses = asyncHandler(async (req, res, next) => {
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
      select: 'title dueDate type maxPoints submissionCount'
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
  // Add faculty ID to request body
  req.body.faculty = req.user.id;

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

  await course.remove();

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

  // Check if due date is in the future
  if (new Date(req.body.dueDate) <= new Date()) {
    return next(new ErrorResponse('Due date must be in the future', 400));
  }

  // Handle file upload if present
  if (req.file) {
    try {
      const result = await uploadToCloudinary(req.file.path, {
        folder: `assignments/course_${course._id}`,
        resource_type: 'auto'
      });
      req.body.attachments = [{
        fileName: req.file.originalname,
        fileUrl: result.secure_url,
        fileSize: req.file.size,
        publicId: result.public_id
      }];
    } catch (error) {
      return next(new ErrorResponse('Failed to upload file', 500));
    }
  }

  // Set creator
  req.body.createdBy = req.user.id;

  const assignment = await Assignment.create(req.body);

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
// @route   POST /api/v1/faculty/resources
// @access  Private/Faculty
exports.uploadResource = asyncHandler(async (req, res, next) => {
  const { course, title, description, type } = req.body;

  // Check if course exists and faculty owns it
  const courseExists = await Course.findOne({
    _id: course,
    faculty: req.user.id
  });

  if (!courseExists) {
    return next(new ErrorResponse('Course not found or not authorized', 404));
  }

  // Check if file is uploaded
  if (!req.file) {
    return next(new ErrorResponse('Please upload a file', 400));
  }

  // Upload to Cloudinary
  let uploadResult;
  try {
    uploadResult = await uploadToCloudinary(req.file.path, {
      folder: `resources/course_${course}`,
      resource_type: 'auto'
    });
  } catch (error) {
    return next(new ErrorResponse('Failed to upload file', 500));
  }

  // Create resource record
  const resource = await Resource.create({
    course,
    title,
    description,
    type: type || 'document',
    fileUrl: uploadResult.secure_url,
    fileName: req.file.originalname,
    fileSize: req.file.size,
    mimeType: req.file.mimetype,
    publicId: uploadResult.public_id,
    uploadedBy: req.user.id
  });

  res.status(201).json({
    success: true,
    data: resource
  });
});

// @desc    Get faculty gradebook
// @route   GET /api/v1/faculty/gradebook
// @access  Private/Faculty
exports.getGradebook = asyncHandler(async (req, res, next) => {
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