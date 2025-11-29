const { promisePool } = require('../config/database');

class FeedbackService {
  // Get all feedback
  async getAllFeedback() {
    try {
      const [feedback] = await promisePool.query(
        `SELECT f.*, 
                c.name as customer_name, c.phone as customer_phone,
                sr.service_type, sr.status as service_status
         FROM Feedback f
         INNER JOIN Customer c ON f.customer_id = c.customer_id
         INNER JOIN Service_Request sr ON f.service_request_id = sr.service_request_id
         ORDER BY f.created_at DESC`
      );
      
      return feedback;
    } catch (error) {
      throw new Error(`Failed to fetch feedback: ${error.message}`);
    }
  }

  // Create feedback
  async createFeedback(data) {
    const { customer_id, service_request_id, rating, comments } = data;
    
    try {
      const [result] = await promisePool.query(
        `INSERT INTO Feedback (customer_id, service_request_id, rating, comments) 
         VALUES (?, ?, ?, ?)`,
        [customer_id, service_request_id, rating, comments]
      );
      
      const [feedback] = await promisePool.query(
        `SELECT f.*, c.name as customer_name
         FROM Feedback f
         INNER JOIN Customer c ON f.customer_id = c.customer_id
         WHERE f.feedback_id = ?`,
        [result.insertId]
      );
      
      return feedback[0];
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Feedback already exists for this service request');
      }
      throw new Error(`Failed to create feedback: ${error.message}`);
    }
  }
}

module.exports = new FeedbackService();