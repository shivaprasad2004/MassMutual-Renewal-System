const policyService = require('../services/policyService');

exports.getPolicies = async (req, res) => {
  try {
    const policies = await policyService.getAllPolicies();
    res.json(policies);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createPolicy = async (req, res) => {
  try {
    const policy = await policyService.createPolicy(req.body, req.user.id);

    // Emit real-time event
    if (req.io) {
      req.io.emit('policy_created', policy);
    }

    res.status(201).json(policy);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updatePolicy = async (req, res) => {
  try {
    const policy = await policyService.updatePolicy(req.params.id, req.body);
    
    // Emit real-time event
    if (req.io) {
      req.io.emit('policy_updated', policy);
    }
    
    res.json(policy);
  } catch (error) {
    const status = error.message === 'Policy not found' ? 404 : 500;
    res.status(status).json({ message: error.message });
  }
};

exports.deletePolicy = async (req, res) => {
  try {
    await policyService.deletePolicy(req.params.id);

    // Emit real-time event
    if (req.io) {
      req.io.emit('policy_deleted', req.params.id);
    }

    res.json({ message: 'Policy removed' });
  } catch (error) {
    const status = error.message === 'Policy not found' ? 404 : 500;
    res.status(status).json({ message: error.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const stats = await policyService.getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
