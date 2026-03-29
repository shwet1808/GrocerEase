"use client";
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth(); // Import the magic login function from our context

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      // 1. We talk to the      // Connect to our real Node.js database
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Did the backend Middleware/Controller reject them? Show the error in red.
        throw new Error(data.message || 'Login failed');
      }

      // 2. Success! The Controller handed us the JWT token and the User profile.
      // We pass it to Context, which saves it and redirects them dynamically.
      login(data.token, data.user);

    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="glass-card login-card">
        <div className="login-header">
          <h2>Welcome Back</h2>
          <p>Sign in to access GrocerEase</p>
        </div>

        {errorMsg && <div className="error-badge">{errorMsg}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              className="input-field" 
              placeholder="e.g. admin@demo.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="input-field" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary login-btn" disabled={loading}>
            {loading ? 'Authenticating...' : 'Secure Sign In'}
          </button>
        </form>

        <div className="demo-hint">
          <p><strong>Admin Demo:</strong> admin@demo.com</p>
          <p><strong>Customer Demo:</strong> customer1@demo.com</p>
          <p>Pass: password123</p>
        </div>
      </div>

      <style jsx>{`
        .login-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 80vh;
        }

        .login-card {
          width: 100%;
          max-width: 420px;
          padding: 2.5rem;
        }

        .login-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .login-header h2 {
          font-size: 2rem;
          color: var(--color-dark);
          margin-bottom: 0.5rem;
          font-weight: 700;
        }

        .login-header p {
          color: #64748B;
        }

        .error-badge {
          background-color: #FEF2F2;
          color: #DC2626;
          padding: 0.75rem;
          border-radius: var(--radius-md);
          font-size: 0.9rem;
          text-align: center;
          margin-bottom: 1.5rem;
          border: 1px solid #FECACA;
          animation: shake 0.4s ease-in-out;
        }

        .login-btn {
          width: 100%;
          margin-top: 1rem;
        }

        .demo-hint {
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid #e2e8f0;
          font-size: 0.85rem;
          color: #64748B;
          text-align: center;
          line-height: 1.6;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
}
