const express = require('express');
const { notificationController } = require('../../../controllers');
const { auth } = require('../../../middleware');

const router = express.Router();

// Apply protection to all routes
router.use(auth.protect);

router.get('/', notificationController.getNotifications);
router.put('/readall', notificationController.markAllAsRead);
router.put('/:id/read', notificationController.markAsRead);
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;
