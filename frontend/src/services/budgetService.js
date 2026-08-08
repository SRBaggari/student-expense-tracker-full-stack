import api from './api';

const budgetService = {
  // Fetch budget for a specific month (format YYYY-MM)
  getBudget: async (month) => {
    const url = month ? `/budget?month=${encodeURIComponent(month)}` : '/budget';
    const response = await api.get(url);
    return response.data;
  },

  // Set or update a budget
  setBudget: async (budgetData) => {
    // budgetData: { limit, categoryLimits, month }
    const response = await api.post('/budget', budgetData);
    return response.data;
  }
};

export default budgetService;
