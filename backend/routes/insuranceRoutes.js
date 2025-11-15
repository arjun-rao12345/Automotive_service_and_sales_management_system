const express = require('express');
const router = express.Router();
const insuranceController = require('../controllers/insuranceController');

router.get('/', insuranceController.getAll);
router.post('/', insuranceController.create);
router.put('/:id', insuranceController.update);
router.delete('/:id', insuranceController.delete);

module.exports = router;