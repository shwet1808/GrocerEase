"use client";
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Login() {
  const { login } = useAuth();
  const router = useRouter();

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoginMsg, setIsLoginMsg] = useState(true); // Toggle between Login vs Register UI (Wait, admin adds customers usually but self-register is here for demo)
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const endpoint = isLoginMsg ? '/api/auth/login' : '/api/auth/register';
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      const payload = { email, password };
      if (!isLoginMsg) {
        payload.name = "New Customer"; // Hardcoded for demo registration
        payload.role = "customer";
      }

      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Authentication Failed');

      login(data.token, data.user);
      
      // Route based on role
      if (data.user.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/customer');
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper animate-stagger">
      <div className="glass-panel login-card">
        <div style={{textAlign: 'center', marginBottom: '2.5rem'}}>
          <div className="logo-orb" style={{margin: '0 auto 1rem', width: '40px', height: '40px'}}></div>
          <h2>{isLoginMsg ? 'Welcome Back' : 'Create Account'}</h2>
          <p style={{color: 'var(--color-muted)', marginTop: '0.5rem'}}>Authenticate to access the provisioning system.</p>
        </div>

        {errorMsg && <div className="badge badge-danger" style={{width: '100%', marginBottom: '1.5rem', display: 'flex', justifyContent: 'center'}}>{errorMsg}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              required 
              className="input-field" 
              value={email} 
              onChange={e => setEmail(e.target.value)}
              placeholder="operator@grocerease.com"
            />
          </div>
          
          <div className="form-group" style={{marginBottom: '2.5rem'}}>
            <label className="form-label">Secure Password</label>
            <input 
              type="password" 
              required 
              className="input-field" 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="btn-primary" style={{width: '100%', padding: '1rem'}} disabled={loading}>
            {loading ? 'Authenticating...' : isLoginMsg ? 'Sign In' : 'Register'}
          </button>
        </form>

        <div style={{textAlign: 'center', marginTop: '2rem'}}>
          <button 
            type="button" 
            onClick={() => setIsLoginMsg(!isLoginMsg)}
            className="toggle-btn"
          >
            {isLoginMsg ? "Don't have an account? Register" : "Already have an account? Sign In"}
          </button>
        </div>
      </div>

      <style jsx>{`
        .login-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: calc(100vh - 150px);
        }

        .login-card {
          width: 100%;
          max-width: 450px;
          padding: 3rem;
          background: rgba(255, 255, 255, 0.85);
        }

        .logo-orb {
          background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light));
          border-radius: 50%;
          box-shadow: 0 0 25px var(--color-primary-light);
        }

        .toggle-btn {
          background: none;
          border: none;
          color: var(--color-muted);
          font-family: inherit;
          font-weight: 500;
          cursor: pointer;
          transition: color 0.2s;
        }

        .toggle-btn:hover {
          color: var(--color-primary);
        }
      `}</style>
    </div>
  );
}
