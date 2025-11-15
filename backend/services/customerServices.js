const { promisePool } = require('../config/database');

class CustomerService {
  // Get all customers with pagination
  async getAllCustomers(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    try {
      // Get total count
      const [countResult] = await promisePool.query(
        'SELECT COUNT(*) as total FROM Customer'
      );
      const total = countResult[0].total;
      
      // Get paginated customers
      const [customers] = await promisePool.query(
        `SELECT customer_id, name, phone, email, address, created_at, updated_at 
         FROM Customer 
         ORDER BY created_at DESC 
         LIMIT ? OFFSET ?`,
        [limit, offset]
      );
      
      return {
        customers,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Failed to fetch customers: ${error.message}`);
    }
  }

  // Get customer by ID with vehicles
  async getCustomerById(id) {
    try {
      const [customers] = await promisePool.query(
        `SELECT customer_id, name, phone, email, address, created_at, updated_at 
         FROM Customer 
         WHERE customer_id = ?`,
        [id]
      );
      
      if (customers.length === 0) {
        throw new Error('Customer not found');
      }
      
      // Get customer's vehicles
      const [vehicles] = await promisePool.query(
        `SELECT v.*, vm.brand, vm.model_name, vm.year 
         FROM Vehicle v
         LEFT JOIN Vehicle_Model vm ON v.model_id = vm.model_id
         WHERE v.customer_id = ?`,
        [id]
      );
      
      return {
        ...customers[0],
        vehicles
      };
    } catch (error) {
      throw error;
    }
  }

  // Create new customer
  async createCustomer(data) {
    const { name, phone, email, address } = data;
    
    try {
      const [result] = await promisePool.query(
        `INSERT INTO Customer (name, phone, email, address) 
         VALUES (?, ?, ?, ?)`,
        [name, phone, email, address]
      );
      
      return await this.getCustomerById(result.insertId);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Email already exists');
      }
      throw new Error(`Failed to create customer: ${error.message}`);
    }
  }

  // Update customer
  async updateCustomer(id, data) {
    const { name, phone, email, address } = data;
    
    try {
      const [result] = await promisePool.query(
        `UPDATE Customer 
         SET name = ?, phone = ?, email = ?, address = ? 
         WHERE customer_id = ?`,
        [name, phone, email, address, id]
      );
      
      if (result.affectedRows === 0) {
        throw new Error('Customer not found');
      }
      
      return await this.getCustomerById(id);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Email already exists');
      }
      throw error;
    }
  }

  // Delete customer
  async deleteCustomer(id) {
    try {
      const [result] = await promisePool.query(
        'DELETE FROM Customer WHERE customer_id = ?',
        [id]
      );
      
      if (result.affectedRows === 0) {
        throw new Error('Customer not found');
      }
      
      return { message: 'Customer deleted successfully' };
    } catch (error) {
      throw error;
    }
  }

  // Search customers
  async searchCustomers(query) {
    try {
      const searchTerm = `%${query}%`;
      const [customers] = await promisePool.query(
        `SELECT customer_id, name, phone, email, address 
         FROM Customer 
         WHERE name LIKE ? OR email LIKE ? OR phone LIKE ?
         LIMIT 20`,
        [searchTerm, searchTerm, searchTerm]
      );
      
      return customers;
    } catch (error) {
      throw new Error(`Search failed: ${error.message}`);
    }
  }
}

module.exports = new CustomerService();