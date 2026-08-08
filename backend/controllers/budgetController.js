const Budget = require('../models/Budget');
const { checkBudgetThresholds } = require('../utils/budgetCheck');

// @desc    Get user budget for a specific month
// @route   GET /api/budget
// @access  Private
const getBudget = async (req, res, next) => {
  try {
    // Get month from query or default to current month (YYYY-MM)
    let month = req.query.month;
    if (!month) {
      const today = new Date();
      month = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    }

    let budget = await Budget.findOne({ user: req.user._id, month });

    // If no budget exists, return a default template (limit = 0)
    if (!budget) {
      return res.json({
        success: true,
        data: {
          user: req.user._id,
          limit: 0,
          categoryLimits: {},
          month
        }
      });
    }

    res.json({
      success: true,
      data: budget
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Set or update user budget for a month
// @route   POST /api/budget
// @access  Private
const setBudget = async (req, res, next) => {
  try {
    const { limit, categoryLimits, month } = req.body;

    if (!month) {
      return res.status(400).json({
        success: false,
        message: 'Please specify the month in YYYY-MM format'
      });
    }

    // Find and update, or create if it doesn't exist
    const budget = await Budget.findOneAndUpdate(
      { user: req.user._id, month },
      {
        limit: parseFloat(limit) || 0,
        categoryLimits: categoryLimits || {}
      },
      { new: true, upsert: true, runValidators: true }
    );

    // Recalculate thresholds immediately
    checkBudgetThresholds(req.user._id, month);

    res.json({
      success: true,
      data: budget
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBudget,
  setBudget
};
