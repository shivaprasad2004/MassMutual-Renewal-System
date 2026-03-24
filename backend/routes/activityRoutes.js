const express = require('express');
const router = express.Router();
const { getActivity, getEntityActivity } = require('../controllers/activityController');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, getActivity);
router.get('/:entityType/:entityId', auth, getEntityActivity);

module.exports = router;
