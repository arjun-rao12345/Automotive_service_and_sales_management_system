const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');

// Payment routes
router.post('/payments', invoiceController.createPayment);
router.get('/:invoiceId/payments', invoiceController.getPayments);

// Invoice routes
router.get('/', invoiceController.getAll);
router.get('/:id', invoiceController.getById);
router.post('/', invoiceController.create);
router.put('/:id', invoiceController.update);

module.exports = router;