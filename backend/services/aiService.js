const { Policy, Customer, Renewal } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../config/db');
const ServiceNowService = require('./servicenowService');

class AIService {

  /**
   * Calculate risk score for a single policy (0-100)
   * Higher = more risky
   */
  static calculatePolicyRiskScore(policy) {
    let score = 0;
    const today = new Date();
    const renewalDate = new Date(policy.renewal_date);
    const issueDate = new Date(policy.issue_date);
    const daysToRenewal = Math.ceil((renewalDate - today) / (1000 * 60 * 60 * 24));
    const policyAgeDays = Math.ceil((today - issueDate) / (1000 * 60 * 60 * 24));

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
    if (policy.status === 'Lapsed') {
      score += 25;
    } else if (policy.status === 'Pending Renewal') {
      score += 15;
    } else if (policy.status === 'Active') {
      score += 0;
    }

    // Factor 3: Premium amount relative to coverage (0-15 points)
    if (policy.premium_amount && policy.coverage_amount) {
      const ratio = policy.premium_amount / policy.coverage_amount;
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

    // Factor 5: Payment frequency risk (0-15 points)
    if (policy.payment_frequency === 'monthly') {
      score += 10; // Monthly = more friction points
    } else if (policy.payment_frequency === 'quarterly') {
      score += 5;
    }

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Sync AI insights for a policy to ServiceNow
   */
  static async syncPolicyAIInsights(policy) {
    const riskScore = this.calculatePolicyRiskScore(policy);
    const riskLevel = this.getRiskLevel(riskScore);
    const recommendedAction = this.getRecommendedAction(riskScore, policy);

    // Sync to ServiceNow asynchronously
    ServiceNowService.syncData({
      u_policy_number: policy.policy_number,
      u_risk_score: riskScore,
      u_risk_level: riskLevel,
      u_recommended_action: recommendedAction,
      u_prediction: riskScore >= 50 ? 'AT_RISK' : 'SAFE',
      u_last_ai_analysis: new Date().toISOString()
    }, 'u_ai_insights').catch(err => 
      console.error('ServiceNow AI Insight sync error:', err.message)
    );

    return { riskScore, riskLevel, recommendedAction };
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
   * Calculate risk scores for all policies
   */
  static async getAllRiskScores() {
    const policies = await Policy.findAll({
      include: [{ model: Customer }],
      order: [['renewal_date', 'ASC']]
    });

    return policies.map(policy => {
      const score = this.calculatePolicyRiskScore(policy);
      return {
        id: policy.id,
        policy_number: policy.policy_number,
        customer_name: policy.Customer?.name || 'N/A',
        type: policy.type,
        status: policy.status,
        renewal_date: policy.renewal_date,
        premium_amount: policy.premium_amount,
        coverage_amount: policy.coverage_amount,
        risk_score: score,
        risk_level: this.getRiskLevel(score)
      };
    });
  }

  /**
   * Get renewal predictions for upcoming policies
   */
  static async getRenewalPredictions(days = 90) {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    const policies = await Policy.findAll({
      where: {
        renewal_date: { [Op.between]: [today, futureDate] },
        status: 'Active'
      },
      include: [{ model: Customer }],
      order: [['renewal_date', 'ASC']]
    });

    return policies.map(policy => {
      const riskScore = this.calculatePolicyRiskScore(policy);
      const renewalProbability = Math.max(5, 100 - riskScore);

      return {
        id: policy.id,
        policy_number: policy.policy_number,
        customer_name: policy.Customer?.name || 'N/A',
        type: policy.type,
        renewal_date: policy.renewal_date,
        premium_amount: policy.premium_amount,
        risk_score: riskScore,
        renewal_probability: renewalProbability,
        prediction: renewalProbability >= 60 ? 'likely_renew' : 'at_risk',
        recommended_action: this.getRecommendedAction(riskScore, policy)
      };
    });
  }

  /**
   * Get recommended action based on risk
   */
  static getRecommendedAction(riskScore, policy) {
    if (riskScore >= 75) {
      return `URGENT: Contact ${policy.Customer?.name || 'customer'} immediately. High lapse risk for ${policy.type} policy.`;
    }
    if (riskScore >= 50) {
      return `Schedule follow-up call with ${policy.Customer?.name || 'customer'} to discuss renewal options.`;
    }
    if (riskScore >= 25) {
      return `Send renewal reminder email to ${policy.Customer?.name || 'customer'}.`;
    }
    return 'No action needed. Policy is in good standing.';
  }

  /**
   * Get historical renewal trends (monthly)
   */
  static async getRenewalTrends() {
    const months = 6;
    const trends = [];
    const today = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() - i + 1, 0);

      const renewedCount = await Policy.count({
        where: {
          status: 'Renewed',
          updatedAt: { [Op.between]: [startOfMonth, endOfMonth] }
        }
      });

      const lapsedCount = await Policy.count({
        where: {
          status: 'Lapsed',
          updatedAt: { [Op.between]: [startOfMonth, endOfMonth] }
        }
      });

      trends.push({
        month: startOfMonth.toLocaleString('default', { month: 'short' }),
        renewed: renewedCount,
        lapsed: lapsedCount,
        total: renewedCount + lapsedCount,
        retentionRate: (renewedCount + lapsedCount) > 0 ? (renewedCount / (renewedCount + lapsedCount)) * 100 : 100
      });
    }

    return trends;
  }

  /**
   * Detect anomalies in the policy data
   */
  static async detectAnomalies() {
    const policies = await Policy.findAll({
      include: [{ model: Customer }]
    });

    const anomalies = [];
    const today = new Date();

    // Calculate average premium by type
    const premiumByType = {};
    policies.forEach(p => {
      if (!premiumByType[p.type]) premiumByType[p.type] = [];
      premiumByType[p.type].push(parseFloat(p.premium_amount) || 0);
    });

    const avgPremiums = {};
    Object.keys(premiumByType).forEach(type => {
      const arr = premiumByType[type];
      avgPremiums[type] = arr.reduce((a, b) => a + b, 0) / arr.length;
    });

    policies.forEach(policy => {
      const premium = parseFloat(policy.premium_amount) || 0;
      const avg = avgPremiums[policy.type] || 0;
      const renewalDate = new Date(policy.renewal_date);
      const daysToRenewal = Math.ceil((renewalDate - today) / (1000 * 60 * 60 * 24));

      // Anomaly: Premium significantly above average
      if (avg > 0 && premium > avg * 2.5) {
        anomalies.push({
          type: 'premium_spike',
          severity: 'high',
          policy_id: policy.id,
          policy_number: policy.policy_number,
          customer_name: policy.Customer?.name || 'N/A',
          message: `Premium $${premium.toLocaleString()} is ${((premium / avg) * 100 - 100).toFixed(0)}% above average for ${policy.type} policies ($${avg.toFixed(0)})`,
          detected_at: new Date()
        });
      }

      // Anomaly: Policy overdue by more than 30 days
      if (daysToRenewal < -30 && policy.status === 'Active') {
        anomalies.push({
          type: 'overdue_renewal',
          severity: 'critical',
          policy_id: policy.id,
          policy_number: policy.policy_number,
          customer_name: policy.Customer?.name || 'N/A',
          message: `Policy is ${Math.abs(daysToRenewal)} days past renewal date but still marked as Active`,
          detected_at: new Date()
        });
      }

      // Anomaly: Very high coverage with low premium
      if (policy.coverage_amount && premium > 0) {
        const ratio = premium / policy.coverage_amount;
        if (ratio < 0.001) {
          anomalies.push({
            type: 'coverage_mismatch',
            severity: 'medium',
            policy_id: policy.id,
            policy_number: policy.policy_number,
            customer_name: policy.Customer?.name || 'N/A',
            message: `Premium-to-coverage ratio unusually low (${(ratio * 100).toFixed(3)}%) for policy ${policy.policy_number}`,
            detected_at: new Date()
          });
        }
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

    // High risk policies needing attention
    const criticalPolicies = riskScores.filter(p => p.risk_level === 'critical');
    const highRiskPolicies = riskScores.filter(p => p.risk_level === 'high');

    if (criticalPolicies.length > 0) {
      recommendations.push({
        type: 'urgent',
        priority: 'critical',
        title: `${criticalPolicies.length} Critical Risk Policies`,
        message: `${criticalPolicies.length} policies require immediate attention to prevent lapse.`,
        action: 'Review and contact customers today',
        policies: criticalPolicies.slice(0, 5).map(p => p.policy_number),
        icon: 'alert-triangle'
      });
    }

    if (highRiskPolicies.length > 0) {
      recommendations.push({
        type: 'warning',
        priority: 'high',
        title: `${highRiskPolicies.length} High Risk Policies`,
        message: `Schedule follow-ups for ${highRiskPolicies.length} policies with elevated risk scores.`,
        action: 'Schedule customer outreach this week',
        policies: highRiskPolicies.slice(0, 5).map(p => p.policy_number),
        icon: 'alert-circle'
      });
    }

    // Upcoming renewals in next 7 days
    const sevenDays = new Date();
    sevenDays.setDate(today.getDate() + 7);
    const urgentRenewals = riskScores.filter(p => {
      const rd = new Date(p.renewal_date);
      return rd >= today && rd <= sevenDays;
    });

    if (urgentRenewals.length > 0) {
      recommendations.push({
        type: 'info',
        priority: 'high',
        title: `${urgentRenewals.length} Renewals This Week`,
        message: `${urgentRenewals.length} policies are due for renewal within the next 7 days.`,
        action: 'Send renewal reminders',
        policies: urgentRenewals.map(p => p.policy_number),
        icon: 'clock'
      });
    }

    // Revenue optimization
    const totalPremiumAtRisk = riskScores
      .filter(p => p.risk_level === 'high' || p.risk_level === 'critical')
      .reduce((sum, p) => sum + (parseFloat(p.premium_amount) || 0), 0);

    if (totalPremiumAtRisk > 0) {
      recommendations.push({
        type: 'insight',
        priority: 'medium',
        title: 'Revenue Protection Opportunity',
        message: `$${totalPremiumAtRisk.toLocaleString()} in annual premium is at risk across high/critical policies.`,
        action: 'Prioritize retention outreach to protect revenue',
        icon: 'dollar-sign'
      });
    }

    // Portfolio diversity suggestion
    const typeCounts = {};
    riskScores.forEach(p => {
      typeCounts[p.type] = (typeCounts[p.type] || 0) + 1;
    });
    const totalPolicies = riskScores.length;
    const dominantType = Object.entries(typeCounts).sort(([,a], [,b]) => b - a)[0];
    if (dominantType && totalPolicies > 0 && (dominantType[1] / totalPolicies) > 0.6) {
      recommendations.push({
        type: 'insight',
        priority: 'low',
        title: 'Portfolio Diversification',
        message: `${((dominantType[1] / totalPolicies) * 100).toFixed(0)}% of policies are ${dominantType[0]} type. Consider diversifying.`,
        action: 'Explore cross-selling opportunities',
        icon: 'pie-chart'
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

    const criticalCount = riskScores.filter(p => p.risk_level === 'critical').length;
    const highCount = riskScores.filter(p => p.risk_level === 'high').length;
    const mediumCount = riskScores.filter(p => p.risk_level === 'medium').length;
    const lowCount = riskScores.filter(p => p.risk_level === 'low').length;

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
        critical: criticalCount,
        high: highCount,
        medium: mediumCount,
        low: lowCount,
        average_risk: Math.round(avgRisk)
      }
    };
  }

  /**
   * Get trend data for charts
   */
  static async getTrends() {
    const policies = await Policy.findAll({
      include: [{ model: Customer }],
      order: [['createdAt', 'ASC']]
    });

    // Monthly policy creation trend (last 12 months)
    const months = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        label: d.toLocaleString('default', { month: 'short', year: '2-digit' }),
        year: d.getFullYear(),
        month: d.getMonth()
      });
    }

    const policyTrend = months.map(m => {
      const count = policies.filter(p => {
        const d = new Date(p.createdAt);
        return d.getFullYear() === m.year && d.getMonth() === m.month;
      }).length;
      return { label: m.label, count };
    });

    // Premium revenue by month
    const revenueTrend = months.map(m => {
      const total = policies
        .filter(p => {
          const d = new Date(p.createdAt);
          return d.getFullYear() === m.year && d.getMonth() === m.month;
        })
        .reduce((sum, p) => sum + (parseFloat(p.premium_amount) || 0), 0);
      return { label: m.label, revenue: total };
    });

    // Policy type distribution
    const typeDistribution = {};
    policies.forEach(p => {
      typeDistribution[p.type] = (typeDistribution[p.type] || 0) + 1;
    });

    // Status distribution
    const statusDistribution = {};
    policies.forEach(p => {
      statusDistribution[p.status] = (statusDistribution[p.status] || 0) + 1;
    });

    // Renewal rate calculation
    const renewedCount = policies.filter(p => p.status === 'Renewed').length;
    const lapsedCount = policies.filter(p => p.status === 'Lapsed').length;
    const totalResolved = renewedCount + lapsedCount;
    const renewalRate = totalResolved > 0 ? Math.round((renewedCount / totalResolved) * 100) : 100;

    // Total premium and coverage
    const totalPremium = policies.reduce((sum, p) => sum + (parseFloat(p.premium_amount) || 0), 0);
    const totalCoverage = policies.reduce((sum, p) => sum + (parseFloat(p.coverage_amount) || 0), 0);

    return {
      policyTrend,
      revenueTrend,
      typeDistribution,
      statusDistribution,
      renewalRate,
      totalPremium,
      totalCoverage,
      totalPolicies: policies.length
    };
  }

  /**
   * Get AI-enriched dashboard data
   */
  static async getDashboardData() {
    const [health, trends, recommendations, anomalies, riskScores] = await Promise.all([
      this.getPortfolioHealth(),
      this.getTrends(),
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
        renewalRate: trends.renewalRate,
        totalPremium: Math.round(trends.totalPremium),
        totalCoverage: Math.round(trends.totalCoverage)
      },
      trends,
      recommendations: recommendations.slice(0, 5),
      anomalies: anomalies.slice(0, 5),
      topRiskPolicies: riskScores
        .sort((a, b) => b.risk_score - a.risk_score)
        .slice(0, 10),
      upcomingRenewals: upcomingRenewals.slice(0, 10)
    };
  }

  /**
   * Get customer AI profile
   */
  static async getCustomerProfile(customerId) {
    const customer = await Customer.findByPk(customerId, {
      include: [{ model: Policy }]
    });

    if (!customer) return null;

    const policies = customer.Policies || [];
    const riskScores = policies.map(p => ({
      ...p.toJSON(),
      risk_score: this.calculatePolicyRiskScore(p),
      risk_level: this.getRiskLevel(this.calculatePolicyRiskScore(p))
    }));

    const avgRisk = riskScores.length > 0
      ? riskScores.reduce((sum, p) => sum + p.risk_score, 0) / riskScores.length
      : 0;

    const totalPremium = policies.reduce((sum, p) => sum + (parseFloat(p.premium_amount) || 0), 0);
    const totalCoverage = policies.reduce((sum, p) => sum + (parseFloat(p.coverage_amount) || 0), 0);

    let engagement;
    if (policies.length >= 3 && avgRisk < 30) engagement = 'high';
    else if (policies.length >= 2 && avgRisk < 50) engagement = 'medium';
    else engagement = 'low';

    return {
      customer: customer.toJSON(),
      metrics: {
        total_policies: policies.length,
        total_premium: totalPremium,
        total_coverage: totalCoverage,
        average_risk: Math.round(avgRisk),
        engagement_level: engagement,
        lifetime_value: totalPremium * 5 // Estimated 5-year value
      },
      policies: riskScores
    };
  }
}

module.exports = AIService;
