const historyService = require('../services/historyService');

class HistoryController {
  async getAll(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const result = await historyService.getAllHistory(page, limit);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getByServiceId(req, res, next) {
    try {
      const history = await historyService.getHistoryByServiceId(req.params.serviceId);
      res.json({ success: true, data: history });
    } catch (error) {
      next(error);
    }
  }

  async getByCustomerId(req, res, next) {
    try {
      const history = await historyService.getHistoryByCustomerId(req.params.customerId);
      res.json({ success: true, data: history });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new HistoryController();

