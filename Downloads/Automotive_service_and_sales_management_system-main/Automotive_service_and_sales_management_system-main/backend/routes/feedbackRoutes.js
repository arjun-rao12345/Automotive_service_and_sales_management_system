const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');

router.get('/', feedbackController.getAll);
router.post('/', feedbackController.create);

module.exports = router;