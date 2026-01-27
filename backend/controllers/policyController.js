const { Policy, Customer, Renewal } = require('../models');
const { Op } = require('sequelize');

exports.getPolicies = async (req, res) => {
  try {
    // Basic pagination and filtering can be added here
    const policies = await Policy.findAll({
      include: [{ model: Customer }],
      order: [['renewal_date', 'ASC']],
    });
    res.json(policies);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createPolicy = async (req, res) => {
  try {
    const { 
      policy_number, customer_id, type, premium_amount, 
      coverage_amount, issue_date, renewal_date, payment_frequency 
    } = req.body;

    const policy = await Policy.create({
      policy_number,
      customer_id,
      agent_id: req.user.id, // Assigned to creating agent
      type,
      premium_amount,
      coverage_amount,
      issue_date,
      renewal_date,
      payment_frequency,
      status: 'Active'
    });

    // Create initial renewal record
    await Renewal.create({
      policy_id: policy.id,
      renewal_date: renewal_date,
      status: 'Pending'
    });

    res.status(201).json(policy);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updatePolicy = async (req, res) => {
  try {
    const policy = await Policy.findByPk(req.params.id);
    if (!policy) return res.status(404).json({ message: 'Policy not found' });

    await policy.update(req.body);
    res.json(policy);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deletePolicy = async (req, res) => {
  try {
    const policy = await Policy.findByPk(req.params.id);
    if (!policy) return res.status(404).json({ message: 'Policy not found' });

    await policy.destroy();
    res.json({ message: 'Policy removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const totalPolicies = await Policy.count();
    
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

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
        status: 'Active' // Should be 'Active' but passed due date
      }
    });

    res.json({
      totalPolicies,
      upcomingRenewals,
      overduePolicies
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
