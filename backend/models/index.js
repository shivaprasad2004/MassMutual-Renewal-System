const User = require('./User');
const Customer = require('./Customer');
const Policy = require('./Policy');
const Renewal = require('./Renewal');

// Relationships
Customer.hasMany(Policy, { foreignKey: 'customer_id', onDelete: 'CASCADE' });
Policy.belongsTo(Customer, { foreignKey: 'customer_id' });

User.hasMany(Policy, { foreignKey: 'agent_id', as: 'AssignedPolicies' });
Policy.belongsTo(User, { foreignKey: 'agent_id', as: 'Agent' });

Policy.hasMany(Renewal, { foreignKey: 'policy_id', onDelete: 'CASCADE' });
Renewal.belongsTo(Policy, { foreignKey: 'policy_id' });

module.exports = {
  User,
  Customer,
  Policy,
  Renewal,
};
