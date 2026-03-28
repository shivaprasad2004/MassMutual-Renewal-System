const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const validate = require('../middleware/validate');
const {
  getPolicies,
  getPolicyById,
  createPolicy,
  updatePolicy,
  bulkUpdateStatus,
  deletePolicy,
  getDashboardStats,
  exportPolicies,
  getAIInsights,
  getPolicyTimeline,
  getRiskBreakdown
} = require('../controllers/policyController');
const auth = require('../middleware/authMiddleware');

router.get('/stats', auth, getDashboardStats);
router.get('/ai-insights', auth, getAIInsights);
router.get('/export', auth, exportPolicies);
router.get('/', auth, getPolicies);
router.get('/:id/timeline', auth, getPolicyTimeline);
router.get('/:id/risk-breakdown', auth, getRiskBreakdown);
router.get('/:id', auth, getPolicyById);
router.post(
  '/',
  auth,
  [
    check('policy_number', 'Policy number is required').notEmpty().trim(),
    check('customer_id', 'Customer ID is required').notEmpty().isInt(),
    check('type', 'Policy type is required').notEmpty(),
    check('premium_amount', 'Premium amount must be a number').optional().isFloat({ min: 0 })
  ],
  validate,
  createPolicy
);
router.put('/bulk-status', auth, bulkUpdateStatus);
router.put('/:id', auth, updatePolicy);
router.delete('/:id', auth, deletePolicy);

module.exports = router;
