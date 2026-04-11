"use client";
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { z } from 'zod';

const billItemSchema = z.object({
  productId: z.preprocess((val) => Number(val), z.number().min(1, "Select a valid product")),
  quantity: z.preprocess((val) => Number(val), z.number().min(1, "Quantity must be at least 1"))
});

export default function CustomerCRM() {
  const { token, logout } = useAuth();
  const [data, setData] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Billing Modal State
  const [billingUser, setBillingUser] = useState(null);
  const [billItems, setBillItems] = useState([{ productId: '', quantity: 1 }]);
  const [billError, setBillError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;

      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        
        // Fetch users
        const userRes = await fetch(`${API_URL}/api/users`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (userRes.status === 401 || userRes.status === 403) return logout();
        const userData = await userRes.json();
        
        // Fetch products
        const prodRes = await fetch(`${API_URL}/api/products`);
        const prodData = await prodRes.json();

        setData(userData);
        setProducts(prodData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, logout]);

  const handleOpenBillModal = (user) => {
    setBillingUser(user);
    setBillItems([{ productId: '', quantity: 1 }]);
    setBillError('');
  };

  const handleAddBillRow = () => {
    setBillItems([...billItems, { productId: '', quantity: 1 }]);
  };

  const updateBillRow = (index, field, value) => {
    const newItems = [...billItems];
    newItems[index][field] = value;
    setBillItems(newItems);
  };

  const handleSubmitBill = async (e) => {
    e.preventDefault();
    setBillError('');

    // Zod verification
    try {
      const parsedItems = billItems.map(item => billItemSchema.parse(item));
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      const res = await fetch(`${API_URL}/api/orders/admin`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: billingUser.id,
          items: parsedItems
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to generate bill');
      }

      alert(`Bill successfully generated for ${billingUser.name}!`);
      setBillingUser(null);
    } catch (err) {
      if (err instanceof z.ZodError) {
        setBillError(err.errors[0].message);
      } else {
        setBillError(err.message);
      }
    }
  };

  if (loading) return <div className="loading-state">Syncing CRM Database...</div>;
  if (!data) return null;

  return (
    <div className="animate-stagger">
      <div className="header-flex">
        <div>
          <h2>Customer Relationship Management</h2>
          <p style={{color: 'var(--color-muted)'}}>Manage accounts, oversight, and generate customer billing overrides.</p>
        </div>
      </div>

      <div style={{display: 'flex', gap: '1.5rem', marginBottom: '2.5rem'}}>
        <div className="glass-panel" style={{flex: 1, padding: '2rem'}}>
          <p style={{fontSize: '0.85rem', color: 'var(--color-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem'}}>Active Customers</p>
          <h3 style={{fontSize: '3rem', color: 'var(--color-primary)'}}>{data.metrics?.totalCustomers || 0}</h3>
        </div>
        <div className="glass-panel" style={{flex: 1, padding: '2rem'}}>
          <p style={{fontSize: '0.85rem', color: 'var(--color-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem'}}>Staff / Admins</p>
          <h3 style={{fontSize: '3rem', color: 'var(--color-dark)'}}>{data.metrics?.totalAdmins || 0}</h3>
        </div>
      </div>

      <div className="glass-panel">
        <table className="erp-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Contact Node</th>
              <th>Onboarding Date</th>
              <th>Authorization</th>
              <th style={{textAlign: 'right'}}>Action</th>
            </tr>
          </thead>
          <tbody>
            {data.users?.map(u => (
              <tr key={u.id}>
                <td style={{color: 'var(--color-muted)'}}>#{u.id}</td>
                <td style={{fontWeight: 700}}>{u.name}</td>
                <td>{u.email}</td>
                <td style={{color: 'var(--color-muted)'}}>{new Date(u.joined_date || u.created_at).toLocaleDateString()}</td>
                <td>
                  <span className={`badge ${u.role === 'admin' ? 'badge-warning' : 'badge-neutral'}`}>
                    {u.role}
                  </span>
                </td>
                <td style={{textAlign: 'right'}}>
                  {u.role === 'customer' && (
                    <button onClick={() => handleOpenBillModal(u)} className="btn-secondary btn-sm">Issue Bill</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {billingUser && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content animate-stagger" style={{maxWidth: '650px'}}>
            <h3>Generate Directive Bill</h3>
            <p style={{color: 'var(--color-muted)', marginBottom: '2rem'}}>
              Issuing an internal invoice for <b>{billingUser.name}</b>
            </p>

            {billError && <div className="badge badge-danger" style={{marginBottom: '1rem'}}>{billError}</div>}
            
            <form onSubmit={handleSubmitBill}>
              {billItems.map((item, index) => (
                <div key={index} style={{display: 'flex', gap: '1rem', marginBottom: '1rem'}}>
                  <div className="form-group" style={{flex: 2}}>
                    <label className="form-label">Product</label>
                    <select 
                      className="input-field" 
                      value={item.productId}
                      onChange={e => updateBillRow(index, 'productId', e.target.value)}
                    >
                      <option value="">-- Select Product --</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} (₹{p.price}) - {p.stock_quantity} limit</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group" style={{flex: 1}}>
                    <label className="form-label">Quantity</label>
                    <input 
                      type="number" 
                      min="1" 
                      className="input-field" 
                      value={item.quantity} 
                      onChange={e => updateBillRow(index, 'quantity', e.target.value)} 
                    />
                  </div>
                </div>
              ))}
              
              <button type="button" onClick={handleAddBillRow} className="btn-secondary btn-sm" style={{marginBottom: '2rem'}}>+ Add Row</button>
              
              <div style={{display: 'flex', justifyContent: 'flex-end', gap: '1rem'}}>
                <button type="button" onClick={() => setBillingUser(null)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Generate Invoice</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .header-flex { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2.5rem; }
        .btn-sm { padding: 0.4rem 1rem; font-size: 0.85rem; }
        .modal-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(10, 10, 10, 0.5); backdrop-filter: blur(8px);
          display: flex; justify-content: center; align-items: center; z-index: 999;
          animation: fadeIn 0.3s ease-out;
        }
        .modal-content {
          width: 100%; padding: 3rem;
          background: rgba(255, 255, 255, 0.95);
        }
        .modal-content h3 { margin-bottom: 0.5rem; font-size: 1.8rem; }
        .loading-state { text-align: center; font-weight: 500; color: var(--color-muted); padding: 5rem 0; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}
