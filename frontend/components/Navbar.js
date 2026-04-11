"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`premium-nav ${scrolled ? 'nav-scrolled' : ''}`}>
      <div className="nav-container">
        <div className="nav-brand">
          <Link href="/">
            <div className="logo-orb"></div>
            <h2>Grocer<span className="gradient-text">Ease</span></h2>
          </Link>
        </div>

        <div className="nav-links">
          {/* Conditional Logic */}
          {user?.role === 'admin' ? (
            <div className="admin-links">
              <Link href="/admin/dashboard" className="nav-item">Sales & Returns</Link>
              <Link href="/admin/products" className="nav-item">Inventory</Link>
              <Link href="/admin/customers" className="nav-item">CRM</Link>
              <span className="badge badge-danger" style={{marginLeft: '1rem'}}>Admin</span>
            </div>
          ) : user?.role === 'customer' ? (
            <div className="customer-links">
              <Link href="/customer" className="nav-item">My Purchases</Link>
            </div>
          ) : (
            <Link href="/" className="nav-item">Store</Link>
          )}

          <div className="auth-section">
            {!user ? (
              <Link href="/login" className="btn-primary">Sign In</Link>
            ) : (
              <div className="user-profile">
                <div className="avatar">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="user-details">
                  <span className="user-name">{user.name.split(' ')[0]}</span>
                  <button onClick={logout} className="logout-text">Sign out</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .premium-nav {
          position: sticky;
          top: 0;
          z-index: 100;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          padding: 1.5rem 0;
        }

        .nav-scrolled {
          padding: 1rem 0;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.5);
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.03);
        }

        .nav-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .nav-brand a {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .logo-orb {
          width: 12px;
          height: 12px;
          background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light));
          border-radius: 50%;
          box-shadow: 0 0 15px var(--color-primary-light);
        }

        .nav-brand h2 {
          font-weight: 800;
          font-size: 1.6rem;
          letter-spacing: -0.04em;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 2.5rem;
        }

        .admin-links, .customer-links {
          display: flex;
          align-items: center;
          gap: 2rem;
          background: rgba(255, 255, 255, 0.5);
          padding: 0.5rem 1.5rem;
          border-radius: 99px;
          border: 1px solid rgba(0,0,0,0.05);
        }

        .nav-item {
          font-weight: 600;
          font-size: 0.95rem;
          color: var(--color-muted);
          position: relative;
        }

        .nav-item::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 0%;
          height: 2px;
          background: var(--color-dark);
          transition: width 0.3s ease;
        }

        .nav-item:hover { color: var(--color-dark); }
        .nav-item:hover::after { width: 100%; }

        .auth-section {
          padding-left: 1.5rem;
          border-left: 1px solid rgba(0,0,0,0.1);
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: var(--color-dark);
          border: 1px solid rgba(0,0,0,0.05);
        }

        .user-details {
          display: flex;
          flex-direction: column;
        }

        .user-name {
          font-weight: 700;
          font-size: 0.9rem;
          line-height: 1.1;
        }

        .logout-text {
          background: none;
          border: none;
          color: var(--color-muted);
          font-size: 0.75rem;
          text-align: left;
          cursor: pointer;
          padding: 0;
          font-weight: 500;
        }

        .logout-text:hover { color: var(--danger); }
      `}</style>
    </nav>
  );
}
