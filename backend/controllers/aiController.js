const AIChatService = require('../services/aiChatService');

exports.chat = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }
    const result = await AIChatService.processQuery(message.trim());
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'AI processing error', error: error.message });
  }
};

exports.getSummary = async (req, res) => {
  try {
    const { entityType, id } = req.params;
    const result = await AIChatService.generateSummary(entityType, parseInt(id));
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Summary generation error', error: error.message });
  }
};
