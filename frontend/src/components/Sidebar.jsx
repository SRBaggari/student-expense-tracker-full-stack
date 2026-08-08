import React from 'react';
import { NavLink } from 'react-router-dom';
import authService from '../services/authService';
import '../css/Navbar.css';

const Sidebar = ({ isOpen, onClose }) => {
  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      authService.logout();
    }
  };

  const getLinkClass = ({ isActive }) =>
    isActive ? 'sidebar-item active' : 'sidebar-item';

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <ul className="sidebar-menu">
        <li className={getLinkClass} onClick={onClose}>
          <NavLink to="/dashboard">
            <span className="sidebar-icon">🏠</span>
            <span>Dashboard</span>
          </NavLink>
        </li>
        <li className={getLinkClass} onClick={onClose}>
          <NavLink to="/analytics">
            <span className="sidebar-icon">📊</span>
            <span>Analytics</span>
          </NavLink>
        </li>
        <li className={getLinkClass} onClick={onClose}>
          <NavLink to="/profile">
            <span className="sidebar-icon">👤</span>
            <span>Profile & Budget</span>
          </NavLink>
        </li>
      </ul>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="btn-logout">
          <span className="sidebar-icon">🚪</span>
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
