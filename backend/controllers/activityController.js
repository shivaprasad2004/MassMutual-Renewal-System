const ActivityService = require('../services/activityService');

exports.getActivity = async (req, res) => {
  try {
    const { limit = 50, action, userId } = req.query;
    const result = await ActivityService.getRecent({
      limit: parseInt(limit),
      action: action || null,
      userId: userId || null
    });
    res.json({ activities: result.rows, total: result.count });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getEntityActivity = async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    const activities = await ActivityService.getByEntity(entityType, entityId);
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
