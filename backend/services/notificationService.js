const { Notification, User } = require('../models');
const ServiceNowService = require('./servicenowService');

class NotificationService {

  static async create({ userId, type, title, message, priority = 'medium', metadata = {} }) {
    const notification = await Notification.create({
      user_id: userId,
      type,
      title,
      message,
      priority,
      metadata
    });

    // Sync to ServiceNow asynchronously
    ServiceNowService.syncData({
      u_user_id: userId?.toString(),
      u_type: type,
      u_title: title,
      u_message: message,
      u_priority: priority,
      u_local_id: notification.id.toString()
    }, 'u_notifications').catch(err =>
      console.error('ServiceNow notification sync error:', err.message)
    );

    return notification;
  }

  static async broadcastToAll({ type, title, message, priority = 'medium', metadata = {} }) {
    const users = await User.findAll();
    const notifications = [];

    for (const user of users) {
      const n = await this.create({
        userId: user.id,
        type,
        title,
        message,
        priority,
        metadata
      });
      notifications.push(n);
    }

    return notifications;
  }

  static async getUserNotifications(userId, { limit = 50, offset = 0, unreadOnly = false } = {}) {
    const where = { user_id: userId };
    if (unreadOnly) where.read = false;

    return await Notification.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });
  }

  static async getUnreadCount(userId) {
    return await Notification.count({
      where: { user_id: userId, read: false }
    });
  }

  static async markAsRead(notificationId, userId) {
    const notification = await Notification.findOne({
      where: { id: notificationId, user_id: userId }
    });
    if (!notification) throw new Error('Notification not found');
    notification.read = true;
    await notification.save();
    return notification;
  }

  static async markAllAsRead(userId) {
    await Notification.update(
      { read: true },
      { where: { user_id: userId, read: false } }
    );
  }

  static async delete(notificationId, userId) {
    const notification = await Notification.findOne({
      where: { id: notificationId, user_id: userId }
    });
    if (!notification) throw new Error('Notification not found');
    await notification.destroy();
  }
}

module.exports = NotificationService;
