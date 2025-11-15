const insuranceService = require('../services/insuranceService');

class InsuranceController {
  async getAll(req, res, next) {
    try {
      const insurance = await insuranceService.getAllInsurance();
      res.json({ success: true, data: insurance });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const insurance = await insuranceService.createInsurance(req.body);
      res.status(201).json({ success: true, data: insurance });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const insurance = await insuranceService.updateInsurance(req.params.id, req.body);
      res.json({ success: true, data: insurance });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const result = await insuranceService.deleteInsurance(req.params.id);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new InsuranceController();