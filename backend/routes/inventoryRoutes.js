const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');

// Special routes first
router.get('/low-stock', inventoryController.getLowStock);
router.get('/suppliers', inventoryController.getAllSuppliers);
router.post('/suppliers', inventoryController.createSupplier);

// Parts routes
router.get('/parts', inventoryController.getAllParts);
router.get('/parts/:id', inventoryController.getPartById);
router.post('/parts', inventoryController.createPart);
router.put('/parts/:id', inventoryController.updatePart);
router.delete('/parts/:id', inventoryController.deletePart);

// Inventory routes
router.post('/inventory', inventoryController.createInventory);
router.put('/inventory/:id', inventoryController.updateInventory);

module.exports = router;