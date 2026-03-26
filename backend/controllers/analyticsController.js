const AIService = require('../services/aiService');

exports.getDashboard = async (req, res) => {
  try {
    const data = await AIService.getDashboardData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getRiskScores = async (req, res) => {
  try {
    const scores = await AIService.getAllRiskScores();
    res.json(scores);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getPredictions = async (req, res) => {
  try {
    const { days = 90 } = req.query;
    const predictions = await AIService.getRenewalPredictions(parseInt(days));
    res.json(predictions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getAnomalies = async (req, res) => {
  try {
    const anomalies = await AIService.detectAnomalies();
    res.json(anomalies);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getRecommendations = async (req, res) => {
  try {
    const recommendations = await AIService.getRecommendations();
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getTrends = async (req, res) => {
  try {
    const trends = await AIService.getTrends();
    res.json(trends);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getCustomerProfile = async (req, res) => {
  try {
    const profile = await AIService.getCustomerProfile(req.params.id);
    if (!profile) return res.status(404).json({ message: 'Customer not found' });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getReport = async (req, res) => {
  try {
    const ReportService = require('../services/reportService');
    const { format = 'json', status, type } = req.query;

    if (format === 'csv') {
      const csv = await ReportService.generateCSVReport({ status, type });
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=portfolio_report.csv');
      return res.send(csv);
    }

    const report = await ReportService.generatePortfolioReport();
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getPortfolioHealth = async (req, res) => {
  try {
    const health = await AIService.getPortfolioHealth();
    res.json(health);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
