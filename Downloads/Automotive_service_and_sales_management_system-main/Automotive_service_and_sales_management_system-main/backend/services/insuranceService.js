const { promisePool } = require('../config/database');

class InsuranceService {
  // Get all insurance records
  async getAllInsurance() {
    try {
      const [insurance] = await promisePool.query(
        `SELECT i.*, 
                v.registration_no, v.vin,
                vm.brand, vm.model_name, vm.year,
                c.name as customer_name
         FROM Insurance i
         INNER JOIN Vehicle v ON i.vehicle_id = v.vehicle_id
         INNER JOIN Vehicle_Model vm ON v.model_id = vm.model_id
         INNER JOIN Customer c ON v.customer_id = c.customer_id
         ORDER BY i.expiry_date ASC`
      );
      
      return insurance;
    } catch (error) {
      throw new Error(`Failed to fetch insurance: ${error.message}`);
    }
  }

  // Create insurance
  async createInsurance(data) {
    const { vehicle_id, provider, policy_number, expiry_date, coverage_amount } = data;
    
    try {
      const [result] = await promisePool.query(
        `INSERT INTO Insurance (vehicle_id, provider, policy_number, expiry_date, coverage_amount) 
         VALUES (?, ?, ?, ?, ?)`,
        [vehicle_id, provider, policy_number, expiry_date, coverage_amount]
      );
      
      const [insurance] = await promisePool.query(
        'SELECT * FROM Insurance WHERE insurance_id = ?',
        [result.insertId]
      );
      
      return insurance[0];
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Policy number already exists');
      }
      throw new Error(`Failed to create insurance: ${error.message}`);
    }
  }

  // Update insurance
  async updateInsurance(id, data) {
    const { provider, policy_number, expiry_date, coverage_amount } = data;
    
    try {
      const [result] = await promisePool.query(
        `UPDATE Insurance 
         SET provider = ?, policy_number = ?, expiry_date = ?, coverage_amount = ?
         WHERE insurance_id = ?`,
        [provider, policy_number, expiry_date, coverage_amount, id]
      );
      
      if (result.affectedRows === 0) {
        throw new Error('Insurance not found');
      }
      
      const [insurance] = await promisePool.query(
        'SELECT * FROM Insurance WHERE insurance_id = ?',
        [id]
      );
      
      return insurance[0];
    } catch (error) {
      throw error;
    }
  }

  // Delete insurance
  async deleteInsurance(id) {
    try {
      const [result] = await promisePool.query(
        'DELETE FROM Insurance WHERE insurance_id = ?',
        [id]
      );
      
      if (result.affectedRows === 0) {
        throw new Error('Insurance not found');
      }
      
      return { message: 'Insurance deleted successfully' };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new InsuranceService();