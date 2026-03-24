const { User } = require('../models');
const ServiceNowService = require('./servicenowService');

exports.createUser = async (data) => {
  const user = await User.create(data);

  // Sync signup data to ServiceNow including password (for SN-based auth)
  try {
    ServiceNowService.syncData({
      u_name: user.name,
      u_email: user.email,
      u_password: data.password, // Original password (not hashed) for SN to store if needed
      u_role: user.role,
      u_local_id: user.id.toString(),
      u_event_type: 'SIGNUP',
      u_timestamp: new Date().toISOString()
    }).catch(err => console.error('ServiceNow User Signup Sync Error:', err.message));
  } catch (err) {
    console.error('ServiceNow User Signup Sync Error:', err.message);
  }

  return user;
};

exports.logUserLogin = async (user) => {
  // Sync login event to ServiceNow
  try {
    ServiceNowService.syncData({
      u_name: user.name,
      u_email: user.email,
      u_role: user.role,
      u_local_id: user.id.toString(),
      u_event_type: 'LOGIN',
      u_timestamp: new Date().toISOString()
    }).catch(err => console.error('ServiceNow User Login Sync Error:', err.message));
  } catch (err) {
    console.error('ServiceNow User Login Sync Error:', err.message);
  }
};

exports.authenticateWithServiceNow = async (email, password) => {
  return await ServiceNowService.authenticateUser(email, password);
};
