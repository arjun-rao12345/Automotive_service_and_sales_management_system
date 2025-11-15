const feedbackService = require('../services/feedbackService');

class FeedbackController {
  async getAll(req, res, next) {
    try {
      const feedback = await feedbackService.getAllFeedback();
      res.json({ success: true, data: feedback });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const feedback = await feedbackService.createFeedback(req.body);
      res.status(201).json({ success: true, data: feedback });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new FeedbackController();