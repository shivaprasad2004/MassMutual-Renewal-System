const AIService = require('../services/aiService');
const ServiceNowService = require('../services/servicenowService');

const POLICY_TABLE = 'u_policy_records';

exports.getPipeline = async (req, res) => {
  try {
    const policies = await ServiceNowService.find(POLICY_TABLE, 'u_status=Active^ORu_status=Pending Renewal', 500);

    const today = new Date();
    const pipeline = { upcoming: [], in_progress: [], completed: [], lapsed: [] };

    for (const p of policies) {
      const riskScore = AIService.calculatePolicyRiskScore(p);
      const renewalDate = new Date(p.u_renewal_date);
      
      const item = {
        id: p.sys_id,
        renewal_date: p.u_renewal_date,
        status: p.u_status,
        stage: p.u_renewal_stage || (renewalDate < today ? 'in_progress' : 'upcoming'),
        policy: {
          id: p.sys_id,
          policy_number: p.u_policy_number,
          type: p.u_type,
          status: p.u_status,
          premium_amount: p.u_premium_amount,
          coverage_amount: p.u_coverage_amount,
          customer_name: p.u_customer_name || 'N/A'
        },
        risk_score: riskScore,
        risk_level: AIService.getRiskLevel(riskScore),
        priority: riskScore >= 75 ? 'critical' : riskScore >= 50 ? 'high' : riskScore >= 25 ? 'medium' : 'low'
      };

      pipeline[item.stage].push(item);
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

    const payload = { u_renewal_stage: stage };
    if (notes) payload.u_notes = notes;

    // Update policy status based on stage
    if (stage === 'completed') payload.u_status = 'Renewed';
    else if (stage === 'lapsed') payload.u_status = 'Lapsed';
    else if (stage === 'in_progress') payload.u_status = 'Pending Renewal';

    const result = await ServiceNowService.update(POLICY_TABLE, id, payload);

    // Emit real-time event
    if (req.io) {
      req.io.emit('renewal_update', { id, stage, policy_id: id });
    }

    res.json({ id, ...payload });
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

    const promises = renewal_ids.map(id => 
      ServiceNowService.update(POLICY_TABLE, id, { u_reminder_sent: 'true' })
    );
    await Promise.all(promises);

    res.json({ message: `Reminders sent for ${renewal_ids.length} renewals`, count: renewal_ids.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getCalendar = async (req, res) => {
  try {
    const { month, year } = req.query;
    const targetMonth = parseInt(month) || new Date().getMonth();
    const targetYear = parseInt(year) || new Date().getFullYear();

    const startDate = new Date(targetYear, targetMonth, 1).toISOString().split('T')[0];
    const endDate = new Date(targetYear, targetMonth + 1, 0).toISOString().split('T')[0];

    const query = `u_renewal_dateBETWEEN${startDate}@${endDate}`;
    const policies = await ServiceNowService.find(POLICY_TABLE, query, 500);

    const calendar = {};
    policies.forEach(p => {
      const date = p.u_renewal_date;
      if (!calendar[date]) calendar[date] = [];
      const riskScore = AIService.calculatePolicyRiskScore(p);
      calendar[date].push({
        id: p.sys_id,
        policy_number: p.u_policy_number,
        type: p.u_type,
        status: p.u_status,
        customer_name: p.u_customer_name || 'N/A',
        premium_amount: p.u_premium_amount,
        risk_score: riskScore,
        risk_level: AIService.getRiskLevel(riskScore)
      });
    });

    res.json({ month: targetMonth, year: targetYear, calendar });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
