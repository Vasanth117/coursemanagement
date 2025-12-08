const express = require('express');
const { gradeController } = require('../../../controllers');
const { auth, role, validation } = require('../../../middleware');

const router = express.Router();

// @route   GET /api/v1/grades
// @desc    Get all grades
// @access  Private/Faculty
router.get('/',
  auth.protect,
  role.facultyOnly,
  validation.validatePagination,
  validation.handleValidationErrors,
  gradeController.getGrades
);

// @route   GET /api/v1/grades/course/:courseId
// @desc    Get grades by course
// @access  Private/Faculty
router.get('/course/:courseId',
  auth.protect,
  role.facultyOnly,
  validation.validateObjectId('courseId'),
  validation.validatePagination,
  validation.handleValidationErrors,
  gradeController.getCourseGrades
);

// @route   GET /api/v1/grades/student/:studentId
// @desc    Get student grades
// @access  Private/Student Self or Faculty
router.get('/student/:studentId',
  auth.protect,
  validation.validateObjectId('studentId'),
  validation.validatePagination,
  validation.handleValidationErrors,
  gradeController.getStudentGrades
);

// @route   GET /api/v1/grades/assignment/:assignmentId
// @desc    Get assignment grades
// @access  Private/Faculty
router.get('/assignment/:assignmentId',
  auth.protect,
  role.facultyOnly,
  validation.validateObjectId('assignmentId'),
  validation.validatePagination,
  validation.handleValidationErrors,
  gradeController.getAssignmentGrades
);

// @route   GET /api/v1/grades/:id
// @desc    Get single grade
// @access  Private/Student Self or Faculty
router.get('/:id',
  auth.protect,
  validation.validateObjectId('id'),
  validation.handleValidationErrors,
  gradeController.getGrade
);

// @route   POST /api/v1/grades
// @desc    Create grade
// @access  Private/Faculty
router.post('/',
  auth.protect,
  role.facultyOnly,
  validation.validateGrade,
  validation.handleValidationErrors,
  gradeController.createGrade
);

// @route   PUT /api/v1/grades/:id
// @desc    Update grade
// @access  Private/Faculty
router.put('/:id',
  auth.protect,
  role.facultyOnly,
  validation.validateObjectId('id'),
  validation.handleValidationErrors,
  gradeController.updateGrade
);

// @route   DELETE /api/v1/grades/:id
// @desc    Delete grade
// @access  Private/Faculty
router.delete('/:id',
  auth.protect,
  role.facultyOnly,
  validation.validateObjectId('id'),
  validation.handleValidationErrors,
  gradeController.deleteGrade
);

// @route   POST /api/v1/grades/bulk
// @desc    Bulk create grades
// @access  Private/Faculty
router.post('/bulk',
  auth.protect,
  role.facultyOnly,
  gradeController.bulkCreateGrades
);

// @route   GET /api/v1/grades/analytics/:courseId
// @desc    Get grade analytics for course
// @access  Private/Faculty
router.get('/analytics/:courseId',
  auth.protect,
  role.facultyOnly,
  validation.validateObjectId('courseId'),
  validation.handleValidationErrors,
  gradeController.getGradeAnalytics
);

module.exports = router;