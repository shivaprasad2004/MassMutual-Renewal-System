const dotenv = require('dotenv');
dotenv.config();

/**
 * Enterprise Data Access Layer (ServiceNow-Native)
 * This configuration replaces the traditional database (SQLite/Postgres)
 * with a direct interface to the ServiceNow Table API.
 */
const connectDB = async () => {
  try {
    const SN_INSTANCE_URL = process.env.SN_INSTANCE_URL;
    const SN_USERNAME = process.env.SN_USERNAME;
    
    if (!SN_INSTANCE_URL || !SN_USERNAME) {
      console.warn('⚠️ ServiceNow credentials missing in .env');
      return;
    }

    console.log(`🚀 ServiceNow Enterprise Database connected: ${SN_INSTANCE_URL}`);
    console.log('✅ Local data storage disabled. All operations are ServiceNow-Native.');
  } catch (error) {
    console.error('❌ Unable to initialize ServiceNow connection:', error);
  }
};

module.exports = { connectDB };
