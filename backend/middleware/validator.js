const { body, validationResult } = require('express-validator');

// Middleware to check validation results
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Validation rules for customer
const customerValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('phone').notEmpty().withMessage('Phone is required'),
  body('email').optional().isEmail().withMessage('Invalid email format')
];

// Validation rules for vehicle
const vehicleValidation = [
  body('customer_id').isInt().withMessage('Valid customer ID is required'),
  body('model_id').isInt().withMessage('Valid model ID is required'),
  body('registration_no').notEmpty().withMessage('Registration number is required'),
  body('vin').notEmpty().isLength({ min: 17, max: 17 }).withMessage('VIN must be 17 characters')
];

// Validation rules for service request
const serviceRequestValidation = [
  body('customer_id').isInt().withMessage('Valid customer ID is required'),
  body('vehicle_id').isInt().withMessage('Valid vehicle ID is required'),
  body('requested_date').isDate().withMessage('Valid date is required'),
  body('service_type').notEmpty().withMessage('Service type is required')
];

module.exports = {
  validate,
  customerValidation,
  vehicleValidation,
  serviceRequestValidation
};