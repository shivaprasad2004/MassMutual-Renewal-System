const express = require('express');
const router = express.Router();
const { getCustomers, createCustomer, getCustomerById, getCustomerTimeline, updateCustomer } = require('../controllers/customerController');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, getCustomers);
router.post('/', auth, createCustomer);
router.get('/:id/timeline', auth, getCustomerTimeline);
router.get('/:id', auth, getCustomerById);
router.put('/:id', auth, updateCustomer);

module.exports = router;
