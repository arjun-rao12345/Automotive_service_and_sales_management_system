const express = require('express');
const router = express.Router();
const historyController = require('../controllers/historyController');

router.get('/', historyController.getAll);
router.get('/service/:serviceId', historyController.getByServiceId);
router.get('/customer/:customerId', historyController.getByCustomerId);

module.exports = router;

