const cron = require('node-cron');
const ServiceNowService = require('../services/servicenowService');
const NotificationService = require('../services/notificationService');

const POLICY_TABLE = 'u_policy_records';

/**
 * Enterprise Renewal Check Job (ServiceNow-Native)
 * Scans ServiceNow records for upcoming renewals and sends notifications
 */
const checkRenewals = async () => {
  console.log('🚀 Running Enterprise Renewal Check Job...');
  try {
    const today = new Date();
    const alertDays = [30, 60, 90];

    for (const days of alertDays) {
      const targetDate = new Date();
      targetDate.setDate(today.getDate() + days);
      const targetDateStr = targetDate.toISOString().split('T')[0];

      // Query ServiceNow for active policies with this renewal date
      const query = `u_renewal_date=${targetDateStr}^u_status=Active`;
      const policies = await ServiceNowService.find(POLICY_TABLE, query, 500);

      for (const policy of policies) {
        const message = `Policy #${policy.u_policy_number} is due for renewal in ${days} days.`;
        
        // Broadcast notification via ServiceNow-Native Notification Service
        await NotificationService.broadcastToAll({
          type: 'renewal_alert',
          title: `Renewal Alert (${days} Days)`,
          message: message,
          priority: days <= 30 ? 'high' : 'medium',
          metadata: { 
            policy_id: policy.sys_id,
            policy_number: policy.u_policy_number,
            days_remaining: days
          }
        });
        
        console.log(`✅ Renewal notification sent for Policy ${policy.u_policy_number}`);
      }
    }
  } catch (error) {
    console.error('❌ Error in Enterprise Renewal Check Job:', error.message);
  }
};

// Schedule job to run every day at midnight
const initCron = () => {
  // Run once on startup for development verification
  if (process.env.NODE_ENV !== 'production') {
    setTimeout(checkRenewals, 5000);
  }

  cron.schedule('0 0 * * *', checkRenewals);
  console.log('🕒 Enterprise Renewal Check Job Scheduled');
};

module.exports = initCron;
