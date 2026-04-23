"use client";
import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer-simple">
      <div className="footer-container">
        
        <div className="footer-content">
          <div className="footer-brand">
            <h2>Grocer<span>Ease</span></h2>
            <p>Smart supply chain management for the modern web.</p>
          </div>

          <div className="footer-links">
            <Link href="/about">About Us</Link>
            <Link href="/contact">Contact Support</Link>
            <Link href="/store">Live Catalog</Link>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} GrocerEase. All Rights Reserved.</p>
        </div>

      </div>

      <style jsx>{`
        .footer-simple {
          background: var(--color-table-header);
          border-top: 1px solid var(--color-table-border);
          padding: 2.5rem 0 1.5rem 0;
          margin-top: 2rem;
          color: var(--color-text-main);
        }

        .footer-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1.5rem;
        }

        .footer-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .footer-brand h2 {
          font-weight: 700;
          font-size: 1.5rem;
          margin-bottom: 0.25rem;
        }

        .footer-brand span {
          color: var(--color-primary);
        }

        .footer-brand p {
          color: var(--color-text-muted);
          font-size: 0.9rem;
        }

        .footer-links {
          display: flex;
          gap: 1.5rem;
        }

        .footer-links a {
          color: var(--color-text-muted);
          font-size: 0.95rem;
          font-weight: 500;
          transition: color 0.2s;
        }

        .footer-links a:hover {
          color: var(--color-primary);
        }

        .footer-bottom {
          text-align: center;
          padding-top: 1.5rem;
          border-top: 1px solid var(--color-table-border);
          color: var(--color-text-muted);
          font-size: 0.85rem;
        }
        
        @media print {
          .footer-simple {
             display: none;
          }
        }
      `}</style>
    </footer>
  );
}
