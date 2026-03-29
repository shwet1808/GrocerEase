"use client";
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';

// Create a globally accessible tunnel for Auth Data
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // Don't snap UI until we check localStorage
  
  const router = useRouter();

  useEffect(() => {
    // When the app first loads, check if they left their "ID Card" in the browser
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (newToken, newUserInfo) => {
    // Save to Javascript memory instantly
    setToken(newToken);
    setUser(newUserInfo);
    
    // Save to the browser's permanent storage so it survives a page refresh
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUserInfo));
    
    // Route them dynamically!
    if (newUserInfo.role === 'admin') {
      router.push('/admin/dashboard');
    } else {
      router.push('/');
    }
  };

  const logout = () => {
    // Shred the ID card
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// A simple custom hook so we don't have to import useContext everywhere
export const useAuth = () => useContext(AuthContext);
