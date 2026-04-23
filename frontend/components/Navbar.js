"use client";
import React from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const { user, logout } = useAuth(); // Instantly grab their status from memory

  return (
    <nav className="glass-nav">
      <div className="nav-brand">
        <Link href="/">
          <h2>Grocer<span>Ease</span></h2>
        </Link>
      </div>

      <div className="nav-links">
        <Link href="/" className="nav-item">Home</Link>
        <Link href="/about" className="nav-item">About</Link>
        <Link href="/contact" className="nav-item">Contact</Link>
        
        {/* Conditional Logic: Show Store Catalog only if logged in */}
        {user && (
          <Link href="/store" className="nav-item">Catalog</Link>
        )}

        {/* Conditional Logic: ONLY show if they are logged in and happen to be an Admin */}
        {user?.role === 'admin' && (
          <Link href="/admin/dashboard" className="nav-item admin-badge">
            Admin Panel
          </Link>
        )}

        {/* Show 'Login' / 'Signup' if no user, else show 'My Orders' and 'Logout' */}
        {!user ? (
          <>
            <Link href="/login" className="btn-secondary" style={{ marginRight: '1rem', marginLeft: '1rem' }}>Sign In</Link>
            <Link href="/signup" className="btn-primary">Sign Up</Link>
          </>
        ) : (
          <>
            {user.role === 'customer' && (
              <Link href="/orders" className="nav-item">My Orders</Link>
            )}
            <span className="user-greeting" style={{ marginLeft: '1rem' }}>Welcome, {user.name.split(' ')[0]}</span>
            <button onClick={logout} className="btn-secondary">Logout</button>
          </>
        )}
        <ThemeToggle />
      </div>

      <style jsx>{`
        .glass-nav {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 2rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
        }
        
        .nav-brand h2 {
          font-weight: 700;
          font-size: 1.5rem;
          color: var(--color-dark);
          letter-spacing: -0.5px;
        }

        .nav-brand span {
          color: var(--color-primary);
        }

        .nav-links {
          display: flex;
          gap: 1.5rem;
          align-items: center;
        }

        .nav-item {
          font-weight: 500;
          color: #475569;
          transition: color 0.2s;
        }

        .nav-item:hover {
          color: var(--color-primary);
        }

        .admin-badge {
          background-color: #FEF2F2;
          color: #DC2626;
          padding: 0.25rem 0.75rem;
          border-radius: 999px;
          font-size: 0.85rem;
          border: 1px solid #FECACA;
        }

        .user-greeting {
          font-weight: 600;
          color: var(--color-primary-dark);
        }
      `}</style>
    </nav>
  );
}
