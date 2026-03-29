const customerService = require('../services/customerService');
const AIService = require('../services/aiService');
const ServiceNowService = require('../services/servicenowService');
const ActivityService = require('../services/activityService');

const POLICY_TABLE = 'u_policy_records';
const CUSTOMER_TABLE = 'u_customer_records';

exports.getCustomers = async (req, res) => {
  try {
    const customers = await customerService.getAllCustomers();
    const enriched = [];
    
    // Fetch all policies once to avoid N+1 SN calls
    const allPolicies = await ServiceNowService.find(POLICY_TABLE, '', 1000);

    for (const customer of customers) {
      const customerPolicies = allPolicies.filter(p => p.u_customer_id === customer.id || p.u_customer_name === customer.name);
      
      const riskScores = customerPolicies.map(p => AIService.calculatePolicyRiskScore(p));
      const avgRisk = riskScores.length > 0 ? Math.round(riskScores.reduce((a, b) => a + b, 0) / riskScores.length) : 0;
      
      enriched.push({
        ...customer,
        policy_count: customerPolicies.length,
        avg_risk: avgRisk,
        risk_level: AIService.getRiskLevel(avgRisk),
        total_premium: customerPolicies.reduce((sum, p) => sum + (parseFloat(p.u_premium_amount) || 0), 0)
      });
    }
    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createCustomer = async (req, res) => {
  try {
    const customer = await customerService.createCustomer(req.body);
    res.status(201).json(customer);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getCustomerById = async (req, res) => {
  try {
    const profile = await AIService.getCustomerProfile(req.params.id);
    if (!profile) return res.status(404).json({ message: 'Customer not found' });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getCustomerTimeline = async (req, res) => {
  try {
    const customerActivities = await ActivityService.getByEntity('customer', req.params.id);
    
    // Also get policy-related activities for this customer's policies
    const policies = await ServiceNowService.find(POLICY_TABLE, `u_customer_id=${req.params.id}`, 100);
    
    let allActivities = [...customerActivities];
    
    for (const p of policies) {
      const policyActivities = await ActivityService.getByEntity('policy', p.sys_id);
      allActivities = [...allActivities, ...policyActivities];
    }

    const sortedActivities = allActivities
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 50);

    res.json(sortedActivities);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateCustomer = async (req, res) => {
  try {
    const result = await ServiceNowService.update(CUSTOMER_TABLE, req.params.id, req.body);
    res.json({ id: req.params.id, ...req.body });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
