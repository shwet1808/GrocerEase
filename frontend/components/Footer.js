"use client";
import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer-glass">
      <div className="footer-container">
        <div className="footer-brand">
          <h2>Grocer<span>Ease</span></h2>
          <p>The premium CRM & ERP platform ensuring real-time grocery transparency, since 2026.</p>
        </div>

        <div className="footer-links">
          <div className="link-group">
            <h3>Company</h3>
            <Link href="/about">About Us</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/">Careers</Link>
          </div>
          
          <div className="link-group">
            <h3>Platform</h3>
            <Link href="/store">Live Catalog</Link>
            <Link href="/login">Customer Portal</Link>
            <Link href="/signup">Sign Up</Link>
          </div>

          <div className="link-group">
            <h3>Legal</h3>
            <Link href="/">Privacy Policy</Link>
            <Link href="/">Terms of Service</Link>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} GrocerEase. All Rights Reserved. Made for modern supply chains.</p>
      </div>

      <style jsx>{`
        .footer-glass {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-top: 1px solid var(--color-glass-border);
          box-shadow: 0 -4px 10px rgba(0, 0, 0, 0.02);
          margin-top: 4rem;
          padding-top: 4rem;
        }

        .footer-container {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 3rem;
          padding: 0 2rem;
        }

        .footer-brand {
          max-width: 350px;
        }

        .footer-brand h2 {
          font-weight: 700;
          font-size: 1.8rem;
          color: var(--color-dark);
          letter-spacing: -0.5px;
          margin-bottom: 1rem;
        }

        .footer-brand span {
          color: var(--color-primary);
        }

        .footer-brand p {
          color: #64748B;
          line-height: 1.6;
          font-size: 0.95rem;
        }

        .footer-links {
          display: flex;
          gap: 4rem;
          flex-wrap: wrap;
        }

        .link-group {
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
        }

        .link-group h3 {
          font-size: 1.1rem;
          color: var(--color-dark);
          margin-bottom: 0.5rem;
          font-weight: 700;
        }

        .link-group a {
          color: #64748B;
          font-size: 0.95rem;
          transition: color 0.2s;
        }

        .link-group a:hover {
          color: var(--color-primary);
        }

        .footer-bottom {
          text-align: center;
          padding: 2rem 0;
          margin-top: 4rem;
          border-top: 1px solid rgba(0, 0, 0, 0.05);
          color: #94A3B8;
          font-size: 0.9rem;
        }
        
        @media print {
          .footer-glass {
             display: none;
          }
        }
      `}</style>
    </footer>
  );
}
