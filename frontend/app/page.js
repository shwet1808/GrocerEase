"use client";
import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="landing-wrapper">
      
      {/* Dynamic Background Elements */}
      <div className="bg-blob blob-1"></div>
      <div className="bg-blob blob-2"></div>

      <div className="hero-section">
        <div className="badge">🚀 The Next Generation ERP CRM</div>
        <h1>
          Complete Clarity Over Your <br/>
          <span className="gradient-text">Grocery Pipeline.</span>
        </h1>
        <p className="hero-subtitle">
          Instantly view our catalog, check live stock availability, and securely manage your professional invoices inside your private customer portal.
        </p>

        <div className="action-group">
          <Link href="/login" className="btn-primary hero-btn primary-pulse">
            Access Portal
          </Link>
          <Link href="/about" className="btn-secondary hero-btn glass-btn">
            Learn More
          </Link>
        </div>
      </div>

      <div className="features-section">
        <div className="glass-card feature-card">
          <div className="feature-icon bg-green">📦</div>
          <h3>Live Inventory</h3>
          <p>Gain access to real-time stock levels directly from the warehouse without the need to call support.</p>
        </div>

        <div className="glass-card feature-card">
          <div className="feature-icon bg-blue">📄</div>
          <h3>Pro Invoices</h3>
          <p>Every purchase you've ever made is securely stored, ready to be downloaded as a tax-compliant PDF.</p>
        </div>

        <div className="glass-card feature-card">
          <div className="feature-icon bg-purple">⚡</div>
          <h3>Lightning Fast</h3>
          <p>Powered by bleeding-edge Node.js server architecture and edge deployment for zero lag.</p>
        </div>
      </div>

      <style jsx>{`
        .landing-wrapper {
          min-height: 85vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          padding: 2rem 1rem;
        }

        /* Ambient glowing background blobs */
        .bg-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          z-index: -1;
          opacity: 0.6;
          animation: float 10s infinite ease-in-out alternate;
        }

        .blob-1 {
          background: rgba(16, 185, 129, 0.3); /* Primary Green */
          width: 500px;
          height: 500px;
          top: -100px;
          left: -150px;
        }

        .blob-2 {
          background: rgba(59, 130, 246, 0.3); /* Blue Accent */
          width: 400px;
          height: 400px;
          bottom: -50px;
          right: -100px;
          animation-delay: -5s;
        }

        @keyframes float {
          0% { transform: translateY(0) scale(1); }
          100% { transform: translateY(30px) scale(1.05); }
        }

        .hero-section {
          text-align: center;
          max-width: 800px;
          margin-bottom: 5rem;
          animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .badge {
          display: inline-block;
          padding: 0.5rem 1rem;
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(0, 0, 0, 0.05);
          border-radius: 999px;
          font-weight: 600;
          font-size: 0.85rem;
          color: var(--color-primary-dark);
          margin-bottom: 2rem;
          box-shadow: var(--shadow-soft);
          backdrop-filter: blur(10px);
        }

        .hero-section h1 {
          font-size: clamp(2.5rem, 6vw, 4.5rem);
          font-weight: 800;
          line-height: 1.1;
          color: var(--color-dark);
          letter-spacing: -2px;
          margin-bottom: 1.5rem;
        }

        .gradient-text {
          background: linear-gradient(135deg, var(--color-primary), #0ea5e9);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-subtitle {
          font-size: 1.25rem;
          color: #475569;
          margin-bottom: 3rem;
          line-height: 1.6;
          opacity: 0;
          animation: fadeUp 0.8s 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .action-group {
          display: flex;
          gap: 1.5rem;
          justify-content: center;
          opacity: 0;
          animation: fadeUp 0.8s 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .hero-btn {
          font-size: 1.1rem;
          padding: 1.1rem 2.5rem;
          border-radius: 14px;
        }

        .primary-pulse {
          box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4);
          animation: pulseShadow 2s infinite;
        }

        @keyframes pulseShadow {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
          70% { box-shadow: 0 0 0 15px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }

        .glass-btn {
          background: rgba(255, 255, 255, 0.5);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.8);
        }

        .glass-btn:hover {
          background: rgba(255, 255, 255, 0.9);
        }

        .features-section {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2rem;
          width: 100%;
          max-width: 1100px;
          opacity: 0;
          animation: fadeUp 0.8s 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .feature-card {
          padding: 2.5rem;
          background: rgba(255, 255, 255, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.5);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .feature-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
        }

        .feature-icon {
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          border-radius: 12px;
          margin-bottom: 1.5rem;
        }

        .bg-green { background: #D1FAE5; }
        .bg-blue { background: #DBEAFE; }
        .bg-purple { background: #F3E8FF; }

        .feature-card h3 {
          font-size: 1.3rem;
          color: var(--color-dark);
          margin-bottom: 0.75rem;
          font-weight: 700;
        }

        .feature-card p {
          color: #64748B;
          line-height: 1.6;
          font-size: 0.95rem;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
