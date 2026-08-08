import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import authService from '../services/authService';
import api from '../services/api';
import '../css/Navbar.css';

const Navbar = ({ onToggleSidebar }) => {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch current user details
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, []);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!authService.isAuthenticated()) return;
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Poll for notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = async () => {
    try {
      const res = await api.put('/notifications/mark-all-read');
      if (res.data.success) {
        // Optimistically set all local notifications to read
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      }
    } catch (err) {
      console.error('Error marking notifications as read:', err);
    }
  };

  const handleNotificationClick = async (id, index) => {
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
      console.error('Error marking notification as read:', err);
    }
  };

  return (
    <nav className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button className="menu-toggle" onClick={onToggleSidebar} aria-label="Toggle Sidebar">
          ☰
        </button>
        <Link to="/" className="navbar-brand">
          <span>🎓</span> Student Expense Tracker
        </Link>
      </div>

      <div className="navbar-actions">
        {/* Notifications Bell */}
        {authService.isAuthenticated() && (
          <div className="notification-bell-container" ref={dropdownRef}>
            <button
              className="btn btn-link notification-bell"
              onClick={() => setShowDropdown(!showDropdown)}
              aria-label="Notifications"
            >
              🔔
              {unreadCount > 0 && <span className="badge-count">{unreadCount}</span>}
            </button>

            {showDropdown && (
              <div className="notification-dropdown">
                <div className="dropdown-header">
                  <h4>Alerts & Notifications</h4>
                  {unreadCount > 0 && (
                    <button className="btn-link" onClick={handleMarkAllRead}>
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="dropdown-body">
                  {notifications.length === 0 ? (
                    <div className="dropdown-empty">No notifications yet.</div>
                  ) : (
                    notifications.map((notif, index) => (
                      <div
                        key={notif._id}
                        className={`dropdown-item ${!notif.read ? 'unread' : ''}`}
                        onClick={() => handleNotificationClick(notif._id, index)}
                      >
                        <p>{notif.message}</p>
                        <div className="dropdown-item-meta">
                          <span>Type: {notif.type}</span>
                          <span>{new Date(notif.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="dropdown-footer">
                  <Link to="/profile" className="btn-link" onClick={() => setShowDropdown(false)}>
                    View All Notifications
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* User profile identifier */}
        {user && (
          <div className="nav-user">
            <div className="user-avatar">{user.name.charAt(0).toUpperCase()}</div>
            <span style={{ fontSize: '0.9rem' }}>{user.name.split(' ')[0]}</span>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
