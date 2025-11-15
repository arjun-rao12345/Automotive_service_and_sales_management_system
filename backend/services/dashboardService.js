const { promisePool } = require('../config/database');

class DashboardService {
  // Get dashboard statistics
  async getDashboardStats() {
    try {
      // Total customers
      const [customerCount] = await promisePool.query(
        'SELECT COUNT(*) as count FROM Customer'
      );
      
      // Total vehicles
      const [vehicleCount] = await promisePool.query(
        'SELECT COUNT(*) as count FROM Vehicle'
      );
      
      // Pending services
      const [pendingServices] = await promisePool.query(
        "SELECT COUNT(*) as count FROM Service_Request WHERE status IN ('Pending', 'In Progress')"
      );
      
      // Completed services
      const [completedServices] = await promisePool.query(
        "SELECT COUNT(*) as count FROM Service_Request WHERE status = 'Completed'"
      );
      
      // Pending payments
      const [pendingPayments] = await promisePool.query(
        'SELECT COUNT(*) as count FROM Invoice WHERE payment_pending = TRUE'
      );
      
      // Total revenue
      const [revenue] = await promisePool.query(
        'SELECT SUM(total_amount) as total FROM Invoice WHERE payment_pending = FALSE'
      );
      
      // Low stock items
      const [lowStock] = await promisePool.query(
        'SELECT COUNT(*) as count FROM Inventory WHERE quantity <= reorder_level'
      );
      
      // Average rating
      const [avgRating] = await promisePool.query(
        'SELECT AVG(rating) as average FROM Feedback'
      );
      
      return {
        totalCustomers: customerCount[0].count,
        totalVehicles: vehicleCount[0].count,
        pendingServices: pendingServices[0].count,
        completedServices: completedServices[0].count,
        pendingPayments: pendingPayments[0].count,
        totalRevenue: parseFloat(revenue[0].total || 0).toFixed(2),
        lowStockItems: lowStock[0].count,
        averageRating: parseFloat(avgRating[0].average || 0).toFixed(1)
      };
    } catch (error) {
      throw new Error(`Failed to fetch dashboard stats: ${error.message}`);
    }
  }

  // Get recent activity
  async getRecentActivity() {
    try {
      // Recent service requests
      const [recentServices] = await promisePool.query(
        `SELECT sr.service_request_id, sr.service_type, sr.status, sr.requested_date,
                c.name as customer_name,
                v.registration_no
         FROM Service_Request sr
         INNER JOIN Customer c ON sr.customer_id = c.customer_id
         INNER JOIN Vehicle v ON sr.vehicle_id = v.vehicle_id
         ORDER BY sr.created_at DESC
         LIMIT 5`
      );
      
      // Recent invoices
      const [recentInvoices] = await promisePool.query(
        `SELECT i.invoice_id, i.total_amount, i.payment_pending, i.date,
                c.name as customer_name
         FROM Invoice i
         INNER JOIN Service_Request sr ON i.service_request_id = sr.service_request_id
         INNER JOIN Customer c ON sr.customer_id = c.customer_id
         ORDER BY i.date DESC
         LIMIT 5`
      );
      
      return {
        recentServices,
        recentInvoices
      };
    } catch (error) {
      throw new Error(`Failed to fetch recent activity: ${error.message}`);
    }
  }

  // Get service status chart data
  async getServiceStatusChart() {
    try {
      const [statusCounts] = await promisePool.query(
        `SELECT status, COUNT(*) as count 
         FROM Service_Request 
         GROUP BY status`
      );
      
      return statusCounts;
    } catch (error) {
      throw new Error(`Failed to fetch service chart: ${error.message}`);
    }
  }

  // Get monthly revenue
  async getMonthlyRevenue() {
    try {
      const [monthlyData] = await promisePool.query(
        `SELECT DATE_FORMAT(date, '%Y-%m') as month, 
                SUM(total_amount) as revenue
         FROM Invoice
         WHERE date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
         GROUP BY DATE_FORMAT(date, '%Y-%m')
         ORDER BY month ASC`
      );
      
      return monthlyData;
    } catch (error) {
      throw new Error(`Failed to fetch revenue chart: ${error.message}`);
    }
  }
}

module.exports = new DashboardService();