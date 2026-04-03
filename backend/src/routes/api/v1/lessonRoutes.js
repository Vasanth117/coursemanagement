const express = require('express');
const {
  getLessons,
  getLesson,
  createLesson,
  updateLesson,
  deleteLesson
} = require('../../../controllers/lessonController');
const { protect, authorize } = require('../../../middleware/auth');

const router = express.Router({ mergeParams: true });

// Protect all routes
router.use(protect);

router
  .route('/')
  .get(getLessons)
  .post(authorize('faculty', 'admin'), createLesson);

router
  .route('/:id')
  .get(getLesson)
  .put(authorize('faculty', 'admin'), updateLesson)
  .delete(authorize('faculty', 'admin'), deleteLesson);

// Special route for lessons by course
router.get('/course/:courseId', getLessons);

module.exports = router;
