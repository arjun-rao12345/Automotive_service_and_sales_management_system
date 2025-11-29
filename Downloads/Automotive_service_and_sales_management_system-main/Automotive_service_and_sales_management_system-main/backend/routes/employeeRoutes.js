const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');

// Technician routes
router.get('/technicians/all', employeeController.getAllTechnicians);
router.post('/technicians', employeeController.createTechnician);
router.put('/technicians/:id', employeeController.updateTechnician);

// Employee routes
router.get('/', employeeController.getAll);
router.get('/:id', employeeController.getById);
router.post('/', employeeController.create);
router.put('/:id', employeeController.update);
router.delete('/:id', employeeController.delete);

module.exports = router;