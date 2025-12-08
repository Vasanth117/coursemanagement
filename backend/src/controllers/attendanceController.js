const { Attendance, Course, User, Enrollment } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/ErrorResponse');
const mongoose = require('mongoose');

// @desc    Get all attendance records
// @route   GET /api/v1/attendance
// @access  Private/Admin or Faculty
exports.getAttendance = asyncHandler(async (req, res, next) => {
  let query;

  // Admin sees all attendance records
  if (req.user.role === 'admin') {
    query = Attendance.find();
  } 
  // Faculty sees attendance for their courses
  else if (req.user.role === 'faculty') {
    const facultyCourses = await Course.find({ faculty: req.user.id }).distinct('_id');
    query = Attendance.find({ course: { $in: facultyCourses } });
  }
  // Students see their own attendance
  else if (req.user.role === 'student') {
    query = Attendance.find({ student: req.user.id });
  } else {
    return next(new ErrorResponse('Not authorized', 401));
  }

  // Apply filters from query parameters
  const reqQuery = { ...req.query };
  const removeFields = ['select', 'sort', 'page', 'limit'];
  removeFields.forEach(param => delete reqQuery[param]);

  // Create query string
  let queryStr = JSON.stringify(reqQuery);
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  query = query.find(JSON.parse(queryStr));

  // Filter by course
  if (req.query.course) {
    query = query.where('course').equals(req.query.course);
  }

  // Filter by student
  if (req.query.student && req.user.role !== 'student') {
    query = query.where('student').equals(req.query.student);
  }

  // Filter by date range
  if (req.query.startDate) {
    query = query.where('date').gte(new Date(req.query.startDate));
  }
  
  if (req.query.endDate) {
    query = query.where('date').lte(new Date(req.query.endDate));
  }

  // Filter by status
  if (req.query.status) {
    query = query.where('status').equals(req.query.status);
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
    query = query.sort('-date');
  }

  // Populate details
  if (req.user.role === 'student') {
    // Students see course details
    query = query
      .populate('course', 'title code')
      .populate('markedBy', 'name');
  } else {
    // Admin/Faculty see student and course details
    query = query
      .populate('student', 'name email studentId department')
      .populate('course', 'title code')
      .populate('markedBy', 'name');
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const startIndex = (page - 1) * limit;
  const total = await Attendance.countDocuments(query);

  query = query.skip(startIndex).limit(limit);

  const attendanceRecords = await query;

  res.status(200).json({
    success: true,
    count: attendanceRecords.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    data: attendanceRecords
  });
});

// @desc    Get single attendance record
// @route   GET /api/v1/attendance/:id
// @access  Private
exports.getSingleAttendance = asyncHandler(async (req, res, next) => {
  const attendance = await Attendance.findById(req.params.id)
    .populate('student', 'name email studentId department')
    .populate('course', 'title code department faculty')
    .populate('markedBy', 'name email');

  if (!attendance) {
    return next(new ErrorResponse(`Attendance record not found with id of ${req.params.id}`, 404));
  }

  // Check authorization
  const isAdmin = req.user.role === 'admin';
  const isStudent = req.user.role === 'student' && attendance.student._id.toString() === req.user.id;
  
  let isFaculty = false;
  if (req.user.role === 'faculty') {
    const course = await Course.findById(attendance.course);
    isFaculty = course && course.faculty.toString() === req.user.id;
  }

  if (!isAdmin && !isStudent && !isFaculty) {
    return next(new ErrorResponse('Not authorized to view this attendance record', 403));
  }

  res.status(200).json({
    success: true,
    data: attendance
  });
});

// @desc    Mark attendance
// @route   POST /api/v1/attendance
// @access  Private/Faculty or Admin
exports.markAttendance = asyncHandler(async (req, res, next) => {
  // Check authorization
  if (req.user.role !== 'faculty' && req.user.role !== 'admin') {
    return next(new ErrorResponse('Only faculty and admin can mark attendance', 403));
  }

  const { course, date, student, status, notes } = req.body;

  // Validate required fields
  if (!course || !date || !student || !status) {
    return next(new ErrorResponse('Please provide course, date, student, and status', 400));
  }

  // Validate course
  const courseObj = await Course.findById(course);
  if (!courseObj) {
    return next(new ErrorResponse('Course not found', 404));
  }

  // For faculty, check if they own the course
  if (req.user.role === 'faculty' && courseObj.faculty.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to mark attendance for this course', 403));
  }

  // Validate student
  const studentObj = await User.findById(student);
  if (!studentObj || studentObj.role !== 'student') {
    return next(new ErrorResponse('Student not found', 404));
  }

  // Check if student is enrolled in the course
  const enrollment = await Enrollment.findOne({
    student,
    course,
    status: 'enrolled'
  });

  if (!enrollment) {
    return next(new ErrorResponse('Student is not enrolled in this course', 400));
  }

  // Validate date (should not be in the future)
  const attendanceDate = new Date(date);
  const today = new Date();
  
  if (attendanceDate > today) {
    return next(new ErrorResponse('Cannot mark attendance for future dates', 400));
  }

  // Validate status
  const validStatuses = ['present', 'absent', 'late', 'excused', 'half-day'];
  if (!validStatuses.includes(status)) {
    return next(new ErrorResponse(`Invalid status. Valid statuses: ${validStatuses.join(', ')}`, 400));
  }

  // Check if attendance already marked for this student on this date
  const existingAttendance = await Attendance.findOne({
    course,
    student,
    date: {
      $gte: new Date(attendanceDate.setHours(0, 0, 0, 0)),
      $lte: new Date(attendanceDate.setHours(23, 59, 59, 999))
    }
  });

  if (existingAttendance) {
    return next(new ErrorResponse('Attendance already marked for this student on this date', 400));
  }

  // Create attendance record
  const attendance = await Attendance.create({
    course,
    student,
    date: attendanceDate,
    status,
    notes,
    markedBy: req.user.id
  });

  // Populate details for response
  await attendance.populate('student', 'name email studentId');
  await attendance.populate('course', 'title code');
  await attendance.populate('markedBy', 'name');

  res.status(201).json({
    success: true,
    data: attendance
  });
});

// @desc    Update attendance
// @route   PUT /api/v1/attendance/:id
// @access  Private/Faculty or Admin
exports.updateAttendance = asyncHandler(async (req, res, next) => {
  let attendance = await Attendance.findById(req.params.id)
    .populate('course', 'faculty')
    .populate('markedBy');

  if (!attendance) {
    return next(new ErrorResponse(`Attendance record not found with id of ${req.params.id}`, 404));
  }

  // Check authorization
  const isAdmin = req.user.role === 'admin';
  
  let isFaculty = false;
  if (req.user.role === 'faculty') {
    const course = await Course.findById(attendance.course);
    isFaculty = course && course.faculty.toString() === req.user.id;
  }

  if (!isAdmin && !isFaculty) {
    return next(new ErrorResponse('Not authorized to update this attendance record', 403));
  }

  // Validate status if provided
  if (req.body.status) {
    const validStatuses = ['present', 'absent', 'late', 'excused', 'half-day'];
    if (!validStatuses.includes(req.body.status)) {
      return next(new ErrorResponse(`Invalid status. Valid statuses: ${validStatuses.join(', ')}`, 400));
    }
  }

  // Update attendance
  attendance = await Attendance.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  })
    .populate('student', 'name email studentId')
    .populate('course', 'title code')
    .populate('markedBy', 'name');

  res.status(200).json({
    success: true,
    data: attendance
  });
});

// @desc    Delete attendance record
// @route   DELETE /api/v1/attendance/:id
// @access  Private/Admin or Faculty
exports.deleteAttendance = asyncHandler(async (req, res, next) => {
  const attendance = await Attendance.findById(req.params.id)
    .populate('course', 'faculty');

  if (!attendance) {
    return next(new ErrorResponse(`Attendance record not found with id of ${req.params.id}`, 404));
  }

  // Check authorization
  const isAdmin = req.user.role === 'admin';
  
  let isFaculty = false;
  if (req.user.role === 'faculty') {
    const course = await Course.findById(attendance.course);
    isFaculty = course && course.faculty.toString() === req.user.id;
  }

  if (!isAdmin && !isFaculty) {
    return next(new ErrorResponse('Not authorized to delete this attendance record', 403));
  }

  await attendance.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Bulk mark attendance
// @route   POST /api/v1/attendance/bulk
// @access  Private/Faculty or Admin
exports.bulkMarkAttendance = asyncHandler(async (req, res, next) => {
  // Check authorization
  if (req.user.role !== 'faculty' && req.user.role !== 'admin') {
    return next(new ErrorResponse('Only faculty and admin can mark attendance', 403));
  }

  const { course, date, attendanceRecords } = req.body;

  // Validate required fields
  if (!course || !date || !attendanceRecords || !Array.isArray(attendanceRecords)) {
    return next(new ErrorResponse('Please provide course, date, and attendance records array', 400));
  }

  // Validate course
  const courseObj = await Course.findById(course);
  if (!courseObj) {
    return next(new ErrorResponse('Course not found', 404));
  }

  // For faculty, check if they own the course
  if (req.user.role === 'faculty' && courseObj.faculty.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to mark attendance for this course', 403));
  }

  // Validate date
  const attendanceDate = new Date(date);
  const today = new Date();
  
  if (attendanceDate > today) {
    return next(new ErrorResponse('Cannot mark attendance for future dates', 400));
  }

  const results = {
    success: [],
    errors: []
  };

  // Get all enrolled students for validation
  const enrolledStudents = await Enrollment.find({
    course,
    status: 'enrolled'
  }).distinct('student');

  // Process each attendance record
  for (const record of attendanceRecords) {
    try {
      const { student, status, notes } = record;

      // Validate required fields for each record
      if (!student || !status) {
        results.errors.push({
          student,
          error: 'Missing student or status'
        });
        continue;
      }

      // Validate student is enrolled
      if (!enrolledStudents.includes(student)) {
        results.errors.push({
          student,
          error: 'Student is not enrolled in this course'
        });
        continue;
      }

      // Validate status
      const validStatuses = ['present', 'absent', 'late', 'excused', 'half-day'];
      if (!validStatuses.includes(status)) {
        results.errors.push({
          student,
          error: `Invalid status. Valid statuses: ${validStatuses.join(', ')}`
        });
        continue;
      }

      // Check if attendance already marked
      const existingAttendance = await Attendance.findOne({
        course,
        student,
        date: {
          $gte: new Date(attendanceDate.setHours(0, 0, 0, 0)),
          $lte: new Date(attendanceDate.setHours(23, 59, 59, 999))
        }
      });

      if (existingAttendance) {
        // Update existing record
        existingAttendance.status = status;
        existingAttendance.notes = notes || existingAttendance.notes;
        existingAttendance.markedBy = req.user.id;
        await existingAttendance.save();

        results.success.push({
          student,
          status,
          action: 'updated',
          attendanceId: existingAttendance._id
        });
      } else {
        // Create new record
        const attendance = await Attendance.create({
          course,
          student,
          date: attendanceDate,
          status,
          notes,
          markedBy: req.user.id
        });

        results.success.push({
          student,
          status,
          action: 'created',
          attendanceId: attendance._id
        });
      }
    } catch (error) {
      results.errors.push({
        student: record.student,
        error: error.message
      });
    }
  }

  res.status(200).json({
    success: true,
    data: results,
    summary: {
      total: attendanceRecords.length,
      success: results.success.length,
      errors: results.errors.length
    }
  });
});

// @desc    Get course attendance
// @route   GET /api/v1/attendance/course/:courseId
// @access  Private
exports.getCourseAttendance = asyncHandler(async (req, res, next) => {
  const { courseId } = req.params;

  // Validate course
  const course = await Course.findById(courseId);
  if (!course) {
    return next(new ErrorResponse('Course not found', 404));
  }

  // Check authorization
  const isAdmin = req.user.role === 'admin';
  const isFaculty = req.user.role === 'faculty' && course.faculty.toString() === req.user.id;
  
  let isStudent = false;
  if (req.user.role === 'student') {
    // Check if student is enrolled in the course
    const enrollment = await Enrollment.findOne({
      student: req.user.id,
      course: courseId,
      status: 'enrolled'
    });
    isStudent = !!enrollment;
  }

  if (!isAdmin && !isFaculty && !isStudent) {
    return next(new ErrorResponse('Not authorized to view this attendance', 403));
  }

  let query = Attendance.find({ course: courseId });

  // For students, only show their own attendance
  if (isStudent) {
    query = query.where('student').equals(req.user.id);
  }

  // Apply filters from query parameters
  const reqQuery = { ...req.query };
  const removeFields = ['select', 'sort', 'page', 'limit'];
  removeFields.forEach(param => delete reqQuery[param]);

  // Filter by date range
  if (req.query.startDate) {
    query = query.where('date').gte(new Date(req.query.startDate));
  }
  
  if (req.query.endDate) {
    query = query.where('date').lte(new Date(req.query.endDate));
  }

  // Filter by student (only for admin/faculty)
  if (req.query.student && (isAdmin || isFaculty)) {
    query = query.where('student').equals(req.query.student);
  }

  // Filter by status
  if (req.query.status) {
    query = query.where('status').equals(req.query.status);
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
    query = query.sort('-date');
  }

  // Populate details based on role
  if (isStudent) {
    query = query
      .populate('course', 'title code')
      .populate('markedBy', 'name');
  } else {
    query = query
      .populate('student', 'name email studentId department')
      .populate('markedBy', 'name email');
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const startIndex = (page - 1) * limit;
  const total = await Attendance.countDocuments(query);

  query = query.skip(startIndex).limit(limit);

  const attendanceRecords = await query;

  // Get attendance statistics for the course
  let statistics = null;
  if (isAdmin || isFaculty) {
    const stats = await Attendance.aggregate([
      {
        $match: { course: mongoose.Types.ObjectId(courseId) }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Calculate total attendance days
    const uniqueDates = await Attendance.distinct('date', { course: courseId });
    const totalAttendanceDays = uniqueDates.length;

    // Calculate average attendance percentage
    const totalAttendanceRecords = await Attendance.countDocuments({ course: courseId });
    const presentRecords = await Attendance.countDocuments({ 
      course: courseId, 
      status: { $in: ['present', 'late', 'half-day'] } 
    });

    const averageAttendance = totalAttendanceRecords > 0 
      ? (presentRecords / totalAttendanceRecords) * 100 
      : 0;

    statistics = {
      totalRecords: totalAttendanceRecords,
      totalAttendanceDays,
      averageAttendance: averageAttendance.toFixed(2),
      byStatus: stats.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {})
    };
  }

  res.status(200).json({
    success: true,
    count: attendanceRecords.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    data: attendanceRecords,
    statistics
  });
});

// @desc    Get student attendance summary
// @route   GET /api/v1/attendance/student/:studentId
// @access  Private
exports.getStudentAttendance = asyncHandler(async (req, res, next) => {
  const { studentId } = req.params;

  // Check authorization
  const isAdmin = req.user.role === 'admin';
  const isStudent = req.user.role === 'student' && req.user.id === studentId;
  
  let isFaculty = false;
  if (req.user.role === 'faculty') {
    // Faculty can see attendance for students in their courses
    const facultyCourses = await Course.find({ faculty: req.user.id }).distinct('_id');
    const studentEnrollments = await Enrollment.find({
      student: studentId,
      course: { $in: facultyCourses }
    });
    isFaculty = studentEnrollments.length > 0;
  }

  if (!isAdmin && !isStudent && !isFaculty) {
    return next(new ErrorResponse('Not authorized to view this attendance summary', 403));
  }

  // Validate student exists
  const student = await User.findById(studentId);
  if (!student || student.role !== 'student') {
    return next(new ErrorResponse('Student not found', 404));
  }

  // Get attendance summary by course
  const summary = await Attendance.aggregate([
    {
      $match: { student: mongoose.Types.ObjectId(studentId) }
    },
    {
      $group: {
        _id: {
          course: '$course',
          status: '$status'
        },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: '$_id.course',
        total: { $sum: '$count' },
        attendance: {
          $push: {
            status: '$_id.status',
            count: '$count'
          }
        }
      }
    },
    {
      $lookup: {
        from: 'courses',
        localField: '_id',
        foreignField: '_id',
        as: 'course'
      }
    },
    {
      $unwind: '$course'
    },
    {
      $project: {
        course: {
          _id: '$course._id',
          title: '$course.title',
          code: '$course.code'
        },
        total: 1,
        attendance: 1,
        presentCount: {
          $let: {
            vars: {
              present: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: '$attendance',
                      cond: { $eq: ['$$this.status', 'present'] }
                    }
                  },
                  0
                ]
              }
            },
            in: '$$present.count'
          }
        },
        lateCount: {
          $let: {
            vars: {
              late: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: '$attendance',
                      cond: { $eq: ['$$this.status', 'late'] }
                    }
                  },
                  0
                ]
              }
            },
            in: '$$late.count'
          }
        },
        absentCount: {
          $let: {
            vars: {
              absent: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: '$attendance',
                      cond: { $eq: ['$$this.status', 'absent'] }
                    }
                  },
                  0
                ]
              }
            },
            in: '$$absent.count'
          }
        }
      }
    },
    {
      $addFields: {
        attendancePercentage: {
          $cond: [
            { $eq: ['$total', 0] },
            0,
            {
              $multiply: [
                {
                  $divide: [
                    { $add: ['$presentCount', { $divide: ['$lateCount', 2] }] },
                    '$total'
                  ]
                },
                100
              ]
            }
          ]
        }
      }
    },
    {
      $sort: { 'course.title': 1 }
    }
  ]);

  // Calculate overall statistics
  const overallStats = await Attendance.aggregate([
    {
      $match: { student: mongoose.Types.ObjectId(studentId) }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const totalRecords = summary.reduce((sum, course) => sum + course.total, 0);
  const totalPresent = overallStats.find(s => s._id === 'present')?.count || 0;
  const totalLate = overallStats.find(s => s._id === 'late')?.count || 0;
  const totalAbsent = overallStats.find(s => s._id === 'absent')?.count || 0;

  res.status(200).json({
    success: true,
    data: {
      student: {
        _id: student._id,
        name: student.name,
        email: student.email,
        studentId: student.studentId,
        department: student.department
      },
      summary,
      overallStatistics: {
        totalRecords,
        totalPresent,
        totalLate,
        totalAbsent,
        overallAttendancePercentage: totalRecords > 0 
          ? ((totalPresent + (totalLate / 2)) / totalRecords) * 100 
          : 0
      }
    }
  });
});

// @desc    Get attendance calendar for a student
// @route   GET /api/v1/attendance/calendar
// @access  Private/Student
exports.getAttendanceCalendar = asyncHandler(async (req, res, next) => {
  // Only students can access their own calendar
  if (req.user.role !== 'student') {
    return next(new ErrorResponse('Only students can access attendance calendar', 403));
  }

  const { startDate, endDate, course } = req.query;

  // Set default date range (last 30 days)
  const defaultEndDate = new Date();
  const defaultStartDate = new Date();
  defaultStartDate.setDate(defaultStartDate.getDate() - 30);

  const start = startDate ? new Date(startDate) : defaultStartDate;
  const end = endDate ? new Date(endDate) : defaultEndDate;

  // Build query
  const query = {
    student: req.user.id,
    date: { $gte: start, $lte: end }
  };

  if (course) {
    query.course = course;
  }

  const attendanceRecords = await Attendance.find(query)
    .populate('course', 'title code color')
    .sort('date');

  // Group by date for calendar view
  const calendar = {};
  attendanceRecords.forEach(record => {
    const dateStr = record.date.toISOString().split('T')[0];
    
    if (!calendar[dateStr]) {
      calendar[dateStr] = [];
    }
    
    calendar[dateStr].push({
      course: {
        _id: record.course._id,
        title: record.course.title,
        code: record.course.code
      },
      status: record.status,
      notes: record.notes,
      markedBy: record.markedBy
    });
  });

  res.status(200).json({
    success: true,
    data: {
      startDate: start,
      endDate: end,
      calendar,
      statistics: {
        totalDays: Object.keys(calendar).length,
        totalRecords: attendanceRecords.length
      }
    }
  });
});

// @desc    Export attendance report
// @route   GET /api/v1/attendance/export
// @access  Private/Admin or Faculty
exports.exportAttendanceReport = asyncHandler(async (req, res, next) => {
  // Check authorization
  if (req.user.role !== 'admin' && req.user.role !== 'faculty') {
    return next(new ErrorResponse('Only admin and faculty can export attendance reports', 403));
  }

  const { course, startDate, endDate, format = 'json' } = req.query;

  // Validate course if provided
  if (course) {
    const courseObj = await Course.findById(course);
    if (!courseObj) {
      return next(new ErrorResponse('Course not found', 404));
    }

    // For faculty, check if they own the course
    if (req.user.role === 'faculty' && courseObj.faculty.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to export attendance for this course', 403));
    }
  }

  // Build query
  let query = Attendance.find();

  if (course) {
    query = query.where('course').equals(course);
  } else if (req.user.role === 'faculty') {
    // Faculty can only export attendance for their courses
    const facultyCourses = await Course.find({ faculty: req.user.id }).distinct('_id');
    query = query.where('course').in(facultyCourses);
  }

  if (startDate) {
    query = query.where('date').gte(new Date(startDate));
  }
  
  if (endDate) {
    query = query.where('date').lte(new Date(endDate));
  }

  // Populate details
  query = query
    .populate('student', 'name email studentId department')
    .populate('course', 'title code department')
    .populate('markedBy', 'name email')
    .sort('-date');

  const attendanceRecords = await query;

  // Format response based on requested format
  if (format === 'csv') {
    // Create CSV content
    const csvData = attendanceRecords.map(record => ({
      Date: record.date.toISOString().split('T')[0],
      'Student Name': record.student.name,
      'Student ID': record.student.studentId,
      'Course Code': record.course.code,
      'Course Title': record.course.title,
      Status: record.status.toUpperCase(),
      Notes: record.notes || '',
      'Marked By': record.markedBy.name
    }));

    // Convert to CSV string
    const csvString = [
      Object.keys(csvData[0] || {}).join(','),
      ...csvData.map(row => Object.values(row).map(value => 
        `"${(value || '').toString().replace(/"/g, '""')}"`
      ).join(','))
    ].join('\n');

    // Set response headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=attendance_report.csv');
    
    return res.status(200).send(csvString);
  } else if (format === 'pdf') {
    // For PDF, we would typically use a PDF generation library
    // This is a placeholder for PDF generation logic
    return res.status(200).json({
      success: true,
      message: 'PDF export functionality would be implemented here',
      data: attendanceRecords,
      format: 'pdf'
    });
  }

  // Default JSON response
  res.status(200).json({
    success: true,
    count: attendanceRecords.length,
    data: attendanceRecords,
    format: 'json'
  });
});

// @desc    Get attendance report
// @route   GET /api/v1/attendance/report/:courseId
// @access  Private/Faculty
exports.getAttendanceReport = asyncHandler(async (req, res, next) => {
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
    return next(new ErrorResponse('Not authorized to view this report', 403));
  }

  const attendanceData = await Attendance.find({ course: courseId })
    .populate('student', 'name email studentId')
    .sort('date');

  res.status(200).json({
    success: true,
    data: attendanceData
  });
});

// @desc    Get attendance analytics
// @route   GET /api/v1/attendance/analytics/:courseId
// @access  Private/Faculty
exports.getAttendanceAnalytics = asyncHandler(async (req, res, next) => {
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
    return next(new ErrorResponse('Not authorized to view analytics', 403));
  }

  const analytics = await Attendance.aggregate([
    { $match: { course: mongoose.Types.ObjectId(courseId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: analytics
  });
});

// @desc    Get attendance statistics
// @route   GET /api/v1/attendance/statistics
// @access  Private/Admin or Faculty
exports.getAttendanceStatistics = asyncHandler(async (req, res, next) => {
  // Check authorization
  if (req.user.role !== 'admin' && req.user.role !== 'faculty') {
    return next(new ErrorResponse('Only admin and faculty can view statistics', 403));
  }

  const { course, startDate, endDate } = req.query;

  // Build match conditions
  const matchConditions = {};

  if (course) {
    matchConditions.course = mongoose.Types.ObjectId(course);
    
    // For faculty, check if they own the course
    if (req.user.role === 'faculty') {
      const courseObj = await Course.findById(course);
      if (!courseObj || courseObj.faculty.toString() !== req.user.id) {
        return next(new ErrorResponse('Not authorized to view statistics for this course', 403));
      }
    }
  } else if (req.user.role === 'faculty') {
    // Faculty can only see statistics for their courses
    const facultyCourses = await Course.find({ faculty: req.user.id }).distinct('_id');
    matchConditions.course = { $in: facultyCourses };
  }

  if (startDate || endDate) {
    matchConditions.date = {};
    if (startDate) matchConditions.date.$gte = new Date(startDate);
    if (endDate) matchConditions.date.$lte = new Date(endDate);
  }

  // Get statistics by status
  const statusStats = await Attendance.aggregate([
    {
      $match: matchConditions
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);

  // Get statistics by course
  const courseStats = await Attendance.aggregate([
    {
      $match: matchConditions
    },
    {
      $group: {
        _id: '$course',
        total: { $sum: 1 },
        present: {
          $sum: {
            $cond: [{ $in: ['$status', ['present', 'late', 'half-day']] }, 1, 0]
          }
        }
      }
    },
    {
      $lookup: {
        from: 'courses',
        localField: '_id',
        foreignField: '_id',
        as: 'course'
      }
    },
    {
      $unwind: '$course'
    },
    {
      $project: {
        course: {
          _id: '$course._id',
          title: '$course.title',
          code: '$course.code'
        },
        total: 1,
        present: 1,
        attendanceRate: {
          $cond: [
            { $eq: ['$total', 0] },
            0,
            { $multiply: [{ $divide: ['$present', '$total'] }, 100] }
          ]
        }
      }
    },
    {
      $sort: { attendanceRate: -1 }
    }
  ]);

  // Get daily attendance trends
  const dailyTrends = await Attendance.aggregate([
    {
      $match: matchConditions
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$date' }
        },
        total: { $sum: 1 },
        present: {
          $sum: {
            $cond: [{ $in: ['$status', ['present', 'late', 'half-day']] }, 1, 0]
          }
        }
      }
    },
    {
      $project: {
        date: '$_id',
        total: 1,
        present: 1,
        attendanceRate: {
          $cond: [
            { $eq: ['$total', 0] },
            0,
            { $multiply: [{ $divide: ['$present', '$total'] }, 100] }
          ]
        }
      }
    },
    {
      $sort: { date: 1 }
    },
    {
      $limit: 30 // Last 30 days
    }
  ]);

  // Calculate overall statistics
  const totalRecords = statusStats.reduce((sum, stat) => sum + stat.count, 0);
  const presentRecords = statusStats
    .filter(stat => ['present', 'late', 'half-day'].includes(stat._id))
    .reduce((sum, stat) => sum + stat.count, 0);

  const overallAttendanceRate = totalRecords > 0 
    ? (presentRecords / totalRecords) * 100 
    : 0;

  res.status(200).json({
    success: true,
    data: {
      overall: {
        totalRecords,
        presentRecords,
        attendanceRate: overallAttendanceRate.toFixed(2)
      },
      byStatus: statusStats,
      byCourse: courseStats,
      dailyTrends,
      dateRange: {
        startDate: startDate || 'Not specified',
        endDate: endDate || 'Not specified'
      }
    }
  });
});