const express = require('express');
const {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} = require('../controllers/notificationController');
const { verifyJWT } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(verifyJWT);

router.get('/', getUserNotifications);
router.get('/unread-count', getUnreadCount);
router.patch('/read-all', markAllAsRead);
router.patch('/:id/read', markAsRead);

module.exports = router;
