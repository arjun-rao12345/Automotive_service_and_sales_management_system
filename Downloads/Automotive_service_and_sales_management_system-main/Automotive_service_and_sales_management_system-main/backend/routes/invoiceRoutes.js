const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');

// Payment routes - must come before /:id routes to avoid conflicts
router.post('/payments', invoiceController.createPayment);
router.get('/:invoiceId/payments', invoiceController.getPayments);

// Invoice routes
router.get('/', invoiceController.getAll);
router.post('/', invoiceController.create);
router.get('/:id', invoiceController.getById);
router.put('/:id', invoiceController.update);
router.delete('/:id', invoiceController.delete);

module.exports = router;