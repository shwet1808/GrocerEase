"use client";
import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const dummySalesData = [
  { name: 'Mon', sales: 4000, returns: 240 },
  { name: 'Tue', sales: 3000, returns: 139 },
  { name: 'Wed', sales: 2000, returns: 980 },
  { name: 'Thu', sales: 2780, returns: 390 },
  { name: 'Fri', sales: 1890, returns: 480 },
  { name: 'Sat', sales: 2390, returns: 380 },
  { name: 'Sun', sales: 3490, returns: 430 },
];

export default function AdminDashboard() {
  return (
    <div className="animate-stagger">
      <div className="header-flex">
        <div>
          <h2>Sales & Returns Overview</h2>
          <p style={{color: 'var(--color-muted)'}}>Graphical telemetry and manual returns oversight.</p>
        </div>
      </div>

      <div style={{display: 'flex', gap: '1.5rem', marginBottom: '2.5rem'}}>
        <div className="glass-panel stat-card">
          <p className="kpi-label">Weekly Net Sales</p>
          <h3>₹19,550.00</h3>
        </div>
        <div className="glass-panel stat-card">
          <p className="kpi-label">Return Frequency</p>
          <h3 style={{color: 'var(--color-accent)'}}>4.2%</h3>
        </div>
        <div className="glass-panel stat-card">
          <p className="kpi-label">Outstanding Value</p>
          <h3>₹3,030.00</h3>
        </div>
      </div>

      <div className="glass-panel" style={{padding: '2.5rem', marginBottom: '2.5rem'}}>
        <h4 style={{marginBottom: '1.5rem', color: 'var(--color-muted)', letterSpacing: '0.05em'}}>Revenue vs Returns</h4>
        <div style={{height: '350px'}}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dummySalesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-primary-light)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--color-primary-light)" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorReturns" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="var(--color-muted)" tick={{fill: 'var(--color-muted)'}} />
              <YAxis stroke="var(--color-muted)" tick={{fill: 'var(--color-muted)'}} />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
              <Tooltip 
                contentStyle={{background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)'}} 
              />
              <Area type="monotone" dataKey="sales" stroke="var(--color-primary)" fillOpacity={1} fill="url(#colorSales)" />
              <Area type="monotone" dataKey="returns" stroke="var(--color-accent)" fillOpacity={1} fill="url(#colorReturns)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-panel">
        <div style={{padding: '1.5rem 1.5rem 0'}}>
          <h4 style={{color: 'var(--color-muted)', letterSpacing: '0.05em', marginBottom: '1rem'}}>Recent Platform Transactions (Simulated)</h4>
        </div>
        <table className="erp-table">
          <thead>
            <tr>
              <th>Order Ref</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Type</th>
              <th style={{textAlign: 'right'}}>Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{color: 'var(--color-muted)'}}>#ORD-4921</td>
              <td>Today, 14:30</td>
              <td style={{fontWeight: 700}}>Alice Vanguard</td>
              <td><span className="badge badge-success">Sale</span></td>
              <td style={{textAlign: 'right'}} className="currency">₹4,200.00</td>
            </tr>
            <tr>
              <td style={{color: 'var(--color-muted)'}}>#ORD-4919</td>
              <td>Today, 11:15</td>
              <td style={{fontWeight: 700}}>Bob Architect</td>
              <td><span className="badge badge-warning">Return</span></td>
              <td style={{textAlign: 'right'}} className="currency">-₹850.50</td>
            </tr>
            <tr>
              <td style={{color: 'var(--color-muted)'}}>#ORD-4918</td>
              <td>Yesterday</td>
              <td style={{fontWeight: 700}}>Charlie Driver</td>
              <td><span className="badge badge-success">Sale</span></td>
              <td style={{textAlign: 'right'}} className="currency">₹1,100.00</td>
            </tr>
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .header-flex { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2.5rem; }
        .stat-card { flex: 1; padding: 2rem; position: relative; overflow: hidden; }
        .kpi-label { font-size: 0.85rem; color: var(--color-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem; }
        .stat-card h3 { font-size: 2.5rem; color: var(--color-dark); }
      `}</style>
    </div>
  );
}
