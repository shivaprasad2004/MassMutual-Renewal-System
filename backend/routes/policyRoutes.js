const express = require('express');
const router = express.Router();
const { getPolicies, createPolicy, updatePolicy, deletePolicy, getDashboardStats } = require('../controllers/policyController');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, getPolicies);
router.post('/', auth, createPolicy);
router.put('/:id', auth, updatePolicy);
router.delete('/:id', auth, deletePolicy);
router.get('/stats', auth, getDashboardStats);

module.exports = router;
