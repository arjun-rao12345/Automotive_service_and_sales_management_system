const { promisePool } = require('../config/database');

class ServiceService {
  // Helper: Create history entry
  async createHistoryEntry(serviceId, customerId, vehicleId, action, previousStatus = null, newStatus = null) {
    try {
      await promisePool.query(
        `INSERT INTO Service_History 
        (service_id, customer_id, vehicle_id, action, previous_status, new_status, timestamp)
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [serviceId, customerId, vehicleId, action, previousStatus, newStatus]
      );
    } catch (error) {
      // Log error but don't fail the main operation
      console.error('Failed to create history entry:', error.message);
    }
  }

  // Helper: Get service request in LIST format (same columns as getAllServiceRequests)
  async getServiceRequestListItemById(id) {
    const [rows] = await promisePool.query(
      `
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
      WHERE sr.service_request_id = ?
      `,
      [id]
    );

    return rows.length > 0 ? rows[0] : null;
  }

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

  // Get service request by ID (detailed version)
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
      description,
      issues,
      parts_used
    } = data;

    // Validation
    if (!customer_id) {
      throw new Error('Customer ID is required');
    }
    if (!vehicle_id) {
      throw new Error('Vehicle ID is required');
    }
    if (!requested_date) {
      throw new Error('Requested date is required');
    }
    if (!service_type) {
      throw new Error('Service type is required');
    }

    const connection = await promisePool.getConnection();
    try {
      await connection.beginTransaction();

      // Use description or issues or notes (in that order)
      const descriptionText = description || issues || notes || null;

      const [result] = await connection.query(
        `INSERT INTO Service_Request 
        (customer_id, vehicle_id, employee_id, requested_date, service_type, status, service_price, extra_charges, notes)
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
          descriptionText
        ]
      );

      const newId = result.insertId;

      if (Array.isArray(parts_used) && parts_used.length > 0) {
        for (const part of parts_used) {
          await connection.query(
            `INSERT INTO Service_Parts_Used (service_request_id, part_id, part_price, quantity)
             VALUES (?, ?, ?, ?)`,
            [
              newId,
              part.part_id,
              part.part_price ?? part.price ?? 0,
              part.quantity || 1
            ]
          );
        }
      }

      await connection.commit();

      // Create history entry for service creation (non-blocking)
      this.createHistoryEntry(
        newId,
        customer_id,
        vehicle_id,
        'Created',
        null,
        status || 'Pending'
      ).catch(err => console.error('History creation failed (non-critical):', err));

      // FIX: return list-format data so it appears in the service requests page
      return await this.getServiceRequestListItemById(newId);

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
      description,
      issues,
      parts_used
    } = data;

    // Validation
    if (!customer_id) {
      throw new Error('Customer ID is required');
    }
    if (!vehicle_id) {
      throw new Error('Vehicle ID is required');
    }
    if (!requested_date) {
      throw new Error('Requested date is required');
    }
    if (!service_type) {
      throw new Error('Service type is required');
    }

    const connection = await promisePool.getConnection();
    try {
      await connection.beginTransaction();

      // Get current status before update
      const [currentService] = await connection.query(
        'SELECT status, customer_id, vehicle_id FROM Service_Request WHERE service_request_id = ?',
        [id]
      );

      if (currentService.length === 0) {
        throw new Error('Service request not found');
      }

      const oldStatus = currentService[0].status;
      const newStatusValue = status || 'Pending';
      const customerId = customer_id || currentService[0].customer_id;
      const vehicleId = vehicle_id || currentService[0].vehicle_id;

      // Use description or issues or notes (in that order)
      const descriptionText = description || issues || notes || null;

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
             notes = ?,
             updated_at = NOW()
         WHERE service_request_id = ?`,
        [
          customer_id,
          vehicle_id,
          employee_id || null,
          requested_date,
          service_type,
          newStatusValue,
          service_price || 0,
          extra_charges || 0,
          descriptionText,
          id
        ]
      );
      
      if (result.affectedRows === 0) {
        throw new Error('Service request not found');
      }

      // Create history entry for update (non-blocking)
      if (oldStatus !== newStatusValue) {
        this.createHistoryEntry(
          id,
          customerId,
          vehicleId,
          'StatusChanged',
          oldStatus,
          newStatusValue
        ).catch(err => console.error('History creation failed (non-critical):', err));
      } else {
        this.createHistoryEntry(
          id,
          customerId,
          vehicleId,
          'Updated',
          null,
          null
        ).catch(err => console.error('History creation failed (non-critical):', err));
      }

      await connection.query(
        'DELETE FROM Service_Parts_Used WHERE service_request_id = ?',
        [id]
      );

      if (Array.isArray(parts_used) && parts_used.length > 0) {
        for (const part of parts_used) {
          await connection.query(
            `INSERT INTO Service_Parts_Used 
            (service_request_id, part_id, part_price, quantity)
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

      return await this.getServiceRequestListItemById(id);

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Delete service request
  async deleteServiceRequest(id) {
    const connection = await promisePool.getConnection();
    try {
      await connection.beginTransaction();

      // Get service info before deletion for history
      const [service] = await connection.query(
        'SELECT customer_id, vehicle_id, status FROM Service_Request WHERE service_request_id = ?',
        [id]
      );

      if (service.length === 0) {
        throw new Error('Service request not found');
      }

      // Create history entry for closure/deletion (non-blocking)
      this.createHistoryEntry(
        id,
        service[0].customer_id,
        service[0].vehicle_id,
        'Closed',
        service[0].status,
        null
      ).catch(err => console.error('History creation failed (non-critical):', err));

      const [result] = await connection.query(
        'DELETE FROM Service_Request WHERE service_request_id = ?',
        [id]
      );
      
      if (result.affectedRows === 0) {
        throw new Error('Service request not found');
      }

      await connection.commit();
      
      return { message: 'Service request deleted successfully' };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Create service record
  async createServiceRecord(data) {
    const { service_request_id, technician_id, date_completed, notes, labor_hours } = data;
    
    const connection = await promisePool.getConnection();
    try {
      await connection.beginTransaction();

      // Get current status and service info
      const [currentService] = await connection.query(
        'SELECT status, customer_id, vehicle_id FROM Service_Request WHERE service_request_id = ?',
        [service_request_id]
      );

      if (currentService.length === 0) {
        throw new Error('Service request not found');
      }

      const oldStatus = currentService[0].status;
      const customerId = currentService[0].customer_id;
      const vehicleId = currentService[0].vehicle_id;

      const [result] = await connection.query(
        `INSERT INTO Service_Record 
        (service_request_id, technician_id, date_completed, notes, labor_hours) 
         VALUES (?, ?, ?, ?, ?)`,
        [service_request_id, technician_id, date_completed, notes, labor_hours]
      );
      
      await connection.query(
        `UPDATE Service_Request SET status = 'Completed' WHERE service_request_id = ?`,
        [service_request_id]
      );

      // Create history entry for service completion (non-blocking)
      if (oldStatus !== 'Completed') {
        this.createHistoryEntry(
          service_request_id,
          customerId,
          vehicleId,
          'StatusChanged',
          oldStatus,
          'Completed'
        ).catch(err => console.error('History creation failed (non-critical):', err));
      }

      await connection.commit();
      
      const [records] = await promisePool.query(
        'SELECT * FROM Service_Record WHERE service_record_id = ?',
        [result.insertId]
      );
      
      return records[0];
    } catch (error) {
      await connection.rollback();
      throw new Error(`Failed to create service record: ${error.message}`);
    } finally {
      connection.release();
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
