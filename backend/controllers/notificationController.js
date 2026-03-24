const NotificationService = require('../services/notificationService');

exports.getNotifications = async (req, res) => {
  try {
    const { limit = 50, offset = 0, unreadOnly } = req.query;
    const result = await NotificationService.getUserNotifications(req.user.id, {
      limit: parseInt(limit),
      offset: parseInt(offset),
      unreadOnly: unreadOnly === 'true'
    });
    res.json({ notifications: result.rows, total: result.count });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const count = await NotificationService.getUnreadCount(req.user.id);
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notification = await NotificationService.markAsRead(req.params.id, req.user.id);
    res.json(notification);
  } catch (error) {
    const status = error.message === 'Notification not found' ? 404 : 500;
    res.status(status).json({ message: error.message });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    await NotificationService.markAllAsRead(req.user.id);
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    await NotificationService.delete(req.params.id, req.user.id);
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    const status = error.message === 'Notification not found' ? 404 : 500;
    res.status(status).json({ message: error.message });
  }
};
