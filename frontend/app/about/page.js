"use client";
import React from 'react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="about-wrapper">
      <div className="about-hero">
        <h1>About <span>GrocerEase</span></h1>
        <p>Your trusted partner in organic, fast, and reliable grocery management and delivery since 2026.</p>
      </div>

      <div className="about-content">
        <div className="glass-card about-card">
          <div className="icon-wrapper">🌱</div>
          <h2>Our Mission</h2>
          <p>
            At GrocerEase, our mission is to seamlessly connect communities with premium, high-quality, and organically sourced produce. We believe that managing a grocery ecosystem should be entirely frictionless. That's why we've built a robust ERP system behind the scenes that guarantees fresh stock and fast turnarounds for our customers.
          </p>
        </div>

        <div className="glass-card about-card">
          <div className="icon-wrapper">🚀</div>
          <h2>Our Technology</h2>
          <p>
            We don't just sell groceries—we engineer a better shopping experience. Built on a cutting-edge <strong>Next.js</strong> front-end and a blazingly fast <strong>Express.js / TiDB Serverless</strong> backend, GrocerEase ensures that you can effortlessly track your invoices and see live stock availability in milliseconds.
          </p>
        </div>

        <div className="glass-card about-card">
          <div className="icon-wrapper">🤝</div>
          <h2>Customer Commitment</h2>
          <p>
            You are at the center of everything we do. Whether you are generating a professional invoice for your purchases or interacting directly with our CRM portal, we guarantee 100% transparency. Our stock numbers are always live, giving you complete clarity.
          </p>
        </div>
      </div>

      <div className="cta-section">
        <h2>Ready to experience the GrocerEase difference?</h2>
        <Link href="/login" className="btn-primary cta-btn">Access Your Portal</Link>
      </div>

      <style jsx>{`
        .about-wrapper {
          max-width: 1000px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 2rem 0;
          animation: fadeUp 0.8s ease-out;
        }

        .about-hero {
          text-align: center;
          margin-bottom: 4rem;
        }

        .about-hero h1 {
          font-size: clamp(2.5rem, 5vw, 4rem);
          font-weight: 800;
          color: var(--color-dark);
          letter-spacing: -1.5px;
          margin-bottom: 1rem;
        }

        .about-hero span {
          background: linear-gradient(135deg, var(--color-primary), #0ea5e9);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .about-hero p {
          font-size: 1.25rem;
          color: #475569;
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .about-content {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          width: 100%;
          margin-bottom: 4rem;
        }

        .about-card {
          padding: 2.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .about-card:hover {
          transform: translateY(-10px);
          box-shadow: var(--shadow-strong);
        }

        .icon-wrapper {
          font-size: 3rem;
          margin-bottom: 1.5rem;
          background: #F8FAFC;
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
        }

        .about-card h2 {
          font-size: 1.5rem;
          color: var(--color-dark);
          margin-bottom: 1rem;
        }

        .about-card p {
          color: #64748B;
          line-height: 1.7;
          font-size: 1rem;
        }

        .cta-section {
          text-align: center;
          padding: 4rem 2rem;
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(14, 165, 233, 0.1));
          border-radius: var(--radius-lg);
          border: 1px solid rgba(16, 185, 129, 0.2);
          width: 100%;
        }

        .cta-section h2 {
          font-size: 2rem;
          color: var(--color-dark);
          margin-bottom: 1.5rem;
          font-weight: 700;
        }

        .cta-btn {
          font-size: 1.1rem;
          padding: 1rem 2.5rem;
          border-radius: 999px;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
