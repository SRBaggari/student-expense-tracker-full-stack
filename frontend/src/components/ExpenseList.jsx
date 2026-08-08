import React from 'react';
import { formatRupees } from '../utils/currencyFormatter';
import '../css/Dashboard.css';

const ExpenseList = ({
  expenses,
  loading,
  filters,
  onFilterChange,
  onEdit,
  onDelete
}) => {
  const categories = ['All', 'Food', 'Transport', 'Books', 'Entertainment', 'Shopping', 'Others'];

  const getCategoryBadgeClass = (category) => {
    switch (category.toLowerCase()) {
      case 'food': return 'expense-category-badge badge-food';
      case 'transport': return 'expense-category-badge badge-transport';
      case 'books': return 'expense-category-badge badge-books';
      case 'entertainment': return 'expense-category-badge badge-entertainment';
      case 'shopping': return 'expense-category-badge badge-shopping';
      default: return 'expense-category-badge badge-others';
    }
  };

  const handleSearchChange = (e) => {
    onFilterChange({ ...filters, search: e.target.value });
  };

  const handleCategoryChange = (e) => {
    const val = e.target.value === 'All' ? '' : e.target.value;
    onFilterChange({ ...filters, category: val });
  };

  const handleMonthChange = (e) => {
    onFilterChange({ ...filters, month: e.target.value });
  };

  return (
    <div>
      {/* Filtering Section */}
      <div className="filters-panel">
        <div className="filter-item">
          <input
            type="text"
            className="form-control"
            placeholder="🔍 Search title..."
            value={filters.search}
            onChange={handleSearchChange}
          />
        </div>

        <div className="filter-item">
          <select
            className="form-control"
            value={filters.category || 'All'}
            onChange={handleCategoryChange}
            aria-label="Category Filter"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'All' ? '📂 All Categories' : cat}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-item">
          <input
            type="month"
            className="form-control"
            value={filters.month}
            onChange={handleMonthChange}
            aria-label="Month Filter"
          />
        </div>
      </div>

      {/* Expenses Table */}
      <div className="card">
        {loading ? (
          <div className="flex-center" style={{ padding: '3rem 0' }}>
            <div className="spinner"></div>
          </div>
        ) : expenses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--neutral-body)' }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>💸</span>
            <p>No expenses found matching the criteria.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Amount</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense._id} className="expense-row">
                    <td style={{ fontWeight: '600', color: 'var(--neutral-dark)' }}>
                      {expense.title}
                    </td>
                    <td style={{ fontWeight: '600', color: 'var(--neutral-dark)' }}>
                      {formatRupees(expense.amount)}
                    </td>
                    <td>
                      <span className={getCategoryBadgeClass(expense.category)}>
                        {expense.category}
                      </span>
                    </td>
                    <td>
                      {(() => {
                        const d = new Date(expense.date);
                        return `${String(d.getUTCMonth() + 1).padStart(2, '0')}/${String(d.getUTCDate()).padStart(2, '0')}/${d.getUTCFullYear()}`;
                      })()}
                    </td>
                    <td style={{ fontSize: '0.85rem', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={expense.notes}>
                      {expense.notes || '-'}
                    </td>
                    <td>
                      <div className="expense-actions">
                        <button
                          className="action-btn edit"
                          onClick={() => onEdit(expense)}
                          title="Edit expense"
                        >
                          ✏️
                        </button>
                        <button
                          className="action-btn delete"
                          onClick={() => onDelete(expense._id)}
                          title="Delete expense"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseList;
