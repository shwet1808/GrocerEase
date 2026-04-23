"use client";
import React from 'react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button 
      onClick={toggleTheme} 
      className="theme-toggle-btn"
      aria-label="Toggle Dark Mode"
    >
      {theme === 'light' ? '🌙' : '☀️'}
      <style jsx>{`
        .theme-toggle-btn {
          background: transparent;
          border: 2px solid var(--color-glass-border);
          color: var(--color-text-main);
          font-size: 1.2rem;
          cursor: pointer;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          justify-content: center;
          align-items: center;
          transition: transform 0.2s, background 0.2s;
          margin-left: 1rem;
        }
        .theme-toggle-btn:hover {
          transform: scale(1.1);
          background: var(--color-glass-border);
        }
      `}</style>
    </button>
  );
}
