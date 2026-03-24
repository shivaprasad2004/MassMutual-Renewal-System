const express = require('express');
const router = express.Router();
const {
  getDashboard,
  getRiskScores,
  getPredictions,
  getAnomalies,
  getRecommendations,
  getTrends,
  getCustomerProfile,
  getPortfolioHealth
} = require('../controllers/analyticsController');
const auth = require('../middleware/authMiddleware');

router.get('/dashboard', auth, getDashboard);
router.get('/risk-scores', auth, getRiskScores);
router.get('/predictions', auth, getPredictions);
router.get('/anomalies', auth, getAnomalies);
router.get('/recommendations', auth, getRecommendations);
router.get('/trends', auth, getTrends);
router.get('/health', auth, getPortfolioHealth);
router.get('/customer/:id', auth, getCustomerProfile);

module.exports = router;
