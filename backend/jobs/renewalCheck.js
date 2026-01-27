const cron = require('node-cron');
const { Policy, Renewal, Notification, User } = require('../models');
const { Op } = require('sequelize');

const checkRenewals = async () => {
  console.log('Running Renewal Check Job...');
  try {
    const today = new Date();
    const alertDays = [30, 60, 90];

    for (const days of alertDays) {
      const targetDate = new Date();
      targetDate.setDate(today.getDate() + days);
      
      const targetDateStr = targetDate.toISOString().split('T')[0];

      const policies = await Policy.findAll({
        where: {
          renewal_date: targetDateStr,
          status: 'Active'
        },
        include: [{ model: User, as: 'Agent' }]
      });

      for (const policy of policies) {
        const message = `Policy #${policy.policy_number} is due for renewal in ${days} days.`;
        
        // Create Notification
        if (policy.agent_id) {
          await Notification.create({
            user_id: policy.agent_id,
            policy_id: policy.id,
            message: message,
            is_read: false
          });
          console.log(`Notification created for Agent ${policy.agent_id}: ${message}`);
        }
        
        // Logic to send Email/SMS would go here
      }
    }
  } catch (error) {
    console.error('Error in Renewal Check Job:', error);
  }
};

// Schedule job to run every day at midnight
const initCron = () => {
  cron.schedule('0 0 * * *', checkRenewals);
  console.log('Renewal Check Job Scheduled');
};

module.exports = initCron;
