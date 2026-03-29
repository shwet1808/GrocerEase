"use client";
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';

export default function AdminLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If we finished loading from localStorage and there's NO user 
    // OR their role isn't explicitly an admin, instantly block them.
    if (!loading) {
      if (!user || user.role !== 'admin') {
        router.push('/');
      }
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'admin') {
    return <div className="loading-screen">Verifying Admin Credentials...</div>;
  }

  return (
    <div className="admin-layout">
      {/* 
        We are giving the Admin area its very own exclusive Sidebar Navigation. 
        This keeps the Admin Panel looking completely different from the public storefront!
      */}
      <aside className="admin-sidebar glass-card">
        <h3>Admin Tools</h3>
        <ul>
          <li><Link href="/admin/dashboard" className="sidebar-link">📊 Dashboard</Link></li>
          <li><Link href="/admin/products" className="sidebar-link">🛒 Products</Link></li>
          <li><Link href="/admin/customers" className="sidebar-link">👥 Customers</Link></li>
        </ul>
      </aside>

      <main className="admin-content">
        {children}
      </main>

      <style jsx>{`
        .admin-layout {
          display: grid;
          grid-template-columns: 250px 1fr;
          gap: 2rem;
          min-height: calc(100vh - 80px); /* Fill the screen beneath the global Navbar */
        }

        .admin-sidebar {
          padding: 1.5rem;
          align-self: start;
          position: sticky;
          top: 100px;
        }

        .admin-sidebar h3 {
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #64748B;
          margin-bottom: 1.5rem;
        }

        .admin-sidebar ul {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .sidebar-link {
          display: block;
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
          font-weight: 500;
          color: var(--color-dark);
          transition: all 0.2s;
        }

        .sidebar-link:hover {
          background-color: rgba(16, 185, 129, 0.1); /* Light Emerald */
          color: var(--color-primary-dark);
        }

        .sidebar-disabled {
          opacity: 0.5;
          pointer-events: none;
        }

        .admin-content {
          padding: 1rem 0;
          width: 100%;
        }

        .loading-screen {
          min-height: 50vh;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 500;
          color: #64748B;
        }

        /* Make it stack on small phones */
        @media (max-width: 768px) {
          .admin-layout {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
