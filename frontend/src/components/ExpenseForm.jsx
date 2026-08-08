import React, { useState, useEffect } from 'react';
import expenseService from '../services/expenseService';

const ExpenseForm = ({ selectedExpense, onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Categories list
  const categories = ['Food', 'Transport', 'Books', 'Entertainment', 'Shopping', 'Others'];

  // Set initial form values if editing
  useEffect(() => {
    if (selectedExpense) {
      setTitle(selectedExpense.title);
      setAmount(selectedExpense.amount);
      setCategory(selectedExpense.category);
      // Format Date to YYYY-MM-DD for input field
      const formattedDate = new Date(selectedExpense.date).toISOString().split('T')[0];
      setDate(formattedDate);
      setNotes(selectedExpense.notes || '');
    } else {
      // Set to defaults for new expense
      setTitle('');
      setAmount('');
      setCategory('Food');
      setDate(new Date().toISOString().split('T')[0]); // Current date
      setNotes('');
    }
    setError('');
  }, [selectedExpense]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      setError('Amount must be a positive number');
      return;
    }
    if (!date) {
      setError('Date is required');
      return;
    }

    setLoading(true);

    const expenseData = {
      title,
      amount: parseFloat(amount),
      category,
      date,
      notes
    };

    try {
      let data;
      if (selectedExpense) {
        // Edit Mode
        data = await expenseService.updateExpense(selectedExpense._id, expenseData);
      } else {
        // Add Mode
        data = await expenseService.addExpense(expenseData);
      }

      if (data.success) {
        onSave();
        // Clear form if adding new
        if (!selectedExpense) {
          setTitle('');
          setAmount('');
          setCategory('Food');
          setDate(new Date().toISOString().split('T')[0]);
          setNotes('');
        }
      } else {
        setError(data.message || 'Failed to save expense');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error occurred while saving');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3 className="form-title">{selectedExpense ? '📝 Edit Expense' : '➕ Add Expense'}</h3>
      
      {error && (
        <div className="alert alert-danger" style={{ padding: '0.5rem 1rem', marginBottom: '1rem' }}>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="exp-title">Title</label>
          <input
            id="exp-title"
            type="text"
            className="form-control"
            placeholder="e.g., Campus Lunch"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="exp-amount">Amount (₹)</label>
          <input
            id="exp-amount"
            type="number"
            step="0.01"
            className="form-control"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="exp-category">Category</label>
          <select
            id="exp-category"
            className="form-control"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="exp-date">Date</label>
          <input
            id="exp-date"
            type="date"
            className="form-control"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="exp-notes">Notes (Optional)</label>
          <textarea
            id="exp-notes"
            rows="3"
            className="form-control"
            placeholder="Add details (e.g., group split, purchase location)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          ></textarea>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </button>
          {selectedExpense && (
            <button type="button" className="btn btn-secondary" onClick={onCancel} style={{ flex: 1 }}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ExpenseForm;
