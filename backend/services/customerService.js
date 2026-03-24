const { Customer } = require('../models');
const ServiceNowService = require('./servicenowService');

exports.getAllCustomers = async () => {
  return await Customer.findAll();
};

exports.createCustomer = async (data) => {
  const customer = await Customer.create(data);

  // Sync to ServiceNow
  try {
    ServiceNowService.syncData({
      u_name: customer.name,
      u_email: customer.email,
      u_phone: customer.phone,
      u_address: customer.address,
      u_local_id: customer.id.toString()
    }, 'u_customer_records').catch(err => console.error('ServiceNow Customer Sync Error:', err.message));
  } catch (err) {
    console.error('ServiceNow Customer Sync Error:', err.message);
  }

  return customer;
};
