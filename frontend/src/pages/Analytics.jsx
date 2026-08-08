import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Pie, Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import generatePDFReport from '../utils/pdfGenerator';
import { formatRupees } from '../utils/currencyFormatter';
import '../css/Analytics.css';

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.get('/analytics');
      if (res.data.success) {
        setData(res.data.data);
      } else {
        setError('Failed to fetch analytics data');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleExportPDF = async () => {
    if (!data) return;
    setExporting(true);
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : { name: 'Student' };
      
      // Determine current month dynamically to grab active transactions
      const today = new Date();
      const currentMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
      
      const expenseRes = await api.get(`/expenses?month=${currentMonthStr}`);
      const expensesList = expenseRes.data?.data || [];
      
      generatePDFReport(user, data, expensesList);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Could not export PDF report. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '60vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        <span>{error}</span>
        <button onClick={fetchAnalytics} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.85rem' }}>Retry</button>
      </div>
    );
  }

  const { summary, categoryBreakdown, monthlyTrends, weeklyComparison, suggestions } = data;

  // Chart 1: Pie Chart Data (Category Breakdown)
  const categoryLabels = Object.keys(categoryBreakdown);
  const categoryValues = Object.values(categoryBreakdown);
  
  // Custom professional colors
  const categoryColors = {
    'Food': '#FF9F43',
    'Transport': '#0984E3',
    'Books': '#6C5CE7',
    'Entertainment': '#FD79A8',
    'Shopping': '#00B894',
    'Others': '#636E72'
  };
  const pieColors = categoryLabels.map(label => categoryColors[label] || '#636E72');

  const pieData = {
    labels: categoryLabels,
    datasets: [
      {
        data: categoryValues,
        backgroundColor: pieColors,
        borderWidth: 1
      }
    ]
  };

  const pieOptions = {
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 12,
          font: { family: 'Inter', size: 11 }
        }
      }
    },
    responsive: true,
    maintainAspectRatio: false
  };

  // Chart 2: Bar Chart Data (Monthly Trend)
  const barLabels = monthlyTrends.map(item => item.label);
  const barValues = monthlyTrends.map(item => item.amount);

  const barData = {
    labels: barLabels,
    datasets: [
      {
        label: 'Monthly Spending (₹)',
        data: barValues,
        backgroundColor: 'rgba(30, 136, 229, 0.85)',
        hoverBackgroundColor: '#1565c0',
        borderRadius: 6
      }
    ]
  };

  const barOptions = {
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          font: { family: 'Inter' }
        }
      },
      x: {
        ticks: {
          font: { family: 'Inter' }
        }
      }
    },
    plugins: {
      legend: { display: false }
    },
    responsive: true,
    maintainAspectRatio: false
  };

  const getSuggestionClass = (msg) => {
    const text = msg.toLowerCase();
    if (text.includes('exceeded') || text.includes('danger') || text.includes('overspending')) return 'suggestion-item danger';
    if (text.includes('warning') || text.includes('nearing') || text.includes('limit')) return 'suggestion-item warning';
    if (text.includes('great job') || text.includes('excellent') || text.includes('on track')) return 'suggestion-item success';
    return 'suggestion-item'; // Default info
  };

  const getSuggestionIcon = (msg) => {
    const text = msg.toLowerCase();
    if (text.includes('exceeded') || text.includes('danger') || text.includes('overspending')) return '🚨';
    if (text.includes('warning') || text.includes('nearing') || text.includes('limit')) return '⚠️';
    if (text.includes('great job') || text.includes('excellent') || text.includes('on track')) return '🏆';
    return '💡'; // Info
  };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>📊 Expense Analytics</h2>
          <p style={{ color: 'var(--neutral-body)', fontSize: '0.95rem' }}>Visual metrics and smart rule-based insights</p>
        </div>
        <button className="btn btn-primary" onClick={handleExportPDF} disabled={exporting}>
          {exporting ? 'Generating Report...' : '📥 Export PDF Report'}
        </button>
      </div>

      {/* Weekly Trend Banner */}
      <div className={`trend-summary-box ${weeklyComparison.increased ? 'increased' : ''}`}>
        <div>
          <div className="trend-metric-label">This Week's Spend</div>
          <div className="trend-metric-value">{formatRupees(weeklyComparison.thisWeekTotal)}</div>
        </div>
        <div style={{ fontSize: '2rem' }}>
          {weeklyComparison.increased ? '📈' : '📉'}
        </div>
        <div>
          <div className="trend-metric-label">Weekly Deviation</div>
          <div className="trend-metric-value">
            {weeklyComparison.increased ? '+' : '-'}{formatRupees(weeklyComparison.difference)}
          </div>
        </div>
        <div>
          <div className="trend-metric-label">Status</div>
          <div className="trend-metric-value" style={{ fontSize: '1rem', marginTop: '0.5rem' }}>
            {weeklyComparison.increased 
              ? 'Spending is up. Check suggestions.' 
              : 'Excellent! You saved money this week.'}
          </div>
        </div>
      </div>

      {/* Graph Panels */}
      <div className="analytics-grid">
        {/* Pie Chart */}
        <div className="card chart-card">
          <h3 className="chart-title">🍕 Category Spending</h3>
          {summary.totalSpent === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--neutral-body)', padding: '2rem' }}>
              No expenses registered for this month yet.
            </div>
          ) : (
            <div className="chart-container">
              <Pie data={pieData} options={pieOptions} />
            </div>
          )}
        </div>

        {/* Bar Chart */}
        <div className="card chart-card">
          <h3 className="chart-title">📈 Monthly Trend (Last 6 Months)</h3>
          <div className="chart-container bar-chart">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>
      </div>

      {/* Smart Spending Suggestions */}
      <div className="suggestions-panel">
        <h3 className="suggestions-title">💡 Smart Spending Suggestions</h3>
        
        {suggestions.length === 0 ? (
          <p className="suggestions-empty">All checkouts look healthy. Great job managing your budget!</p>
        ) : (
          <div className="suggestions-list">
            {suggestions.map((sug, i) => (
              <div key={i} className={getSuggestionClass(sug)}>
                <span className="suggestion-icon">{getSuggestionIcon(sug)}</span>
                <span className="suggestion-text">{sug}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
