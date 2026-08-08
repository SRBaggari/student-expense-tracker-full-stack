const mongoose = require('mongoose');

const BudgetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  limit: {
    type: Number,
    required: [true, 'Please add a monthly budget limit'],
    default: 0
  },
  // Map key-value pairs where key is Category (Food, Shopping, etc.) and value is limit
  categoryLimits: {
    type: Map,
    of: Number,
    default: {}
  },
  month: {
    type: String,
    required: true,
    // Store in format YYYY-MM
    match: [/^\d{4}-\d{2}$/, 'Please use YYYY-MM format']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure a user has only one budget per month
BudgetSchema.index({ user: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Budget', BudgetSchema);
