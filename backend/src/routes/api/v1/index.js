const express = require('express');
const authRoutes = require('./authRoutes');
const adminRoutes = require('./adminRoutes');
const facultyRoutes = require('./facultyRoutes');
const studentRoutes = require('./studentRoutes');
const courseRoutes = require('./courseRoutes');
const enrollmentRoutes = require('./enrollmentRoutes');
const assignmentRoutes = require('./assignmentRoutes');
const submissionRoutes = require('./submissionRoutes');
const gradeRoutes = require('./gradeRoutes');
const announcementRoutes = require('./announcementRoutes');
const resourceRoutes = require('./resourceRoutes');
const attendanceRoutes = require('./attendanceRoutes');
const notificationRoutes = require('./notificationRoutes');
const lessonRoutes = require('./lessonRoutes');

const router = express.Router();

// API v1 info endpoint
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Learning Management System API v1',
    version: '1.0.0',
    endpoints: {
      auth: '/api/v1/auth',
      courses: '/api/v1/courses',
      admin: '/api/v1/admin',
      faculty: '/api/v1/faculty',
      student: '/api/v1/student',
      notifications: '/api/v1/notifications'
    }
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/faculty', facultyRoutes);
router.use('/student', studentRoutes);
router.use('/courses', courseRoutes);
router.use('/enrollments', enrollmentRoutes);
router.use('/assignments', assignmentRoutes);
router.use('/submissions', submissionRoutes);
router.use('/grades', gradeRoutes);
router.use('/announcements', announcementRoutes);
router.use('/resources', resourceRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/notifications', notificationRoutes);
router.use('/lessons', lessonRoutes);

module.exports = router;