const { promisePool } = require('../config/database');

class VehicleService {
  // Get all vehicles with pagination
  async getAllVehicles(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    try {
      const [countResult] = await promisePool.query(
        'SELECT COUNT(*) as total FROM Vehicle'
      );
      const total = countResult[0].total;
      
      const [vehicles] = await promisePool.query(
        `SELECT v.vehicle_id, v.registration_no, v.vin, v.created_at,
                c.customer_id, c.name as customer_name, c.phone as customer_phone,
                vm.model_id, vm.brand, vm.model_name, vm.year
         FROM Vehicle v
         INNER JOIN Customer c ON v.customer_id = c.customer_id
         INNER JOIN Vehicle_Model vm ON v.model_id = vm.model_id
         ORDER BY v.created_at DESC
         LIMIT ? OFFSET ?`,
        [limit, offset]
      );
      
      return {
        vehicles,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Failed to fetch vehicles: ${error.message}`);
    }
  }

  // Get vehicle by ID
  async getVehicleById(id) {
    try {
      const [vehicles] = await promisePool.query(
        `SELECT v.*, 
                c.name as customer_name, c.phone as customer_phone, c.email as customer_email,
                vm.brand, vm.model_name, vm.year
         FROM Vehicle v
         INNER JOIN Customer c ON v.customer_id = c.customer_id
         INNER JOIN Vehicle_Model vm ON v.model_id = vm.model_id
         WHERE v.vehicle_id = ?`,
        [id]
      );
      
      if (vehicles.length === 0) {
        throw new Error('Vehicle not found');
      }
      
      return vehicles[0];
    } catch (error) {
      throw error;
    }
  }

  // Create new vehicle
  async createVehicle(data) {
    const { customer_id, model_id, registration_no, vin } = data;
    
    try {
      const [result] = await promisePool.query(
        `INSERT INTO Vehicle (customer_id, model_id, registration_no, vin) 
         VALUES (?, ?, ?, ?)`,
        [customer_id, model_id, registration_no, vin]
      );
      
      return await this.getVehicleById(result.insertId);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Registration number or VIN already exists');
      }
      if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        throw new Error('Invalid customer or model reference');
      }
      throw new Error(`Failed to create vehicle: ${error.message}`);
    }
  }

  // Update vehicle
  async updateVehicle(id, data) {
    const { customer_id, model_id, registration_no, vin } = data;
    
    try {
      const [result] = await promisePool.query(
        `UPDATE Vehicle 
         SET customer_id = ?, model_id = ?, registration_no = ?, vin = ?
         WHERE vehicle_id = ?`,
        [customer_id, model_id, registration_no, vin, id]
      );
      
      if (result.affectedRows === 0) {
        throw new Error('Vehicle not found');
      }
      
      return await this.getVehicleById(id);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Registration number or VIN already exists');
      }
      throw error;
    }
  }

  // Delete vehicle
  async deleteVehicle(id) {
    try {
      const [result] = await promisePool.query(
        'DELETE FROM Vehicle WHERE vehicle_id = ?',
        [id]
      );
      
      if (result.affectedRows === 0) {
        throw new Error('Vehicle not found');
      }
      
      return { message: 'Vehicle deleted successfully' };
    } catch (error) {
      throw error;
    }
  }

  // Get all vehicle models
  async getAllModels() {
    try {
      const [models] = await promisePool.query(
        `SELECT model_id, brand, model_name, year, created_at
         FROM Vehicle_Model
         ORDER BY brand ASC, model_name ASC, year DESC`
      );
      
      return models;
    } catch (error) {
      throw new Error(`Failed to fetch models: ${error.message}`);
    }
  }

  // Create vehicle model
  async createModel(data) {
    const { brand, model_name, year } = data;
    
    try {
      const [result] = await promisePool.query(
        `INSERT INTO Vehicle_Model (brand, model_name, year) 
         VALUES (?, ?, ?)`,
        [brand, model_name, year]
      );
      
      const [models] = await promisePool.query(
        'SELECT * FROM Vehicle_Model WHERE model_id = ?',
        [result.insertId]
      );
      
      return models[0];
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('This model already exists');
      }
      throw new Error(`Failed to create model: ${error.message}`);
    }
  }
}

module.exports = new VehicleService();