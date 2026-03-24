const policyService = require('../services/policyService');
const ActivityService = require('../services/activityService');
const NotificationService = require('../services/notificationService');

exports.getPolicies = async (req, res) => {
  try {
    const { page, limit, status, type, search, sortBy, sortOrder } = req.query;
    const result = await policyService.getAllPolicies({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 50,
      status,
      type,
      search,
      sortBy,
      sortOrder
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getPolicyById = async (req, res) => {
  try {
    const policy = await policyService.getPolicyById(req.params.id);
    res.json(policy);
  } catch (error) {
    const status = error.message === 'Policy not found' ? 404 : 500;
    res.status(status).json({ message: error.message });
  }
};

exports.createPolicy = async (req, res) => {
  try {
    const policy = await policyService.createPolicy(req.body, req.user.id);

    // Log activity
    ActivityService.log({
      userId: req.user.id,
      action: 'policy_created',
      description: `Created policy ${policy.policy_number}`,
      entityType: 'policy',
      entityId: policy.id,
      ipAddress: req.ip
    }).catch(err => console.error('Activity log error:', err));

    // Create notification
    NotificationService.broadcastToAll({
      type: 'system',
      title: 'New Policy Created',
      message: `Policy ${policy.policy_number} has been created.`,
      priority: 'low',
      metadata: { policy_id: policy.id }
    }).catch(err => console.error('Notification error:', err));

    // Emit real-time event
    if (req.io) {
      req.io.emit('policy_created', policy);
      req.io.emit('notification_new', { title: 'New Policy Created', message: `Policy ${policy.policy_number}` });
    }

    res.status(201).json(policy);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updatePolicy = async (req, res) => {
  try {
    const policy = await policyService.updatePolicy(req.params.id, req.body);

    // Log activity
    ActivityService.log({
      userId: req.user.id,
      action: 'policy_updated',
      description: `Updated policy ${policy.policy_number}`,
      entityType: 'policy',
      entityId: policy.id,
      metadata: { changes: req.body },
      ipAddress: req.ip
    }).catch(err => console.error('Activity log error:', err));

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

exports.bulkUpdateStatus = async (req, res) => {
  try {
    const { ids, status } = req.body;
    const result = await policyService.bulkUpdateStatus(ids, status);

    ActivityService.log({
      userId: req.user.id,
      action: 'policy_updated',
      description: `Bulk updated ${ids.length} policies to ${status}`,
      entityType: 'policy',
      metadata: { ids, status },
      ipAddress: req.ip
    }).catch(err => console.error('Activity log error:', err));

    if (req.io) {
      req.io.emit('policies_bulk_updated', { ids, status });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deletePolicy = async (req, res) => {
  try {
    await policyService.deletePolicy(req.params.id);

    ActivityService.log({
      userId: req.user.id,
      action: 'policy_deleted',
      description: `Deleted policy ID ${req.params.id}`,
      entityType: 'policy',
      entityId: parseInt(req.params.id),
      ipAddress: req.ip
    }).catch(err => console.error('Activity log error:', err));

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

exports.getAIInsights = async (req, res) => {
  try {
    const aiService = require('../services/aiService');
    const predictions = await aiService.getRenewalPredictions();
    const anomalies = await aiService.detectAnomalies();
    const trends = await aiService.getRenewalTrends();
    const recommendations = await aiService.getRecommendations();
    const health = await aiService.getPortfolioHealth();
    
    res.json({ predictions, anomalies, trends, recommendations, health });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.exportPolicies = async (req, res) => {
  try {
    const { status, type } = req.query;
    const csv = await policyService.exportPolicies({ status, type });

    ActivityService.log({
      userId: req.user.id,
      action: 'export_generated',
      description: 'Exported policies to CSV',
      entityType: 'policy',
      ipAddress: req.ip
    }).catch(err => console.error('Activity log error:', err));

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=policies_export.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
