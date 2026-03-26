const { Policy, Customer, Renewal } = require('../models');
const { Op } = require('sequelize');
const AIService = require('./aiService');

class AIChatService {
  static async processQuery(message) {
    const lowerMsg = message.toLowerCase().trim();

    // Try OpenAI if configured
    if (process.env.OPENAI_API_KEY) {
      try {
        return await this.processWithLLM(message);
      } catch (err) {
        console.error('LLM processing failed, falling back to local:', err.message);
      }
    }

    // Local rule-based fallback
    return await this.processLocally(lowerMsg, message);
  }

  static async processWithLLM(message) {
    const { default: OpenAI } = await import('openai');
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Get context data
    const [health, stats] = await Promise.all([
      AIService.getPortfolioHealth(),
      AIService.getDashboardData()
    ]);

    const systemPrompt = `You are an AI assistant for a MassMutual policy renewal management system. You help agents monitor policies, track renewals, and manage risk.

Current Portfolio Stats:
- Total Policies: ${stats.stats.totalPolicies}
- Upcoming Renewals: ${stats.stats.upcomingRenewals}
- Overdue Policies: ${stats.stats.overduePolicies}
- Portfolio Health: ${health.grade} (${health.score}/100)
- Revenue at Risk: $${stats.stats.revenueAtRisk?.toLocaleString()}
- Renewal Rate: ${stats.stats.renewalRate}%

Top Risk Policies: ${JSON.stringify(stats.topRiskPolicies?.slice(0, 5).map(p => ({ number: p.policy_number, risk: p.risk_score, customer: p.customer_name })))}

Anomalies: ${JSON.stringify(stats.anomalies?.slice(0, 3))}

Answer concisely with actionable insights. Use the data above to answer policy-related questions. If asked to show or list data, format it clearly.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      max_tokens: 500,
      temperature: 0.7
    });

    const reply = completion.choices[0].message.content;

    return {
      type: 'ai_response',
      message: reply,
      source: 'llm',
      timestamp: new Date().toISOString()
    };
  }

  static async processLocally(lowerMsg, originalMsg) {
    // Pattern matching for common queries
    if (lowerMsg.includes('high risk') || lowerMsg.includes('high-risk') || lowerMsg.includes('critical')) {
      const scores = await AIService.getAllRiskScores();
      const highRisk = scores.filter(p => p.risk_level === 'critical' || p.risk_level === 'high');
      return {
        type: 'policy_list',
        message: `Found ${highRisk.length} high/critical risk policies.`,
        data: highRisk.slice(0, 10),
        source: 'local',
        timestamp: new Date().toISOString()
      };
    }

    if (lowerMsg.includes('expir') || lowerMsg.includes('renewal') || lowerMsg.includes('upcoming')) {
      let days = 30;
      const daysMatch = lowerMsg.match(/(\d+)\s*days?/);
      if (daysMatch) days = parseInt(daysMatch[1]);
      if (lowerMsg.includes('next month')) days = 30;
      if (lowerMsg.includes('next week')) days = 7;
      if (lowerMsg.includes('next quarter') || lowerMsg.includes('90 days')) days = 90;

      const predictions = await AIService.getRenewalPredictions(days);
      return {
        type: 'predictions',
        message: `Found ${predictions.length} policies with renewals in the next ${days} days.`,
        data: predictions.slice(0, 10),
        source: 'local',
        timestamp: new Date().toISOString()
      };
    }

    if (lowerMsg.includes('health') || lowerMsg.includes('portfolio') || lowerMsg.includes('overview')) {
      const health = await AIService.getPortfolioHealth();
      const dashboard = await AIService.getDashboardData();
      return {
        type: 'health_report',
        message: `Portfolio Health: ${health.grade} (${health.score}/100). ${health.breakdown.total_policies} total policies. ${health.breakdown.critical} critical, ${health.breakdown.high} high risk.`,
        data: { health, stats: dashboard.stats },
        source: 'local',
        timestamp: new Date().toISOString()
      };
    }

    if (lowerMsg.includes('anomal') || lowerMsg.includes('unusual') || lowerMsg.includes('irregular')) {
      const anomalies = await AIService.detectAnomalies();
      return {
        type: 'anomalies',
        message: `Detected ${anomalies.length} anomalies in the portfolio.`,
        data: anomalies.slice(0, 10),
        source: 'local',
        timestamp: new Date().toISOString()
      };
    }

    if (lowerMsg.includes('recommend') || lowerMsg.includes('suggest') || lowerMsg.includes('action')) {
      const recommendations = await AIService.getRecommendations();
      return {
        type: 'recommendations',
        message: `Here are ${recommendations.length} AI recommendations for your portfolio.`,
        data: recommendations,
        source: 'local',
        timestamp: new Date().toISOString()
      };
    }

    if (lowerMsg.includes('trend') || lowerMsg.includes('performance') || lowerMsg.includes('history')) {
      const trends = await AIService.getRenewalTrends();
      return {
        type: 'trends',
        message: `Renewal trends for the last 6 months.`,
        data: trends,
        source: 'local',
        timestamp: new Date().toISOString()
      };
    }

    if (lowerMsg.includes('customer') && (lowerMsg.includes('search') || lowerMsg.includes('find') || lowerMsg.includes('show'))) {
      const nameMatch = originalMsg.match(/(?:customer|for)\s+["']?([a-zA-Z\s]+)["']?/i);
      if (nameMatch) {
        const customers = await Customer.findAll({
          where: { name: { [Op.like]: `%${nameMatch[1].trim()}%` } },
          include: [{ model: Policy }]
        });
        return {
          type: 'customer_list',
          message: `Found ${customers.length} customers matching "${nameMatch[1].trim()}".`,
          data: customers.map(c => c.toJSON()),
          source: 'local',
          timestamp: new Date().toISOString()
        };
      }
    }

    if (lowerMsg.includes('policy') && (lowerMsg.includes('search') || lowerMsg.includes('find') || lowerMsg.includes('show') || lowerMsg.includes('get'))) {
      const numberMatch = originalMsg.match(/[A-Z]{2,}-\d+/i);
      if (numberMatch) {
        const policy = await Policy.findOne({
          where: { policy_number: { [Op.like]: `%${numberMatch[0]}%` } },
          include: [{ model: Customer }]
        });
        if (policy) {
          const riskScore = AIService.calculatePolicyRiskScore(policy);
          return {
            type: 'policy_detail',
            message: `Found policy ${policy.policy_number}. Risk Score: ${riskScore}/100.`,
            data: { ...policy.toJSON(), risk_score: riskScore, risk_level: AIService.getRiskLevel(riskScore) },
            source: 'local',
            timestamp: new Date().toISOString()
          };
        }
      }
    }

    // Default: return portfolio summary with helpful tips
    const health = await AIService.getPortfolioHealth();
    return {
      type: 'help',
      message: `I can help you with policy monitoring. Try asking:\n- "Show high risk policies"\n- "Upcoming renewals next month"\n- "Portfolio health overview"\n- "Detect anomalies"\n- "Show recommendations"\n- "Renewal trends"\n\nCurrent Portfolio: ${health.grade} (${health.score}/100)`,
      data: { health },
      source: 'local',
      timestamp: new Date().toISOString()
    };
  }

  static async generateSummary(entityType, entityId) {
    if (entityType === 'policy') {
      const policy = await Policy.findByPk(entityId, { include: [{ model: Customer }] });
      if (!policy) return { message: 'Policy not found' };

      const riskScore = AIService.calculatePolicyRiskScore(policy);
      const riskLevel = AIService.getRiskLevel(riskScore);
      const action = AIService.getRecommendedAction(riskScore, policy);
      const renewalDate = new Date(policy.renewal_date);
      const daysToRenewal = Math.ceil((renewalDate - new Date()) / (1000 * 60 * 60 * 24));

      return {
        type: 'policy_summary',
        summary: {
          policy_number: policy.policy_number,
          customer: policy.Customer?.name || 'N/A',
          type: policy.type,
          status: policy.status,
          risk_score: riskScore,
          risk_level: riskLevel,
          days_to_renewal: daysToRenewal,
          premium: policy.premium_amount,
          coverage: policy.coverage_amount,
          recommendation: action,
          health: riskScore < 25 ? 'Healthy' : riskScore < 50 ? 'Monitor' : riskScore < 75 ? 'At Risk' : 'Critical'
        }
      };
    }

    if (entityType === 'customer') {
      const profile = await AIService.getCustomerProfile(entityId);
      if (!profile) return { message: 'Customer not found' };
      return { type: 'customer_summary', summary: profile };
    }

    return { message: 'Unknown entity type' };
  }
}

module.exports = AIChatService;
