const { Renewal, Policy, Customer } = require('../models');
const AIService = require('../services/aiService');
const ServiceNowService = require('../services/servicenowService');
const { Op } = require('sequelize');

exports.getPipeline = async (req, res) => {
  try {
    const renewals = await Renewal.findAll({
      include: [{
        model: Policy,
        include: [{ model: Customer }]
      }],
      order: [['renewal_date', 'ASC']]
    });

    const today = new Date();
    const pipeline = { upcoming: [], in_progress: [], completed: [], lapsed: [] };

    for (const renewal of renewals) {
      const policy = renewal.Policy;
      if (!policy) continue;

      const riskScore = AIService.calculatePolicyRiskScore(policy);
      const item = {
        id: renewal.id,
        renewal_date: renewal.renewal_date,
        status: renewal.status,
        stage: renewal.stage || 'upcoming',
        reminder_sent: renewal.reminder_sent,
        notes: renewal.notes,
        policy: {
          id: policy.id,
          policy_number: policy.policy_number,
          type: policy.type,
          status: policy.status,
          premium_amount: policy.premium_amount,
          coverage_amount: policy.coverage_amount,
          customer_name: policy.Customer?.name || 'N/A',
          customer_email: policy.Customer?.email || 'N/A'
        },
        risk_score: riskScore,
        risk_level: AIService.getRiskLevel(riskScore),
        priority: riskScore >= 75 ? 'critical' : riskScore >= 50 ? 'high' : riskScore >= 25 ? 'medium' : 'low'
      };

      // Auto-assign stage based on data if not explicitly set
      if (renewal.stage) {
        pipeline[renewal.stage].push(item);
      } else if (renewal.status === 'Completed') {
        pipeline.completed.push(item);
      } else if (renewal.status === 'Skipped' || policy.status === 'Lapsed') {
        pipeline.lapsed.push(item);
      } else if (new Date(renewal.renewal_date) < today) {
        pipeline.in_progress.push(item);
      } else {
        pipeline.upcoming.push(item);
      }
    }

    // Sort each column by risk score (highest first)
    Object.keys(pipeline).forEach(key => {
      pipeline[key].sort((a, b) => b.risk_score - a.risk_score);
    });

    res.json(pipeline);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateStage = async (req, res) => {
  try {
    const { id } = req.params;
    const { stage, notes } = req.body;

    const renewal = await Renewal.findByPk(id, {
      include: [{ model: Policy, include: [{ model: Customer }] }]
    });
    if (!renewal) return res.status(404).json({ message: 'Renewal not found' });

    const updates = {};
    if (stage) {
      updates.stage = stage;
      if (stage === 'completed') updates.status = 'Completed';
      if (stage === 'lapsed') updates.status = 'Skipped';
    }
    if (notes !== undefined) updates.notes = notes;

    await renewal.update(updates);

    // Update policy status based on stage
    if (stage === 'completed' && renewal.Policy) {
      await renewal.Policy.update({ status: 'Renewed' });
    } else if (stage === 'lapsed' && renewal.Policy) {
      await renewal.Policy.update({ status: 'Lapsed' });
    } else if (stage === 'in_progress' && renewal.Policy) {
      await renewal.Policy.update({ status: 'Pending Renewal' });
    }

    // Sync to ServiceNow
    ServiceNowService.syncData({
      u_renewal_id: renewal.id,
      u_policy_number: renewal.Policy?.policy_number,
      u_stage: stage,
      u_status: updates.status || renewal.status,
      u_updated_at: new Date().toISOString()
    }, 'u_renewal_pipeline').catch(err =>
      console.error('ServiceNow renewal sync error:', err.message)
    );

    // Emit real-time event
    if (req.io) {
      req.io.emit('renewal_update', { id: renewal.id, stage, policy_id: renewal.Policy?.id });
    }

    res.json(renewal);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.batchRemind = async (req, res) => {
  try {
    const { renewal_ids } = req.body;
    if (!renewal_ids || !renewal_ids.length) {
      return res.status(400).json({ message: 'renewal_ids array is required' });
    }

    const renewals = await Renewal.findAll({
      where: { id: { [Op.in]: renewal_ids } },
      include: [{ model: Policy, include: [{ model: Customer }] }]
    });

    let reminded = 0;
    for (const renewal of renewals) {
      await renewal.update({ reminder_sent: true });
      reminded++;
    }

    res.json({ message: `Reminders sent for ${reminded} renewals`, count: reminded });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getCalendar = async (req, res) => {
  try {
    const { month, year } = req.query;
    const targetMonth = parseInt(month) || new Date().getMonth();
    const targetYear = parseInt(year) || new Date().getFullYear();

    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0);

    const policies = await Policy.findAll({
      where: {
        renewal_date: { [Op.between]: [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]] }
      },
      include: [{ model: Customer }],
      order: [['renewal_date', 'ASC']]
    });

    const calendar = {};
    policies.forEach(policy => {
      const date = policy.renewal_date;
      if (!calendar[date]) calendar[date] = [];
      const riskScore = AIService.calculatePolicyRiskScore(policy);
      calendar[date].push({
        id: policy.id,
        policy_number: policy.policy_number,
        type: policy.type,
        status: policy.status,
        customer_name: policy.Customer?.name || 'N/A',
        premium_amount: policy.premium_amount,
        risk_score: riskScore,
        risk_level: AIService.getRiskLevel(riskScore)
      });
    });

    res.json({ month: targetMonth, year: targetYear, calendar });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
