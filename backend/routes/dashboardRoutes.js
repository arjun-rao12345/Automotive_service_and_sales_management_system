const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

router.get('/stats', dashboardController.getStats);
router.get('/activity', dashboardController.getRecentActivity);
router.get('/charts/services', dashboardController.getServiceChart);
router.get('/charts/revenue', dashboardController.getRevenueChart);

module.exports = router;