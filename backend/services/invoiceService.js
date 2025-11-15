const { promisePool } = require('../config/database');

class InvoiceService {
  // Get all invoices
  async getAllInvoices(page = 1, limit = 10, paymentPending = null) {
    const offset = (page - 1) * limit;
    
    try {
      let countQuery = 'SELECT COUNT(*) as total FROM Invoice';
      let dataQuery = `
        SELECT i.*, 
               sr.service_type, sr.status as service_status,
               c.customer_id, c.name as customer_name, c.phone as customer_phone
        FROM Invoice i
        INNER JOIN Service_Request sr ON i.service_request_id = sr.service_request_id
        INNER JOIN Customer c ON sr.customer_id = c.customer_id
      `;
      
      const params = [];
      
      if (paymentPending !== null) {
        countQuery += ' WHERE payment_pending = ?';
        dataQuery += ' WHERE i.payment_pending = ?';
        params.push(paymentPending);
      }
      
      dataQuery += ' ORDER BY i.date DESC LIMIT ? OFFSET ?';
      
      const [countResult] = await promisePool.query(
        countQuery, 
        paymentPending !== null ? [paymentPending] : []
      );
      const total = countResult[0].total;
      
      const [invoices] = await promisePool.query(dataQuery, [...params, limit, offset]);
      
      return {
        invoices,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Failed to fetch invoices: ${error.message}`);
    }
  }

  // Get invoice by ID
  async getInvoiceById(id) {
    try {
      const [invoices] = await promisePool.query(
        `SELECT i.*, 
                sr.service_type, sr.status as service_status,
                c.customer_id, c.name as customer_name, c.phone as customer_phone, c.email as customer_email
         FROM Invoice i
         INNER JOIN Service_Request sr ON i.service_request_id = sr.service_request_id
         INNER JOIN Customer c ON sr.customer_id = c.customer_id
         WHERE i.invoice_id = ?`,
        [id]
      );
      
      if (invoices.length === 0) {
        throw new Error('Invoice not found');
      }
      
      // Get payments for this invoice
      const [payments] = await promisePool.query(
        `SELECT * FROM Payment WHERE invoice_id = ? ORDER BY date DESC`,
        [id]
      );
      
      return {
        ...invoices[0],
        payments
      };
    } catch (error) {
      throw error;
    }
  }

  // Create invoice
  async createInvoice(data) {
    const { service_request_id, payment_pending, date, due_date } = data;
    try {
      // Fetch service price and extra charges
      const [serviceRows] = await promisePool.query(
        `SELECT service_price, extra_charges FROM Service_Request WHERE service_request_id = ?`,
        [service_request_id]
      );
      if (!serviceRows.length) throw new Error('Service request not found');
      const { service_price, extra_charges } = serviceRows[0];

      // Sum all parts used for this service
      const [partsRows] = await promisePool.query(
        `SELECT SUM(part_price * quantity) AS parts_total FROM Service_Parts_Used WHERE service_request_id = ?`,
        [service_request_id]
      );
      const parts_total = parseFloat(partsRows[0].parts_total) || 0;

      // Calculate total
      const total_amount = parseFloat(service_price) + parseFloat(extra_charges) + parts_total;

      const [result] = await promisePool.query(
        `INSERT INTO Invoice (service_request_id, total_amount, payment_pending, date, due_date) 
         VALUES (?, ?, ?, ?, ?)`,
        [service_request_id, total_amount, payment_pending !== false, date, due_date]
      );
      return await this.getInvoiceById(result.insertId);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Invoice already exists for this service request');
      }
      throw new Error(`Failed to create invoice: ${error.message}`);
    }
  }

  // Update invoice
  async updateInvoice(id, data) {
    const { total_amount, payment_pending, date, due_date } = data;
    
    try {
      const [result] = await promisePool.query(
        `UPDATE Invoice 
         SET total_amount = ?, payment_pending = ?, date = ?, due_date = ?
         WHERE invoice_id = ?`,
        [total_amount, payment_pending, date, due_date, id]
      );
      
      if (result.affectedRows === 0) {
        throw new Error('Invoice not found');
      }
      
      return await this.getInvoiceById(id);
    } catch (error) {
      throw error;
    }
  }

  // Create payment
  async createPayment(data) {
    const { invoice_id, method, amount_paid, date, transaction_reference } = data;
    
    const connection = await promisePool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Insert payment
      const [result] = await connection.query(
        `INSERT INTO Payment (invoice_id, method, amount_paid, date, transaction_reference) 
         VALUES (?, ?, ?, ?, ?)`,
        [invoice_id, method, amount_paid, date, transaction_reference]
      );
      
      // Calculate total paid
      const [payments] = await connection.query(
        'SELECT SUM(amount_paid) as total_paid FROM Payment WHERE invoice_id = ?',
        [invoice_id]
      );
      
      const [invoice] = await connection.query(
        'SELECT total_amount FROM Invoice WHERE invoice_id = ?',
        [invoice_id]
      );
      
      const totalPaid = parseFloat(payments[0].total_paid);
      const totalAmount = parseFloat(invoice[0].total_amount);
      
      // Update invoice payment status
      if (totalPaid >= totalAmount) {
        await connection.query(
          'UPDATE Invoice SET payment_pending = FALSE WHERE invoice_id = ?',
          [invoice_id]
        );
      }
      
      await connection.commit();
      
      const [newPayment] = await promisePool.query(
        'SELECT * FROM Payment WHERE payment_id = ?',
        [result.insertId]
      );
      
      return newPayment[0];
    } catch (error) {
      await connection.rollback();
      throw new Error(`Failed to create payment: ${error.message}`);
    } finally {
      connection.release();
    }
  }

  // Get payments by invoice
  async getPaymentsByInvoice(invoiceId) {
    try {
      const [payments] = await promisePool.query(
        'SELECT * FROM Payment WHERE invoice_id = ? ORDER BY date DESC',
        [invoiceId]
      );
      
      return payments;
    } catch (error) {
      throw new Error(`Failed to fetch payments: ${error.message}`);
    }
  }
}

module.exports = new InvoiceService();