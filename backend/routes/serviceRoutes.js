const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');

// Service records routes
router.post('/records', serviceController.createRecord);
router.put('/records/:id', serviceController.updateRecord);

// Service request routes
router.get('/', serviceController.getAll);
router.get('/:id', serviceController.getById);
router.post('/', serviceController.create);
router.put('/:id', serviceController.update);
router.delete('/:id', serviceController.delete);

module.exports = router;