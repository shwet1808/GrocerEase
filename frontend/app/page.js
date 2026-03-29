"use client";
import React from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth(); // Globally grab user from memory

  return (
    <div className="home-wrapper">
      <div className="hero-section">
        <h1>Fresh Groceries, <br/><span>Delivered to Your Door.</span></h1>
        <p>Premium organic produce, exactly when you need it.</p>
        
        {!user ? (
          <Link href="/login" className="btn-primary hero-btn">Login to Start Shopping</Link>
        ) : (
          <div className="ready-badge">
            You are logged in securely! Token is active.
          </div>
        )}
      </div>

      <style jsx>{`
        .home-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 70vh;
          text-align: center;
        }

        .hero-section h1 {
          font-size: 4rem;
          font-weight: 800;
          line-height: 1.1;
          color: var(--color-dark);
          margin-bottom: 1.5rem;
          letter-spacing: -2px;
        }

        .hero-section span {
          background: linear-gradient(135deg, var(--color-primary), #0ea5e9);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-section p {
          font-size: 1.25rem;
          color: #475569;
          margin-bottom: 3rem;
          max-width: 600px;
          margin-inline: auto;
        }

        .hero-btn {
          font-size: 1.25rem;
          padding: 1rem 2.5rem;
        }

        .ready-badge {
          display: inline-block;
          background: #D1FAE5;
          color: #065F46;
          padding: 1rem 2rem;
          border-radius: 999px;
          font-weight: 500;
          border: 1px solid #A7F3D0;
        }
      `}</style>
    </div>
  );
}
