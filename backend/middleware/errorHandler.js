const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // MySQL errors
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(400).json({
      success: false,
      message: 'Duplicate entry. Record already exists.'
    });
  }

  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({
      success: false,
      message: 'Invalid reference. The related record does not exist.'
    });
  }

  if (err.code === 'ER_ROW_IS_REFERENCED_2') {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete. Record is referenced by other records.'
    });
  }

  // Custom error messages
  if (err.message) {
    return res.status(err.status || 400).json({
      success: false,
      message: err.message
    });
  }

  // Default error
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};

module.exports = errorHandler;