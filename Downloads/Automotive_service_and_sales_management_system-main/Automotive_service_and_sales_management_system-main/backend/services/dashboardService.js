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
      
      // Total services
      const [totalServices] = await promisePool.query(
        'SELECT COUNT(*) as count FROM Service_Request'
      );
      
      // Pending services
      const [pendingServices] = await promisePool.query(
        "SELECT COUNT(*) as count FROM Service_Request WHERE status = 'Pending'"
      );
      
      // In Progress services
      const [inProgressServices] = await promisePool.query(
        "SELECT COUNT(*) as count FROM Service_Request WHERE status = 'In Progress'"
      );
      
      // Completed services
      const [completedServices] = await promisePool.query(
        "SELECT COUNT(*) as count FROM Service_Request WHERE status = 'Completed'"
      );
      
      // Services today
      const [todayServices] = await promisePool.query(
        'SELECT COUNT(*) as count FROM Service_Request WHERE DATE(created_at) = CURDATE()'
      );
      
      // Services this month
      const [monthlyServices] = await promisePool.query(
        `SELECT COUNT(*) as count FROM Service_Request 
         WHERE YEAR(created_at) = YEAR(CURDATE()) 
         AND MONTH(created_at) = MONTH(CURDATE())`
      );
      
      // Services this year
      const [yearlyServices] = await promisePool.query(
        'SELECT COUNT(*) as count FROM Service_Request WHERE YEAR(created_at) = YEAR(CURDATE())'
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
        totalCustomers: customerCount[0].count || 0,
        totalVehicles: vehicleCount[0].count || 0,
        totalServices: totalServices[0].count || 0,
        pendingServices: pendingServices[0].count || 0,
        inProgressServices: inProgressServices[0].count || 0,
        completedServices: completedServices[0].count || 0,
        todayServices: todayServices[0].count || 0,
        monthlyServices: monthlyServices[0].count || 0,
        yearlyServices: yearlyServices[0].count || 0,
        pendingPayments: pendingPayments[0].count || 0,
        totalRevenue: parseFloat(revenue[0].total || 0).toFixed(2),
        lowStockItems: lowStock[0].count || 0,
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

  // Get service stats for today
  async getTodayStats() {
    try {
      const [todayServices] = await promisePool.query(
        `SELECT COUNT(*) as count 
         FROM Service_Request 
         WHERE DATE(created_at) = CURDATE()`
      );

      return {
        today: todayServices[0].count
      };
    } catch (error) {
      throw new Error(`Failed to fetch today stats: ${error.message}`);
    }
  }

  // Get service stats for this month
  async getMonthlyStats() {
    try {
      const [monthlyServices] = await promisePool.query(
        `SELECT COUNT(*) as count 
         FROM Service_Request 
         WHERE YEAR(created_at) = YEAR(CURDATE()) 
         AND MONTH(created_at) = MONTH(CURDATE())`
      );

      return {
        monthly: monthlyServices[0].count
      };
    } catch (error) {
      throw new Error(`Failed to fetch monthly stats: ${error.message}`);
    }
  }

  // Get service stats for this year
  async getYearlyStats() {
    try {
      const [yearlyServices] = await promisePool.query(
        `SELECT COUNT(*) as count 
         FROM Service_Request 
         WHERE YEAR(created_at) = YEAR(CURDATE())`
      );

      return {
        yearly: yearlyServices[0].count
      };
    } catch (error) {
      throw new Error(`Failed to fetch yearly stats: ${error.message}`);
    }
  }

  // Get comprehensive dashboard stats
  async getComprehensiveStats() {
    try {
      // Today's services
      const [todayServices] = await promisePool.query(
        `SELECT COUNT(*) as count 
         FROM Service_Request 
         WHERE DATE(created_at) = CURDATE()`
      );

      // This month's services
      const [monthlyServices] = await promisePool.query(
        `SELECT COUNT(*) as count 
         FROM Service_Request 
         WHERE YEAR(created_at) = YEAR(CURDATE()) 
         AND MONTH(created_at) = MONTH(CURDATE())`
      );

      // This year's services
      const [yearlyServices] = await promisePool.query(
        `SELECT COUNT(*) as count 
         FROM Service_Request 
         WHERE YEAR(created_at) = YEAR(CURDATE())`
      );

      // Status breakdown
      const [statusBreakdown] = await promisePool.query(
        `SELECT status, COUNT(*) as count 
         FROM Service_Request 
         GROUP BY status`
      );

      const statusMap = {
        'Pending': 0,
        'In Progress': 0,
        'Completed': 0,
        'Cancelled': 0
      };

      statusBreakdown.forEach(item => {
        statusMap[item.status] = item.count;
      });

      return {
        today: todayServices[0].count,
        monthly: monthlyServices[0].count,
        yearly: yearlyServices[0].count,
        pending: statusMap['Pending'] || 0,
        inProgress: statusMap['In Progress'] || 0,
        completed: statusMap['Completed'] || 0,
        cancelled: statusMap['Cancelled'] || 0
      };
    } catch (error) {
      throw new Error(`Failed to fetch comprehensive stats: ${error.message}`);
    }
  }
}

module.exports = new DashboardService();