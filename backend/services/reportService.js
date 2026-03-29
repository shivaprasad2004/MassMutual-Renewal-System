const ServiceNowService = require('./servicenowService');
const AIService = require('./aiService');

class ReportService {
  static POLICY_TABLE = 'u_policy_records';

  /**
   * Generate comprehensive portfolio report from ServiceNow data
   */
  static async generatePortfolioReport() {
    const [health, dashboard] = await Promise.all([
      AIService.getPortfolioHealth(),
      AIService.getDashboardData()
    ]);

    return {
      generated_at: new Date().toISOString(),
      portfolio_health: health,
      statistics: dashboard.stats,
      risk_summary: health.breakdown,
      top_risk_policies: dashboard.topRiskPolicies,
      anomalies: dashboard.anomalies,
      recommendations: dashboard.recommendations,
      upcoming_renewals: dashboard.upcomingRenewals
    };
  }

  /**
   * Generate CSV report from ServiceNow data
   */
  static async generateCSVReport(filters = {}) {
    let query = '';
    if (filters.status) query += `u_status=${filters.status}^`;
    if (filters.type) query += `u_type=${filters.type}^`;

    const policies = await ServiceNowService.find(this.POLICY_TABLE, query, 1000);

    const headers = ['Policy Number', 'Customer', 'Type', 'Status', 'Premium', 'Coverage', 'Renewal Date', 'Risk Score', 'Risk Level'];
    const rows = [headers.join(',')];

    for (const p of policies) {
      const riskScore = AIService.calculatePolicyRiskScore(p);
      const riskLevel = AIService.getRiskLevel(riskScore);
      
      const row = [
        p.u_policy_number,
        `"${p.u_customer_name || 'N/A'}"`,
        p.u_type,
        p.u_status,
        p.u_premium_amount,
        p.u_coverage_amount,
        p.u_renewal_date,
        riskScore,
        riskLevel
      ];
      
      rows.push(row.join(','));
    }

    return rows.join('\n');
  }
}

module.exports = ReportService;
