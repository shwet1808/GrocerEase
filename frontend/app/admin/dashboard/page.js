"use client";
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const { token, logout } = useAuth(); // We need the secure token to pass to the Bouncer!
  const [stats, setStats] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      if (!token) return; // Don't try fetching if wait for token

      try {
        const response = await fetch('http://localhost:5000/api/dashboard', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // 🚨 We attach the digital ID card to the HTTP Header!
            'Authorization': `Bearer ${token}` 
          }
        });

        // Did our Bouncer kick us out? (Maybe token expired)
        if (response.status === 401 || response.status === 403) {
           logout();
           return;
        }

        if (!response.ok) {
          throw new Error('Failed to load dashboard data');
        }

        const data = await response.json();
        setStats(data); // `data` contains { overview: {...}, lowStockAlerts: [...] }

      } catch (err) {
        setErrorMsg(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, [token, logout]);

  if (loading) return <div className="loading-state">Loading Financial Data...</div>;
  if (errorMsg) return <div className="error-badge">{errorMsg}</div>;
  if (!stats) return null;

  return (
    <div className="dashboard-wrapper">
      <div className="dash-header">
        <h2>Store Overview</h2>
        <p>Live metrics compiled directly from the MySQL engine.</p>
      </div>

      {/* 4 Beautiful KPI Cards */}
      <div className="kpi-grid">
        <div className="glass-card stat-card">
          <p className="stat-title">Total Products</p>
          <h3 className="stat-value">{stats.overview.totalProducts}</h3>
        </div>
        
        <div className="glass-card stat-card">
          <p className="stat-title">Total Orders</p>
          <h3 className="stat-value">{stats.overview.totalOrders}</h3>
        </div>

        <div className="glass-card stat-card revenue-card">
          <p className="stat-title">Gross Revenue</p>
          <h3 className="stat-value">${stats.overview.totalRevenue.toFixed(2)}</h3>
        </div>

        <div className="glass-card stat-card profit-card">
          <p className="stat-title">Net Profit</p>
          <h3 className="stat-value">${stats.overview.profit.toFixed(2)}</h3>
        </div>
      </div>

      <div className="alerts-section">
        <h3>📈 Sales & Profit Trend (Last 30 Days)</h3>
        <div className="glass-card chart-container">
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={stats.salesGraph} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="date" stroke="#64748B" tickMargin={10} />
              <YAxis stroke="#64748B" tickFormatter={(value) => `$${value}`} />
              <Tooltip 
                contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                formatter={(value) => [`$${Number(value).toFixed(2)}`, undefined]}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }}/>
              <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={3} activeDot={{ r: 8 }} name="Gross Revenue" />
              <Line type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={3} name="Net Profit" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="alerts-section" style={{ marginTop: '3rem' }}>
        <h3>🚨 Low Stock Alerts (Needs Restock)</h3>
        
        {stats.lowStockAlerts.length === 0 ? (
           <p className="all-good-msg">All items are beautifully stocked. No action needed.</p>
        ) : (
          <div className="glass-card table-wrapper">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>Product ID</th>
                  <th>Product Name</th>
                  <th>Current Stock</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.lowStockAlerts.map(item => (
                  <tr key={item.id}>
                    <td>#{item.id}</td>
                    <td className="item-name">{item.name}</td>
                    <td className="item-stock">{item.stock_quantity} units</td>
                    <td>
                      <span className={`status-badge ${item.stock_quantity === 0 ? 'critical' : 'warning'}`}>
                        {item.stock_quantity === 0 ? 'OUT OF STOCK' : 'LOW SUPPLY'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style jsx>{`
        .dashboard-wrapper {
          animation: slideUp 0.6s ease-out;
        }

        .dash-header {
          margin-bottom: 2rem;
        }

        .dash-header h2 {
          font-size: 2rem;
          color: var(--color-dark);
          letter-spacing: -1px;
          margin-bottom: 0.25rem;
        }

        .dash-header p {
          color: #64748B;
          font-size: 1.1rem;
        }

        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }

        .stat-card {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          transition: transform 0.2s;
        }
        
        .stat-card:hover {
          transform: translateY(-5px);
        }

        .stat-title {
          font-size: 0.9rem;
          color: #64748B;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 500;
          margin-bottom: 0.5rem;
        }

        .stat-value {
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--color-dark);
          line-height: 1;
        }

        /* Specialized card colors */
        .revenue-card .stat-value {
          color: var(--color-primary-dark);
        }

        .profit-card {
          position: relative;
          overflow: hidden;
        }
        
        .profit-card::after {
          content: "";
          position: absolute;
          top: 0; left: 0; width: 100%; height: 4px;
          background: linear-gradient(90deg, #10B981, #34D399);
        }

        /* Chart Styling */
        .chart-container {
          padding: 2rem 1rem 1rem 0; 
          margin-bottom: 2rem;
        }

        /* Table Styling */
        .alerts-section h3 {
          font-size: 1.5rem;
          color: #0F172A;
          margin-bottom: 1.5rem;
        }

        .table-wrapper {
          padding: 0;
          overflow: hidden;
        }

        .inventory-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .inventory-table th {
          padding: 1.25rem 1.5rem;
          background-color: #F8FAFC;
          color: #475569;
          font-weight: 600;
          border-bottom: 1px solid #E2E8F0;
        }

        .inventory-table td {
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #F1F5F9;
          color: #334155;
        }

        .item-name {
          font-weight: 500;
        }

        .item-stock {
          font-variant-numeric: tabular-nums; /* Makes numbers align perfectly */
        }

        /* Dynamic Badges */
        .status-badge {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.25rem 0.75rem;
          border-radius: 999px;
          letter-spacing: 0.5px;
        }

        .status-badge.critical {
          background-color: #FEF2F2;
          color: #DC2626;
          border: 1px solid #FECACA;
        }

        .status-badge.warning {
          background-color: #FFFBEB;
          color: #D97706;
          border: 1px solid #FDE68A;
        }

        .all-good-msg {
          padding: 2rem;
          background: #ECFDF5;
          color: #065F46;
          border-radius: var(--radius-lg);
          font-weight: 500;
          text-align: center;
        }

        .loading-state, .error-badge {
          padding: 3rem;
          text-align: center;
          font-size: 1.2rem;
          color: #64748B;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
