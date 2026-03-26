const express = require('express');
const router = express.Router();
const { chat, getSummary } = require('../controllers/aiController');
const auth = require('../middleware/authMiddleware');

router.post('/chat', auth, chat);
router.get('/summary/:entityType/:id', auth, getSummary);

module.exports = router;
