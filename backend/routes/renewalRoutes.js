const express = require('express');
const router = express.Router();
const { getPipeline, updateStage, batchRemind, getCalendar } = require('../controllers/renewalController');
const auth = require('../middleware/authMiddleware');

router.get('/pipeline', auth, getPipeline);
router.get('/calendar', auth, getCalendar);
router.put('/:id/stage', auth, updateStage);
router.post('/batch-remind', auth, batchRemind);

module.exports = router;
