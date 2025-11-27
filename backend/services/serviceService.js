const { promisePool } = require('../config/database');

class ServiceService {
  // Get all service requests
  async getAllServiceRequests(page = 1, limit = 10, status = null) {
    const offset = (page - 1) * limit;
    
    try {
      let countQuery = 'SELECT COUNT(*) as total FROM Service_Request';
      let dataQuery = `
        SELECT sr.service_request_id, sr.requested_date, sr.service_type, sr.status, sr.created_at,
               c.customer_id, c.name as customer_name, c.phone as customer_phone,
               v.vehicle_id, v.registration_no, v.vin,
               vm.brand, vm.model_name, vm.year,
               e.name as employee_name
        FROM Service_Request sr
        INNER JOIN Customer c ON sr.customer_id = c.customer_id
        INNER JOIN Vehicle v ON sr.vehicle_id = v.vehicle_id
        INNER JOIN Vehicle_Model vm ON v.model_id = vm.model_id
        LEFT JOIN Employee e ON sr.employee_id = e.employee_id
      `;
      
      const params = [];
      
      if (status) {
        countQuery += ' WHERE status = ?';
        dataQuery += ' WHERE sr.status = ?';
        params.push(status);
      }
      
      dataQuery += ' ORDER BY sr.requested_date DESC LIMIT ? OFFSET ?';
      
      const [countResult] = await promisePool.query(countQuery, status ? [status] : []);
      const total = countResult[0].total;
      
      const [requests] = await promisePool.query(dataQuery, [...params, limit, offset]);
      
      return {
        serviceRequests: requests,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Failed to fetch service requests: ${error.message}`);
    }
  }

  // Get service request by ID
  async getServiceRequestById(id) {
    try {
      const [requests] = await promisePool.query(
        `SELECT sr.*,
                c.name as customer_name, c.phone as customer_phone, c.email as customer_email,
                v.registration_no, v.vin,
                vm.brand, vm.model_name, vm.year,
                e.name as employee_name
         FROM Service_Request sr
         INNER JOIN Customer c ON sr.customer_id = c.customer_id
         INNER JOIN Vehicle v ON sr.vehicle_id = v.vehicle_id
         INNER JOIN Vehicle_Model vm ON v.model_id = vm.model_id
         LEFT JOIN Employee e ON sr.employee_id = e.employee_id
         WHERE sr.service_request_id = ?`,
        [id]
      );
      
      if (requests.length === 0) {
        throw new Error('Service request not found');
      }
      
      // Get service record if exists
      const [records] = await promisePool.query(
        `SELECT sr.*, e.name as technician_name, t.specialization
         FROM Service_Record sr
         INNER JOIN Technician t ON sr.technician_id = t.technician_id
         INNER JOIN Employee e ON t.employee_id = e.employee_id
         WHERE sr.service_request_id = ?`,
        [id]
      );
      
      return {
        ...requests[0],
        service_record: records[0] || null
      };
    } catch (error) {
      throw error;
    }
  }

  // Create service request
  async createServiceRequest(data) {
    const {
      customer_id,
      vehicle_id,
      employee_id,
      requested_date,
      service_type,
      status,
      service_price,
      extra_charges,
      notes,
      parts_used
    } = data;

    const connection = await promisePool.getConnection();
    try {
      await connection.beginTransaction();

      const [result] = await connection.query(
        `INSERT INTO Service_Request (customer_id, vehicle_id, employee_id, requested_date, service_type, status, service_price, extra_charges, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          customer_id,
          vehicle_id,
          employee_id || null,
          requested_date,
          service_type,
          status || 'Pending',
          service_price || 0,
          extra_charges || 0,
          notes || null
        ]
      );

      if (Array.isArray(parts_used) && parts_used.length > 0) {
        for (const part of parts_used) {
          await connection.query(
            `INSERT INTO Service_Parts_Used (service_request_id, part_id, part_price, quantity)
             VALUES (?, ?, ?, ?)`,
            [
              result.insertId,
              part.part_id,
              part.part_price ?? part.price ?? 0,
              part.quantity || 1
            ]
          );
        }
      }

      await connection.commit();
      return await this.getServiceRequestById(result.insertId);
    } catch (error) {
      await connection.rollback();
      if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        throw new Error('Invalid customer, vehicle, employee, or part reference');
      }
      throw new Error(`Failed to create service request: ${error.message}`);
    } finally {
      connection.release();
    }
  }

  // Update service request
  async updateServiceRequest(id, data) {
    const {
      customer_id,
      vehicle_id,
      employee_id,
      requested_date,
      service_type,
      status,
      service_price,
      extra_charges,
      notes,
      parts_used
    } = data;

    const connection = await promisePool.getConnection();
    try {
      await connection.beginTransaction();

      const [result] = await connection.query(
        `UPDATE Service_Request 
         SET customer_id = ?, 
             vehicle_id = ?, 
             employee_id = ?, 
             requested_date = ?, 
             service_type = ?, 
             status = ?, 
             service_price = ?, 
             extra_charges = ?, 
             notes = ?
         WHERE service_request_id = ?`,
        [
          customer_id,
          vehicle_id,
          employee_id || null,
          requested_date,
          service_type,
          status || 'Pending',
          service_price || 0,
          extra_charges || 0,
          notes || null,
          id
        ]
      );
      
      if (result.affectedRows === 0) {
        throw new Error('Service request not found');
      }

      await connection.query(
        'DELETE FROM Service_Parts_Used WHERE service_request_id = ?',
        [id]
      );

      if (Array.isArray(parts_used) && parts_used.length > 0) {
        for (const part of parts_used) {
          await connection.query(
            `INSERT INTO Service_Parts_Used (service_request_id, part_id, part_price, quantity)
             VALUES (?, ?, ?, ?)`,
            [
              id,
              part.part_id,
              part.part_price ?? part.price ?? 0,
              part.quantity || 1
            ]
          );
        }
      }

      await connection.commit();
      return await this.getServiceRequestById(id);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Delete service request
  async deleteServiceRequest(id) {
    try {
      const [result] = await promisePool.query(
        'DELETE FROM Service_Request WHERE service_request_id = ?',
        [id]
      );
      
      if (result.affectedRows === 0) {
        throw new Error('Service request not found');
      }
      
      return { message: 'Service request deleted successfully' };
    } catch (error) {
      throw error;
    }
  }

  // Create service record
  async createServiceRecord(data) {
    const { service_request_id, technician_id, date_completed, notes, labor_hours } = data;
    
    try {
      const [result] = await promisePool.query(
        `INSERT INTO Service_Record (service_request_id, technician_id, date_completed, notes, labor_hours) 
         VALUES (?, ?, ?, ?, ?)`,
        [service_request_id, technician_id, date_completed, notes, labor_hours]
      );
      
      // Update service request status to Completed
      await promisePool.query(
        `UPDATE Service_Request SET status = 'Completed' WHERE service_request_id = ?`,
        [service_request_id]
      );
      
      const [records] = await promisePool.query(
        'SELECT * FROM Service_Record WHERE service_record_id = ?',
        [result.insertId]
      );
      
      return records[0];
    } catch (error) {
      throw new Error(`Failed to create service record: ${error.message}`);
    }
  }

  // Update service record
  async updateServiceRecord(id, data) {
    const { technician_id, date_completed, notes, labor_hours } = data;
    
    try {
      const [result] = await promisePool.query(
        `UPDATE Service_Record 
         SET technician_id = ?, date_completed = ?, notes = ?, labor_hours = ?
         WHERE service_record_id = ?`,
        [technician_id, date_completed, notes, labor_hours, id]
      );
      
      if (result.affectedRows === 0) {
        throw new Error('Service record not found');
      }
      
      const [records] = await promisePool.query(
        'SELECT * FROM Service_Record WHERE service_record_id = ?',
        [id]
      );
      
      return records[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new ServiceService();