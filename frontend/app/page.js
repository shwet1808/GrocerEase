"use client";
import React from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="home-wrapper">
      <div className="hero-section glass-panel">
        <div className="hero-content animate-stagger">
          <div className="badge badge-success">Organic & Certified</div>
          <h1>Curated provisions, <br/><span>delivered with precision.</span></h1>
          <p>Experience grocery delivery reimagined for the modern aesthetic. Uncompromised quality meeting flawless logistics.</p>
          
          {!user ? (
            <div className="action-group">
              <Link href="/login" className="btn-primary">Enter the Storehouse</Link>
            </div>
          ) : (
            <div className="ready-badge">
              <span className="status-dot"></span>
              Securely connected as {user.role}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .home-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: calc(100vh - 100px);
        }

        .hero-section {
          padding: 5rem;
          max-width: 900px;
          text-align: center;
          position: relative;
        }

        .hero-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
        }

        h1 {
          font-size: 4.5rem;
          font-weight: 800;
          line-height: 1.05;
          letter-spacing: -0.04em;
          color: var(--color-dark);
        }

        h1 span {
          background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        p {
          font-size: 1.25rem;
          color: var(--color-muted);
          max-width: 500px;
          line-height: 1.6;
          margin-bottom: 1rem;
        }

        .action-group {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
        }

        .ready-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.9);
          color: var(--color-dark);
          padding: 0.8rem 1.5rem;
          border-radius: 99px;
          font-weight: 600;
          font-size: 0.9rem;
          border: 1px solid rgba(0,0,0,0.05);
          box-shadow: var(--shadow-card);
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--success);
          box-shadow: 0 0 10px var(--success);
        }
      `}</style>
    </div>
  );
}
