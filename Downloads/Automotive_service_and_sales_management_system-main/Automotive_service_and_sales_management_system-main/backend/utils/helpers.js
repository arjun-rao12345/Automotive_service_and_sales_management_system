// Helper utility functions

// Format date to YYYY-MM-DD
const formatDate = (date) => {
  if (!date) return null;
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

// Format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount);
};

// Calculate pagination
const calculatePagination = (page, limit, total) => {
  return {
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    totalRecords: total,
    hasNext: page < Math.ceil(total / limit),
    hasPrev: page > 1
  };
};

// Sanitize SQL input (basic protection)
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.replace(/[^\w\s@.-]/gi, '');
};

module.exports = {
  formatDate,
  formatCurrency,
  calculatePagination,
  sanitizeInput
};