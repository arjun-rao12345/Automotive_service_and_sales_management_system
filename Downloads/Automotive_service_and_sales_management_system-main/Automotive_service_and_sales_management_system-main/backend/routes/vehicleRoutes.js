const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');

// Models routes should come first to avoid conflict with /:id
router.get('/models/all', vehicleController.getAllModels);
router.post('/models', vehicleController.createModel);

// Vehicle routes - by-customer must come before /:id to avoid conflict
router.get('/by-customer/:customerId', vehicleController.getByCustomerId);

// Vehicle routes
router.get('/', vehicleController.getAll);
router.get('/:id', vehicleController.getById);
router.post('/', vehicleController.create);
router.put('/:id', vehicleController.update);
router.delete('/:id', vehicleController.delete);

module.exports = router;