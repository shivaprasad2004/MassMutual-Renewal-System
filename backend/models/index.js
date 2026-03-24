const User = require('./User');
const Customer = require('./Customer');
const Policy = require('./Policy');
const Renewal = require('./Renewal');
const Notification = require('./Notification');
const ActivityLog = require('./ActivityLog');

// Relationships
Customer.hasMany(Policy, { foreignKey: 'customer_id', onDelete: 'CASCADE' });
Policy.belongsTo(Customer, { foreignKey: 'customer_id' });

User.hasMany(Policy, { foreignKey: 'agent_id', as: 'AssignedPolicies' });
Policy.belongsTo(User, { foreignKey: 'agent_id', as: 'Agent' });

Policy.hasMany(Renewal, { foreignKey: 'policy_id', onDelete: 'CASCADE' });
Renewal.belongsTo(Policy, { foreignKey: 'policy_id' });

// Notification relationships
User.hasMany(Notification, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Notification.belongsTo(User, { foreignKey: 'user_id' });

// Activity log relationships
User.hasMany(ActivityLog, { foreignKey: 'user_id', onDelete: 'SET NULL' });
ActivityLog.belongsTo(User, { foreignKey: 'user_id' });

module.exports = {
  User,
  Customer,
  Policy,
  Renewal,
  Notification,
  ActivityLog,
};
