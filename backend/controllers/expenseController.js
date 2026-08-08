const Expense = require('../models/Expense');
const { checkBudgetThresholds } = require('../utils/budgetCheck');

// @desc    Get all user expenses with filters
// @route   GET /api/expenses
// @access  Private
const getExpenses = async (req, res, next) => {
  try {
    const { category, search, month } = req.query;
    const query = { user: req.user._id };

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Search by title (case-insensitive regex)
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    // Filter by month (format YYYY-MM)
    if (month) {
      const startOfMonth = new Date(`${month}-01T00:00:00.000Z`);
      const year = parseInt(month.split('-')[0]);
      const monthNum = parseInt(month.split('-')[1]);
      const endOfMonth = new Date(Date.UTC(year, monthNum, 0, 23, 59, 59, 999));

      query.date = { $gte: startOfMonth, $lte: endOfMonth };
    }

    const expenses = await Expense.find(query).sort({ date: -1 });

    res.json({
      success: true,
      count: expenses.length,
      data: expenses
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add an expense
// @route   POST /api/expenses
// @access  Private
const addExpense = async (req, res, next) => {
  try {
    const { title, amount, category, date, notes } = req.body;

    const expense = await Expense.create({
      user: req.user._id,
      title,
      amount: parseFloat(amount),
      category,
      date: date || new Date(),
      notes
    });

    // Run budget thresholds check asynchronously
    const expenseDate = new Date(expense.date);
    const month = `${expenseDate.getUTCFullYear()}-${String(expenseDate.getUTCMonth() + 1).padStart(2, '0')}`;
    checkBudgetThresholds(req.user._id, month);

    res.status(201).json({
      success: true,
      data: expense
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an expense
// @route   PUT /api/expenses/:id
// @access  Private
const updateExpense = async (req, res, next) => {
  try {
    let expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    // Make sure user owns the expense
    if (expense.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to edit this expense'
      });
    }

    expense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    // Trigger budget checker
    const expenseDate = new Date(expense.date);
    const month = `${expenseDate.getUTCFullYear()}-${String(expenseDate.getUTCMonth() + 1).padStart(2, '0')}`;
    checkBudgetThresholds(req.user._id, month);

    res.json({
      success: true,
      data: expense
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an expense
// @route   DELETE /api/expenses/:id
// @access  Private
const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    // Make sure user owns the expense
    if (expense.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this expense'
      });
    }

    await expense.deleteOne();

    // Trigger budget check for recalculating
    const expenseDate = new Date(expense.date);
    const month = `${expenseDate.getUTCFullYear()}-${String(expenseDate.getUTCMonth() + 1).padStart(2, '0')}`;
    checkBudgetThresholds(req.user._id, month);

    res.json({
      success: true,
      message: 'Expense removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getExpenses,
  addExpense,
  updateExpense,
  deleteExpense
};
