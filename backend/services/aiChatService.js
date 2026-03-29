const AIService = require('./aiService');
const ServiceNowService = require('./servicenowService');

class AIChatService {
  static POLICY_TABLE = 'u_policy_records';
  static CUSTOMER_TABLE = 'u_customer_records';

  static async processQuery(message) {
    const lowerMsg = message.toLowerCase().trim();

    // Local rule-based processing for ServiceNow-Native environment
    return await this.processLocally(lowerMsg, message);
  }

  static async processLocally(lowerMsg, originalMsg) {
    // Pattern matching for common queries
    if (lowerMsg.includes('high risk') || lowerMsg.includes('high-risk') || lowerMsg.includes('critical')) {
      const scores = await AIService.getAllRiskScores();
      const highRisk = scores.filter(p => p.risk_level === 'critical' || p.risk_level === 'high');
      return {
        type: 'policy_list',
        message: `Found ${highRisk.length} high/critical risk policies in ServiceNow.`,
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
        message: `Found ${predictions.length} policies in ServiceNow with renewals in the next ${days} days.`,
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
        message: `Portfolio Health: ${health.grade} (${health.score}/100). ${health.breakdown.total_policies} total policies in ServiceNow. ${health.breakdown.critical} critical, ${health.breakdown.high} high risk.`,
        data: { health, stats: dashboard.stats },
        source: 'local',
        timestamp: new Date().toISOString()
      };
    }

    if (lowerMsg.includes('anomal') || lowerMsg.includes('unusual') || lowerMsg.includes('irregular')) {
      const anomalies = await AIService.detectAnomalies();
      return {
        type: 'anomalies',
        message: `Detected ${anomalies.length} anomalies in the ServiceNow portfolio.`,
        data: anomalies.slice(0, 10),
        source: 'local',
        timestamp: new Date().toISOString()
      };
    }

    if (lowerMsg.includes('recommend') || lowerMsg.includes('suggest') || lowerMsg.includes('action')) {
      const recommendations = await AIService.getRecommendations();
      return {
        type: 'recommendations',
        message: `Here are ${recommendations.length} AI recommendations based on ServiceNow data.`,
        data: recommendations,
        source: 'local',
        timestamp: new Date().toISOString()
      };
    }

    if (lowerMsg.includes('customer') && (lowerMsg.includes('search') || lowerMsg.includes('find') || lowerMsg.includes('show'))) {
      const nameMatch = originalMsg.match(/(?:customer|for)\s+["']?([a-zA-Z\s]+)["']?/i);
      if (nameMatch) {
        const query = `u_nameLIKE${nameMatch[1].trim()}`;
        const customers = await ServiceNowService.find(this.CUSTOMER_TABLE, query, 10);
        return {
          type: 'customer_list',
          message: `Found ${customers.length} customers in ServiceNow matching "${nameMatch[1].trim()}".`,
          data: customers.map(c => ({
            id: c.sys_id,
            name: c.u_name,
            email: c.u_email,
            phone: c.u_phone
          })),
          source: 'local',
          timestamp: new Date().toISOString()
        };
      }
    }

    if (lowerMsg.includes('policy') && (lowerMsg.includes('search') || lowerMsg.includes('find') || lowerMsg.includes('show') || lowerMsg.includes('get'))) {
      const numberMatch = originalMsg.match(/[A-Z]{2,}-\d+/i);
      if (numberMatch) {
        const query = `u_policy_numberLIKE${numberMatch[0]}`;
        const policies = await ServiceNowService.find(this.POLICY_TABLE, query, 1);
        if (policies.length > 0) {
          const p = policies[0];
          const riskScore = AIService.calculatePolicyRiskScore(p);
          return {
            type: 'policy_detail',
            message: `Found policy ${p.u_policy_number} in ServiceNow. Risk Score: ${riskScore}/100.`,
            data: {
              id: p.sys_id,
              policy_number: p.u_policy_number,
              type: p.u_type,
              status: p.u_status,
              customer_name: p.u_customer_name,
              risk_score: riskScore,
              risk_level: AIService.getRiskLevel(riskScore)
            },
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
      message: `I am your ServiceNow-Native AI assistant. I can help you with:\n- "Show high risk policies"\n- "Upcoming renewals next month"\n- "Portfolio health overview"\n- "Detect anomalies"\n- "Show recommendations"\n- "Search customer [name]"\n\nCurrent ServiceNow Portfolio Health: ${health.grade} (${health.score}/100)`,
      data: { health },
      source: 'local',
      timestamp: new Date().toISOString()
    };
  }

  static async generateSummary(entityType, entityId) {
    if (entityType === 'policy') {
      const p = await ServiceNowService.findById(this.POLICY_TABLE, entityId);
      if (!p) return { message: 'Policy not found' };

      const riskScore = AIService.calculatePolicyRiskScore(p);
      const riskLevel = AIService.getRiskLevel(riskScore);
      const action = AIService.getRecommendedAction(riskScore, p);
      const renewalDate = new Date(p.u_renewal_date);
      const daysToRenewal = Math.ceil((renewalDate - new Date()) / (1000 * 60 * 60 * 24));

      return {
        type: 'policy_summary',
        summary: {
          policy_number: p.u_policy_number,
          customer: p.u_customer_name || 'N/A',
          type: p.u_type,
          status: p.u_status,
          risk_score: riskScore,
          risk_level: riskLevel,
          days_to_renewal: daysToRenewal,
          premium: p.u_premium_amount,
          coverage: p.u_coverage_amount,
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
