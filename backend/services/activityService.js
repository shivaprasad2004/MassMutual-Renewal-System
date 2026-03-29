const ServiceNowService = require('./servicenowService');

class ActivityService {
  static TABLE = 'u_activity_logs';

  /**
   * Log an activity directly to ServiceNow
   */
  static async log({ userId, action, description, entityType = null, entityId = null, metadata = {}, ipAddress = null }) {
    const payload = {
      u_user_id: userId?.toString(),
      u_action: action,
      u_description: description,
      u_entity_type: entityType,
      u_entity_id: entityId?.toString(),
      u_metadata: JSON.stringify(metadata),
      u_ip_address: ipAddress,
      u_timestamp: new Date().toISOString()
    };

    try {
      const result = await ServiceNowService.create(this.TABLE, payload);
      return { id: result.sys_id, ...payload };
    } catch (err) {
      console.error('ServiceNow activity log error:', err.message);
      // Don't throw, just log to console to prevent blocking main flow
      return null;
    }
  }

  /**
   * Get recent activities from ServiceNow
   */
  static async getRecent({ limit = 50, action = null, userId = null } = {}) {
    let query = '';
    if (action) query += `u_action=${action}^`;
    if (userId) query += `u_user_id=${userId}^`;
    
    // Sort by timestamp descending
    query += 'ORDERBYDESCu_timestamp';

    const results = await ServiceNowService.find(this.TABLE, query, limit);
    
    return {
      rows: results.map(r => ({
        id: r.sys_id,
        user_id: r.u_user_id,
        action: r.u_action,
        description: r.u_description,
        entity_type: r.u_entity_type,
        entity_id: r.u_entity_id,
        metadata: r.u_metadata ? JSON.parse(r.u_metadata) : {},
        timestamp: r.u_timestamp,
        createdAt: r.u_timestamp // For frontend compatibility
      })),
      count: results.length
    };
  }

  /**
   * Get activities by entity from ServiceNow
   */
  static async getByEntity(entityType, entityId) {
    const query = `u_entity_type=${entityType}^u_entity_id=${entityId}^ORDERBYDESCu_timestamp`;
    const results = await ServiceNowService.find(this.TABLE, query, 100);
    
    return results.map(r => ({
      id: r.sys_id,
      user_id: r.u_user_id,
      action: r.u_action,
      description: r.u_description,
      timestamp: r.u_timestamp,
      createdAt: r.u_timestamp
    }));
  }
}

module.exports = ActivityService;
