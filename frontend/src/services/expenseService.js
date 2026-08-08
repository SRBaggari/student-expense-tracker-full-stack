import api from './api';

const expenseService = {
  // Fetch expenses with optional filters
  getExpenses: async (filters = {}) => {
    const { category, search, month } = filters;
    let queryParams = [];

    if (category) queryParams.push(`category=${encodeURIComponent(category)}`);
    if (search) queryParams.push(`search=${encodeURIComponent(search)}`);
    if (month) queryParams.push(`month=${encodeURIComponent(month)}`);

    const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
    const response = await api.get(`/expenses${queryString}`);
    return response.data;
  },

  // Create a new expense
  addExpense: async (expenseData) => {
    const response = await api.post('/expenses', expenseData);
    return response.data;
  },

  // Update an existing expense
  updateExpense: async (id, expenseData) => {
    const response = await api.put(`/expenses/${id}`, expenseData);
    return response.data;
  },

  // Delete an expense
  deleteExpense: async (id) => {
    const response = await api.delete(`/expenses/${id}`);
    return response.data;
  }
};

export default expenseService;
