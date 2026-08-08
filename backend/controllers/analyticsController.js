const Expense = require('../models/Expense');
const Budget = require('../models/Budget');
const { formatRupees } = require('../utils/currencyFormatter');

// @desc    Get user analytics and smart spending suggestions
// @route   GET /api/analytics
// @access  Private
const getAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // 1. Determine date boundaries
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonthNum = today.getMonth() + 1; // 1-indexed
    const currentMonthStr = `${currentYear}-${String(currentMonthNum).padStart(2, '0')}`;

    const startOfCurrentMonth = new Date(`${currentMonthStr}-01T00:00:00.000Z`);
    const endOfCurrentMonth = new Date(Date.UTC(currentYear, currentMonthNum, 0, 23, 59, 59, 999));

    // 2. Fetch current month expenses & budget
    const currentExpenses = await Expense.find({
      user: userId,
      date: { $gte: startOfCurrentMonth, $lte: endOfCurrentMonth }
    });

    const budget = await Budget.findOne({ user: userId, month: currentMonthStr });
    const budgetLimit = budget ? budget.limit : 0;

    // 3. Category Breakdown (Pie Chart Data)
    const categories = ['Food', 'Transport', 'Books', 'Entertainment', 'Shopping', 'Others'];
    const categoryBreakdown = {};
    categories.forEach(cat => {
      categoryBreakdown[cat] = 0;
    });

    currentExpenses.forEach(exp => {
      // Safeguard against missing/invalid categories
      const cat = exp.category;
      if (categoryBreakdown.hasOwnProperty(cat)) {
        categoryBreakdown[cat] += exp.amount;
      } else {
        categoryBreakdown['Others'] += exp.amount;
      }
    });

    const totalSpent = currentExpenses.reduce((acc, exp) => acc + exp.amount, 0);
    const remainingBudget = budgetLimit > 0 ? Math.max(0, budgetLimit - totalSpent) : 0;

    // Determine Top Spending Category
    let topCategory = 'None';
    let maxCategoryAmt = 0;
    Object.keys(categoryBreakdown).forEach(cat => {
      if (categoryBreakdown[cat] > maxCategoryAmt) {
        maxCategoryAmt = categoryBreakdown[cat];
        topCategory = cat;
      }
    });

    // 4. Monthly Trend (Bar Chart Data - Last 6 Months)
    const monthlyTrends = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const mYear = d.getFullYear();
      const mMonth = d.getMonth() + 1;
      const mStr = `${mYear}-${String(mMonth).padStart(2, '0')}`;

      const start = new Date(`${mStr}-01T00:00:00.000Z`);
      const end = new Date(Date.UTC(mYear, mMonth, 0, 23, 59, 59, 999));

      const mExpenses = await Expense.find({
        user: userId,
        date: { $gte: start, $lte: end }
      });

      const mTotal = mExpenses.reduce((acc, exp) => acc + exp.amount, 0);

      // Get month name abbreviation
      const monthName = d.toLocaleString('default', { month: 'short' });
      monthlyTrends.push({
        monthStr: mStr,
        label: `${monthName} ${mYear}`,
        amount: mTotal
      });
    }

    // 5. Weekly Comparison (This Week vs Last Week)
    const oneDay = 24 * 60 * 60 * 1000;
    const nowMs = today.getTime();
    
    const startOfThisWeek = new Date(nowMs - 7 * oneDay);
    const startOfLastWeek = new Date(nowMs - 14 * oneDay);

    const thisWeekExpenses = await Expense.find({
      user: userId,
      date: { $gte: startOfThisWeek, $lte: today }
    });

    const lastWeekExpenses = await Expense.find({
      user: userId,
      date: { $gte: startOfLastWeek, $lt: startOfThisWeek }
    });

    const thisWeekTotal = thisWeekExpenses.reduce((acc, exp) => acc + exp.amount, 0);
    const lastWeekTotal = lastWeekExpenses.reduce((acc, exp) => acc + exp.amount, 0);

    // 6. Generate Smart Spending Suggestions
    const suggestions = [];

    if (budgetLimit > 0) {
      if (totalSpent > budgetLimit) {
        suggestions.push(`Budget exceeded! You are overspending by ${formatRupees(totalSpent - budgetLimit)}. Avoid all non-essential shopping.`);
      } else if (totalSpent >= budgetLimit * 0.9) {
        suggestions.push(`You have consumed 90% or more of your monthly budget. Pause non-essential entertainment and shopping.`);
      } else if (totalSpent < budgetLimit * 0.5 && today.getDate() > 15) {
        suggestions.push(`Great job! You've spent only ${( (totalSpent / budgetLimit) * 100 ).toFixed(0)}% of your budget, and the month is more than half over. You are on track to save!`);
      }
    } else {
      suggestions.push('You have not set a monthly budget. Setting a budget helps you analyze and restrict unnecessary expenses.');
    }

    // Category percentage checks
    if (totalSpent > 0) {
      const foodPct = (categoryBreakdown['Food'] / totalSpent) * 100;
      const entPct = (categoryBreakdown['Entertainment'] / totalSpent) * 100;
      const shopPct = (categoryBreakdown['Shopping'] / totalSpent) * 100;

      if (foodPct > 35) {
        suggestions.push(`You are spending a large portion of your money on Food (${foodPct.toFixed(0)}%). Consider meal prepping or using the campus dining hall to save.`);
      }
      if (entPct > 20) {
        suggestions.push(`Entertainment accounts for ${entPct.toFixed(0)}% of your expenses. Try reducing streaming subscriptions or seeking out free student activities.`);
      }
      if (shopPct > 25) {
        suggestions.push(`Shopping is taking up ${shopPct.toFixed(0)}% of your budget. Try the 24-hour cooling-off rule before buying non-essential items.`);
      }
    }

    // Weekly comparison check
    if (thisWeekTotal > lastWeekTotal && lastWeekTotal > 0) {
      const pctIncrease = ((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100;
      suggestions.push(`Your expenses increased by ${formatRupees(thisWeekTotal - lastWeekTotal)} (${pctIncrease.toFixed(0)}%) this week compared to last week. Review your recent transactions.`);
    } else if (thisWeekTotal < lastWeekTotal && thisWeekTotal > 0) {
      suggestions.push(`Excellent! You spent less this week (${formatRupees(thisWeekTotal)}) than last week (${formatRupees(lastWeekTotal)}). Keep up the good financial discipline.`);
    }

    // If no specific warnings, give general college student money tips
    if (suggestions.length <= 1) {
      suggestions.push('Tip: Always ask for student discounts when shopping or buying transit tickets.');
      suggestions.push('Tip: Buy used textbooks or rent them instead of purchasing new ones.');
    }

    res.json({
      success: true,
      data: {
        summary: {
          totalSpent,
          budgetLimit,
          remainingBudget,
          topCategory,
          topCategoryAmount: maxCategoryAmt
        },
        categoryBreakdown,
        monthlyTrends,
        weeklyComparison: {
          thisWeekTotal,
          lastWeekTotal,
          increased: thisWeekTotal > lastWeekTotal,
          difference: Math.abs(thisWeekTotal - lastWeekTotal)
        },
        suggestions
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAnalytics
};
