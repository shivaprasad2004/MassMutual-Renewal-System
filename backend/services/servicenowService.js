const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../.env') });

const SN_AUTH_TABLE = process.env.SN_TABLE_NAME || 'u_massmutualsystemauth';

/**
 * Enterprise ServiceNow Data Access Object (DAO)
 * This service treats ServiceNow as the primary database for the application.
 */
class ServiceNowService {
  
  static getHeaders() {
    const username = process.env.SN_USERNAME;
    const password = process.env.SN_PASSWORD;
    const auth = Buffer.from(`${username}:${password}`).toString('base64');
    return {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  /**
   * CREATE: Insert a new record into a table
   */
  static async create(tableName, data) {
    const url = `${process.env.SN_INSTANCE_URL}/api/now/table/${tableName}`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error?.message || 'SN Create Failed');
      return result.result;
    } catch (error) {
      console.error(`SN [${tableName}] CREATE Error:`, error.message);
      throw error;
    }
  }

  /**
   * READ (List): Fetch multiple records with optional query
   */
  static async find(tableName, query = '', limit = 100) {
    const url = `${process.env.SN_INSTANCE_URL}/api/now/table/${tableName}?sysparm_query=${encodeURIComponent(query)}&sysparm_limit=${limit}`;
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error?.message || 'SN Find Failed');
      return result.result;
    } catch (error) {
      console.error(`SN [${tableName}] FIND Error:`, error.message);
      throw error;
    }
  }

  /**
   * READ (Single): Fetch a specific record by sys_id
   */
  static async findById(tableName, sysId) {
    const url = `${process.env.SN_INSTANCE_URL}/api/now/table/${tableName}/${sysId}`;
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error?.message || 'SN FindById Failed');
      return result.result;
    } catch (error) {
      console.error(`SN [${tableName}] FINDBYID Error:`, error.message);
      throw error;
    }
  }

  /**
   * UPDATE: Modify an existing record
   */
  static async update(tableName, sysId, data) {
    const url = `${process.env.SN_INSTANCE_URL}/api/now/table/${tableName}/${sysId}`;
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error?.message || 'SN Update Failed');
      return result.result;
    } catch (error) {
      console.error(`SN [${tableName}] UPDATE Error:`, error.message);
      throw error;
    }
  }

  /**
   * DELETE: Remove a record from ServiceNow
   */
  static async delete(tableName, sysId) {
    const url = `${process.env.SN_INSTANCE_URL}/api/now/table/${tableName}/${sysId}`;
    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: this.getHeaders()
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error?.message || 'SN Delete Failed');
      }
      return true;
    } catch (error) {
      console.error(`SN [${tableName}] DELETE Error:`, error.message);
      throw error;
    }
  }

  /**
   * AUTH: Specialized method for user authentication
   */
  static async authenticateUser(email, password) {
    const query = `u_email=${email}^u_password=${password}`;
    const results = await this.find(SN_AUTH_TABLE, query, 1);
    
    if (results && results.length > 0) {
      const user = results[0];
      return {
        id: user.sys_id,
        name: user.u_name,
        email: user.u_email,
        role: user.u_role || 'Agent'
      };
    }
    return null;
  }
}

module.exports = ServiceNowService;
