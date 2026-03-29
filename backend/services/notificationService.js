const ServiceNowService = require('./servicenowService');

class NotificationService {
  static TABLE = 'u_notifications';

  /**
   * Create a notification directly in ServiceNow
   */
  static async create({ userId, type, title, message, priority = 'medium', metadata = {} }) {
    const payload = {
      u_user_id: userId?.toString(),
      u_type: type,
      u_title: title,
      u_message: message,
      u_priority: priority,
      u_metadata: JSON.stringify(metadata),
      u_read: 'false',
      u_timestamp: new Date().toISOString()
    };

    try {
      const result = await ServiceNowService.create(this.TABLE, payload);
      return { id: result.sys_id, ...payload };
    } catch (err) {
      console.error('ServiceNow notification create error:', err.message);
      return null;
    }
  }

  /**
   * Broadcast notification to all users in ServiceNow auth table
   */
  static async broadcastToAll({ type, title, message, priority = 'medium', metadata = {} }) {
    try {
      const AUTH_TABLE = process.env.SN_TABLE_NAME || 'u_massmutualsystemauth';
      const users = await ServiceNowService.find(AUTH_TABLE, '', 100);
      
      const promises = users.map(user => 
        this.create({
          userId: user.sys_id,
          type,
          title,
          message,
          priority,
          metadata
        })
      );
      
      return await Promise.all(promises);
    } catch (err) {
      console.error('ServiceNow broadcast error:', err.message);
      return [];
    }
  }

  /**
   * Get user notifications from ServiceNow
   */
  static async getUserNotifications(userId, { limit = 50, unreadOnly = false } = {}) {
    let query = `u_user_id=${userId}^`;
    if (unreadOnly) query += 'u_read=false^';
    query += 'ORDERBYDESCu_timestamp';

    const results = await ServiceNowService.find(this.TABLE, query, limit);
    
    return {
      rows: results.map(r => ({
        id: r.sys_id,
        user_id: r.u_user_id,
        type: r.u_type,
        title: r.u_title,
        message: r.u_message,
        priority: r.u_priority,
        read: r.u_read === 'true',
        metadata: r.u_metadata ? JSON.parse(r.u_metadata) : {},
        createdAt: r.u_timestamp
      })),
      count: results.length
    };
  }

  /**
   * Get unread count from ServiceNow
   */
  static async getUnreadCount(userId) {
    const query = `u_user_id=${userId}^u_read=false`;
    const results = await ServiceNowService.find(this.TABLE, query, 1000);
    return results.length;
  }

  /**
   * Mark a notification as read in ServiceNow
   */
  static async markAsRead(notificationId) {
    await ServiceNowService.update(this.TABLE, notificationId, { u_read: 'true' });
  }

  /**
   * Mark all notifications as read for a user in ServiceNow
   */
  static async markAllAsRead(userId) {
    const query = `u_user_id=${userId}^u_read=false`;
    const unread = await ServiceNowService.find(this.TABLE, query, 1000);
    
    const promises = unread.map(n => 
      ServiceNowService.update(this.TABLE, n.sys_id, { u_read: 'true' })
    );
    await Promise.all(promises);
  }

  /**
   * Delete a notification from ServiceNow
   */
  static async delete(notificationId) {
    await ServiceNowService.delete(this.TABLE, notificationId);
  }
}

module.exports = NotificationService;
