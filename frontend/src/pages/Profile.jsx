import React, { useState, useEffect } from 'react';
import authService from '../services/authService';
import budgetService from '../services/budgetService';
import api from '../services/api';
import '../css/Profile.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [budgetLimit, setBudgetLimit] = useState('');
  const [categoryLimits, setCategoryLimits] = useState({
    Food: '',
    Transport: '',
    Books: '',
    Entertainment: '',
    Shopping: '',
    Others: ''
  });
  
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const today = new Date();
  const currentMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

  const categories = ['Food', 'Transport', 'Books', 'Entertainment', 'Shopping', 'Others'];

  // Load profile, budget, and notifications
  const loadProfileData = async () => {
    setLoading(true);
    try {
      // 1. Local user details
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);

      // 2. Fetch Budget
      const budgetRes = await budgetService.getBudget(currentMonthStr);
      if (budgetRes.success && budgetRes.data) {
        setBudgetLimit(budgetRes.data.limit || '');
        
        // Populate category limits
        const catLimits = budgetRes.data.categoryLimits || {};
        const populatedCats = {};
        categories.forEach(cat => {
          // If Category limit exists, map it. Otherwise keep empty string.
          // Note: categoryLimits in Mongoose map key to value, so we check using map syntax or bracket syntax depending on serialization
          populatedCats[cat] = catLimits[cat] || '';
        });
        setCategoryLimits(populatedCats);
      }

      // 3. Fetch Notifications
      await loadNotificationsOnly();
    } catch (err) {
      console.error('Error loading profile data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadNotificationsOnly = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.data);
      }
    } catch (err) {
      console.error('Error loading notifications:', err);
    }
  };

  useEffect(() => {
    loadProfileData();
  }, []);

  const handleBudgetSubmit = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Clean up category limits (remove empty strings)
      const cleanCategoryLimits = {};
      Object.keys(categoryLimits).forEach(cat => {
        if (categoryLimits[cat] !== '') {
          cleanCategoryLimits[cat] = parseFloat(categoryLimits[cat]);
        }
      });

      const budgetData = {
        limit: parseFloat(budgetLimit) || 0,
        categoryLimits: cleanCategoryLimits,
        month: currentMonthStr
      };

      const res = await budgetService.setBudget(budgetData);
      if (res.success) {
        setMessage({ type: 'success', text: 'Budget configurations updated successfully!' });
        
        // Reload notifications because updating the budget might trigger warning clear/creations
        setTimeout(loadNotificationsOnly, 1000);
      } else {
        setMessage({ type: 'danger', text: res.message || 'Failed to update budget' });
      }
    } catch (err) {
      setMessage({
        type: 'danger',
        text: err.response?.data?.message || 'Error occurred while saving configurations'
      });
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCategoryLimitChange = (cat, val) => {
    setCategoryLimits(prev => ({
      ...prev,
      [cat]: val
    }));
  };

  const handleMarkRead = async (id, index) => {
    try {
      const res = await api.put(`/notifications/${id}`);
      if (res.data.success) {
        setNotifications(prev => {
          const updated = [...prev];
          updated[index].read = true;
          return updated;
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await api.put('/notifications/mark-all-read');
      if (res.data.success) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      const res = await api.delete(`/notifications/${id}`);
      if (res.data.success) {
        setNotifications(prev => prev.filter(n => n._id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getNotifClass = (notif) => {
    let classes = 'notification-center-item';
    if (notif.read) classes += ' read';
    if (notif.type === 'danger') classes += ' danger';
    else if (notif.type === 'warning') classes += ' warning';
    else if (notif.type === 'success') classes += ' success';
    return classes;
  };

  const getNotifIcon = (type) => {
    if (type === 'danger') return '🚨';
    if (type === 'warning') return '⚠️';
    if (type === 'success') return '🏆';
    return '💡';
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '60vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="profile-layout fade-in">
      {/* Left Column: User Profile Details & Budget Limits Form */}
      <div>
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="user-info-section">
            <div className="profile-avatar-large">
              {user ? user.name.charAt(0).toUpperCase() : 'S'}
            </div>
            <div className="user-info-text">
              <h3>{user ? user.name : 'Student Name'}</h3>
              <p>✉️ {user ? user.email : 'student@university.edu'}</p>
              <p style={{ marginTop: '0.25rem', fontSize: '0.8rem' }}>
                Member Since: {user ? new Date(user.createdAt).toLocaleDateString() : 'Today'}
              </p>
            </div>
          </div>

          <form onSubmit={handleBudgetSubmit}>
            <h3 style={{ marginBottom: '1rem' }}>🎯 Set Monthly Budget limits</h3>
            <p style={{ color: 'var(--neutral-body)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Set budget goals for the current month <strong>({currentMonthStr})</strong>. Overspending notifications will be triggered instantly based on these numbers.
            </p>

            {message.text && (
              <div className={`alert alert-${message.type}`}>
                <span>{message.text}</span>
                <button type="button" onClick={() => setMessage({ type: '', text: '' })} className="alert-close">×</button>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="overall-limit">Total Monthly Budget Limit (₹)</label>
              <input
                id="overall-limit"
                type="number"
                step="1"
                placeholder="e.g., 500"
                className="form-control"
                value={budgetLimit}
                onChange={(e) => setBudgetLimit(e.target.value)}
              />
            </div>

            <h4 style={{ marginTop: '1.5rem', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
              📂 Category-Specific Budget Limits (Optional)
            </h4>
            <p style={{ color: 'var(--neutral-body)', fontSize: '0.8rem' }}>
              Assign caps to specific category items to prevent micro-overspending.
            </p>

            <div className="category-limits-grid">
              {categories.map(cat => (
                <div key={cat} className="category-limit-field">
                  <label htmlFor={`limit-${cat}`}>{cat} (₹)</label>
                  <input
                    id={`limit-${cat}`}
                    type="number"
                    step="1"
                    placeholder="None"
                    value={categoryLimits[cat]}
                    onChange={(e) => handleCategoryLimitChange(cat, e.target.value)}
                  />
                </div>
              ))}
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ marginTop: '2rem', width: '100%' }}
              disabled={saveLoading}
            >
              {saveLoading ? 'Updating configurations...' : 'Save Budget Settings'}
            </button>
          </form>
        </div>
      </div>

      {/* Right Column: Notification Log Center */}
      <div>
        <div className="card notification-center-card">
          <div className="notification-center-header">
            <h3>🔔 Alert Center</h3>
            {notifications.filter(n => !n.read).length > 0 && (
              <button className="btn-link" onClick={handleMarkAllRead}>
                Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--neutral-body)' }}>
              <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>📭</span>
              <p>Your log is empty. Overspending alerts will be listed here.</p>
            </div>
          ) : (
            <div className="notification-center-list">
              {notifications.map((notif, index) => (
                <div key={notif._id} className={getNotifClass(notif)}>
                  <span style={{ fontSize: '1.2rem', marginTop: '0.2rem' }}>
                    {getNotifIcon(notif.type)}
                  </span>
                  
                  <div className="notification-center-content">
                    <p className="notification-center-msg">{notif.message}</p>
                    <span className="notification-center-time">
                      📅 {new Date(notif.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.25rem', alignSelf: 'center' }}>
                    {!notif.read && (
                      <button
                        onClick={() => handleMarkRead(notif._id, index)}
                        className="btn-icon-action check"
                        title="Mark as read"
                      >
                        ✔️
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteNotification(notif._id)}
                      className="btn-icon-action delete"
                      title="Delete alert"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
