import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import '../css/Auth.css';

const Home = () => {
  const navigate = useNavigate();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (authService.isAuthenticated()) {
      navigate('/dashboard');
    }
  }, [navigate]);

  return (
    <div className="hero-container">
      <div className="hero-logo">🎓</div>
      <h1 className="hero-title">Student Expense Tracker</h1>
      <p className="hero-subtitle">
        Master your money, plan monthly budgets, analyze category spending, and receive smart tips tailored for college students.
      </p>

      <div className="hero-buttons">
        <Link to="/login" className="btn btn-primary">
          Sign In
        </Link>
        <Link to="/register" className="btn btn-outline">
          Create Account
        </Link>
      </div>

      <div className="features-grid">
        <div className="card feature-card card-hover">
          <span className="feature-icon">📊</span>
          <h3>Analytics & Charts</h3>
          <p>Visualize where your money goes with pie charts and track monthly spending trends over time.</p>
        </div>

        <div className="card feature-card card-hover">
          <span className="feature-icon">💸</span>
          <h3>Budget Thresholds</h3>
          <p>Set a monthly budget limit and receive notifications immediately if you overspend.</p>
        </div>

        <div className="card feature-card card-hover">
          <span className="feature-icon">💡</span>
          <h3>Smart Spending Tips</h3>
          <p>Receive rule-based recommendations on how to cut back and save on books, food, and shopping.</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
