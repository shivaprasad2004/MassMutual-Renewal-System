const { Policy, Customer, Renewal } = require('../models');
const { Op } = require('sequelize');
const ServiceNowService = require('./servicenowService');
const AIService = require('./aiService');

exports.getAllPolicies = async ({ page = 1, limit = 50, status, type, search, sortBy = 'renewal_date', sortOrder = 'ASC' } = {}) => {
  const where = {};
  if (status) where.status = status;
  if (type) where.type = type;

  if (search) {
    where[Op.or] = [
      { policy_number: { [Op.like]: `%${search}%` } }
    ];
  }

  const offset = (page - 1) * limit;

  const result = await Policy.findAndCountAll({
    where,
    include: [{ model: Customer }],
    order: [[sortBy, sortOrder.toUpperCase()]],
    limit: parseInt(limit),
    offset
  });

  // Add risk scores to each policy
  const policiesWithRisk = result.rows.map(policy => {
    const riskScore = AIService.calculatePolicyRiskScore(policy);
    return {
      ...policy.toJSON(),
      risk_score: riskScore,
      risk_level: AIService.getRiskLevel(riskScore)
    };
  });

  return {
    policies: policiesWithRisk,
    total: result.count,
    page: parseInt(page),
    totalPages: Math.ceil(result.count / limit)
  };
};

exports.getPolicyById = async (id) => {
  const policy = await Policy.findByPk(id, {
    include: [
      { model: Customer },
      { model: Renewal, order: [['renewal_date', 'DESC']] }
    ]
  });

  if (!policy) throw new Error('Policy not found');

  const riskScore = AIService.calculatePolicyRiskScore(policy);

  return {
    ...policy.toJSON(),
    risk_score: riskScore,
    risk_level: AIService.getRiskLevel(riskScore),
    recommended_action: AIService.getRecommendedAction(riskScore, policy)
  };
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

    // Sync AI insights too
    AIService.syncPolicyAIInsights(policy);
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

exports.bulkUpdateStatus = async (ids, status) => {
  const result = await Policy.update(
    { status },
    { where: { id: { [Op.in]: ids } } }
  );
  return { updated: result[0] };
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

exports.exportPolicies = async (filters = {}) => {
  const where = {};
  if (filters.status) where.status = filters.status;
  if (filters.type) where.type = filters.type;

  const policies = await Policy.findAll({
    where,
    include: [{ model: Customer }],
    order: [['renewal_date', 'ASC']]
  });

  // Generate CSV
  const headers = ['Policy Number', 'Customer', 'Type', 'Premium', 'Coverage', 'Issue Date', 'Renewal Date', 'Status', 'Risk Score'];
  const rows = policies.map(p => {
    const riskScore = AIService.calculatePolicyRiskScore(p);
    return [
      p.policy_number,
      p.Customer?.name || 'N/A',
      p.type,
      p.premium_amount,
      p.coverage_amount,
      p.issue_date,
      p.renewal_date,
      p.status,
      riskScore
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
};
