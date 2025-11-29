const employeeService = require('../services/employeeService');

class EmployeeController {
  async getAll(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const result = await employeeService.getAllEmployees(page, limit);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const employee = await employeeService.getEmployeeById(req.params.id);
      res.json({ success: true, data: employee });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const employee = await employeeService.createEmployee(req.body);
      res.status(201).json({ success: true, data: employee });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const employee = await employeeService.updateEmployee(req.params.id, req.body);
      res.json({ success: true, data: employee });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const result = await employeeService.deleteEmployee(req.params.id);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getAllTechnicians(req, res, next) {
    try {
      const technicians = await employeeService.getAllTechnicians();
      res.json({ success: true, data: technicians });
    } catch (error) {
      next(error);
    }
  }

  async createTechnician(req, res, next) {
    try {
      const technician = await employeeService.createTechnician(req.body);
      res.status(201).json({ success: true, data: technician });
    } catch (error) {
      next(error);
    }
  }

  async updateTechnician(req, res, next) {
    try {
      const technician = await employeeService.updateTechnician(req.params.id, req.body);
      res.json({ success: true, data: technician });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new EmployeeController();