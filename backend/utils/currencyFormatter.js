/**
 * Formats a numeric value into Indian Rupees (₹) with Indian digit grouping (en-IN).
 * @param {number} amount - Numeric value to format
 * @returns {string} Formatted currency string
 */
const formatRupees = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount);
};

module.exports = { formatRupees };
