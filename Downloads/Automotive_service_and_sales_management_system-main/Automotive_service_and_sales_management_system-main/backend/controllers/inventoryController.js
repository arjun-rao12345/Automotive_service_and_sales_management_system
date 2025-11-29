const inventoryService = require('../services/inventoryService');

class InventoryController {
  async getAllParts(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const result = await inventoryService.getAllParts(page, limit);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getPartById(req, res, next) {
    try {
      const part = await inventoryService.getPartById(req.params.id);
      res.json({ success: true, data: part });
    } catch (error) {
      next(error);
    }
  }

  async createPart(req, res, next) {
    try {
      const part = await inventoryService.createPart(req.body);
      res.status(201).json({ success: true, data: part });
    } catch (error) {
      next(error);
    }
  }

  async updatePart(req, res, next) {
    try {
      const part = await inventoryService.updatePart(req.params.id, req.body);
      res.json({ success: true, data: part });
    } catch (error) {
      next(error);
    }
  }

  async deletePart(req, res, next) {
    try {
      const result = await inventoryService.deletePart(req.params.id);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getAllSuppliers(req, res, next) {
    try {
      const suppliers = await inventoryService.getAllSuppliers();
      res.json({ success: true, data: suppliers });
    } catch (error) {
      next(error);
    }
  }

  async createSupplier(req, res, next) {
    try {
      const supplier = await inventoryService.createSupplier(req.body);
      res.status(201).json({ success: true, data: supplier });
    } catch (error) {
      next(error);
    }
  }

  async updateInventory(req, res, next) {
    try {
      const inventory = await inventoryService.updateInventory(req.params.id, req.body);
      res.json({ success: true, data: inventory });
    } catch (error) {
      next(error);
    }
  }

  async createInventory(req, res, next) {
    try {
      const inventory = await inventoryService.createInventory(req.body);
      res.status(201).json({ success: true, data: inventory });
    } catch (error) {
      next(error);
    }
  }

  async getLowStock(req, res, next) {
    try {
      const items = await inventoryService.getLowStockItems();
      res.json({ success: true, data: items });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new InventoryController();