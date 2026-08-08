import api from './api';

const authService = {
  // Register a new user
  register: async (name, email, password) => {
    const response = await api.post('/auth/register', { name, email, password });
    if (response.data.success && response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify({
        _id: response.data.data._id,
        name: response.data.data.name,
        email: response.data.data.email
      }));
    }
    return response.data;
  },

  // Login existing user
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.success && response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify({
        _id: response.data.data._id,
        name: response.data.data.name,
        email: response.data.data.email
      }));
    }
    return response.data;
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  },

  // Get current user profile from DB
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  // Retrieve user details stored locally
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) return JSON.parse(userStr);
    return null;
  },

  // Check if token exists
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};

export default authService;
