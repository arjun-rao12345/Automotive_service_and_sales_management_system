const serviceService = require('../services/serviceService');

class ServiceController {
  async getAll(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const status = req.query.status || null;
      const result = await serviceService.getAllServiceRequests(page, limit, status);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const request = await serviceService.getServiceRequestById(req.params.id);
      res.json({ success: true, data: request });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const request = await serviceService.createServiceRequest(req.body);
      res.status(201).json({ success: true, data: request });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const request = await serviceService.updateServiceRequest(req.params.id, req.body);
      res.json({ success: true, data: request });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const result = await serviceService.deleteServiceRequest(req.params.id);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async createRecord(req, res, next) {
    try {
      const record = await serviceService.createServiceRecord(req.body);
      res.status(201).json({ success: true, data: record });
    } catch (error) {
      next(error);
    }
  }

  async updateRecord(req, res, next) {
    try {
      const record = await serviceService.updateServiceRecord(req.params.id, req.body);
      res.json({ success: true, data: record });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ServiceController();