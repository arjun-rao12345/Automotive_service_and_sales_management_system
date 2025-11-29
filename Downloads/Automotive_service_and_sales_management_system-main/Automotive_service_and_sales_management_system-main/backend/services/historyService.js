const { promisePool } = require('../config/database');

class HistoryService {
  // Create history entry
  async createHistoryEntry(data) {
    const {
      serviceId,
      customerId,
      vehicleId,
      action,
      previousStatus,
      newStatus
    } = data;

    try {
      const [result] = await promisePool.query(
        `INSERT INTO Service_History 
        (service_id, customer_id, vehicle_id, action, previous_status, new_status, timestamp)
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [
          serviceId,
          customerId,
          vehicleId,
          action,
          previousStatus || null,
          newStatus || null
        ]
      );

      const [history] = await promisePool.query(
        `SELECT sh.*,
                c.name as customer_name,
                v.registration_no,
                sr.service_type
         FROM Service_History sh
         INNER JOIN Customer c ON sh.customer_id = c.customer_id
         INNER JOIN Vehicle v ON sh.vehicle_id = v.vehicle_id
         INNER JOIN Service_Request sr ON sh.service_id = sr.service_request_id
         WHERE sh.history_id = ?`,
        [result.insertId]
      );

      return history[0];
    } catch (error) {
      throw new Error(`Failed to create history entry: ${error.message}`);
    }
  }

  // Get all history entries
  async getAllHistory(page = 1, limit = 50) {
    const offset = (page - 1) * limit;

    try {
      // Check if table exists, if not return empty result
      try {
        await promisePool.query('SELECT 1 FROM Service_History LIMIT 1');
      } catch (tableError) {
        // Table doesn't exist, return empty result
        return {
          history: [],
          pagination: {
            total: 0,
            page,
            limit,
            totalPages: 0
          }
        };
      }

      const [countResult] = await promisePool.query(
        'SELECT COUNT(*) as total FROM Service_History'
      );
      const total = countResult[0].total;

      const [history] = await promisePool.query(
        `SELECT sh.*,
                c.name as customer_name,
                c.phone as customer_phone,
                v.registration_no,
                vm.brand, vm.model_name, vm.year,
                sr.service_type, sr.status as current_status
         FROM Service_History sh
         INNER JOIN Customer c ON sh.customer_id = c.customer_id
         INNER JOIN Vehicle v ON sh.vehicle_id = v.vehicle_id
         INNER JOIN Vehicle_Model vm ON v.model_id = vm.model_id
         INNER JOIN Service_Request sr ON sh.service_id = sr.service_request_id
         ORDER BY sh.timestamp DESC
         LIMIT ? OFFSET ?`,
        [limit, offset]
      );

      return {
        history,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      // If error, return empty result instead of throwing
      console.error('Error fetching history:', error.message);
      return {
        history: [],
        pagination: {
          total: 0,
          page,
          limit,
          totalPages: 0
        }
      };
    }
  }

  // Get history by service ID
  async getHistoryByServiceId(serviceId) {
    try {
      const [history] = await promisePool.query(
        `SELECT sh.*,
                c.name as customer_name,
                v.registration_no,
                sr.service_type
         FROM Service_History sh
         INNER JOIN Customer c ON sh.customer_id = c.customer_id
         INNER JOIN Vehicle v ON sh.vehicle_id = v.vehicle_id
         INNER JOIN Service_Request sr ON sh.service_id = sr.service_request_id
         WHERE sh.service_id = ?
         ORDER BY sh.timestamp DESC`,
        [serviceId]
      );

      return history;
    } catch (error) {
      throw new Error(`Failed to fetch history for service: ${error.message}`);
    }
  }

  // Get history by customer ID
  async getHistoryByCustomerId(customerId) {
    try {
      const [history] = await promisePool.query(
        `SELECT sh.*,
                c.name as customer_name,
                v.registration_no,
                sr.service_type, sr.status as current_status
         FROM Service_History sh
         INNER JOIN Customer c ON sh.customer_id = c.customer_id
         INNER JOIN Vehicle v ON sh.vehicle_id = v.vehicle_id
         INNER JOIN Service_Request sr ON sh.service_id = sr.service_request_id
         WHERE sh.customer_id = ?
         ORDER BY sh.timestamp DESC`,
        [customerId]
      );

      return history;
    } catch (error) {
      throw new Error(`Failed to fetch history for customer: ${error.message}`);
    }
  }
}

module.exports = new HistoryService();

