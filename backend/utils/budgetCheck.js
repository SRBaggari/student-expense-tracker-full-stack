const Budget = require('../models/Budget');
const Expense = require('../models/Expense');
const Notification = require('../models/Notification');
const { formatRupees } = require('./currencyFormatter');

/**
 * Checks if user's expenses exceed the monthly budget or category budget limits
 * and creates notifications accordingly.
 * @param {string} userId - ID of the user
 * @param {string} month - Format YYYY-MM
 */
const checkBudgetThresholds = async (userId, month) => {
  try {
    // 1. Fetch budget for this month
    const budget = await Budget.findOne({ user: userId, month });
    if (!budget) return; // No budget set for this month

    // 2. Fetch all expenses for this month
    const startOfMonth = new Date(`${month}-01T00:00:00.000Z`);
    // Get last day of month
    const year = parseInt(month.split('-')[0]);
    const monthNum = parseInt(month.split('-')[1]);
    const endOfMonth = new Date(Date.UTC(year, monthNum, 0, 23, 59, 59, 999));

    const expenses = await Expense.find({
      user: userId,
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });

    // 3. Calculate total monthly expenses
    const totalSpent = expenses.reduce((acc, exp) => acc + exp.amount, 0);

    // 4. Check total budget threshold
    if (budget.limit > 0) {
      if (totalSpent > budget.limit) {
        // Check if an exceeded notification already exists for this month
        const exists = await Notification.findOne({
          user: userId,
          message: { $regex: 'Budget exceeded.*' + month },
          type: 'danger'
        });

        if (!exists) {
          await Notification.create({
            user: userId,
            message: `Budget exceeded! You have spent ${formatRupees(totalSpent)} out of your ${formatRupees(budget.limit)} monthly budget. (Month: ${month})`,
            type: 'danger'
          });
        }
      } else if (totalSpent >= budget.limit * 0.9) {
        // Check if warning notification exists
        const exists = await Notification.findOne({
          user: userId,
          message: { $regex: 'Budget warning.*' + month },
          type: 'warning'
        });

        if (!exists) {
          await Notification.create({
            user: userId,
            message: `Budget warning! You have spent over 90% of your budget: ${formatRupees(totalSpent)} of ${formatRupees(budget.limit)}. (Month: ${month})`,
            type: 'warning'
          });
        }
      }
    }

    // 5. Check category budget limits
    if (budget.categoryLimits && budget.categoryLimits.size > 0) {
      for (const [category, catLimit] of budget.categoryLimits.entries()) {
        if (!catLimit || catLimit <= 0) continue;

        // Sum expenses for this category
        const catSpent = expenses
          .filter((exp) => exp.category.toLowerCase() === category.toLowerCase())
          .reduce((acc, exp) => acc + exp.amount, 0);

        if (catSpent > catLimit) {
          const exists = await Notification.findOne({
            user: userId,
            message: { $regex: `Overspending on ${category}.*${month}` },
            type: 'warning'
          });

          if (!exists) {
            await Notification.create({
              user: userId,
              message: `Overspending on ${category}! You have spent ${formatRupees(catSpent)} exceeding your category budget of ${formatRupees(catLimit)}. (Month: ${month})`,
              type: 'warning'
            });
          }
        }
      }
    }
  } catch (error) {
    console.error('Error checking budget thresholds:', error);
  }
};

module.exports = { checkBudgetThresholds };
