const ServiceNowService = require('./servicenowService');

const AUTH_TABLE = process.env.SN_TABLE_NAME || 'u_massmutualsystemauth';

/**
 * Enterprise User Service (ServiceNow-Native)
 */
exports.findUserByEmail = async (email) => {
  const users = await ServiceNowService.find(AUTH_TABLE, `u_email=${email}`, 1);
  if (users && users.length > 0) {
    const user = users[0];
    return {
      id: user.sys_id,
      name: user.u_name,
      email: user.u_email,
      password: user.u_password,
      role: user.u_role
    };
  }
  return null;
};

exports.findUserById = async (id) => {
  const user = await ServiceNowService.findById(AUTH_TABLE, id);
  if (user) {
    return {
      id: user.sys_id,
      name: user.u_name,
      email: user.u_email,
      role: user.u_role
    };
  }
  return null;
};

exports.createUser = async (data) => {
  const payload = {
    u_name: data.name,
    u_email: data.email,
    u_password: data.password, // Stored as plain text in custom SN field for simple demo auth
    u_role: data.role || 'Agent',
    u_status: 'Active'
  };

  const result = await ServiceNowService.create(AUTH_TABLE, payload);
  return {
    id: result.sys_id,
    name: result.u_name,
    email: result.u_email,
    role: result.u_role
  };
};

exports.logUserLogin = async (user) => {
  const ActivityService = require('./activityService');
  await ActivityService.log({
    userId: user.id,
    action: 'LOGIN',
    description: `User ${user.name} logged in`,
    entityType: 'User',
    entityId: user.id
  });
};

exports.authenticateWithServiceNow = async (email, password) => {
  return await ServiceNowService.authenticateUser(email, password);
};
