const { Policy, Customer, Renewal } = require('../models');
const { Op } = require('sequelize');

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

  return policy;
};

exports.updatePolicy = async (id, data) => {
  const policy = await Policy.findByPk(id);
  if (!policy) throw new Error('Policy not found');

  await policy.update(data);
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
