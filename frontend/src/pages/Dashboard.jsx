import React, { useState, useEffect } from 'react';
import expenseService from '../services/expenseService';
import budgetService from '../services/budgetService';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';
import { formatRupees } from '../utils/currencyFormatter';
import '../css/Dashboard.css';

const Dashboard = () => {
  const [expenses, setExpenses] = useState([]);
  const [budget, setBudget] = useState({ limit: 0, categoryLimits: {} });
  const [loading, setLoading] = useState(true);
  const [expensesLoading, setExpensesLoading] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  
  // Set current month YYYY-MM by default
  const today = new Date();
  const currentMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

  const [filters, setFilters] = useState({
    search: '',
    category: '',
    month: currentMonthStr
  });

  // Derived dashboard metrics
  const [totalSpent, setTotalSpent] = useState(0);
  const [topCategory, setTopCategory] = useState({ name: 'None', amount: 0 });

  // Fetch both budget and expenses
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Budget
      const budgetRes = await budgetService.getBudget(filters.month);
      if (budgetRes.success) {
        setBudget(budgetRes.data);
      }

      // 2. Fetch Expenses
      await loadExpensesOnly();
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadExpensesOnly = async () => {
    setExpensesLoading(true);
    try {
      const expenseRes = await expenseService.getExpenses(filters);
      if (expenseRes.success) {
        setExpenses(expenseRes.data);
        
        // Calculate total spent & top category for the current selected filter criteria
        const sum = expenseRes.data.reduce((acc, exp) => acc + exp.amount, 0);
        setTotalSpent(sum);

        // Find top category
        const catMap = {};
        expenseRes.data.forEach((exp) => {
          catMap[exp.category] = (catMap[exp.category] || 0) + exp.amount;
        });

        let topCatName = 'None';
        let topCatAmt = 0;
        Object.keys(catMap).forEach((cat) => {
          if (catMap[cat] > topCatAmt) {
            topCatAmt = catMap[cat];
            topCatName = cat;
          }
        });
        setTopCategory({ name: topCatName, amount: topCatAmt });
      }
    } catch (err) {
      console.error('Error fetching expenses:', err);
    } finally {
      setExpensesLoading(false);
    }
  };

  // Re-run whenever month changes (since budget is tied to month)
  useEffect(() => {
    loadDashboardData();
  }, [filters.month]);

  // Re-run for search & category filters on the current loaded month
  useEffect(() => {
    loadExpensesOnly();
  }, [filters.search, filters.category]);

  const handleSave = () => {
    setSelectedExpense(null);
    loadDashboardData(); // Reload everything to update limits & alerts
  };

  const handleEdit = (expense) => {
    setSelectedExpense(expense);
    // Scroll to form smoothly on mobile
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        const res = await expenseService.deleteExpense(id);
        if (res.success) {
          loadDashboardData();
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete expense');
      }
    }
  };

  const remainingBudget = budget.limit > 0 ? budget.limit - totalSpent : 0;
  const percentUsed = budget.limit > 0 ? (totalSpent / budget.limit) * 100 : 0;
  const isOverspent = budget.limit > 0 && totalSpent > budget.limit;
  const isNearLimit = budget.limit > 0 && totalSpent >= budget.limit * 0.9 && totalSpent <= budget.limit;

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2>🏠 Financial Dashboard</h2>
        <span style={{ fontSize: '0.95rem', color: 'var(--neutral-body)', fontWeight: 500 }}>
          Reporting Month: <strong>{filters.month}</strong>
        </span>
      </div>

      {/* Overspending alerts */}
      {isOverspent && (
        <div className="overspending-warning">
          <span className="overspending-warning-icon">🚨</span>
          <div>
            <strong>Budget Exceeded Alert!</strong> You have spent <strong>{formatRupees(totalSpent)}</strong> which exceeds your monthly limit of <strong>{formatRupees(budget.limit)}</strong> by <strong>{formatRupees(totalSpent - budget.limit)}</strong>.
          </div>
        </div>
      )}

      {isNearLimit && (
        <div className="overspending-warning" style={{ backgroundColor: 'var(--warning-light)', color: 'var(--warning-amber)', borderColor: 'rgba(245, 124, 0, 0.2)' }}>
          <span className="overspending-warning-icon">⚠️</span>
          <div>
            <strong>Budget Warning!</strong> You have spent over 90% of your budget limit. Total spent: <strong>{formatRupees(totalSpent)}</strong> of <strong>{formatRupees(budget.limit)}</strong>.
          </div>
        </div>
      )}

      {/* Metrics Cards Grid */}
      <div className="dashboard-grid">
        <div className="card metric-card total-summary-card">
          <div>
            <div className="metric-title" style={{ opacity: 0.9 }}>Total Expenses</div>
            <div className="metric-value">{formatRupees(totalSpent)}</div>
          </div>
          <span className="metric-icon">💰</span>
        </div>

        <div className="card metric-card budget">
          <div>
            <div className="metric-title">Monthly Budget</div>
            <div className="metric-value">
              {budget.limit > 0 ? formatRupees(budget.limit) : formatRupees(0)}
            </div>
          </div>
          <span className="metric-icon">🎯</span>
        </div>

        <div className="card metric-card remaining">
          <div>
            <div className="metric-title">Remaining Balance</div>
            <div className="metric-value" style={{ color: remainingBudget <= 0 && budget.limit > 0 ? 'var(--danger-red)' : 'var(--success-green)' }}>
              {formatRupees(remainingBudget)}
            </div>
          </div>
          <span className="metric-icon">⚖️</span>
        </div>

        <div className="card metric-card top-category">
          <div>
            <div className="metric-title">Top Spending Category</div>
            <div className="metric-value" style={{ fontSize: '1.4rem', margin: '0.8rem 0' }}>
              {topCategory.name}
            </div>
            {topCategory.name !== 'None' && (
              <span style={{ fontSize: '0.8rem', color: 'var(--neutral-body)', fontWeight: 500 }}>
                Spent: {formatRupees(topCategory.amount)}
              </span>
            )}
          </div>
          <span className="metric-icon">🏆</span>
        </div>
      </div>

      {/* Core Split Layout */}
      <div className="dashboard-layout">
        {/* Left Side: Expense Addition/Modification */}
        <div>
          <ExpenseForm
            selectedExpense={selectedExpense}
            onSave={handleSave}
            onCancel={() => setSelectedExpense(null)}
          />
        </div>

        {/* Right Side: List of Transactions */}
        <div>
          <div className="recent-expenses-header">
            <h3>Recent Expenses</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--neutral-body)' }}>
              Showing {expenses.length} records
            </span>
          </div>
          <ExpenseList
            expenses={expenses}
            loading={expensesLoading}
            filters={filters}
            onFilterChange={setFilters}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
