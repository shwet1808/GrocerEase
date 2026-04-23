"use client";
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import OrderCard from '../../components/OrderCard';

export default function OrdersPage() {
  const { user, token, loading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [fetching, setFetching] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (token) {
      fetchMyOrders();
    }
  }, [token]);

  const fetchMyOrders = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/orders/myorders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setFetching(false);
    }
  };

  const handlePrint = (orderId) => {
    // We add a specific class to body to know which order we are printing
    document.body.classList.add(`printing-order-${orderId}`);
    window.print();
    document.body.classList.remove(`printing-order-${orderId}`);
  };

  if (loading || fetching) {
    return <div className="loader-container"><div className="loader"></div></div>;
  }

  return (
    <div className="orders-container">
      <div className="orders-header hide-on-print">
        <h2>Your Purchase History</h2>
        <p>Review your past orders and download invoices.</p>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state hide-on-print">
          <p>You haven't placed any orders yet.</p>
          <button className="btn-primary" onClick={() => router.push('/')}>Start Shopping</button>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <OrderCard key={order.id} order={order} handlePrint={handlePrint} userName={user?.name} />
          ))}
        </div>
      )}

      <style jsx>{`
        .orders-container {
          max-width: 900px;
          margin: 0 auto;
          width: 100%;
        }
        .orders-header {
          margin-bottom: 2rem;
        }
        .orders-header h2 {
          font-size: 2rem;
          color: var(--color-dark);
          font-weight: 800;
        }
        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          background: rgba(255,255,255,0.5);
          border-radius: var(--radius-lg);
          border: 1px dashed var(--color-glass-border);
        }
        .empty-state p {
          margin-bottom: 1.5rem;
          color: var(--color-text-muted);
          font-size: 1.1rem;
        }
        .orders-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        /* PRINT STYLES - Moved globally for OrderCard to pick up */
        @media print {
          /* Hide EVERYTHING in the layout by default */
          :global(body *){
             visibility: hidden;
          }
          :global(nav) {
            display: none !important;
          }
          
          /* Only show the invoice of the clicked order */
          :global(body[class*="printing-order-"]) :global(.invoice-template),
          :global(body[class*="printing-order-"]) :global(.invoice-template *) {
            visibility: visible;
          }

          /* Ensure the invoice template takes up the whole printed page correctly */
          :global(body[class*="printing-order-"]) :global(.invoice-template) {
            display: block !important;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100vh;
            margin: 0;
            padding: 2rem;
            box-sizing: border-box;
          }

          /* Print-specific formatting for the invoice */
          :global(.invoice-header) {
            display: flex;
            justify-content: space-between;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 1.5rem;
            margin-bottom: 2rem;
          }
          :global(.invoice-header h1) {
            font-size: 2.5rem;
            color: #0F172A;
          }
          :global(.invoice-header h1 span) {
            color: #10B981;
          }
          :global(.invoice-meta p) {
            margin-bottom: 0.25rem;
            font-size: 0.95rem;
          }
          :global(.invoice-title) {
            text-align: center;
            font-size: 1.5rem;
            margin-bottom: 1.5rem;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: #475569;
          }
          :global(.invoice-table) {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 2rem;
          }
          :global(.invoice-table th), :global(.invoice-table td) {
            border-bottom: 1px solid #e2e8f0;
            padding: 1rem 0.5rem;
            text-align: left;
          }
          :global(.invoice-table th) {
            background-color: #f8fafc;
            color: #475569;
            font-weight: 600;
          }
          :global(.invoice-table td:last-child), :global(.invoice-table th:last-child) {
            text-align: right;
          }
          :global(.invoice-summary) {
            width: 50%;
            margin-left: auto;
            border-top: 2px solid #e2e8f0;
            padding-top: 1rem;
          }
          :global(.summary-row) {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.5rem;
            font-size: 1.1rem;
          }
          :global(.total-row) {
            font-size: 1.4rem;
            font-weight: bold;
            color: #0F172A;
            margin-top: 0.5rem;
          }
          :global(.invoice-footer) {
            margin-top: 4rem;
            text-align: center;
            color: #64748B;
            font-size: 0.9rem;
            border-top: 1px solid #e2e8f0;
            padding-top: 1rem;
          }
        }
      `}</style>
    </div>
  );
}
