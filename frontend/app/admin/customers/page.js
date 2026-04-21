"use client";
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';

export default function CustomerCRM() {
  const { token, logout } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      if (!token) return;

      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const response = await fetch(`${API_URL}/api/users`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.status === 401 || response.status === 403) {
          logout();
          return;
        }

        const json = await response.json();
        setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [token, logout]);

  if (loading) return <div className="loading-state">Loading Customer Data...</div>;
  if (!data) return null;

  return (
    <div className="crm-wrapper">
      <div className="crm-header">
        <h2>Customer CRM</h2>
        <p>Manage registered accounts and staff roles.</p>
      </div>

      <div className="kpi-grid">
        <div className="glass-card stat-card">
          <p className="stat-title">Active Customers</p>
          <h3 className="stat-value">{data.metrics.totalCustomers}</h3>
        </div>
        <div className="glass-card stat-card admin-kpi">
          <p className="stat-title">Staff / Admins</p>
          <h3 className="stat-value">{data.metrics.totalAdmins}</h3>
        </div>
      </div>

      <div className="glass-card table-wrapper">
        <table className="crm-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email Address</th>
              <th>Join Date</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {data.users.map(user => (
              <tr key={user.id}>
                <td>#{user.id}</td>
                <td className="user-name">{user.name}</td>
                <td>{user.email}</td>
                <td className="user-date">{user.joined_date}</td>
                <td>
                  <span className={`role-badge ${user.role}`}>
                    {user.role}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .crm-wrapper { animation: fadeIn 0.4s ease-out; }
        
        .crm-header { margin-bottom: 2rem; }
        .crm-header h2 { font-size: 2rem; color: var(--color-dark); margin-bottom: 0.25rem; }
        .crm-header p { color: #64748B; font-size: 1.1rem; }

        .kpi-grid { display: flex; gap: 1.5rem; margin-bottom: 2rem; }
        .stat-card { padding: 1.5rem; min-width: 250px; }
        .stat-title { font-size: 0.9rem; color: #64748B; text-transform: uppercase; font-weight: 500; margin-bottom: 0.5rem; }
        .stat-value { font-size: 2.5rem; font-weight: 700; color: var(--color-dark); }
        .admin-kpi .stat-value { color: #8B5CF6; } /* Purple for Staff */

        .table-wrapper { overflow: hidden; padding: 0; }
        .crm-table { width: 100%; border-collapse: collapse; text-align: left; }
        .crm-table th { padding: 1.25rem 1.5rem; background: #F8FAFC; color: #475569; border-bottom: 1px solid #E2E8F0; }
        .crm-table td { padding: 1rem 1.5rem; border-bottom: 1px solid #F1F5F9; color: #334155; }
        .user-name { font-weight: 600; color: var(--color-dark); }
        .user-date { color: #64748B; font-size: 0.9rem; }

        .role-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
        }
        .role-badge.admin { background: #EDE9FE; color: #7C3AED; border: 1px solid #DDD6FE; }
        .role-badge.customer { background: #E0F2FE; color: #0284C7; border: 1px solid #BAE6FD; }

        .loading-state { padding: 3rem; text-align: center; color: #64748B; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}
