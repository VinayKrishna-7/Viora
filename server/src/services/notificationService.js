const Notification = require('../models/Notification');
const { sendNotificationToUser } = require('../sockets/socketHandler');

class NotificationService {
  /**
   * Create a notification (skips if sender is recipient) and emit WebSocket event
   */
  async createNotification({ recipient, sender, type, video = null, comment = null, text = '' }) {
    if (!recipient || !sender) return null;
    if (recipient.toString() === sender.toString()) return null; // Don't notify self

    const notif = await Notification.create({
      recipient,
      sender,
      type,
      video,
      comment,
      text,
    });

    const populated = await notif.populate([
      { path: 'sender', select: 'username avatar' },
      { path: 'video', select: 'title thumbnailUrl' },
    ]);

    try {
      sendNotificationToUser(recipient, populated);
    } catch (e) {
      console.warn('[Socket] Failed to emit notification:', e.message);
    }

    return populated;
  }

  /**
   * Get user's notifications
   */
  async getUserNotifications(userId, { page = 1, limit = 20 } = {}) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find({ recipient: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('sender', 'username avatar')
        .populate('video', 'title thumbnailUrl')
        .lean(),
      Notification.countDocuments({ recipient: userId }),
      Notification.countDocuments({ recipient: userId, read: false }),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    return {
      notifications,
      unreadCount,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasNextPage: pageNum < totalPages,
      },
    };
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId) {
    const count = await Notification.countDocuments({ recipient: userId, read: false });
    return { unreadCount: count };
  }

  /**
   * Mark single notification as read
   */
  async markAsRead(notificationId, userId) {
    return await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { read: true },
      { new: true }
    );
  }

  /**
   * Mark all notifications for user as read
   */
  async markAllAsRead(userId) {
    await Notification.updateMany({ recipient: userId, read: false }, { read: true });
    return { success: true };
  }
}

module.exports = new NotificationService();
