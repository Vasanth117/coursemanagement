const { Lesson, Course } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/ErrorResponse');

// @desc    Get all lessons for a course
// @route   GET /api/v1/lessons/course/:courseId
// @access  Private
exports.getLessons = asyncHandler(async (req, res, next) => {
  const lessons = await Lesson.find({ course: req.params.courseId }).sort('order');

  res.status(200).json({
    success: true,
    count: lessons.length,
    data: lessons
  });
});

// @desc    Get single lesson
// @route   GET /api/v1/lessons/:id
// @access  Private
exports.getLesson = asyncHandler(async (req, res, next) => {
  const lesson = await Lesson.findById(req.params.id);

  if (!lesson) {
    return next(new ErrorResponse(`Lesson not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: lesson
  });
});

// @desc    Create lesson
// @route   POST /api/v1/lessons
// @access  Private/Faculty or Admin
exports.createLesson = asyncHandler(async (req, res, next) => {
  req.body.createdBy = req.user.id;

  const course = await Course.findById(req.body.course);
  if (!course) {
    return next(new ErrorResponse('Course not found', 404));
  }

  // Check authorization
  if (req.user.role !== 'admin' && course.faculty.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to add lessons to this course', 403));
  }

  const lesson = await Lesson.create(req.body);

  res.status(201).json({
    success: true,
    data: lesson
  });
});

// @desc    Update lesson
// @route   PUT /api/v1/lessons/:id
// @access  Private/Faculty or Admin
exports.updateLesson = asyncHandler(async (req, res, next) => {
  let lesson = await Lesson.findById(req.params.id);

  if (!lesson) {
    return next(new ErrorResponse(`Lesson not found with id of ${req.params.id}`, 404));
  }

  // Check authorization
  const course = await Course.findById(lesson.course);
  if (req.user.role !== 'admin' && course.faculty.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to update this lesson', 403));
  }

  lesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: lesson
  });
});

// @desc    Delete lesson
// @route   DELETE /api/v1/lessons/:id
// @access  Private/Faculty or Admin
exports.deleteLesson = asyncHandler(async (req, res, next) => {
  const lesson = await Lesson.findById(req.params.id);

  if (!lesson) {
    return next(new ErrorResponse(`Lesson not found with id of ${req.params.id}`, 404));
  }

  // Check authorization
  const course = await Course.findById(lesson.course);
  if (req.user.role !== 'admin' && course.faculty.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to delete this lesson', 403));
  }

  await lesson.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});
