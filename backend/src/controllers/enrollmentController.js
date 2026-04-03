// Enrollment controller 
const { Enrollment, Course, User, Grade } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/ErrorResponse');
const mongoose = require('mongoose');

// @desc    Get faculty enrollments
// @route   GET /api/v1/faculty/:facultyId/enrollments
// @access  Private/Faculty or Admin
exports.getFacultyEnrollments = asyncHandler(async (req, res, next) => {
  const { facultyId } = req.params;

  // Check authorization
  const isAdmin = req.user.role === 'admin';
  const isFacultySelf = req.user.role === 'faculty' && req.user.id === facultyId;

  if (!isAdmin && !isFacultySelf) {
    return next(new ErrorResponse('Not authorized', 403));
  }

  // Get faculty courses
  const facultyCourses = await Course.find({ faculty: facultyId }).distinct('_id');

  // Get enrollments for faculty courses
  const enrollments = await Enrollment.find({ 
    course: { $in: facultyCourses } 
  })
    .populate('student', 'name email studentId')
    .populate('course', 'title code')
    .sort('-enrolledAt')
    .limit(50);

  // Get total enrollments count
  const totalEnrollments = await Enrollment.countDocuments({
    course: { $in: facultyCourses }
  });

  // Get today's enrollments
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayEnrollments = await Enrollment.countDocuments({
    course: { $in: facultyCourses },
    enrolledAt: { $gte: today, $lt: tomorrow }
  });

  res.status(200).json({
    success: true,
    data: {
      enrollments,
      total: totalEnrollments,
      today: todayEnrollments
    }
  });
});

// @desc    Get enrollment statistics
// @route   GET /api/v1/enrollments/stats
// @access  Private/Admin or Faculty
exports.getEnrollmentStats = asyncHandler(async (req, res, next) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Get total enrollments
  const total = await Enrollment.countDocuments();
  
  // Get enrollments by status
  const statusStats = await Enrollment.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  // Get today's enrollments
  const todayEnrollments = await Enrollment.countDocuments({
    enrolledAt: { $gte: today, $lt: tomorrow }
  });

  // Format status stats
  const stats = statusStats.reduce((acc, stat) => {
    acc[stat._id] = stat.count;
    return acc;
  }, {});

  res.status(200).json({
    success: true,
    data: {
      total,
      enrolled: stats.enrolled || 0,
      pending: stats.pending || 0,
      completed: stats.completed || 0,
      dropped: stats.dropped || 0,
      rejected: stats.rejected || 0,
      today: todayEnrollments
    }
  });
});

// @desc    Get all enrollments
// @route   GET /api/v1/enrollments
// @access  Private/Admin
exports.getEnrollments = asyncHandler(async (req, res, next) => {
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
  query = Enrollment.find(JSON.parse(queryStr));

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
    query = query.sort('-enrolledAt');
  }

  // Populate student and course details
  query = query
    .populate('student', 'name email studentId department')
    .populate('course', 'title code department faculty')
    .populate({
      path: 'course',
      populate: {
        path: 'faculty',
        select: 'name'
      }
    });

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const total = await Enrollment.countDocuments(JSON.parse(queryStr));

  query = query.skip(startIndex).limit(limit);

  const enrollments = await query;

  res.status(200).json({
    success: true,
    count: enrollments.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    data: enrollments
  });
});

// @desc    Get single enrollment
// @route   GET /api/v1/enrollments/:id
// @access  Private/Admin or Related User
exports.getEnrollment = asyncHandler(async (req, res, next) => {
  const enrollment = await Enrollment.findById(req.params.id)
    .populate('student', 'name email studentId department phone')
    .populate('course', 'title code department credits faculty schedule')
    .populate({
      path: 'course',
      populate: {
        path: 'faculty',
        select: 'name email phone'
      }
    });

  if (!enrollment) {
    return next(new ErrorResponse(`Enrollment not found with id of ${req.params.id}`, 404));
  }

  // Check authorization
  const isAdmin = req.user.role === 'admin';
  const isStudent = req.user.role === 'student' && enrollment.student._id.toString() === req.user.id;
  const isFaculty = req.user.role === 'faculty' && enrollment.course.faculty._id.toString() === req.user.id;

  if (!isAdmin && !isStudent && !isFaculty) {
    return next(new ErrorResponse('Not authorized to view this enrollment', 403));
  }

  // Get grades for this enrollment
  const grades = await Grade.find({
    student: enrollment.student._id,
    course: enrollment.course._id
  })
    .populate('assignment', 'title type dueDate maxPoints weightage')
    .sort('assignment.dueDate');

  // Calculate final grade
  let totalWeightedScore = 0;
  let totalWeight = 0;

  grades.forEach(grade => {
    if (grade.score !== null && grade.assignment) {
      const weight = grade.assignment.weightage || 1;
      const percentage = (grade.score / grade.assignment.maxPoints) * 100;
      totalWeightedScore += percentage * weight;
      totalWeight += weight;
    }
  });

  const finalGrade = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;

  res.status(200).json({
    success: true,
    data: {
      enrollment,
      grades,
      finalGrade: Math.round(finalGrade * 100) / 100,
      letterGrade: getLetterGrade(finalGrade)
    }
  });
});

// @desc    Create enrollment (Admin only)
// @route   POST /api/v1/enrollments
// @access  Private/Admin
exports.createEnrollment = asyncHandler(async (req, res, next) => {
  const { student, course, status = 'enrolled' } = req.body;

  // Validate student
  const studentUser = await User.findById(student);
  if (!studentUser || studentUser.role !== 'student') {
    return next(new ErrorResponse('Student ID must belong to a student', 400));
  }

  // Validate course
  const courseObj = await Course.findById(course);
  if (!courseObj) {
    return next(new ErrorResponse('Course not found', 404));
  }

  if (!courseObj.isActive) {
    return next(new ErrorResponse('Course is not active', 400));
  }

  // Check if course is full
  if (courseObj.enrolledStudents.length >= courseObj.maxStudents) {
    return next(new ErrorResponse('Course is full', 400));
  }

  // Check if already enrolled
  const existingEnrollment = await Enrollment.findOne({ student, course });
  if (existingEnrollment) {
    return next(new ErrorResponse('Student is already enrolled in this course', 400));
  }

  // Check prerequisites if any
  if (courseObj.prerequisites && courseObj.prerequisites.length > 0) {
    const completedCourses = await Enrollment.find({
      student,
      course: { $in: courseObj.prerequisites },
      status: 'completed'
    });

    if (completedCourses.length < courseObj.prerequisites.length) {
      return next(new ErrorResponse('Prerequisites not met', 400));
    }
  }

  // Create enrollment
  const enrollment = await Enrollment.create({
    student,
    course,
    enrolledAt: new Date(),
    status,
    enrolledBy: req.user.id
  });

  // Add student to course's enrolled students list if enrolled (not pending)
  if (status === 'enrolled') {
    courseObj.enrolledStudents.push(student);
    await courseObj.save();
  }

  // Populate details
  await enrollment.populate('student', 'name email studentId');
  await enrollment.populate('course', 'title code department');
  await enrollment.populate('enrolledBy', 'name');

  // Send real-time update
  const wsService = req.app.get('wsService');
  if (wsService) {
    wsService.broadcastEnrollmentUpdate(enrollment);
  }

  res.status(201).json({
    success: true,
    data: enrollment
  });
});

// @desc    Update enrollment
// @route   PUT /api/v1/enrollments/:id
// @access  Private/Admin or Course Faculty
exports.updateEnrollment = asyncHandler(async (req, res, next) => {
  let enrollment = await Enrollment.findById(req.params.id)
    .populate('course', 'faculty');

  if (!enrollment) {
    return next(new ErrorResponse(`Enrollment not found with id of ${req.params.id}`, 404));
  }

  // Check authorization
  const isAdmin = req.user.role === 'admin';
  const isFaculty = req.user.role === 'faculty' && enrollment.course.faculty.toString() === req.user.id;

  if (!isAdmin && !isFaculty) {
    return next(new ErrorResponse('Not authorized to update this enrollment', 403));
  }

  // Handle status changes
  if (req.body.status && req.body.status !== enrollment.status) {
    // If changing from pending to enrolled
    if (enrollment.status === 'pending' && req.body.status === 'enrolled') {
      const course = await Course.findById(enrollment.course);
      if (course.enrolledStudents.length >= course.maxStudents) {
        return next(new ErrorResponse('Course is full', 400));
      }
      
      // Add student to course
      course.enrolledStudents.push(enrollment.student);
      await course.save();
    }
    
    // If changing from enrolled to completed/dropped
    else if (enrollment.status === 'enrolled' && (req.body.status === 'completed' || req.body.status === 'dropped')) {
      // Calculate final grade if completing
      if (req.body.status === 'completed' && req.body.grade) {
        enrollment.grade = req.body.grade;
        enrollment.completedAt = new Date();
      }
      
      // Remove student from course if dropping
      if (req.body.status === 'dropped') {
        const course = await Course.findById(enrollment.course);
        course.enrolledStudents = course.enrolledStudents.filter(
          studentId => studentId.toString() !== enrollment.student.toString()
        );
        await course.save();
      }
    }
  }

  // Update enrollment
  enrollment = await Enrollment.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  })
    .populate('student', 'name email studentId')
    .populate('course', 'title code department')
    .populate('enrolledBy', 'name');

  res.status(200).json({
    success: true,
    data: enrollment
  });
});

// @desc    Delete enrollment
// @route   DELETE /api/v1/enrollments/:id
// @access  Private/Admin
exports.deleteEnrollment = asyncHandler(async (req, res, next) => {
  const enrollment = await Enrollment.findById(req.params.id)
    .populate('course');

  if (!enrollment) {
    return next(new ErrorResponse(`Enrollment not found with id of ${req.params.id}`, 404));
  }

  // Remove student from course's enrolled students list if enrolled
  if (enrollment.status === 'enrolled' && enrollment.course) {
    const course = await Course.findById(enrollment.course._id);
    if (course) {
      course.enrolledStudents = course.enrolledStudents.filter(
        studentId => studentId.toString() !== enrollment.student.toString()
      );
      await course.save();
    }
  }

  // Delete all related grades/submissions
  await Grade.deleteMany({
    student: enrollment.student,
    course: enrollment.course
  });

  await enrollment.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get pending enrollment requests
// @route   GET /api/v1/enrollments/pending
// @access  Private/Admin or Faculty
exports.getPendingEnrollments = asyncHandler(async (req, res, next) => {
  let query = Enrollment.find({ status: 'pending' });

  // For faculty, only show their courses
  if (req.user.role === 'faculty') {
    const facultyCourses = await Course.find({ faculty: req.user.id }).distinct('_id');
    query = query.where('course').in(facultyCourses);
  }

  // Sort
  query = query.sort('-enrolledAt');

  // Populate details
  query = query
    .populate('student', 'name email studentId department')
    .populate('course', 'title code department faculty')
    .populate({
      path: 'course',
      populate: {
        path: 'faculty',
        select: 'name'
      }
    });

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const startIndex = (page - 1) * limit;
  const total = await Enrollment.countDocuments({ status: 'pending' });

  query = query.skip(startIndex).limit(limit);

  const pendingEnrollments = await query;

  res.status(200).json({
    success: true,
    count: pendingEnrollments.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    data: pendingEnrollments
  });
});

// @desc    Approve enrollment request
// @route   PUT /api/v1/enrollments/:id/approve
// @access  Private/Admin or Course Faculty
exports.approveEnrollment = asyncHandler(async (req, res, next) => {
  const enrollment = await Enrollment.findById(req.params.id)
    .populate('course', 'faculty enrolledStudents maxStudents');

  if (!enrollment) {
    return next(new ErrorResponse(`Enrollment not found with id of ${req.params.id}`, 404));
  }

  if (enrollment.status !== 'pending') {
    return next(new ErrorResponse('Enrollment is not pending', 400));
  }

  // Check authorization
  const isAdmin = req.user.role === 'admin';
  const isFaculty = req.user.role === 'faculty' && enrollment.course.faculty.toString() === req.user.id;

  if (!isAdmin && !isFaculty) {
    return next(new ErrorResponse('Not authorized to approve this enrollment', 403));
  }

  // Check if course is full
  if (enrollment.course.enrolledStudents.length >= enrollment.course.maxStudents) {
    return next(new ErrorResponse('Course is full', 400));
  }

  // Approve enrollment
  enrollment.status = 'enrolled';
  enrollment.approvedBy = req.user.id;
  enrollment.approvedAt = new Date();
  await enrollment.save();

  // Add student to course
  enrollment.course.enrolledStudents.push(enrollment.student);
  await enrollment.course.save();

  // Populate details for response
  await enrollment.populate('student', 'name email studentId');
  await enrollment.populate('course', 'title code department');
  await enrollment.populate('approvedBy', 'name');

  res.status(200).json({
    success: true,
    message: 'Enrollment approved successfully',
    data: enrollment
  });
});

// @desc    Reject enrollment request
// @route   PUT /api/v1/enrollments/:id/reject
// @access  Private/Admin or Course Faculty
exports.rejectEnrollment = asyncHandler(async (req, res, next) => {
  const enrollment = await Enrollment.findById(req.params.id)
    .populate('course', 'faculty');

  if (!enrollment) {
    return next(new ErrorResponse(`Enrollment not found with id of ${req.params.id}`, 404));
  }

  if (enrollment.status !== 'pending') {
    return next(new ErrorResponse('Enrollment is not pending', 400));
  }

  // Check authorization
  const isAdmin = req.user.role === 'admin';
  const isFaculty = req.user.role === 'faculty' && enrollment.course.faculty.toString() === req.user.id;

  if (!isAdmin && !isFaculty) {
    return next(new ErrorResponse('Not authorized to reject this enrollment', 403));
  }

  // Reject enrollment
  enrollment.status = 'rejected';
  enrollment.rejectedBy = req.user.id;
  enrollment.rejectedAt = new Date();
  enrollment.rejectionReason = req.body.reason;
  await enrollment.save();

  // Populate details for response
  await enrollment.populate('student', 'name email studentId');
  await enrollment.populate('course', 'title code department');
  await enrollment.populate('rejectedBy', 'name');

  res.status(200).json({
    success: true,
    message: 'Enrollment rejected successfully',
    data: enrollment
  });
});

// @desc    Bulk enroll students
// @route   POST /api/v1/enrollments/bulk
// @access  Private/Admin
exports.bulkEnroll = asyncHandler(async (req, res, next) => {
  const { course, students, status = 'enrolled' } = req.body;

  if (!course || !students || !Array.isArray(students) || students.length === 0) {
    return next(new ErrorResponse('Please provide course ID and array of student IDs', 400));
  }

  // Validate course
  const courseObj = await Course.findById(course);
  if (!courseObj) {
    return next(new ErrorResponse('Course not found', 404));
  }

  if (!courseObj.isActive) {
    return next(new ErrorResponse('Course is not active', 400));
  }

  // Check course capacity
  const availableSeats = courseObj.maxStudents - courseObj.enrolledStudents.length;
  if (students.length > availableSeats) {
    return next(new ErrorResponse(`Only ${availableSeats} seats available`, 400));
  }

  const results = {
    success: [],
    errors: []
  };

  // Process each student
  for (const studentId of students) {
    try {
      // Validate student
      const student = await User.findById(studentId);
      if (!student || student.role !== 'student') {
        results.errors.push({
          studentId,
          error: 'Not a valid student'
        });
        continue;
      }

      // Check if already enrolled
      const existingEnrollment = await Enrollment.findOne({ student: studentId, course });
      if (existingEnrollment) {
        results.errors.push({
          studentId,
          error: 'Already enrolled in this course'
        });
        continue;
      }

      // Create enrollment
      const enrollment = await Enrollment.create({
        student: studentId,
        course,
        enrolledAt: new Date(),
        status,
        enrolledBy: req.user.id
      });

      // Add to course if enrolled (not pending)
      if (status === 'enrolled') {
        courseObj.enrolledStudents.push(studentId);
      }

      results.success.push({
        studentId,
        enrollmentId: enrollment._id,
        status
      });
    } catch (error) {
      results.errors.push({
        studentId,
        error: error.message
      });
    }
  }

  // Save course updates
  if (status === 'enrolled') {
    await courseObj.save();
  }

  res.status(200).json({
    success: true,
    data: results,
    summary: {
      total: students.length,
      success: results.success.length,
      errors: results.errors.length
    }
  });
});

// @desc    Get student's course enrollments
// @route   GET /api/v1/enrollments/student/:studentId
// @access  Private/Admin or Student Self
exports.getStudentEnrollments = asyncHandler(async (req, res, next) => {
  const { studentId } = req.params;

  // Check authorization
  const isAdmin = req.user.role === 'admin';
  const isStudentSelf = req.user.role === 'student' && req.user.id === studentId;

  if (!isAdmin && !isStudentSelf) {
    return next(new ErrorResponse('Not authorized to view these enrollments', 403));
  }

  // Validate student exists
  const student = await User.findById(studentId);
  if (!student || student.role !== 'student') {
    return next(new ErrorResponse('Student not found', 404));
  }

  let query = Enrollment.find({ student: studentId });

  // Filter by status
  if (req.query.status) {
    query = query.where('status').equals(req.query.status);
  }

  // Filter by semester/year
  if (req.query.semester && req.query.year) {
    const courses = await Course.find({
      semester: req.query.semester,
      year: parseInt(req.query.year)
    }).distinct('_id');
    
    query = query.where('course').in(courses);
  }

  // Sort
  const sortBy = req.query.sort || '-enrolledAt';
  query = query.sort(sortBy);

  // Populate course details
  query = query.populate({
    path: 'course',
    select: 'title code department credits faculty semester year',
    populate: {
      path: 'faculty',
      select: 'name email'
    }
  });

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const total = await Enrollment.countDocuments({ student: studentId });

  query = query.skip(startIndex).limit(limit);

  const enrollments = await query;

  // Calculate statistics
  const totalEnrollments = await Enrollment.countDocuments({ student: studentId });
  const completedCourses = await Enrollment.countDocuments({ 
    student: studentId, 
    status: 'completed' 
  });
  const currentEnrollments = await Enrollment.countDocuments({ 
    student: studentId, 
    status: 'enrolled' 
  });

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
      enrollments,
      statistics: {
        total: totalEnrollments,
        completed: completedCourses,
        current: currentEnrollments,
        completionRate: totalEnrollments > 0 ? Math.round((completedCourses / totalEnrollments) * 100) : 0
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

// @desc    Get course enrollments
// @route   GET /api/v1/enrollments/course/:courseId
// @access  Private/Admin or Course Faculty
exports.getCourseEnrollments = asyncHandler(async (req, res, next) => {
  const { courseId } = req.params;

  // Validate course
  const course = await Course.findById(courseId);
  if (!course) {
    return next(new ErrorResponse('Course not found', 404));
  }

  // Check authorization
  const isAdmin = req.user.role === 'admin';
  const isFaculty = req.user.role === 'faculty' && course.faculty.toString() === req.user.id;

  if (!isAdmin && !isFaculty) {
    return next(new ErrorResponse('Not authorized to view these enrollments', 403));
  }

  let query = Enrollment.find({ course: courseId });

  // Filter by status
  if (req.query.status) {
    query = query.where('status').equals(req.query.status);
  }

  // Sort
  const sortBy = req.query.sort || '-enrolledAt';
  query = query.sort(sortBy);

  // Populate student details
  query = query.populate('student', 'name email studentId department phone');

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const total = await Enrollment.countDocuments({ course: courseId });

  query = query.skip(startIndex).limit(limit);

  const enrollments = await query;

  // Get enrollment statistics
  const enrollmentStats = await Enrollment.aggregate([
    {
      $match: { course: new mongoose.Types.ObjectId(courseId) }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  // Calculate average grade for completed enrollments
  const avgGrade = await Enrollment.aggregate([
    {
      $match: { 
        course: new mongoose.Types.ObjectId(courseId),
        status: 'completed',
        grade: { $exists: true, $ne: null }
      }
    },
    {
      $group: {
        _id: null,
        averageGrade: { $avg: '$grade' }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      course: {
        id: course._id,
        title: course.title,
        code: course.code,
        department: course.department,
        maxStudents: course.maxStudents
      },
      enrollments,
      statistics: {
        total: total,
        byStatus: enrollmentStats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {}),
        averageGrade: avgGrade.length > 0 ? Math.round(avgGrade[0].averageGrade * 100) / 100 : null
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

// Helper function to convert numeric grade to letter grade
function getLetterGrade(numericGrade) {
  if (numericGrade >= 90) return 'A';
  if (numericGrade >= 80) return 'B';
  if (numericGrade >= 70) return 'C';
  if (numericGrade >= 60) return 'D';
  return 'F';
}