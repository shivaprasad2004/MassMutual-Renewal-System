const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { register, login, me, refresh } = require('../controllers/authController');
const { authLimiter } = require('../middleware/rateLimiter');
const validate = require('../middleware/validate');
const auth = require('../middleware/authMiddleware');

// Register with validation + rate limiting
router.post(
  '/register',
  authLimiter,
  [
    check('name', 'Name is required').notEmpty().trim(),
    check('email', 'Please include a valid email').isEmail().normalizeEmail(),
    check('password', 'Password must be at least 6 characters').isLength({ min: 6 })
  ],
  validate,
  register
);

// Login with validation + rate limiting
router.post(
  '/login',
  authLimiter,
  [
    check('email', 'Please include a valid email').isEmail().normalizeEmail(),
    check('password', 'Password is required').notEmpty()
  ],
  validate,
  login
);

// Get current user profile (requires auth)
router.get('/me', auth, me);

// Refresh token
router.post('/refresh', refresh);

module.exports = router;
