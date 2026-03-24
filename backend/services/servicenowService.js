const dotenv = require('dotenv');
dotenv.config();

const SN_INSTANCE_URL = process.env.SN_INSTANCE_URL;
const SN_USERNAME = process.env.SN_USERNAME;
const SN_PASSWORD = process.env.SN_PASSWORD;
const SN_TABLE_NAME = process.env.SN_TABLE_NAME || 'u_policy_records';

/**
 * Service to handle data synchronization with ServiceNow via REST API
 */
class ServiceNowService {
  /**
   * Send data to ServiceNow Table API
   * @param {Object} data - The data object to send
   * @param {string} tableName - (Optional) Overrides default table name
   * @returns {Promise<Object>} - Response from ServiceNow
   */
  static async syncData(data, tableName = SN_TABLE_NAME) {
    if (!SN_INSTANCE_URL || !SN_USERNAME || !SN_PASSWORD) {
      console.warn('ServiceNow credentials missing. Skipping sync.');
      return null;
    }

    const auth = Buffer.from(`${SN_USERNAME}:${SN_PASSWORD}`).toString('base64');
    const url = `${SN_INSTANCE_URL}/api/now/table/${tableName}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`ServiceNow Sync Error (${response.status}):`, errorBody);
        throw new Error(`ServiceNow sync failed with status ${response.status}`);
      }

      const result = await response.json();
      console.log('Successfully synced data to ServiceNow:', result.result.sys_id);
      return result.result;
    } catch (error) {
      console.error('Error syncing data to ServiceNow:', error.message);
      // Depending on requirements, we might not want to throw and break the main flow
      // return null or rethrow
      throw error;
    }
  }

  /**
   * Update existing record in ServiceNow
   * @param {string} sysId - ServiceNow sys_id
   * @param {Object} data - Updated data
   * @param {string} tableName - (Optional) Table name
   */
  static async updateRecord(sysId, data, tableName = SN_TABLE_NAME) {
    if (!SN_INSTANCE_URL || !SN_USERNAME || !SN_PASSWORD) return null;

    const auth = Buffer.from(`${SN_USERNAME}:${SN_PASSWORD}`).toString('base64');
    const url = `${SN_INSTANCE_URL}/api/now/table/${tableName}/${sysId}`;

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`ServiceNow update failed with status ${response.status}`);
      }

      const result = await response.json();
      return result.result;
    } catch (error) {
      console.error('Error updating ServiceNow record:', error.message);
      throw error;
    }
  }

  /**
   * Fetch a user from ServiceNow by email and password
   * @param {string} email 
   * @param {string} password 
   */
  static async authenticateUser(email, password) {
    if (!SN_INSTANCE_URL || !SN_USERNAME || !SN_PASSWORD) return null;

    const auth = Buffer.from(`${SN_USERNAME}:${SN_PASSWORD}`).toString('base64');
    // We search for a record where email matches and password matches
    const query = `u_email=${email}^u_password=${password}`;
    const url = `${SN_INSTANCE_URL}/api/now/table/${SN_TABLE_NAME}?sysparm_query=${encodeURIComponent(query)}&sysparm_limit=1`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) return null;

      const result = await response.json();
      if (result.result && result.result.length > 0) {
        const snUser = result.result[0];
        return {
          id: snUser.u_local_id || snUser.sys_id,
          name: snUser.u_name,
          email: snUser.u_email,
          role: snUser.u_role || 'Agent'
        };
      }
      return null;
    } catch (error) {
      console.error('ServiceNow Auth Error:', error.message);
      return null;
    }
  }
}

module.exports = ServiceNowService;
