const customerService = require('../services/customerService');
const AIService = require('../services/aiService');
const { Customer, Policy, ActivityLog } = require('../models');

exports.getCustomers = async (req, res) => {
  try {
    const customers = await customerService.getAllCustomers();
    // Enrich with policy counts and risk
    const enriched = [];
    for (const c of customers) {
      const customer = c.toJSON ? c.toJSON() : c;
      const policies = await Policy.findAll({ where: { customer_id: customer.id } });
      const riskScores = policies.map(p => AIService.calculatePolicyRiskScore(p));
      const avgRisk = riskScores.length > 0 ? Math.round(riskScores.reduce((a, b) => a + b, 0) / riskScores.length) : 0;
      enriched.push({
        ...customer,
        policy_count: policies.length,
        avg_risk: avgRisk,
        risk_level: AIService.getRiskLevel(avgRisk),
        total_premium: policies.reduce((sum, p) => sum + (parseFloat(p.premium_amount) || 0), 0)
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
    const activities = await ActivityLog.findAll({
      where: { entity_type: 'customer', entity_id: req.params.id },
      order: [['createdAt', 'DESC']],
      limit: 50
    });
    // Also get policy-related activities for this customer's policies
    const policies = await Policy.findAll({ where: { customer_id: req.params.id } });
    const policyIds = policies.map(p => p.id);

    let policyActivities = [];
    if (policyIds.length > 0) {
      const { Op } = require('sequelize');
      policyActivities = await ActivityLog.findAll({
        where: { entity_type: 'policy', entity_id: { [Op.in]: policyIds } },
        order: [['createdAt', 'DESC']],
        limit: 50
      });
    }

    const allActivities = [...activities, ...policyActivities]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 50);

    res.json(allActivities.map(a => ({
      id: a.id,
      action: a.action,
      description: a.description,
      entity_type: a.entity_type,
      entity_id: a.entity_id,
      timestamp: a.createdAt
    })));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    await customer.update(req.body);
    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
