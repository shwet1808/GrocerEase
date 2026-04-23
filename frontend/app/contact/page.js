"use client";
import React, { useState } from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate sending an email/message to the backend
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 1500);
  };

  return (
    <div className="contact-wrapper">
      <div className="contact-hero">
        <h1>Get in <span>Touch</span></h1>
        <p>Have questions about your inventory or technical issues? Our support team is here to help.</p>
      </div>

      <div className="contact-container">
        <div className="glass-card info-card">
          <h2>Contact Information</h2>
          <p>Fill up the form and our team will get back to you within 24 hours.</p>
          
          <div className="info-items">
            <div className="info-item">
              <span className="icon">📍</span>
              <p>123 Organic Avenue, Tech District, Node City 10001</p>
            </div>
            <div className="info-item">
              <span className="icon">📞</span>
              <p>+91 (800) 123-4567</p>
            </div>
            <div className="info-item">
              <span className="icon">✉️</span>
              <p>support@grocerease.com</p>
            </div>
          </div>
        </div>

        <div className="glass-card form-card">
          {success ? (
            <div className="success-message">
              <div className="success-icon">✓</div>
              <h3>Message Sent!</h3>
              <p>We've received your message and will contact you shortly.</p>
              <button className="btn-secondary mt-4" onClick={() => setSuccess(false)}>Send Another</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Your Name</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    required 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input 
                    type="email" 
                    className="input-field" 
                    required 
                    value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value})} 
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Subject</label>
                <input 
                  type="text" 
                  className="input-field" 
                  required 
                  value={formData.subject} 
                  onChange={e => setFormData({...formData, subject: e.target.value})} 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Message</label>
                <textarea 
                  className="input-field" 
                  rows="5" 
                  required 
                  value={formData.message} 
                  onChange={e => setFormData({...formData, message: e.target.value})} 
                ></textarea>
              </div>

              <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', marginTop: '1rem', padding: '1rem' }}>
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}
        </div>
      </div>

      <style jsx>{`
        .contact-wrapper {
          max-width: 1100px;
          margin: 0 auto;
          animation: fadeUp 0.8s ease-out;
        }

        .contact-hero {
          text-align: center;
          margin-bottom: 4rem;
        }

        .contact-hero h1 {
          font-size: clamp(2.5rem, 5vw, 3.5rem);
          font-weight: 800;
          color: var(--color-dark);
          letter-spacing: -1.5px;
          margin-bottom: 1rem;
        }

        .contact-hero span {
          background: linear-gradient(135deg, var(--color-primary), #0ea5e9);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .contact-hero p {
          font-size: 1.15rem;
          color: #475569;
          max-width: 500px;
          margin: 0 auto;
        }

        .contact-container {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 2rem;
          align-items: stretch;
        }

        .info-card {
           background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
           color: white;
           border: none;
        }
        
        .info-card h2 {
           font-size: 1.8rem;
           margin-bottom: 0.5rem;
        }
        
        .info-card > p {
           color: #D1FAE5;
           margin-bottom: 3rem;
           font-size: 1rem;
           line-height: 1.5;
        }

        .info-items {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .info-item {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .icon {
          font-size: 1.5rem;
          background: rgba(255, 255, 255, 0.2);
          width: 50px;
          height: 50px;
          min-width: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
        }

        .info-item p {
          font-size: 1rem;
          margin: 0;
          font-weight: 500;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .success-message {
          text-align: center;
          padding: 4rem 2rem;
          animation: fadeUp 0.5s ease-out;
        }

        .success-icon {
          width: 80px;
          height: 80px;
          background: #D1FAE5;
          color: #10B981;
          font-size: 3rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          margin: 0 auto 1.5rem;
        }
        
        .success-message h3 {
           font-size: 2rem;
           color: var(--color-dark);
           margin-bottom: 1rem;
        }
        
        .success-message p {
           color: #64748B;
        }

        .mt-4 { margin-top: 1.5rem; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .contact-container {
            grid-template-columns: 1fr;
          }
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
