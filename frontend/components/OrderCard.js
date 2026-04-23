"use client";
import React from 'react';

export default function OrderCard({ order, handlePrint, userName }) {
  return (
    <div className={`glass-card order-card order-box-${order.id}`}>
      <div className="order-summary hide-on-print">
        <div className="order-info">
          <h3>Order #{order.id}</h3>
          <span className={`status-badge ${order.status}`}>{order.status}</span>
          <span className="date">{new Date(order.created_at).toLocaleDateString()}</span>
        </div>
        <div className="order-actions">
          <span className="total">₹{parseFloat(order.total_amount).toFixed(2)}</span>
          <button className="btn-primary print-btn" onClick={() => handlePrint(order.id)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
            Save as PDF
          </button>
        </div>
      </div>

      {/* Invoice Template - Hidden on screen, shown on print */}
      <div className="invoice-template">
        <div className="invoice-header">
          <h1>Grocer<span>Ease</span></h1>
          <div className="invoice-meta">
            <p><strong>Invoice #:</strong> INV-{order.id}-{new Date(order.created_at).getFullYear()}</p>
            <p><strong>Date:</strong> {new Date(order.created_at).toLocaleDateString()}</p>
            <p><strong>Customer:</strong> {userName || 'Customer'}</p>
            <p><strong>Status:</strong> {order.status.toUpperCase()}</p>
          </div>
        </div>
        
        <h2 className="invoice-title">Tax Invoice</h2>

        <table className="invoice-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items && order.items.map((item, index) => (
              <tr key={index}>
                <td>{item.name}</td>
                <td>{item.quantity}</td>
                <td>₹{parseFloat(item.price_at_time).toFixed(2)}</td>
                <td>₹{(item.quantity * parseFloat(item.price_at_time)).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="invoice-summary">
          <div className="summary-row total-row">
            <span>Grand Total:</span>
            <span>₹{parseFloat(order.total_amount).toFixed(2)}</span>
          </div>
        </div>

        <div className="invoice-footer">
          <p>Thank you for shopping with GrocerEase!</p>
          <p>For support, contact support@grocerease.com</p>
        </div>
      </div>

      {/* On-screen Item list */}
      <div className="items-list hide-on-print">
        <h4>Items</h4>
        <ul>
          {order.items && order.items.map((item, idx) => (
            <li key={idx}>
              <span>{item.quantity}x {item.name}</span>
              <span>₹{(item.quantity * parseFloat(item.price_at_time)).toFixed(2)}</span>
            </li>
          ))}
        </ul>
      </div>

      <style jsx>{`
        .order-card {
          padding: 1.5rem;
        }
        .order-summary {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 1px solid var(--color-table-border);
          padding-bottom: 1.5rem;
          margin-bottom: 1.5rem;
        }
        .order-info h3 {
          font-size: 1.3rem;
          margin-bottom: 0.5rem;
        }
        .status-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 999px;
          font-size: 0.85rem;
          font-weight: 600;
          margin-right: 1rem;
          text-transform: capitalize;
        }
        .status-badge.completed { background: #D1FAE5; color: #065F46; border: 1px solid #A7F3D0; }
        .status-badge.pending { background: #FEF3C7; color: #92400E; border: 1px solid #FDE68A; }
        .date {
          color: var(--color-text-muted);
          font-size: 0.9rem;
        }
        .order-actions {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 1rem;
        }
        .total {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--color-primary-dark);
        }
        .print-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
        }
        .items-list h4 {
          margin-bottom: 1rem;
          color: var(--color-dark);
        }
        .items-list ul {
          list-style: none;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .items-list li {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem;
          background: rgba(255,255,255,0.05); /* Works for dark and light */
          border-radius: var(--radius-md);
          font-size: 0.95rem;
        }

        .invoice-template {
          display: none;
          background: white;
          width: 100%;
          padding: 2rem;
          color: #000;
        }

        /* The @media print rules are handled in the parent component or globals */
      `}</style>
    </div>
  );
}
