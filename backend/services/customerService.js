const ServiceNowService = require('./servicenowService');

const TABLE = 'u_customer_records';

/**
 * ServiceNow-Native Customer Service
 */
exports.getAllCustomers = async () => {
  const results = await ServiceNowService.find(TABLE, '', 1000);
  return results.map(c => ({
    id: c.sys_id,
    name: c.u_name,
    email: c.u_email,
    phone: c.u_phone,
    address: c.u_address
  }));
};

exports.createCustomer = async (data) => {
  const payload = {
    u_name: data.name,
    u_email: data.email,
    u_phone: data.phone,
    u_address: data.address
  };

  const result = await ServiceNowService.create(TABLE, payload);
  return { id: result.sys_id, ...data };
};
