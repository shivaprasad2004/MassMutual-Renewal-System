const { Policy, Customer } = require('../models');
const AIService = require('./aiService');

class ReportService {
  static async generatePortfolioReport() {
    const [health, trends, riskScores, anomalies, recommendations] = await Promise.all([
      AIService.getPortfolioHealth(),
      AIService.getTrends(),
      AIService.getAllRiskScores(),
      AIService.detectAnomalies(),
      AIService.getRecommendations()
    ]);

    return {
      generated_at: new Date().toISOString(),
      portfolio_health: health,
      statistics: {
        total_policies: trends.totalPolicies,
        total_premium: trends.totalPremium,
        total_coverage: trends.totalCoverage,
        renewal_rate: trends.renewalRate,
        type_distribution: trends.typeDistribution,
        status_distribution: trends.statusDistribution
      },
      risk_summary: {
        critical: riskScores.filter(p => p.risk_level === 'critical').length,
        high: riskScores.filter(p => p.risk_level === 'high').length,
        medium: riskScores.filter(p => p.risk_level === 'medium').length,
        low: riskScores.filter(p => p.risk_level === 'low').length
      },
      top_risk_policies: riskScores.sort((a, b) => b.risk_score - a.risk_score).slice(0, 20),
      anomalies: anomalies.slice(0, 10),
      recommendations,
      trends: {
        revenue: trends.revenueTrend,
        policies: trends.policyTrend
      }
    };
  }

  static async generateCSVReport(filters = {}) {
    const policies = await Policy.findAll({
      include: [{ model: Customer }],
      order: [['renewal_date', 'ASC']]
    });

    const rows = [['Policy Number', 'Customer', 'Type', 'Status', 'Premium', 'Coverage', 'Renewal Date', 'Risk Score', 'Risk Level'].join(',')];

    for (const policy of policies) {
      if (filters.status && policy.status !== filters.status) continue;
      if (filters.type && policy.type !== filters.type) continue;

      const riskScore = AIService.calculatePolicyRiskScore(policy);
      rows.push([
        policy.policy_number,
        `"${policy.Customer?.name || 'N/A'}"`,
        policy.type,
        policy.status,
        policy.premium_amount,
        policy.coverage_amount,
        policy.renewal_date,
        riskScore,
        AIService.getRiskLevel(riskScore)
      ].join(','));
    }

    return rows.join('\n');
  }
}

module.exports = ReportService;
