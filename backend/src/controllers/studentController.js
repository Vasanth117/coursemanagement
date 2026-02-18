const { Course, Enrollment, Assignment, Grade, User, Resource, Announcement } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/ErrorResponse');
const mongoose = require('mongoose');

// @desc    Get student dashboard
// @route   GET /api/v1/student/dashboard
// @access  Private/Student
exports.getDashboard = asyncHandler(async (req, res, next) => {
  const studentId = req.user.id;

  // Get student statistics
  const [
    enrolledCourses,
    completedCourses,
    totalAssignments,
    pendingAssignments,
    recentCourses,
    upcomingAssignments,
    recentGrades
  ] = await Promise.all([
    Enrollment.countDocuments({ student: studentId, status: 'enrolled' }),
    Enrollment.countDocuments({ student: studentId, status: 'completed' }),
    Grade.countDocuments({ student: studentId }),
    Grade.countDocuments({ 
      student: studentId,
      assignment: { 
        $in: await Assignment.find({ dueDate: { $gte: new Date() } }).distinct('_id') 
      },
      status: { $in: ['pending', 'submitted'] }
    }),
    Enrollment.find({ student: studentId })
      .sort('-enrolledAt')
      .limit(3)
      .populate('course', 'title code faculty department')
      .populate('faculty', 'name'),
    Grade.find({ 
      student: studentId,
      assignment: { 
        $in: await Assignment.find({ 
          dueDate: { $gte: new Date() },
          isPublished: true 
        }).distinct('_id') 
      },
      status: 'pending'
    })
      .populate('assignment', 'title dueDate course maxPoints')
      .populate({
        path: 'assignment',
        populate: {
          path: 'course',
          select: 'title code'
        }
      })
      .sort('assignment.dueDate')
      .limit(5),
    Grade.find({ 
      student: studentId,
      status: 'graded'
    })
      .sort('-gradedAt')
      .limit(5)
      .populate('assignment', 'title type')
      .populate('course', 'title code')
  ]);

  // Calculate average grade
  const grades = await Grade.find({ 
    student: studentId,
    status: 'graded',
    score: { $ne: null }
  });
  
  const averageGrade = grades.length > 0
    ? grades.reduce((sum, grade) => sum + (grade.score / grade.maxScore) * 100, 0) / grades.length
    : 0;

  res.status(200).json({
    success: true,
    data: {
      counts: {
        enrolledCourses,
        completedCourses,
        totalAssignments,
        pendingAssignments,
        averageGrade: Math.round(averageGrade * 100) / 100
      },
      recentCourses,
      upcomingAssignments,
      recentGrades
    }
  });
});

// @desc    Get available courses for enrollment
// @route   GET /api/v1/student/courses/available
// @access  Private/Student
exports.getAvailableCourses = asyncHandler(async (req, res, next) => {
  const studentId = req.user.id;

  // Get courses student is already enrolled in
  const enrolledCourses = await Enrollment.find({ student: studentId })
    .distinct('course');

  // Get available courses (not enrolled and active)
  let query = Course.find({
    _id: { $nin: enrolledCourses },
    isActive: true
  });

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
        { code: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ]
    });
  }

  // Filter by faculty
  if (req.query.faculty) {
    query = query.where('faculty').equals(req.query.faculty);
  }

  // Sort
  const sortBy = req.query.sort || 'title';
  query = query.sort(sortBy);

  // Populate faculty details
  query = query.populate('faculty', 'name email department');

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const total = await Course.countDocuments(query);

  query = query.skip(startIndex).limit(limit);

  const courses = await query;

  // Calculate available seats for each course
  const coursesWithAvailability = courses.map(course => ({
    ...course.toObject(),
    availableSeats: course.maxStudents - course.enrolledStudents.length,
    enrollmentPercentage: Math.round((course.enrolledStudents.length / course.maxStudents) * 100)
  }));

  res.status(200).json({
    success: true,
    count: coursesWithAvailability.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    data: coursesWithAvailability
  });
});

// @desc    Get enrolled courses
// @route   GET /api/v1/student/courses
// @access  Private/Student
exports.getCourses = asyncHandler(async (req, res, next) => {
  const studentId = req.user.id;

  let query = Enrollment.find({ 
    student: studentId,
    status: { $in: ['enrolled', 'completed'] }
  });

  // Sort
  const sortBy = req.query.sort || '-enrolledAt';
  query = query.sort(sortBy);

  // Populate course details
  query = query.populate({
    path: 'course',
    select: 'title code description department faculty semester year schedule credits',
    populate: {
      path: 'faculty',
      select: 'name email'
    }
  });

  const enrollments = await query;

  res.status(200).json({
    success: true,
    count: enrollments.length,
    data: enrollments
  });
});

// @desc    Enroll in course
// @route   POST /api/v1/student/enroll
// @access  Private/Student
exports.requestEnrollment = asyncHandler(async (req, res, next) => {
  const studentId = req.user.id;
  const { courseId } = req.body;

  console.log('Enrollment request:', { studentId, courseId });

  if (!courseId) {
    return next(new ErrorResponse('Course ID is required', 400));
  }

  // Check if course exists and is active
  const course = await Course.findById(courseId);
  if (!course) {
    return next(new ErrorResponse('Course not found', 404));
  }

  if (!course.isActive) {
    return next(new ErrorResponse('Course is not active', 400));
  }

  // Check if course is full
  if (course.enrolledStudents.length >= course.maxStudents) {
    return next(new ErrorResponse('Course is full', 400));
  }

  // Check if already enrolled
  const existingEnrollment = await Enrollment.findOne({
    student: studentId,
    course: courseId
  });

  if (existingEnrollment) {
    return next(new ErrorResponse('Already enrolled in this course', 400));
  }

  // Create enrollment
  const enrollment = await Enrollment.create({
    student: studentId,
    course: courseId,
    enrolledAt: new Date(),
    status: 'enrolled',
    enrolledBy: studentId
  });

  // Add student to course's enrolled students list
  course.enrolledStudents.push(studentId);
  await course.save();

  console.log('Enrollment successful:', enrollment._id);

  res.status(201).json({
    success: true,
    message: 'Successfully enrolled in course',
    data: enrollment
  });
});

// @desc    Unenroll from course
// @route   DELETE /api/v1/student/courses/:id/unenroll
// @access  Private/Student
exports.unenrollFromCourse = asyncHandler(async (req, res, next) => {
  const studentId = req.user.id;
  const courseId = req.params.id;

  // Find enrollment
  const enrollment = await Enrollment.findOne({
    student: studentId,
    course: courseId,
    status: 'enrolled'
  });

  if (!enrollment) {
    return next(new ErrorResponse('Not enrolled in this course', 404));
  }

  // Check if course has started (optional restriction)
  const course = await Course.findById(courseId);
  if (course && course.startDate && new Date() > course.startDate) {
    return next(new ErrorResponse('Cannot unenroll after course has started', 400));
  }

  // Remove student from course's enrolled students
  await Course.findByIdAndUpdate(courseId, {
    $pull: { enrolledStudents: studentId }
  });

  // Delete enrollment
  await enrollment.remove();

  res.status(200).json({
    success: true,
    message: 'Successfully unenrolled from course'
  });
});

// @desc    Get course details (for enrolled students)
// @route   GET /api/v1/student/courses/:id
// @access  Private/Student
exports.getCourseDetails = asyncHandler(async (req, res, next) => {
  const studentId = req.user.id;
  const courseId = req.params.id;

  // Check if student is enrolled
  const enrollment = await Enrollment.findOne({
    student: studentId,
    course: courseId,
    status: { $in: ['enrolled', 'completed'] }
  });

  if (!enrollment) {
    return next(new ErrorResponse('Not enrolled in this course', 403));
  }

  // Get course with all details
  const course = await Course.findById(courseId)
    .populate('faculty', 'name email phone department')
    .populate({
      path: 'assignments',
      match: { isPublished: true },
      select: 'title description dueDate type maxPoints weightage attachments'
    });

  // Get announcements
  const announcements = await Announcement.find({
    course: courseId
  })
    .sort('-createdAt')
    .limit(10)
    .populate('createdBy', 'name');

  // Get resources
  const resources = await Resource.find({
    course: courseId
  })
    .sort('-uploadedAt')
    .populate('uploadedBy', 'name');

  // Get student's grades for this course
  const grades = await Grade.find({
    student: studentId,
    course: courseId
  })
    .populate('assignment', 'title type dueDate maxPoints weightage');

  // Calculate current grade
  let totalWeightedScore = 0;
  let totalWeight = 0;

  grades.forEach(grade => {
    if (grade.score !== null && grade.score !== undefined && grade.assignment) {
      const weight = grade.assignment.weightage || 0;
      const percentage = (grade.score / grade.assignment.maxPoints) * 100;
      totalWeightedScore += percentage * weight;
      totalWeight += weight;
    }
  });

  const currentGrade = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;

  res.status(200).json({
    success: true,
    data: {
      course,
      enrollment,
      announcements,
      resources,
      grades,
      currentGrade: Math.round(currentGrade * 100) / 100,
      letterGrade: getLetterGrade(currentGrade)
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

// @desc    Get course assignments
// @route   GET /api/v1/student/courses/:id/assignments
// @access  Private/Student
exports.getAssignments = asyncHandler(async (req, res, next) => {
  const studentId = req.user.id;
  const courseId = req.params.id;

  // Check if student is enrolled
  const enrollment = await Enrollment.findOne({
    student: studentId,
    course: courseId,
    status: { $in: ['enrolled', 'completed'] }
  });

  if (!enrollment) {
    return next(new ErrorResponse('Not enrolled in this course', 403));
  }

  // Get published assignments
  const assignments = await Assignment.find({
    course: courseId,
    isPublished: true
  })
    .sort('dueDate')
    .select('title description dueDate type maxPoints weightage attachments allowLateSubmission');

  // Get student's submissions for these assignments
  const assignmentsWithStatus = await Promise.all(
    assignments.map(async (assignment) => {
      const submission = await Grade.findOne({
        student: studentId,
        assignment: assignment._id
      });

      const now = new Date();
      const dueDate = new Date(assignment.dueDate);
      const isOverdue = now > dueDate;
      const daysRemaining = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));

      return {
        ...assignment.toObject(),
        submission,
        status: submission ? submission.status : 'pending',
        isOverdue,
        daysRemaining: daysRemaining > 0 ? daysRemaining : 0
      };
    })
  );

  // Categorize assignments
  const categorized = {
    pending: assignmentsWithStatus.filter(a => a.status === 'pending' && !a.isOverdue),
    submitted: assignmentsWithStatus.filter(a => a.status === 'submitted'),
    graded: assignmentsWithStatus.filter(a => a.status === 'graded'),
    overdue: assignmentsWithStatus.filter(a => a.isOverdue && a.status === 'pending')
  };

  res.status(200).json({
    success: true,
    data: {
      assignments: assignmentsWithStatus,
      categorized,
      counts: {
        total: assignmentsWithStatus.length,
        pending: categorized.pending.length,
        submitted: categorized.submitted.length,
        graded: categorized.graded.length,
        overdue: categorized.overdue.length
      }
    }
  });
});

// @desc    Submit assignment
// @route   POST /api/v1/student/assignments/:id/submit
// @access  Private/Student
exports.submitAssignment = asyncHandler(async (req, res, next) => {
  const studentId = req.user.id;
  const assignmentId = req.params.id;

  // Check if assignment exists and is published
  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) {
    return next(new ErrorResponse('Assignment not found', 404));
  }

  if (!assignment.isPublished) {
    return next(new ErrorResponse('Assignment is not available for submission', 400));
  }

  // Check if student is enrolled in the course
  const enrollment = await Enrollment.findOne({
    student: studentId,
    course: assignment.course,
    status: 'enrolled'
  });

  if (!enrollment) {
    return next(new ErrorResponse('Not enrolled in this course', 403));
  }

  // Check due date
  const now = new Date();
  const dueDate = new Date(assignment.dueDate);

  if (now > dueDate && !assignment.allowLateSubmission) {
    return next(new ErrorResponse('Assignment submission deadline has passed', 400));
  }

  // Check if already submitted
  const existingSubmission = await Grade.findOne({
    student: studentId,
    assignment: assignmentId
  });

  if (existingSubmission && !assignment.allowMultipleAttempts) {
    return next(new ErrorResponse('Already submitted this assignment', 400));
  }

  if (existingSubmission && assignment.allowMultipleAttempts) {
    // Check max attempts
    const submissionCount = await Grade.countDocuments({
      student: studentId,
      assignment: assignmentId
    });

    if (submissionCount >= assignment.maxAttempts) {
      return next(new ErrorResponse(`Maximum submission attempts (${assignment.maxAttempts}) reached`, 400));
    }
  }

  // Check if file is uploaded
  if (!req.file && !req.body.textSubmission) {
    return next(new ErrorResponse('Please provide either a file or text submission', 400));
  }

  // Handle file upload if present
  let fileData = null;
  if (req.file) {
    try {
      const result = await uploadToCloudinary(req.file.path, {
        folder: `submissions/assignment_${assignmentId}`,
        resource_type: 'auto'
      });
      
      fileData = {
        fileName: req.file.originalname,
        fileUrl: result.secure_url,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        publicId: result.public_id
      };
    } catch (error) {
      return next(new ErrorResponse('Failed to upload file', 500));
    }
  }

  // Calculate late penalty if applicable
  let latePenalty = 0;
  let isLate = false;

  if (now > dueDate && assignment.allowLateSubmission) {
    isLate = true;
    const lateDays = Math.ceil((now - dueDate) / (1000 * 60 * 60 * 24));
    latePenalty = Math.min(assignment.latePenalty * lateDays, 100);
  }

  // Create or update submission
  const submissionData = {
    student: studentId,
    assignment: assignmentId,
    course: assignment.course,
    submittedAt: now,
    status: 'submitted',
    textSubmission: req.body.textSubmission || null,
    files: fileData ? [fileData] : [],
    isLate,
    latePenalty
  };

  let submission;
  if (existingSubmission) {
    submission = await Grade.findByIdAndUpdate(
      existingSubmission._id,
      submissionData,
      { new: true, runValidators: true }
    );
  } else {
    submission = await Grade.create(submissionData);
  }

  // Populate assignment details
  await submission.populate('assignment', 'title dueDate maxPoints');
  await submission.populate('course', 'title code');

  res.status(201).json({
    success: true,
    message: isLate ? 'Assignment submitted late' : 'Assignment submitted successfully',
    data: submission
  });
});

// @desc    Get student grades
// @route   GET /api/v1/student/grades
// @access  Private/Student
exports.getGrades = asyncHandler(async (req, res, next) => {
  const studentId = req.user.id;

  let query = Grade.find({ student: studentId });

  // Filter by course
  if (req.query.course) {
    query = query.where('course').equals(req.query.course);
  }

  // Filter by status
  if (req.query.status) {
    query = query.where('status').equals(req.query.status);
  }

  // Sort
  const sortBy = req.query.sort || '-submittedAt';
  query = query.sort(sortBy);

  // Populate details
  query = query
    .populate('assignment', 'title type dueDate maxPoints weightage')
    .populate('course', 'title code')
    .populate('gradedBy', 'name');

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const startIndex = (page - 1) * limit;
  const total = await Grade.countDocuments(query);

  query = query.skip(startIndex).limit(limit);

  const grades = await query;

  // Calculate statistics
  const gradedAssignments = grades.filter(g => g.status === 'graded');
  const averageGrade = gradedAssignments.length > 0
    ? gradedAssignments.reduce((sum, g) => {
        const percentage = g.maxScore > 0 ? (g.score / g.maxScore) * 100 : 0;
        return sum + percentage;
      }, 0) / gradedAssignments.length
    : 0;

  // Group by course
  const gradesByCourse = {};
  grades.forEach(grade => {
    if (grade.course) {
      const courseId = grade.course._id.toString();
      if (!gradesByCourse[courseId]) {
        gradesByCourse[courseId] = {
          course: grade.course,
          grades: []
        };
      }
      gradesByCourse[courseId].grades.push(grade);
    }
  });

  // Calculate course averages
  Object.keys(gradesByCourse).forEach(courseId => {
    const courseData = gradesByCourse[courseId];
    const gradedInCourse = courseData.grades.filter(g => g.status === 'graded');
    
    if (gradedInCourse.length > 0) {
      const courseAverage = gradedInCourse.reduce((sum, g) => {
        const percentage = g.maxScore > 0 ? (g.score / g.maxScore) * 100 : 0;
        const weight = g.assignment ? g.assignment.weightage || 1 : 1;
        return sum + (percentage * weight);
      }, 0) / gradedInCourse.reduce((sum, g) => sum + (g.assignment ? g.assignment.weightage || 1 : 1), 0);
      
      courseData.averageGrade = Math.round(courseAverage * 100) / 100;
      courseData.letterGrade = getLetterGrade(courseAverage);
    }
  });

  res.status(200).json({
    success: true,
    data: {
      grades,
      statistics: {
        totalAssignments: grades.length,
        graded: gradedAssignments.length,
        pending: grades.length - gradedAssignments.length,
        averageGrade: Math.round(averageGrade * 100) / 100
      },
      byCourse: Object.values(gradesByCourse)
    },
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Get student profile
// @route   GET /api/v1/student/profile
// @access  Private/Student
exports.getStudentProfile = asyncHandler(async (req, res, next) => {
  const studentId = req.user.id;

  const student = await User.findById(studentId)
    .select('name email studentId department phone address dateOfBirth gender profileImage');

  // Get academic statistics
  const [
    totalEnrollments,
    completedCourses,
    currentEnrollments,
    totalAssignmentsSubmitted,
    averageGrade
  ] = await Promise.all([
    Enrollment.countDocuments({ student: studentId }),
    Enrollment.countDocuments({ student: studentId, status: 'completed' }),
    Enrollment.countDocuments({ student: studentId, status: 'enrolled' }),
    Grade.countDocuments({ student: studentId, status: { $in: ['submitted', 'graded'] } }),
    Grade.aggregate([
      {
        $match: {
          student: new mongoose.Types.ObjectId(studentId),
          status: 'graded',
          score: { $ne: null }
        }
      },
      {
        $group: {
          _id: null,
          average: { $avg: { $divide: ['$score', '$maxScore'] } }
        }
      }
    ])
  ]);

  // Get recent enrollments
  const recentEnrollments = await Enrollment.find({ student: studentId })
    .sort('-enrolledAt')
    .limit(3)
    .populate('course', 'title code department')
    .populate({
      path: 'course',
      populate: {
        path: 'faculty',
        select: 'name'
      }
    });

  // Get recent grades
  const recentGrades = await Grade.find({ 
    student: studentId,
    status: 'graded'
  })
    .sort('-gradedAt')
    .limit(5)
    .populate('assignment', 'title type')
    .populate('course', 'title code')
    .populate('gradedBy', 'name');

  res.status(200).json({
    success: true,
    data: {
      profile: student,
      statistics: {
        totalEnrollments,
        completedCourses,
        currentEnrollments,
        totalAssignmentsSubmitted,
        averageGrade: averageGrade[0] ? Math.round(averageGrade[0].average * 100 * 100) / 100 : 0,
        completionRate: totalEnrollments > 0 ? Math.round((completedCourses / totalEnrollments) * 100) : 0
      },
      recentEnrollments,
      recentGrades
    }
  });
});

// @desc    Update student profile
// @route   PUT /api/v1/student/profile
// @access  Private/Student
exports.updateProfile = asyncHandler(async (req, res, next) => {
  const studentId = req.user.id;

  const allowedUpdates = ['name', 'phone', 'address', 'dateOfBirth', 'gender'];
  const updates = {};

  allowedUpdates.forEach(field => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  // Handle profile image upload
  if (req.file) {
    try {
      const result = await uploadToCloudinary(req.file.path, {
        folder: `profiles/students`,
        transformation: [
          { width: 500, height: 500, crop: 'fill', gravity: 'face' }
        ]
      });
      updates.profileImage = result.secure_url;
    } catch (error) {
      return next(new ErrorResponse('Failed to upload profile image', 500));
    }
  }

  const student = await User.findByIdAndUpdate(
    studentId,
    updates,
    { new: true, runValidators: true }
  ).select('name email studentId department phone address dateOfBirth gender profileImage');

  res.status(200).json({
    success: true,
    data: student
  });
});

// @desc    Get student schedule
// @route   GET /api/v1/student/schedule
// @access  Private/Student
exports.getSchedule = asyncHandler(async (req, res, next) => {
  const studentId = req.user.id;

  // Get current enrollments
  const enrollments = await Enrollment.find({
    student: studentId,
    status: 'enrolled'
  }).populate({
    path: 'course',
    select: 'title code schedule department faculty',
    populate: {
      path: 'faculty',
      select: 'name'
    }
  });

  // Organize by day
  const scheduleByDay = {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: []
  };

  enrollments.forEach(enrollment => {
    const course = enrollment.course;
    if (course && course.schedule && course.schedule.days) {
      course.schedule.days.forEach(day => {
        scheduleByDay[day].push({
          course: {
            id: course._id,
            title: course.title,
            code: course.code,
            department: course.department
          },
          faculty: course.faculty,
          time: `${course.schedule.startTime} - ${course.schedule.endTime}`,
          room: course.schedule.room,
          startTime: course.schedule.startTime,
          endTime: course.schedule.endTime
        });
      });
    }
  });

  // Sort each day by start time
  Object.keys(scheduleByDay).forEach(day => {
    scheduleByDay[day].sort((a, b) => {
      const timeA = a.startTime ? parseInt(a.startTime.replace(':', '')) : 0;
      const timeB = b.startTime ? parseInt(b.startTime.replace(':', '')) : 0;
      return timeA - timeB;
    });
  });

  // Get today's schedule
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todaysSchedule = scheduleByDay[today] || [];

  // Get upcoming assignments (next 7 days)
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);

  const upcomingAssignments = await Grade.find({
    student: studentId,
    assignment: {
      $in: await Assignment.find({
        dueDate: { $gte: new Date(), $lte: nextWeek },
        isPublished: true
      }).distinct('_id')
    },
    status: 'pending'
  })
    .populate({
      path: 'assignment',
      select: 'title dueDate course maxPoints',
      populate: {
        path: 'course',
        select: 'title code'
      }
    })
    .sort('assignment.dueDate');

  res.status(200).json({
    success: true,
    data: {
      scheduleByDay,
      todaysSchedule,
      upcomingAssignments
    }
  });
});

// @desc    Download student transcript
// @route   GET /api/v1/student/transcript
// @access  Private/Student
exports.getTranscript = asyncHandler(async (req, res, next) => {
  const studentId = req.user.id;

  // Get student details
  const student = await User.findById(studentId)
    .select('name studentId department email');

  // Get all completed courses with grades
  const enrollments = await Enrollment.find({
    student: studentId,
    status: 'completed'
  }).populate({
    path: 'course',
    select: 'title code credits department'
  });

  // Get grades for completed courses
  const transcript = await Promise.all(
    enrollments.map(async (enrollment) => {
      const grades = await Grade.find({
        student: studentId,
        course: enrollment.course._id,
        status: 'graded'
      }).populate('assignment', 'title weightage maxPoints');

      // Calculate course grade
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

      const courseGrade = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;

      return {
        course: enrollment.course,
        grade: Math.round(courseGrade * 100) / 100,
        letterGrade: getLetterGrade(courseGrade),
        credits: enrollment.course.credits || 3
      };
    })
  );

  // Calculate GPA
  const gradePoints = {
    'A': 4.0,
    'B': 3.0,
    'C': 2.0,
    'D': 1.0,
    'F': 0.0
  };

  let totalCredits = 0;
  let totalGradePoints = 0;

  transcript.forEach(course => {
    const credits = course.credits;
    const gradePoint = gradePoints[course.letterGrade] || 0;
    
    totalCredits += credits;
    totalGradePoints += gradePoint * credits;
  });

  const gpa = totalCredits > 0 ? totalGradePoints / totalCredits : 0;

  // Generate PDF transcript (simplified - in production use a PDF library)
  const transcriptData = {
    student,
    transcript,
    summary: {
      totalCourses: transcript.length,
      totalCredits,
      gpa: Math.round(gpa * 100) / 100
    },
    generatedAt: new Date()
  };

  res.status(200).json({
    success: true,
    data: transcriptData
  });
});

// @desc    Get assignment details
// @route   GET /api/v1/student/assignments/:id
// @access  Private/Student
exports.getAssignmentDetails = asyncHandler(async (req, res, next) => {
  const studentId = req.user.id;
  const assignmentId = req.params.id;

  const assignment = await Assignment.findById(assignmentId)
    .populate('course', 'title code')
    .populate('createdBy', 'name');

  if (!assignment) {
    return next(new ErrorResponse('Assignment not found', 404));
  }

  // Check if student is enrolled
  const enrollment = await Enrollment.findOne({
    student: studentId,
    course: assignment.course._id,
    status: { $in: ['enrolled', 'completed'] }
  });

  if (!enrollment) {
    return next(new ErrorResponse('Not enrolled in this course', 403));
  }

  // Get student's submission
  const submission = await Grade.findOne({
    student: studentId,
    assignment: assignmentId
  });

  res.status(200).json({
    success: true,
    data: {
      assignment,
      submission
    }
  });
});

// @desc    Get course details for enrollment (public)
// @route   GET /api/v1/student/courses/:id/preview
// @access  Private/Student
exports.getCoursePreview = asyncHandler(async (req, res, next) => {
  const courseId = req.params.id;

  // Get course with basic details (no enrollment required)
  const course = await Course.findById(courseId)
    .populate('faculty', 'name email phone department')
    .select('title code description credits department faculty maxStudents enrolledStudents semester year schedule prerequisites isActive');

  if (!course) {
    return next(new ErrorResponse('Course not found', 404));
  }

  if (!course.isActive) {
    return next(new ErrorResponse('Course is not active', 400));
  }

  // Calculate available seats
  const availableSeats = course.maxStudents - course.enrolledStudents.length;
  const enrollmentPercentage = Math.round((course.enrolledStudents.length / course.maxStudents) * 100);

  res.status(200).json({
    success: true,
    data: {
      ...course.toObject(),
      availableSeats,
      enrollmentPercentage,
      isEnrolled: course.enrolledStudents.includes(req.user.id)
    }
  });
});

// @desc    Get student attendance
// @route   GET /api/v1/student/attendance
// @access  Private/Student
exports.getAttendance = asyncHandler(async (req, res, next) => {
  const studentId = req.user.id;
  
  // Get enrolled courses
  const enrollments = await Enrollment.find({
    student: studentId,
    status: { $in: ['enrolled', 'completed'] }
  }).populate('course', 'title code');
  
  // Mock attendance data (in real implementation, you'd have an Attendance model)
  const attendanceData = enrollments.map(enrollment => ({
    course: enrollment.course,
    totalClasses: 30,
    attendedClasses: Math.floor(Math.random() * 30) + 20,
    attendancePercentage: Math.floor(Math.random() * 30) + 70
  }));
  
  res.status(200).json({
    success: true,
    data: attendanceData
  });
});