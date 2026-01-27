const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const { check } = require('express-validator');

// Validation middleware could be added here
router.post('/register', register);
router.post('/login', login);

module.exports = router;
