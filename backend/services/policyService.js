const ServiceNowService = require('./servicenowService');
const AIService = require('./aiService');

const TABLE = 'u_policy_records';

/**
 * ServiceNow-Native Policy Service
 */
exports.getAllPolicies = async ({ page = 1, limit = 50, status, type, search } = {}) => {
  let query = '';
  if (status && status !== 'All') query += `u_status=${status}^`;
  if (type && type !== 'All') query += `u_type=${type}^`;
  if (search) query += `u_policy_numberLIKE${search}^ORu_local_idLIKE${search}`;

  const results = await ServiceNowService.find(TABLE, query, limit);
  
  // Map SN fields to application fields
  const policies = results.map(p => ({
    id: p.sys_id,
    policy_number: p.u_policy_number,
    type: p.u_type,
    premium_amount: p.u_premium_amount,
    coverage_amount: p.u_coverage_amount,
    issue_date: p.u_issue_date,
    renewal_date: p.u_renewal_date,
    status: p.u_status,
    Customer: {
      id: p.u_customer_id,
      name: p.u_customer_name || 'N/A'
    },
    risk_score: AIService.calculatePolicyRiskScore({
      renewal_date: p.u_renewal_date,
      status: p.u_status,
      premium_amount: p.u_premium_amount,
      coverage_amount: p.u_coverage_amount
    })
  }));

  return {
    policies,
    total: policies.length,
    page: 1,
    totalPages: 1
  };
};

exports.getPolicyById = async (id) => {
  const p = await ServiceNowService.findById(TABLE, id);
  
  // Fetch full customer details for the detail view
  let customerObj = { id: p.u_customer_id, name: p.u_customer_name || 'N/A' };
  if (p.u_customer_id) {
    try {
      const customer = await ServiceNowService.findById('u_customer_records', p.u_customer_id);
      customerObj = {
        id: customer.sys_id,
        name: customer.u_name,
        email: customer.u_email,
        phone: customer.u_phone,
        address: customer.u_address
      };
    } catch (err) {
      console.warn('Could not fetch full customer details for policy view:', err.message);
    }
  }

  return {
    id: p.sys_id,
    policy_number: p.u_policy_number,
    type: p.u_type,
    premium_amount: p.u_premium_amount,
    coverage_amount: p.u_coverage_amount,
    issue_date: p.u_issue_date,
    renewal_date: p.u_renewal_date,
    status: p.u_status,
    Customer: customerObj
  };
};

exports.createPolicy = async (data, agentId) => {
  // Fetch customer name for denormalization
  let customerName = 'N/A';
  if (data.customer_id) {
    try {
      const customer = await ServiceNowService.findById('u_customer_records', data.customer_id);
      customerName = customer.u_name || 'N/A';
    } catch (err) {
      console.warn('Could not fetch customer name for policy:', err.message);
    }
  }

  const payload = {
    u_policy_number: data.policy_number,
    u_type: data.type,
    u_premium_amount: data.premium_amount,
    u_coverage_amount: data.coverage_amount,
    u_issue_date: data.issue_date,
    u_renewal_date: data.renewal_date,
    u_status: 'Active',
    u_agent_id: agentId,
    u_customer_id: data.customer_id,
    u_customer_name: customerName
  };

  const result = await ServiceNowService.create(TABLE, payload);
  return { id: result.sys_id, ...data, customer_name: customerName };
};

exports.updatePolicy = async (id, data) => {
  const payload = {};
  if (data.status) payload.u_status = data.status;
  if (data.premium_amount) payload.u_premium_amount = data.premium_amount;
  if (data.coverage_amount) payload.u_coverage_amount = data.coverage_amount;
  if (data.renewal_date) payload.u_renewal_date = data.renewal_date;
  if (data.type) payload.u_type = data.type;
  if (data.policy_number) payload.u_policy_number = data.policy_number;
  if (data.issue_date) payload.u_issue_date = data.issue_date;
  
  if (data.customer_id) {
    payload.u_customer_id = data.customer_id;
    try {
      const customer = await ServiceNowService.findById('u_customer_records', data.customer_id);
      payload.u_customer_name = customer.u_name || 'N/A';
    } catch (err) {
      console.warn('Could not fetch customer name for policy update:', err.message);
    }
  }

  const result = await ServiceNowService.update(TABLE, id, payload);
  return { 
    id, 
    ...data, 
    Customer: {
      id: payload.u_customer_id,
      name: payload.u_customer_name || 'N/A'
    }
  };
};

exports.deletePolicy = async (id) => {
  return await ServiceNowService.delete(TABLE, id);
};

exports.bulkUpdateStatus = async (ids, status) => {
  const promises = ids.map(id => ServiceNowService.update(TABLE, id, { u_status: status }));
  await Promise.all(promises);
  return { updated: ids.length };
};

exports.exportPolicies = async (filters = {}) => {
  const AIService = require('./aiService');
  let query = '';
  if (filters.status) query += `u_status=${filters.status}^`;
  if (filters.type) query += `u_type=${filters.type}^`;

  const results = await ServiceNowService.find(TABLE, query, 1000);

  const headers = ['Policy Number', 'Type', 'Status', 'Premium', 'Coverage', 'Renewal Date', 'Risk Score'];
  const rows = [headers.join(',')];

  results.forEach(p => {
    const riskScore = AIService.calculatePolicyRiskScore(p);
    rows.push([
      p.u_policy_number,
      p.u_type,
      p.u_status,
      p.u_premium_amount,
      p.u_coverage_amount,
      p.u_renewal_date,
      riskScore
    ].join(','));
  });

  return rows.join('\n');
};

exports.getStats = async () => {
  const all = await ServiceNowService.find(TABLE, '', 1000);
  const today = new Date();
  
  return {
    totalPolicies: all.length,
    upcomingRenewals: all.filter(p => new Date(p.u_renewal_date) > today && p.u_status === 'Active').length,
    overduePolicies: all.filter(p => new Date(p.u_renewal_date) < today && p.u_status === 'Active').length
  };
};
