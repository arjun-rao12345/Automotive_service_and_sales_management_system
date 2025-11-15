const vehicleService = require('../services/vehicleService');

class VehicleController {
  async getAll(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const result = await vehicleService.getAllVehicles(page, limit);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const vehicle = await vehicleService.getVehicleById(req.params.id);
      res.json({ success: true, data: vehicle });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const vehicle = await vehicleService.createVehicle(req.body);
      res.status(201).json({ success: true, data: vehicle });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const vehicle = await vehicleService.updateVehicle(req.params.id, req.body);
      res.json({ success: true, data: vehicle });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const result = await vehicleService.deleteVehicle(req.params.id);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getAllModels(req, res, next) {
    try {
      const models = await vehicleService.getAllModels();
      res.json({ success: true, data: models });
    } catch (error) {
      next(error);
    }
  }

  async createModel(req, res, next) {
    try {
      const model = await vehicleService.createModel(req.body);
      res.status(201).json({ success: true, data: model });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new VehicleController();