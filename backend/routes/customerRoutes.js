const express = require('express');
const router = express.Router();
const { getCustomers, createCustomer } = require('../controllers/customerController');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, getCustomers);
router.post('/', auth, createCustomer);

module.exports = router;
