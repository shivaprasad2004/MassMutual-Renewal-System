const { Policy, Customer, Renewal } = require('../models');
const { Op } = require('sequelize');
const ServiceNowService = require('./servicenowService');

exports.getAllPolicies = async () => {
  return await Policy.findAll({
    include: [{ model: Customer }],
    order: [['renewal_date', 'ASC']],
  });
};

exports.createPolicy = async (data, agentId) => {
  const policy = await Policy.create({
    ...data,
    agent_id: agentId,
    status: 'Active'
  });

  // Create initial renewal record
  await Renewal.create({
    policy_id: policy.id,
    renewal_date: data.renewal_date,
    status: 'Pending'
  });

  // Sync to ServiceNow asynchronously
  try {
    ServiceNowService.syncData({
      u_policy_number: policy.policy_number,
      u_type: policy.type,
      u_premium_amount: policy.premium_amount,
      u_coverage_amount: policy.coverage_amount,
      u_issue_date: policy.issue_date,
      u_renewal_date: policy.renewal_date,
      u_status: policy.status,
      u_local_id: policy.id.toString()
    }).catch(err => console.error('Background ServiceNow Sync Error:', err.message));
  } catch (err) {
    console.error('ServiceNow Sync Error:', err.message);
  }

  return policy;
};

exports.updatePolicy = async (id, data) => {
  const policy = await Policy.findByPk(id);
  if (!policy) throw new Error('Policy not found');

  await policy.update(data);

  // Sync update to ServiceNow
  try {
    // Note: We might want to store ServiceNow sys_id in our database for updates
    // For now, we search by policy number or local id
    ServiceNowService.syncData({
      u_policy_number: policy.policy_number,
      u_type: policy.type,
      u_premium_amount: policy.premium_amount,
      u_coverage_amount: policy.coverage_amount,
      u_issue_date: policy.issue_date,
      u_renewal_date: policy.renewal_date,
      u_status: policy.status,
      u_local_id: policy.id.toString(),
      u_sync_type: 'UPDATE'
    }).catch(err => console.error('Background ServiceNow Update Sync Error:', err.message));
  } catch (err) {
    console.error('ServiceNow Update Error:', err.message);
  }

  return policy;
};

exports.deletePolicy = async (id) => {
  const policy = await Policy.findByPk(id);
  if (!policy) throw new Error('Policy not found');

  await policy.destroy();
  return true;
};

exports.getStats = async () => {
  const today = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(today.getDate() + 30);

  const totalPolicies = await Policy.count();
  
  const upcomingRenewals = await Policy.count({
    where: {
      renewal_date: {
        [Op.between]: [today, thirtyDaysFromNow]
      },
      status: 'Active'
    }
  });

  const overduePolicies = await Policy.count({
    where: {
      renewal_date: {
        [Op.lt]: today
      },
      status: 'Active'
    }
  });

  return { totalPolicies, upcomingRenewals, overduePolicies };
};
