const { Grade, Assignment, Course, User, Enrollment } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/ErrorResponse');
const mongoose = require('mongoose');

// @desc    Get all grades
// @route   GET /api/v1/grades
// @access  Private/Admin or Faculty
exports.getGrades = asyncHandler(async (req, res, next) => {
  let query;

  // Admin sees all grades
  if (req.user.role === 'admin') {
    query = Grade.find();
  } 
  // Faculty sees grades for their courses
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
  // Students see only their own grades
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

  // Filter by status
  if (req.query.status) {
    query = query.where('status').equals(req.query.status);
  }

  // Filter by graded status
  if (req.query.graded !== undefined) {
    if (req.query.graded === 'true') {
      query = query.where('status').equals('graded');
    } else {
      query = query.where('status').ne('graded');
    }
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

  // Filter by student (for admin/faculty)
  if (req.query.student && req.user.role !== 'student') {
    query = query.where('student').equals(req.query.student);
  }

  // Filter by score range
  if (req.query.minScore) {
    query = query.where('score').gte(parseFloat(req.query.minScore));
  }
  
  if (req.query.maxScore) {
    query = query.where('score').lte(parseFloat(req.query.maxScore));
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
    query = query.sort('-gradedAt');
  }

  // Populate details based on user role
  if (req.user.role === 'student') {
    // Students see assignment, course, and grader details
    query = query
      .populate('assignment', 'title type maxPoints weightage')
      .populate('course', 'title code')
      .populate('gradedBy', 'name');
  } else {
    // Admin/Faculty see student, assignment, and course details
    query = query
      .populate('student', 'name email studentId department')
      .populate('assignment', 'title type maxPoints weightage')
      .populate('course', 'title code')
      .populate('gradedBy', 'name');
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const startIndex = (page - 1) * limit;
  const total = await Grade.countDocuments(query);

  query = query.skip(startIndex).limit(limit);

  const grades = await query;

  res.status(200).json({
    success: true,
    count: grades.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    data: grades
  });
});

// @desc    Get single grade
// @route   GET /api/v1/grades/:id
// @access  Private
exports.getGrade = asyncHandler(async (req, res, next) => {
  const grade = await Grade.findById(req.params.id)
    .populate('student', 'name email studentId department')
    .populate('assignment', 'title description type maxPoints weightage dueDate')
    .populate('course', 'title code department')
    .populate('gradedBy', 'name email');

  if (!grade) {
    return next(new ErrorResponse(`Grade not found with id of ${req.params.id}`, 404));
  }

  // Check authorization
  const isAdmin = req.user.role === 'admin';
  const isStudent = req.user.role === 'student' && grade.student._id.toString() === req.user.id;
  
  let isFaculty = false;
  if (req.user.role === 'faculty') {
    const course = await Course.findById(grade.course);
    isFaculty = course && course.faculty.toString() === req.user.id;
  }

  if (!isAdmin && !isStudent && !isFaculty) {
    return next(new ErrorResponse('Not authorized to view this grade', 403));
  }

  // Calculate percentage and letter grade
  const percentage = grade.maxScore > 0 ? (grade.score / grade.maxScore) * 100 : 0;
  const letterGrade = getLetterGrade(percentage);

  res.status(200).json({
    success: true,
    data: {
      ...grade.toObject(),
      percentage: Math.round(percentage * 100) / 100,
      letterGrade
    }
  });
});

// @desc    Update grade
// @route   PUT /api/v1/grades/:id
// @access  Private/Faculty or Admin
exports.updateGrade = asyncHandler(async (req, res, next) => {
  const { score, feedback } = req.body;

  const grade = await Grade.findById(req.params.id)
    .populate('assignment')
    .populate('course');

  if (!grade) {
    return next(new ErrorResponse(`Grade not found with id of ${req.params.id}`, 404));
  }

  // Check authorization
  const isAdmin = req.user.role === 'admin';
  
  let isFaculty = false;
  if (req.user.role === 'faculty') {
    const course = await Course.findById(grade.course);
    isFaculty = course && course.faculty.toString() === req.user.id;
  }

  if (!isAdmin && !isFaculty) {
    return next(new ErrorResponse('Not authorized to update this grade', 403));
  }

  // Validate score if provided
  if (score !== undefined) {
    if (score < 0 || score > grade.assignment.maxPoints) {
      return next(new ErrorResponse(`Score must be between 0 and ${grade.assignment.maxPoints}`, 400));
    }

    // Apply late penalty if applicable
    let finalScore = score;
    if (grade.isLate && grade.latePenalty > 0) {
      finalScore = score * (1 - grade.latePenalty / 100);
    }

    grade.score = Math.max(0, finalScore);
  }

  // Update feedback if provided
  if (feedback !== undefined) {
    grade.feedback = feedback;
  }

  // Update grade status and grader info
  grade.status = 'graded';
  grade.gradedBy = req.user.id;
  grade.gradedAt = new Date();

  await grade.save();

  // Populate details for response
  await grade.populate('student', 'name email studentId');
  await grade.populate('assignment', 'title maxPoints');
  await grade.populate('gradedBy', 'name');

  // Calculate percentage
  const percentage = grade.maxScore > 0 ? (grade.score / grade.maxScore) * 100 : 0;

  res.status(200).json({
    success: true,
    data: {
      ...grade.toObject(),
      percentage: Math.round(percentage * 100) / 100,
      letterGrade: getLetterGrade(percentage)
    }
  });
});

// @desc    Delete grade
// @route   DELETE /api/v1/grades/:id
// @access  Private/Admin
exports.deleteGrade = asyncHandler(async (req, res, next) => {
  const grade = await Grade.findById(req.params.id);

  if (!grade) {
    return next(new ErrorResponse(`Grade not found with id of ${req.params.id}`, 404));
  }

  // Only admin can delete grades
  if (req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to delete grades', 403));
  }

  await grade.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get course grades
// @route   GET /api/v1/grades/course/:courseId
// @access  Private/Admin, Faculty, or Students in course
exports.getCourseGrades = asyncHandler(async (req, res, next) => {
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
    return next(new ErrorResponse('Not authorized to view these grades', 403));
  }

  // Build query based on user role
  let query = Grade.find({ course: courseId });

  if (isStudent) {
    // Students only see their own grades
    query = query.where('student').equals(req.user.id);
  }

  // Filter by assignment
  if (req.query.assignment) {
    query = query.where('assignment').equals(req.query.assignment);
  }

  // Filter by status
  if (req.query.status) {
    query = query.where('status').equals(req.query.status);
  }

  // Sort
  const sortBy = req.query.sort || '-gradedAt';
  query = query.sort(sortBy);

  // Populate details
  if (isStudent) {
    query = query
      .populate('assignment', 'title type weightage maxPoints')
      .populate('gradedBy', 'name');
  } else {
    query = query
      .populate('student', 'name email studentId department')
      .populate('assignment', 'title type weightage maxPoints')
      .populate('gradedBy', 'name');
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const startIndex = (page - 1) * limit;
  const total = await Grade.countDocuments(query);

  query = query.skip(startIndex).limit(limit);

  const grades = await query;

  // Calculate course statistics (for admin/faculty)
  let courseStatistics = null;
  if (!isStudent) {
    const allCourseGrades = await Grade.find({ 
      course: courseId,
      status: 'graded'
    });

    const totalScore = allCourseGrades.reduce((sum, g) => sum + (g.score || 0), 0);
    const totalMaxScore = allCourseGrades.reduce((sum, g) => sum + (g.maxScore || 0), 0);
    
    const averageGrade = totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0;

    // Get grade distribution
    const gradeDistribution = [
      { range: 'A (90-100)', count: 0 },
      { range: 'B (80-89)', count: 0 },
      { range: 'C (70-79)', count: 0 },
      { range: 'D (60-69)', count: 0 },
      { range: 'F (0-59)', count: 0 }
    ];

    allCourseGrades.forEach(grade => {
      const percentage = grade.maxScore > 0 ? (grade.score / grade.maxScore) * 100 : 0;
      
      if (percentage >= 90) gradeDistribution[0].count++;
      else if (percentage >= 80) gradeDistribution[1].count++;
      else if (percentage >= 70) gradeDistribution[2].count++;
      else if (percentage >= 60) gradeDistribution[3].count++;
      else gradeDistribution[4].count++;
    });

    courseStatistics = {
      totalGraded: allCourseGrades.length,
      averageGrade: Math.round(averageGrade * 100) / 100,
      gradeDistribution
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
      grades,
      statistics: courseStatistics
    },
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Get student grades for a course
// @route   GET /api/v1/grades/student/:studentId/course/:courseId
// @access  Private/Admin, Faculty, or Student Self
exports.getStudentCourseGrades = asyncHandler(async (req, res, next) => {
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
  const isFaculty = req.user.role === 'faculty' && course.faculty.toString() === req.user.id;

  if (!isAdmin && !isStudentSelf && !isFaculty) {
    return next(new ErrorResponse('Not authorized to view these grades', 403));
  }

  // Get all grades for this student in this course
  const grades = await Grade.find({
    student: studentId,
    course: courseId
  })
    .populate('assignment', 'title type dueDate maxPoints weightage')
    .sort('assignment.dueDate');

  // Calculate current grade
  let totalWeightedScore = 0;
  let totalWeight = 0;

  const gradedAssignments = grades.filter(g => g.status === 'graded');
  
  gradedAssignments.forEach(grade => {
    if (grade.score !== null && grade.assignment) {
      const weight = grade.assignment.weightage || 1;
      const percentage = (grade.score / grade.assignment.maxPoints) * 100;
      totalWeightedScore += percentage * weight;
      totalWeight += weight;
    }
  });

  const currentGrade = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;

  // Get all assignments for the course
  const assignments = await Assignment.find({
    course: courseId,
    isPublished: true
  }).select('title type dueDate maxPoints weightage');

  // Match assignments with grades
  const assignmentGrades = assignments.map(assignment => {
    const grade = grades.find(g => g.assignment && g.assignment._id.toString() === assignment._id.toString());
    
    return {
      assignment: {
        id: assignment._id,
        title: assignment.title,
        type: assignment.type,
        dueDate: assignment.dueDate,
        maxPoints: assignment.maxPoints,
        weightage: assignment.weightage
      },
      grade: grade ? {
        id: grade._id,
        score: grade.score,
        maxScore: grade.maxScore,
        percentage: grade.maxScore > 0 ? (grade.score / grade.maxScore) * 100 : 0,
        status: grade.status,
        submittedAt: grade.submittedAt,
        gradedAt: grade.gradedAt,
        isLate: grade.isLate,
        feedback: grade.feedback
      } : null,
      status: grade ? grade.status : 'pending'
    };
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
      course: {
        id: course._id,
        title: course.title,
        code: course.code,
        department: course.department
      },
      grades: assignmentGrades,
      statistics: {
        totalAssignments: assignments.length,
        submitted: grades.length,
        graded: gradedAssignments.length,
        pending: assignments.length - grades.length,
        currentGrade: Math.round(currentGrade * 100) / 100,
        letterGrade: getLetterGrade(currentGrade)
      }
    }
  });
});

// @desc    Get grade statistics
// @route   GET /api/v1/grades/statistics
// @access  Private/Admin or Faculty
exports.getGradeStatistics = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'faculty') {
    return next(new ErrorResponse('Not authorized to view grade statistics', 403));
  }

  let matchQuery = { status: 'graded' };

  // For faculty, only show statistics for their courses
  if (req.user.role === 'faculty') {
    const facultyCourses = await Course.find({ faculty: req.user.id }).distinct('_id');
    const facultyAssignments = await Assignment.find({ 
      course: { $in: facultyCourses } 
    }).distinct('_id');
    
    matchQuery.assignment = { $in: facultyAssignments };
  }

  // Apply additional filters
  if (req.query.course) {
    const courseAssignments = await Assignment.find({ 
      course: req.query.course 
    }).distinct('_id');
    
    matchQuery.assignment = { $in: courseAssignments };
  }

  if (req.query.assignment) {
    matchQuery.assignment = req.query.assignment;
  }

  // Get statistics using aggregation
  const statistics = await Grade.aggregate([
    {
      $match: matchQuery
    },
    {
      $group: {
        _id: null,
        totalGrades: { $sum: 1 },
        averageScore: { $avg: '$score' },
        averageMaxScore: { $avg: '$maxScore' },
        highestScore: { $max: '$score' },
        lowestScore: { $min: '$score' },
        totalLateSubmissions: {
          $sum: { $cond: [{ $eq: ['$isLate', true] }, 1, 0] }
        }
      }
    },
    {
      $project: {
        totalGrades: 1,
        averageScore: { $round: ['$averageScore', 2] },
        averageMaxScore: { $round: ['$averageMaxScore', 2] },
        averagePercentage: {
          $round: [
            {
              $multiply: [
                { $divide: ['$averageScore', '$averageMaxScore'] },
                100
              ]
            },
            2
          ]
        },
        highestScore: 1,
        lowestScore: 1,
        totalLateSubmissions: 1,
        lateSubmissionRate: {
          $round: [
            {
              $multiply: [
                { $divide: ['$totalLateSubmissions', '$totalGrades'] },
                100
              ]
            },
            2
          ]
        }
      }
    }
  ]);

  // Get grade distribution
  const gradeDistribution = await Grade.aggregate([
    {
      $match: matchQuery
    },
    {
      $project: {
        percentage: {
          $multiply: [
            { $divide: ['$score', '$maxScore'] },
            100
          ]
        }
      }
    },
    {
      $bucket: {
        groupBy: '$percentage',
        boundaries: [0, 60, 70, 80, 90, 101],
        default: 'Other',
        output: {
          count: { $sum: 1 },
          minPercentage: { $min: '$percentage' },
          maxPercentage: { $max: '$percentage' }
        }
      }
    },
    {
      $project: {
        range: {
          $switch: {
            branches: [
              { case: { $eq: ['$_id', 0] }, then: 'F (0-59)' },
              { case: { $eq: ['$_id', 60] }, then: 'D (60-69)' },
              { case: { $eq: ['$_id', 70] }, then: 'C (70-79)' },
              { case: { $eq: ['$_id', 80] }, then: 'B (80-89)' },
              { case: { $eq: ['$_id', 90] }, then: 'A (90-100)' }
            ],
            default: 'Other'
          }
        },
        count: 1,
        percentageRange: {
          $concat: [
            { $toString: { $round: ['$minPercentage', 0] } },
            '-',
            { $toString: { $round: ['$maxPercentage', 0] } }
          ]
        }
      }
    },
    {
      $sort: { '_id': 1 }
    }
  ]);

  // Get statistics by course
  let coursesWithStats = [];
  if (req.user.role === 'admin' || !req.query.course) {
    coursesWithStats = await Grade.aggregate([
      {
        $match: { status: 'graded' }
      },
      {
        $lookup: {
          from: 'assignments',
          localField: 'assignment',
          foreignField: '_id',
          as: 'assignmentData'
        }
      },
      {
        $unwind: '$assignmentData'
      },
      {
        $lookup: {
          from: 'courses',
          localField: 'assignmentData.course',
          foreignField: '_id',
          as: 'courseData'
        }
      },
      {
        $unwind: '$courseData'
      },
      {
        $group: {
          _id: '$courseData._id',
          courseTitle: { $first: '$courseData.title' },
          courseCode: { $first: '$courseData.code' },
          totalGrades: { $sum: 1 },
          averageScore: { $avg: '$score' },
          averageMaxScore: { $avg: '$maxScore' }
        }
      },
      {
        $project: {
          courseTitle: 1,
          courseCode: 1,
          totalGrades: 1,
          averageScore: { $round: ['$averageScore', 2] },
          averagePercentage: {
            $round: [
              {
                $multiply: [
                  { $divide: ['$averageScore', '$averageMaxScore'] },
                  100
                ]
              },
              2
            ]
          }
        }
      },
      {
        $sort: { averagePercentage: -1 }
      },
      {
        $limit: 10
      }
    ]);
  }

  res.status(200).json({
    success: true,
    data: {
      overall: statistics[0] || {},
      gradeDistribution,
      topCourses: coursesWithStats
    }
  });
});

// @desc    Bulk update grades
// @route   PUT /api/v1/grades/bulk-update
// @access  Private/Admin or Faculty
exports.bulkUpdateGrades = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'faculty') {
    return next(new ErrorResponse('Not authorized to update grades in bulk', 403));
  }

  const { grades } = req.body;

  if (!Array.isArray(grades) || grades.length === 0) {
    return next(new ErrorResponse('Please provide an array of grades to update', 400));
  }

  const results = {
    success: [],
    errors: []
  };

  // Process each grade update
  for (const gradeData of grades) {
    try {
      const { gradeId, score, feedback } = gradeData;

      if (!gradeId) {
        results.errors.push({
          error: 'Missing grade ID'
        });
        continue;
      }

      // Find the grade
      const grade = await Grade.findById(gradeId)
        .populate('assignment')
        .populate('course');

      if (!grade) {
        results.errors.push({
          gradeId,
          error: 'Grade not found'
        });
        continue;
      }

      // Check authorization for faculty
      if (req.user.role === 'faculty') {
        const course = await Course.findById(grade.course);
        if (!course || course.faculty.toString() !== req.user.id) {
          results.errors.push({
            gradeId,
            error: 'Not authorized to update this grade'
          });
          continue;
        }
      }

      // Validate score if provided
      if (score !== undefined) {
        if (score < 0 || score > grade.assignment.maxPoints) {
          results.errors.push({
            gradeId,
            error: `Score must be between 0 and ${grade.assignment.maxPoints}`
          });
          continue;
        }

        // Apply late penalty if applicable
        let finalScore = score;
        if (grade.isLate && grade.latePenalty > 0) {
          finalScore = score * (1 - grade.latePenalty / 100);
        }

        grade.score = Math.max(0, finalScore);
      }

      // Update feedback if provided
      if (feedback !== undefined) {
        grade.feedback = feedback;
      }

      // Update grade status and grader info
      grade.status = 'graded';
      grade.gradedBy = req.user.id;
      grade.gradedAt = new Date();

      await grade.save();

      results.success.push({
        gradeId,
        studentId: grade.student,
        score: grade.score,
        status: 'updated'
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

// @desc    Get gradebook for a course
// @route   GET /api/v1/grades/gradebook/course/:courseId
// @access  Private/Admin or Faculty
exports.getCourseGradebook = asyncHandler(async (req, res, next) => {
  const { courseId } = req.params;

  // Validate course
  const course = await Course.findById(courseId)
    .populate('enrolledStudents', 'name email studentId department');

  if (!course) {
    return next(new ErrorResponse('Course not found', 404));
  }

  // Check authorization
  const isAdmin = req.user.role === 'admin';
  const isFaculty = req.user.role === 'faculty' && course.faculty.toString() === req.user.id;

  if (!isAdmin && !isFaculty) {
    return next(new ErrorResponse('Not authorized to view this gradebook', 403));
  }

  // Get all assignments for the course
  const assignments = await Assignment.find({
    course: courseId,
    isPublished: true
  })
    .select('title type dueDate maxPoints weightage')
    .sort('dueDate');

  // Get all grades for the course
  const allGrades = await Grade.find({ course: courseId })
    .populate('student', 'name email studentId department');

  // Build gradebook
  const gradebook = await Promise.all(
    course.enrolledStudents.map(async (student) => {
      const studentGrades = allGrades.filter(g => 
        g.student._id.toString() === student._id.toString()
      );

      // Calculate grade for each assignment
      const assignmentGrades = assignments.map(assignment => {
        const grade = studentGrades.find(g => 
          g.assignment && g.assignment.toString() === assignment._id.toString()
        );

        return {
          assignment: {
            id: assignment._id,
            title: assignment.title,
            type: assignment.type,
            maxPoints: assignment.maxPoints,
            weightage: assignment.weightage
          },
          grade: grade ? {
            id: grade._id,
            score: grade.score,
            status: grade.status,
            submittedAt: grade.submittedAt,
            isLate: grade.isLate
          } : null,
          percentage: grade && grade.score !== null
            ? (grade.score / assignment.maxPoints) * 100
            : null
        };
      });

      // Calculate final grade
      const gradedAssignments = assignmentGrades.filter(ag => 
        ag.grade && ag.grade.status === 'graded' && ag.grade.score !== null
      );

      let totalWeightedScore = 0;
      let totalWeight = 0;

      gradedAssignments.forEach(ag => {
        const weight = ag.assignment.weightage || 1;
        const percentage = (ag.grade.score / ag.assignment.maxPoints) * 100;
        totalWeightedScore += percentage * weight;
        totalWeight += weight;
      });

      const finalGrade = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;

      return {
        student: {
          id: student._id,
          name: student.name,
          email: student.email,
          studentId: student.studentId,
          department: student.department
        },
        assignmentGrades,
        statistics: {
          totalAssignments: assignments.length,
          submitted: studentGrades.length,
          graded: gradedAssignments.length,
          pending: assignments.length - studentGrades.length,
          finalGrade: Math.round(finalGrade * 100) / 100,
          letterGrade: getLetterGrade(finalGrade)
        }
      };
    })
  );

  res.status(200).json({
    success: true,
    data: {
      course: {
        id: course._id,
        title: course.title,
        code: course.code,
        department: course.department
      },
      assignments,
      gradebook
    }
  });
});

// @desc    Export gradebook as CSV
// @route   GET /api/v1/grades/gradebook/course/:courseId/export
// @access  Private/Admin or Faculty
exports.exportGradebook = asyncHandler(async (req, res, next) => {
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
    return next(new ErrorResponse('Not authorized to export this gradebook', 403));
  }

  // Get all assignments for the course
  const assignments = await Assignment.find({
    course: courseId,
    isPublished: true
  })
    .select('title maxPoints weightage')
    .sort('dueDate');

  // Get enrolled students
  const students = await User.find({
    _id: { $in: course.enrolledStudents },
    role: 'student'
  })
    .select('name studentId email department')
    .sort('name');

  // Generate CSV header
  let csvData = 'Student Name,Student ID,Email,Department,';

  // Add assignment columns
  assignments.forEach((assignment, index) => {
    csvData += `${assignment.title} (${assignment.maxPoints} pts)`;
    if (index < assignments.length - 1) {
      csvData += ',';
    }
  });

  csvData += ',Final Grade,Letter Grade\n';

  // Generate CSV rows
  for (const student of students) {
    csvData += `"${student.name}","${student.studentId}","${student.email}","${student.department}",`;

    let totalWeightedScore = 0;
    let totalWeight = 0;

    // Get grades for each assignment
    for (const assignment of assignments) {
      const grade = await Grade.findOne({
        student: student._id,
        assignment: assignment._id,
        status: 'graded'
      });

      if (grade && grade.score !== null) {
        const weight = assignment.weightage || 1;
        const percentage = (grade.score / assignment.maxPoints) * 100;
        totalWeightedScore += percentage * weight;
        totalWeight += weight;
        
        csvData += grade.score;
      } else {
        csvData += '';
      }

      if (assignment !== assignments[assignments.length - 1]) {
        csvData += ',';
      }
    }

    // Calculate final grade
    const finalGrade = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
    const letterGrade = getLetterGrade(finalGrade);

    csvData += `,${Math.round(finalGrade * 100) / 100},${letterGrade}\n`;
  }

  // Set response headers for CSV download
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${course.code}_gradebook.csv"`);

  res.status(200).send(csvData);
});

// @desc    Get student grades
// @route   GET /api/v1/grades/student/:studentId
// @access  Private
exports.getStudentGrades = asyncHandler(async (req, res, next) => {
  const studentId = req.params.studentId;
  
  const student = await User.findById(studentId);
  if (!student || student.role !== 'student') {
    return next(new ErrorResponse('Student not found', 404));
  }
  
  const isAdmin = req.user.role === 'admin';
  const isStudentSelf = req.user.role === 'student' && req.user.id === studentId;
  
  if (!isAdmin && !isStudentSelf) {
    return next(new ErrorResponse('Not authorized', 403));
  }
  
  const grades = await Grade.find({ student: studentId })
    .populate('assignment', 'title type maxPoints')
    .populate('course', 'title code')
    .sort('-gradedAt');
  
  res.status(200).json({
    success: true,
    count: grades.length,
    data: grades
  });
});

// @desc    Get assignment grades
// @route   GET /api/v1/grades/assignment/:assignmentId
// @access  Private/Faculty
exports.getAssignmentGrades = asyncHandler(async (req, res, next) => {
  const assignmentId = req.params.assignmentId;
  
  const assignment = await Assignment.findById(assignmentId).populate('course');
  if (!assignment) {
    return next(new ErrorResponse('Assignment not found', 404));
  }
  
  const isAdmin = req.user.role === 'admin';
  const isFaculty = req.user.role === 'faculty' && assignment.course.faculty.toString() === req.user.id;
  
  if (!isAdmin && !isFaculty) {
    return next(new ErrorResponse('Not authorized', 403));
  }
  
  const grades = await Grade.find({ assignment: assignmentId })
    .populate('student', 'name email studentId')
    .sort('student.name');
  
  res.status(200).json({
    success: true,
    count: grades.length,
    data: grades
  });
});

// @desc    Create grade
// @route   POST /api/v1/grades
// @access  Private/Faculty
exports.createGrade = asyncHandler(async (req, res, next) => {
  const { student, assignment, score, feedback } = req.body;
  
  const assignmentObj = await Assignment.findById(assignment).populate('course');
  if (!assignmentObj) {
    return next(new ErrorResponse('Assignment not found', 404));
  }
  
  const isAdmin = req.user.role === 'admin';
  const isFaculty = req.user.role === 'faculty' && assignmentObj.course.faculty.toString() === req.user.id;
  
  if (!isAdmin && !isFaculty) {
    return next(new ErrorResponse('Not authorized', 403));
  }
  
  const grade = await Grade.create({
    student,
    assignment,
    course: assignmentObj.course._id,
    score,
    maxScore: assignmentObj.maxPoints,
    feedback,
    status: 'graded',
    gradedBy: req.user.id,
    gradedAt: new Date()
  });
  
  res.status(201).json({
    success: true,
    data: grade
  });
});

// @desc    Bulk create grades
// @route   POST /api/v1/grades/bulk
// @access  Private/Faculty
exports.bulkCreateGrades = asyncHandler(async (req, res, next) => {
  const { grades } = req.body;
  
  if (!Array.isArray(grades)) {
    return next(new ErrorResponse('Please provide an array of grades', 400));
  }
  
  const results = [];
  
  for (const gradeData of grades) {
    try {
      const grade = await Grade.create({
        ...gradeData,
        gradedBy: req.user.id,
        gradedAt: new Date()
      });
      results.push(grade);
    } catch (error) {
      return next(new ErrorResponse(`Error creating grade: ${error.message}`, 400));
    }
  }
  
  res.status(201).json({
    success: true,
    count: results.length,
    data: results
  });
});

// @desc    Get grade analytics
// @route   GET /api/v1/grades/analytics/:courseId
// @access  Private/Faculty
exports.getGradeAnalytics = asyncHandler(async (req, res, next) => {
  const courseId = req.params.courseId;
  
  const course = await Course.findById(courseId);
  if (!course) {
    return next(new ErrorResponse('Course not found', 404));
  }
  
  const isAdmin = req.user.role === 'admin';
  const isFaculty = req.user.role === 'faculty' && course.faculty.toString() === req.user.id;
  
  if (!isAdmin && !isFaculty) {
    return next(new ErrorResponse('Not authorized', 403));
  }
  
  const grades = await Grade.find({ course: courseId, status: 'graded' });
  
  const analytics = {
    totalGrades: grades.length,
    averageScore: grades.length > 0 ? grades.reduce((sum, g) => sum + g.score, 0) / grades.length : 0,
    highestScore: grades.length > 0 ? Math.max(...grades.map(g => g.score)) : 0,
    lowestScore: grades.length > 0 ? Math.min(...grades.map(g => g.score)) : 0
  };
  
  res.status(200).json({
    success: true,
    data: analytics
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