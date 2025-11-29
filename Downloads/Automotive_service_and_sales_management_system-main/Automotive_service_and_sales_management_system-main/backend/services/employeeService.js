const { promisePool } = require('../config/database');

class EmployeeService {
  // Get all employees
  async getAllEmployees(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    try {
      const [countResult] = await promisePool.query(
        'SELECT COUNT(*) as total FROM Employee'
      );
      const total = countResult[0].total;
      
      const [employees] = await promisePool.query(
        `SELECT e.*, t.technician_id, t.specialization, t.certification_level
         FROM Employee e
         LEFT JOIN Technician t ON e.employee_id = t.employee_id
         ORDER BY e.created_at DESC
         LIMIT ? OFFSET ?`,
        [limit, offset]
      );
      
      return {
        employees,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Failed to fetch employees: ${error.message}`);
    }
  }

  // Get employee by ID
  async getEmployeeById(id) {
    try {
      const [employees] = await promisePool.query(
        `SELECT e.*, t.technician_id, t.specialization, t.certification_level
         FROM Employee e
         LEFT JOIN Technician t ON e.employee_id = t.employee_id
         WHERE e.employee_id = ?`,
        [id]
      );
      
      if (employees.length === 0) {
        throw new Error('Employee not found');
      }
      
      return employees[0];
    } catch (error) {
      throw error;
    }
  }

  // Create employee
  async createEmployee(data) {
    const { name, role, phone, email, hire_date } = data;
    
    try {
      const [result] = await promisePool.query(
        `INSERT INTO Employee (name, role, phone, email, hire_date) 
         VALUES (?, ?, ?, ?, ?)`,
        [name, role, phone, email, hire_date]
      );
      
      return await this.getEmployeeById(result.insertId);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Email already exists');
      }
      throw new Error(`Failed to create employee: ${error.message}`);
    }
  }

  // Update employee
  async updateEmployee(id, data) {
    const { name, role, phone, email, hire_date } = data;
    
    try {
      const [result] = await promisePool.query(
        `UPDATE Employee 
         SET name = ?, role = ?, phone = ?, email = ?, hire_date = ?
         WHERE employee_id = ?`,
        [name, role, phone, email, hire_date, id]
      );
      
      if (result.affectedRows === 0) {
        throw new Error('Employee not found');
      }
      
      return await this.getEmployeeById(id);
    } catch (error) {
      throw error;
    }
  }

  // Delete employee
  async deleteEmployee(id) {
    try {
      const [result] = await promisePool.query(
        'DELETE FROM Employee WHERE employee_id = ?',
        [id]
      );
      
      if (result.affectedRows === 0) {
        throw new Error('Employee not found');
      }
      
      return { message: 'Employee deleted successfully' };
    } catch (error) {
      throw error;
    }
  }

  // Get all technicians
  async getAllTechnicians() {
    try {
      const [technicians] = await promisePool.query(
        `SELECT t.*, e.name, e.phone, e.email
         FROM Technician t
         INNER JOIN Employee e ON t.employee_id = e.employee_id
         ORDER BY e.name ASC`
      );
      
      return technicians;
    } catch (error) {
      throw new Error(`Failed to fetch technicians: ${error.message}`);
    }
  }

  // Create technician
  async createTechnician(data) {
    const { employee_id, specialization, certification_level } = data;
    
    try {
      const [result] = await promisePool.query(
        `INSERT INTO Technician (employee_id, specialization, certification_level) 
         VALUES (?, ?, ?)`,
        [employee_id, specialization, certification_level || 'Junior']
      );
      
      const [technicians] = await promisePool.query(
        `SELECT t.*, e.name, e.phone
         FROM Technician t
         INNER JOIN Employee e ON t.employee_id = e.employee_id
         WHERE t.technician_id = ?`,
        [result.insertId]
      );
      
      return technicians[0];
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Employee is already a technician');
      }
      throw new Error(`Failed to create technician: ${error.message}`);
    }
  }

  // Update technician
  async updateTechnician(id, data) {
    const { specialization, certification_level } = data;
    
    try {
      const [result] = await promisePool.query(
        `UPDATE Technician 
         SET specialization = ?, certification_level = ?
         WHERE technician_id = ?`,
        [specialization, certification_level, id]
      );
      
      if (result.affectedRows === 0) {
        throw new Error('Technician not found');
      }
      
      const [technicians] = await promisePool.query(
        `SELECT t.*, e.name
         FROM Technician t
         INNER JOIN Employee e ON t.employee_id = e.employee_id
         WHERE t.technician_id = ?`,
        [id]
      );
      
      return technicians[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new EmployeeService();