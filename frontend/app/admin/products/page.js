"use client";
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { z } from 'zod';

const productSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters."),
  description: z.string().optional(),
  price: z.preprocess((val) => Number(val), z.number().min(0.01, "Price must be greater than 0.")),
  stock_quantity: z.preprocess((val) => Number(val), z.number().int().min(0, "Stock cannot be negative."))
});

export default function AdminProducts() {
  const { token, logout } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State for Modals
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', price: '', stock_quantity: '' });
  const [errorMsgs, setErrorMsgs] = useState({});

  useEffect(() => {
    fetchProducts();
  }, [token]);

  const fetchProducts = async () => {
    if (!token) return;
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_URL}/api/products`);
      if (!res.ok) throw new Error("Failed to load products");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData({ name: '', description: '', price: '', stock_quantity: '' });
    setErrorMsgs({});
    setShowModal(true);
  };

  const handleOpenEditModal = (product) => {
    setEditingId(product.id);
    setFormData({ 
      name: product.name, 
      description: product.description || '', 
      price: product.price, 
      stock_quantity: product.stock_quantity 
    });
    setErrorMsgs({});
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this item?')) return;
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_URL}/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 401 || res.status === 403) return logout();
      if (!res.ok) throw new Error("Failed to delete");
      setProducts(products.filter(p => p.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrorMsgs({});

    // Zod Validation
    const validation = productSchema.safeParse(formData);
    if (!validation.success) {
      const formattedErrors = {};
      validation.error.errors.forEach(err => {
        formattedErrors[err.path[0]] = err.message;
      });
      setErrorMsgs(formattedErrors);
      return;
    }

    const validData = validation.data;
    const method = editingId ? 'PUT' : 'POST';
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const url = editingId ? `${API_URL}/api/products/${editingId}` : `${API_URL}/api/products`;

    try {
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(validData)
      });

      if (res.status === 401 || res.status === 403) return logout();
      if (!res.ok) throw new Error("Failed to save product");
      
      await fetchProducts();
      setShowModal(false);
    } catch (err) {
      setErrorMsgs({ global: err.message });
    }
  };

  if (loading) return <div className="loading-state">Loading Store Catalog...</div>;

  return (
    <div className="animate-stagger">
      <div className="header-flex">
        <div>
          <h2>Product Inventory</h2>
          <p style={{color: 'var(--color-muted)'}}>Manage pricing, stock limits, and descriptions.</p>
        </div>
        <button onClick={handleOpenAddModal} className="btn-primary">+ Add New Item</button>
      </div>

      <div className="glass-panel">
        <table className="erp-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Price (₹)</th>
              <th>Stock</th>
              <th style={{textAlign: 'right'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                <td style={{color: 'var(--color-muted)'}}>#{product.id}</td>
                <td style={{fontWeight: 600}}>{product.name}</td>
                <td className="currency">₹{Number(product.price).toFixed(2)}</td>
                <td>
                  <span className={`badge ${product.stock_quantity > 10 ? 'badge-neutral' : 'badge-danger'}`}>
                    {product.stock_quantity} units
                  </span>
                </td>
                <td style={{textAlign: 'right'}}>
                  <button onClick={() => handleOpenEditModal(product)} className="btn-secondary btn-sm" style={{marginRight: '0.5rem'}}>Edit</button>
                  <button onClick={() => handleDelete(product.id)} className="btn-danger btn-sm">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content animate-stagger">
            <h3>{editingId ? 'Edit Product' : 'Add New Product'}</h3>
            {errorMsgs.global && <div className="badge badge-danger" style={{marginBottom: '1rem'}}>{errorMsgs.global}</div>}
            
            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label className="form-label">Item Name</label>
                <input type="text" className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                {errorMsgs.name && <span className="error-text">{errorMsgs.name}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="input-field" rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                {errorMsgs.description && <span className="error-text">{errorMsgs.description}</span>}
              </div>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem'}}>
                <div className="form-group">
                  <label className="form-label">Price (₹)</label>
                  <input type="number" step="0.01" className="input-field" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                  {errorMsgs.price && <span className="error-text">{errorMsgs.price}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Stock Quantity</label>
                  <input type="number" className="input-field" value={formData.stock_quantity} onChange={e => setFormData({...formData, stock_quantity: e.target.value})} />
                  {errorMsgs.stock_quantity && <span className="error-text">{errorMsgs.stock_quantity}</span>}
                </div>
              </div>
              
              <div style={{display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem'}}>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Save Changes</button>
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
          width: 100%; max-width: 550px; padding: 3rem;
          background: rgba(255, 255, 255, 0.95);
        }
        .modal-content h3 { margin-bottom: 2rem; font-size: 1.8rem; }
        .error-text { color: var(--danger); font-size: 0.8rem; font-weight: 500; margin-top: -0.2rem; }
        .loading-state { text-align: center; font-weight: 500; color: var(--color-muted); padding: 5rem 0; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}
