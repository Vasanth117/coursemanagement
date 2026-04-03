const express = require('express');
const { 
  facultyController, 
  assignmentController, 
  announcementController, 
  resourceController,
  attendanceController,
  gradeController,
  enrollmentController
} = require('../../../controllers');
const { auth, role, validation, upload, rateLimiter } = require('../../../middleware');

const router = express.Router();

router.get('/dashboard',
  auth.protect,
  role.facultyOnly,
  facultyController.getDashboard
);

// @route   GET /api/v1/faculty/dashboard/stats
// @desc    Get faculty dashboard statistics
// @access  Private/Faculty
router.get('/dashboard/stats',
  auth.protect,
  role.facultyOnly,
  facultyController.getDashboard
);

// @route   GET /api/v1/faculty/courses
// @desc    Get faculty courses
// @access  Private/Faculty
router.get('/courses',
  auth.protect,
  role.facultyOnly,
  validation.validatePagination,
  validation.handleValidationErrors,
  facultyController.getCourses
);

// @route   GET /api/v1/faculty/courses/:id
// @desc    Get single faculty course
// @access  Private/Faculty
router.get('/courses/:id',
  auth.protect,
  role.facultyOnly,
  facultyController.getFacultyCourse
);

// @route   POST /api/v1/faculty/courses
// @desc    Create new course
// @access  Private/Faculty
router.post('/courses',
  auth.protect,
  role.facultyOnly,
  facultyController.createCourse
);

// @route   PUT /api/v1/faculty/courses/:id
// @desc    Update course
// @access  Private/Faculty
router.put('/courses/:id',
  auth.protect,
  role.facultyOnly,
  facultyController.updateCourse
);

// @route   DELETE /api/v1/faculty/courses/:id
// @desc    Delete course
// @access  Private/Faculty
router.delete('/courses/:id',
  auth.protect,
  role.facultyOnly,
  facultyController.deleteCourse
);

// @route   GET /api/v1/faculty/courses/:id/gradebook
// @desc    Get course gradebook
// @access  Private/Faculty
router.get('/courses/:id/gradebook',
  auth.protect,
  role.facultyOnly,
  facultyController.getCourseStudents // This returns students with grades which is what gradebook usually needs
);

// @route   PUT /api/v1/faculty/courses/:id/grades
// @desc    Update course grades
// @access  Private/Faculty
router.put('/courses/:id/grades',
  auth.protect,
  role.facultyOnly,
  gradeController.bulkUpdateGrades
);

// @route   GET /api/v1/faculty/courses/:id/resources
// @desc    Get course resources
// @access  Private/Faculty
router.get('/courses/:id/resources',
  auth.protect,
  role.facultyOnly,
  resourceController.getCourseResources
);

// @route   POST /api/v1/faculty/courses/:id/resources
// @desc    Upload course resource
// @access  Private/Faculty
router.post('/courses/:id/resources',
  auth.protect,
  role.facultyOnly,
  upload.uploadResource,
  upload.handleUploadError,
  facultyController.uploadResource
);

// @route   GET /api/v1/faculty/students
// @desc    Get faculty students
// @access  Private/Faculty
router.get('/students',
  auth.protect,
  role.facultyOnly,
  validation.validatePagination,
  validation.handleValidationErrors,
  facultyController.getStudents
);

// @route   GET /api/v1/faculty/students/:id
// @desc    Get student by ID
// @access  Private/Faculty
router.get('/students/:id',
  auth.protect,
  role.facultyOnly,
  facultyController.getStudentById
);

// @route   GET /api/v1/faculty/assignments
// @desc    Get faculty assignments
// @access  Private/Faculty
router.get('/assignments',
  auth.protect,
  role.facultyOnly,
  validation.validatePagination,
  validation.handleValidationErrors,
  facultyController.getAssignments
);

// @route   GET /api/v1/faculty/assignments/:id
// @desc    Get single assignment
// @access  Private/Faculty
router.get('/assignments/:id',
  auth.protect,
  role.facultyOnly,
  assignmentController.getAssignment
);

// @route   POST /api/v1/faculty/assignments
// @desc    Create new assignment
// @access  Private/Faculty
router.post('/assignments',
  auth.protect,
  role.facultyOnly,
  upload.upload.single('file'),
  facultyController.createAssignment
);

// @route   PUT /api/v1/faculty/assignments/:id
// @desc    Update assignment
// @access  Private/Faculty
router.put('/assignments/:id',
  auth.protect,
  role.facultyOnly,
  assignmentController.updateAssignment
);

// @route   DELETE /api/v1/faculty/assignments/:id
// @desc    Delete assignment
// @access  Private/Faculty
router.delete('/assignments/:id',
  auth.protect,
  role.facultyOnly,
  assignmentController.deleteAssignment
);

// @route   GET /api/v1/faculty/assignments/:id/submissions
// @desc    Get assignment submissions
// @access  Private/Faculty
router.get('/assignments/:id/submissions',
  auth.protect,
  role.facultyOnly,
  facultyController.getAssignmentSubmissions
);

// @route   GET /api/v1/faculty/submissions
// @desc    Get pending submissions
// @access  Private/Faculty
router.get('/submissions',
  auth.protect,
  role.facultyOnly,
  validation.validatePagination,
  validation.handleValidationErrors,
  facultyController.getSubmissions
);

// @route   PUT /api/v1/faculty/submissions/:id/grade
// @desc    Grade submission
// @access  Private/Faculty
router.put('/submissions/:id/grade',
  auth.protect,
  role.facultyOnly,
  facultyController.gradeSubmission
);

// @route   GET /api/v1/faculty/grades
// @desc    Get grading overview
// @access  Private/Faculty
router.get('/grades',
  auth.protect,
  role.facultyOnly,
  facultyController.getGrades
);

// @route   GET /api/v1/faculty/gradebook/export
// @desc    Export gradebook to CSV
// @access  Private/Faculty
router.get('/gradebook/export',
  auth.protect,
  role.facultyOnly,
  facultyController.exportGradebook
);

// @route   POST /api/v1/faculty/attendance
// @desc    Update attendance
// @access  Private/Faculty
router.post('/attendance',
  auth.protect,
  role.facultyOnly,
  attendanceController.bulkMarkAttendance
);

// @route   GET /api/v1/faculty/announcements
// @desc    Get faculty announcements
// @access  Private/Faculty
router.get('/announcements',
  auth.protect,
  role.facultyOnly,
  announcementController.getAnnouncements
);

// @route   POST /api/v1/faculty/announcements
// @desc    Create new announcement
// @access  Private/Faculty
router.post('/announcements',
  auth.protect,
  role.facultyOnly,
  facultyController.createAnnouncement
);

// @route   PUT /api/v1/faculty/profile
// @desc    Update faculty profile
// @access  Private/Faculty
router.put('/profile',
  auth.protect,
  role.facultyOnly,
  facultyController.updateProfile
);

// @route   GET /api/v1/faculty/analytics
// @desc    Get faculty analytics
// @access  Private/Faculty
router.get('/analytics',
  auth.protect,
  role.facultyOnly,
  facultyController.getAnalytics
);

// @route   DELETE /api/v1/faculty/resources/:id
// @desc    Delete resource
// @access  Private/Faculty
router.delete('/resources/:id',
  auth.protect,
  role.facultyOnly,
  resourceController.deleteResource
);

// @route   GET /api/v1/faculty/:facultyId/enrollments
// @desc    Get faculty enrollments
// @access  Private/Faculty
router.get('/:facultyId/enrollments',
  auth.protect,
  role.facultyOnly,
  enrollmentController.getFacultyEnrollments
);

module.exports = router;