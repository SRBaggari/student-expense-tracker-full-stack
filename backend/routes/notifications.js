const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

// Protect all routes
router.use(protect);

router.route('/')
  .get(getNotifications);

router.route('/mark-all-read')
  .put(markAllNotificationsRead);

router.route('/:id')
  .put(markNotificationRead)
  .delete(deleteNotification);

module.exports = router;
