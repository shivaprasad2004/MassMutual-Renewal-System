const ServiceNowService = require('./servicenowService');

class AIService {
  static POLICY_TABLE = 'u_policy_records';
  static CUSTOMER_TABLE = 'u_customer_records';

  /**
   * Calculate risk score for a single policy (0-100)
   * Higher = more risky
   */
  static calculatePolicyRiskScore(policy) {
    let score = 0;
    const today = new Date();
    const renewalDate = new Date(policy.u_renewal_date || policy.renewal_date);
    const issueDate = new Date(policy.u_issue_date || policy.issue_date);
    const daysToRenewal = Math.ceil((renewalDate - today) / (1000 * 60 * 60 * 24));
    const policyAgeDays = Math.ceil((today - issueDate) / (1000 * 60 * 60 * 24));
    const status = policy.u_status || policy.status;
    const premium = parseFloat(policy.u_premium_amount || policy.premium_amount || 0);
    const coverage = parseFloat(policy.u_coverage_amount || policy.coverage_amount || 0);

    // Factor 1: Days to renewal (0-30 points)
    if (daysToRenewal < 0) {
      score += 30; // Overdue = max risk
    } else if (daysToRenewal <= 7) {
      score += 25;
    } else if (daysToRenewal <= 15) {
      score += 20;
    } else if (daysToRenewal <= 30) {
      score += 15;
    } else if (daysToRenewal <= 60) {
      score += 8;
    } else if (daysToRenewal <= 90) {
      score += 4;
    }

    // Factor 2: Policy status (0-25 points)
    if (status === 'Lapsed') {
      score += 25;
    } else if (status === 'Pending Renewal') {
      score += 15;
    } else if (status === 'Active') {
      score += 0;
    }

    // Factor 3: Premium amount relative to coverage (0-15 points)
    if (premium && coverage) {
      const ratio = premium / coverage;
      if (ratio > 0.1) score += 15;
      else if (ratio > 0.05) score += 10;
      else if (ratio > 0.02) score += 5;
    }

    // Factor 4: Policy age - newer policies more likely to lapse (0-15 points)
    if (policyAgeDays < 90) {
      score += 15;
    } else if (policyAgeDays < 180) {
      score += 10;
    } else if (policyAgeDays < 365) {
      score += 5;
    }

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Get risk level label from score
   */
  static getRiskLevel(score) {
    if (score >= 75) return 'critical';
    if (score >= 50) return 'high';
    if (score >= 25) return 'medium';
    return 'low';
  }

  /**
   * Get recommended action based on risk
   */
  static getRecommendedAction(riskScore, policy) {
    const customerName = policy.u_customer_name || 'customer';
    const policyType = policy.u_type || policy.type;

    if (riskScore >= 75) {
      return `URGENT: Contact ${customerName} immediately. High lapse risk for ${policyType} policy.`;
    }
    if (riskScore >= 50) {
      return `Schedule follow-up call with ${customerName} to discuss renewal options.`;
    }
    if (riskScore >= 25) {
      return `Send renewal reminder email to ${customerName}.`;
    }
    return 'No action needed. Policy is in good standing.';
  }

  /**
   * Calculate risk scores for all policies from ServiceNow
   */
  static async getAllRiskScores() {
    const policies = await ServiceNowService.find(this.POLICY_TABLE, '', 1000);
    
    return policies.map(p => {
      const score = this.calculatePolicyRiskScore(p);
      return {
        id: p.sys_id,
        policy_number: p.u_policy_number,
        customer_name: p.u_customer_name || 'N/A',
        type: p.u_type,
        status: p.u_status,
        renewal_date: p.u_renewal_date,
        premium_amount: p.u_premium_amount,
        coverage_amount: p.u_coverage_amount,
        risk_score: score,
        risk_level: this.getRiskLevel(score)
      };
    });
  }

  /**
   * Get renewal predictions for upcoming policies
   */
  static async getRenewalPredictions(days = 90) {
    const today = new Date().toISOString().split('T')[0];
    const futureDate = new Date();
    futureDate.setDate(new Date().getDate() + days);
    const futureDateStr = futureDate.toISOString().split('T')[0];

    const query = `u_renewal_dateBETWEEN${today}@${futureDateStr}^u_status=Active`;
    const policies = await ServiceNowService.find(this.POLICY_TABLE, query, 100);

    return policies.map(p => {
      const riskScore = this.calculatePolicyRiskScore(p);
      const renewalProbability = Math.max(5, 100 - riskScore);

      return {
        id: p.sys_id,
        policy_number: p.u_policy_number,
        customer_name: p.u_customer_name || 'N/A',
        type: p.u_type,
        renewal_date: p.u_renewal_date,
        premium_amount: p.u_premium_amount,
        risk_score: riskScore,
        renewal_probability: renewalProbability,
        prediction: renewalProbability >= 60 ? 'likely_renew' : 'at_risk',
        recommended_action: this.getRecommendedAction(riskScore, p)
      };
    });
  }

  /**
   * Detect anomalies in the policy data
   */
  static async detectAnomalies() {
    const policies = await ServiceNowService.find(this.POLICY_TABLE, '', 1000);
    const anomalies = [];
    const today = new Date();

    // Calculate average premium by type
    const premiumByType = {};
    policies.forEach(p => {
      const type = p.u_type;
      const premium = parseFloat(p.u_premium_amount) || 0;
      if (!premiumByType[type]) premiumByType[type] = [];
      premiumByType[type].push(premium);
    });

    const avgPremiums = {};
    Object.keys(premiumByType).forEach(type => {
      const arr = premiumByType[type];
      avgPremiums[type] = arr.reduce((a, b) => a + b, 0) / arr.length;
    });

    policies.forEach(p => {
      const premium = parseFloat(p.u_premium_amount) || 0;
      const avg = avgPremiums[p.u_type] || 0;
      const renewalDate = new Date(p.u_renewal_date);
      const daysToRenewal = Math.ceil((renewalDate - today) / (1000 * 60 * 60 * 24));

      // Anomaly: Premium significantly above average
      if (avg > 0 && premium > avg * 2.5) {
        anomalies.push({
          type: 'premium_spike',
          severity: 'high',
          policy_id: p.sys_id,
          policy_number: p.u_policy_number,
          customer_name: p.u_customer_name || 'N/A',
          message: \`Premium $\${premium.toLocaleString()} is \${((premium / avg) * 100 - 100).toFixed(0)}% above average for \${p.u_type} policies ($\${avg.toFixed(0)})\`,
          detected_at: new Date()
        });
      }

      // Anomaly: Policy overdue by more than 30 days
      if (daysToRenewal < -30 && p.u_status === 'Active') {
        anomalies.push({
          type: 'overdue_renewal',
          severity: 'critical',
          policy_id: p.sys_id,
          policy_number: p.u_policy_number,
          customer_name: p.u_customer_name || 'N/A',
          message: \`Policy is \${Math.abs(daysToRenewal)} days past renewal date but still marked as Active\`,
          detected_at: new Date()
        });
      }
    });

    return anomalies.sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return (severityOrder[a.severity] || 3) - (severityOrder[b.severity] || 3);
    });
  }

  /**
   * Generate AI recommendations
   */
  static async getRecommendations() {
    const riskScores = await this.getAllRiskScores();
    const today = new Date();
    const recommendations = [];

    const criticalPolicies = riskScores.filter(p => p.risk_level === 'critical');
    const highRiskPolicies = riskScores.filter(p => p.risk_level === 'high');

    if (criticalPolicies.length > 0) {
      recommendations.push({
        type: 'urgent',
        priority: 'critical',
        title: \`\${criticalPolicies.length} Critical Risk Policies\`,
        message: \`\${criticalPolicies.length} policies require immediate attention to prevent lapse.\`,
        action: 'Review and contact customers today',
        policies: criticalPolicies.slice(0, 5).map(p => p.policy_number),
        icon: 'alert-triangle'
      });
    }

    if (highRiskPolicies.length > 0) {
      recommendations.push({
        type: 'warning',
        priority: 'high',
        title: \`\${highRiskPolicies.length} High Risk Policies\`,
        message: \`Schedule follow-ups for \${highRiskPolicies.length} policies with elevated risk scores.\`,
        action: 'Schedule customer outreach this week',
        policies: highRiskPolicies.slice(0, 5).map(p => p.policy_number),
        icon: 'alert-circle'
      });
    }

    return recommendations;
  }

  /**
   * Calculate portfolio health score (0-100)
   */
  static async getPortfolioHealth() {
    const riskScores = await this.getAllRiskScores();
    if (riskScores.length === 0) {
      return { score: 100, grade: 'A+', status: 'excellent', breakdown: {} };
    }

    const avgRisk = riskScores.reduce((sum, p) => sum + p.risk_score, 0) / riskScores.length;
    const healthScore = Math.round(Math.max(0, 100 - avgRisk));

    let grade, status;
    if (healthScore >= 90) { grade = 'A+'; status = 'excellent'; }
    else if (healthScore >= 80) { grade = 'A'; status = 'very_good'; }
    else if (healthScore >= 70) { grade = 'B+'; status = 'good'; }
    else if (healthScore >= 60) { grade = 'B'; status = 'fair'; }
    else if (healthScore >= 50) { grade = 'C'; status = 'needs_attention'; }
    else if (healthScore >= 35) { grade = 'D'; status = 'poor'; }
    else { grade = 'F'; status = 'critical'; }

    return {
      score: healthScore,
      grade,
      status,
      breakdown: {
        total_policies: riskScores.length,
        critical: riskScores.filter(p => p.risk_level === 'critical').length,
        high: riskScores.filter(p => p.risk_level === 'high').length,
        medium: riskScores.filter(p => p.risk_level === 'medium').length,
        low: riskScores.filter(p => p.risk_level === 'low').length,
        average_risk: Math.round(avgRisk)
      }
    };
  }

  /**
   * Get AI-enriched dashboard data
   */
  static async getDashboardData() {
    const [health, recommendations, anomalies, riskScores] = await Promise.all([
      this.getPortfolioHealth(),
      this.getRecommendations(),
      this.detectAnomalies(),
      this.getAllRiskScores()
    ]);

    const today = new Date();
    const thirtyDays = new Date();
    thirtyDays.setDate(today.getDate() + 30);

    const upcomingRenewals = riskScores.filter(p => {
      const rd = new Date(p.renewal_date);
      return rd >= today && rd <= thirtyDays && p.status === 'Active';
    });

    const overduePolicies = riskScores.filter(p => {
      const rd = new Date(p.renewal_date);
      return rd < today && p.status === 'Active';
    });

    const totalPremium = riskScores.reduce((sum, p) => sum + (parseFloat(p.premium_amount) || 0), 0);
    const totalCoverage = riskScores.reduce((sum, p) => sum + (parseFloat(p.coverage_amount) || 0), 0);
    const revenueAtRisk = riskScores
      .filter(p => p.risk_level === 'high' || p.risk_level === 'critical')
      .reduce((sum, p) => sum + (parseFloat(p.premium_amount) || 0), 0);

    return {
      health,
      stats: {
        totalPolicies: riskScores.length,
        upcomingRenewals: upcomingRenewals.length,
        overduePolicies: overduePolicies.length,
        revenueAtRisk: Math.round(revenueAtRisk),
        totalPremium: Math.round(totalPremium),
        totalCoverage: Math.round(totalCoverage)
      },
      recommendations: recommendations.slice(0, 5),
      anomalies: anomalies.slice(0, 5),
      topRiskPolicies: riskScores
        .sort((a, b) => b.risk_score - a.risk_score)
        .slice(0, 10),
      upcomingRenewals: upcomingRenewals.slice(0, 10)
    };
  }
}

module.exports = AIService;
