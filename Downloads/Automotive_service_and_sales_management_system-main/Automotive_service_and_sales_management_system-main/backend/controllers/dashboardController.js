const dashboardService = require('../services/dashboardService');

class DashboardController {
  async getStats(req, res, next) {
    try {
      const stats = await dashboardService.getDashboardStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }

  async getRecentActivity(req, res, next) {
    try {
      const activity = await dashboardService.getRecentActivity();
      res.json({ success: true, data: activity });
    } catch (error) {
      next(error);
    }
  }

  async getServiceChart(req, res, next) {
    try {
      const data = await dashboardService.getServiceStatusChart();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getRevenueChart(req, res, next) {
    try {
      const data = await dashboardService.getMonthlyRevenue();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getTodayStats(req, res, next) {
    try {
      const stats = await dashboardService.getTodayStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }

  async getMonthlyStats(req, res, next) {
    try {
      const stats = await dashboardService.getMonthlyStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }

  async getYearlyStats(req, res, next) {
    try {
      const stats = await dashboardService.getYearlyStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }

  async getComprehensiveStats(req, res, next) {
    try {
      const stats = await dashboardService.getComprehensiveStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DashboardController();