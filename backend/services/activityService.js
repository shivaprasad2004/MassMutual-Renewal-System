const { ActivityLog, User } = require('../models');
const ServiceNowService = require('./servicenowService');

class ActivityService {

  static async log({ userId, action, description, entityType = null, entityId = null, metadata = {}, ipAddress = null }) {
    const activity = await ActivityLog.create({
      user_id: userId,
      action,
      description,
      entity_type: entityType,
      entity_id: entityId,
      metadata,
      ip_address: ipAddress
    });

    // Sync to ServiceNow asynchronously
    ServiceNowService.syncData({
      u_user_id: userId?.toString(),
      u_action: action,
      u_description: description,
      u_entity_type: entityType,
      u_entity_id: entityId?.toString(),
      u_local_id: activity.id.toString(),
      u_timestamp: new Date().toISOString()
    }, 'u_activity_logs').catch(err =>
      console.error('ServiceNow activity sync error:', err.message)
    );

    return activity;
  }

  static async getRecent({ limit = 50, offset = 0, action = null, userId = null } = {}) {
    const where = {};
    if (action) where.action = action;
    if (userId) where.user_id = userId;

    return await ActivityLog.findAndCountAll({
      where,
      include: [{ model: User, attributes: ['id', 'name', 'email', 'role'] }],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });
  }

  static async getByEntity(entityType, entityId) {
    return await ActivityLog.findAll({
      where: { entity_type: entityType, entity_id: entityId },
      include: [{ model: User, attributes: ['id', 'name', 'email', 'role'] }],
      order: [['createdAt', 'DESC']]
    });
  }
}

module.exports = ActivityService;
