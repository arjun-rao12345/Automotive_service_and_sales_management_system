const invoiceService = require('../services/invoiceService');

class InvoiceController {
  async getAll(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const paymentPending = req.query.payment_pending === 'true' ? true : 
                            req.query.payment_pending === 'false' ? false : null;
      const result = await invoiceService.getAllInvoices(page, limit, paymentPending);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const invoice = await invoiceService.getInvoiceById(req.params.id);
      res.json({ success: true, data: invoice });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const invoice = await invoiceService.createInvoice(req.body);
      res.status(201).json({ success: true, data: invoice });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const invoice = await invoiceService.updateInvoice(req.params.id, req.body);
      res.json({ success: true, data: invoice });
    } catch (error) {
      next(error);
    }
  }

  async createPayment(req, res, next) {
    try {
      const payment = await invoiceService.createPayment(req.body);
      res.status(201).json({ success: true, data: payment });
    } catch (error) {
      next(error);
    }
  }

  async getPayments(req, res, next) {
    try {
      const payments = await invoiceService.getPaymentsByInvoice(req.params.invoiceId);
      res.json({ success: true, data: payments });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const result = await invoiceService.deleteInvoice(req.params.id);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new InvoiceController();