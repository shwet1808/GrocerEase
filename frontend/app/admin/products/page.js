"use client";
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';

export default function AdminProducts() {
  const { token, logout } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State for Modals
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', price: '', stock_quantity: '' });
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch all products on load
  const fetchProducts = async () => {
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

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData({ name: '', description: '', price: '', stock_quantity: '' });
    setErrorMsg('');
    setShowModal(true);
  };

  const handleOpenEditModal = (product) => {
    setEditingId(product.id);
    setFormData({ 
      name: product.name, 
      description: product.description, 
      price: product.price, 
      stock_quantity: product.stock_quantity 
    });
    setErrorMsg('');
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
      
      // Remove from UI instantly
      setProducts(products.filter(p => p.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const method = editingId ? 'PUT' : 'POST';
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const url = editingId 
      ? `${API_URL}/api/products/${editingId}`
      : `${API_URL}/api/products`;

    try {
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.status === 401 || res.status === 403) return logout();
      if (!res.ok) throw new Error("Failed to save product");

      // Refresh the entire list magically
      await fetchProducts();
      setShowModal(false);
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  if (loading) return <div className="loading-state">Loading Store Catalog...</div>;

  return (
    <div className="erp-wrapper">
      <div className="erp-header">
        <div>
          <h2>Product Inventory</h2>
          <p>Manage pricing, stock limits, and descriptions.</p>
        </div>
        <button onClick={handleOpenAddModal} className="btn-primary">+ Add New Item</button>
      </div>

      <div className="glass-card table-wrapper">
        <table className="erp-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                <td>#{product.id}</td>
                <td className="product-name">{product.name}</td>
                <td className="product-price">${Number(product.price).toFixed(2)}</td>
                <td>{product.stock_quantity} units</td>
                <td className="action-buttons">
                  <button onClick={() => handleOpenEditModal(product)} className="btn-edit">Edit</button>
                  <button onClick={() => handleDelete(product.id)} className="btn-delete">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="glass-card modal-content">
            <h3>{editingId ? 'Edit Product' : 'Add New Product'}</h3>
            {errorMsg && <div className="error-badge">{errorMsg}</div>}
            
            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label className="form-label">Item Name</label>
                <input required type="text" className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="input-field" rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Price ($)</label>
                  <input required type="number" step="0.01" className="input-field" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Stock Quantity</label>
                  <input required type="number" className="input-field" value={formData.stock_quantity} onChange={e => setFormData({...formData, stock_quantity: e.target.value})} />
                </div>
              </div>
              
              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .erp-wrapper { animation: slideIn 0.4s ease-out; }
        
        .erp-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem; }
        .erp-header h2 { font-size: 2rem; color: var(--color-dark); margin-bottom: 0.25rem; }
        .erp-header p { color: #64748B; font-size: 1.1rem; }

        .table-wrapper { overflow: hidden; padding: 0; }
        .erp-table { width: 100%; border-collapse: collapse; text-align: left; }
        .erp-table th { padding: 1.25rem 1.5rem; background: #F8FAFC; color: #475569; border-bottom: 1px solid #E2E8F0; }
        .erp-table td { padding: 1rem 1.5rem; border-bottom: 1px solid #F1F5F9; color: #334155; }
        
        .product-name { font-weight: 600; color: var(--color-dark); }
        .product-price { font-variant-numeric: tabular-nums; color: var(--color-primary-dark); font-weight: 500; }

        .action-buttons { display: flex; gap: 0.5rem; }
        .btn-edit, .btn-delete { padding: 0.4rem 0.8rem; border-radius: 6px; font-size: 0.85rem; font-weight: 600; border: none; cursor: pointer; transition: 0.2s; }
        .btn-edit { background: #E0F2FE; color: #0284C7; }
        .btn-edit:hover { background: #BAE6FD; }
        .btn-delete { background: #FEF2F2; color: #DC2626; }
        .btn-delete:hover { background: #FECACA; }

        .modal-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(4px);
          display: flex; justify-content: center; align-items: center; z-index: 999;
          animation: fadeIn 0.2s ease-out;
        }

        .modal-content {
          width: 100%; max-width: 500px; padding: 2.5rem;
          background: white; transform: translateY(0);
        }
        
        .modal-content h3 { margin-bottom: 1.5rem; font-size: 1.5rem; color: var(--color-dark); }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        
        .modal-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem; }
        .loading-state { padding: 3rem; text-align: center; color: #64748B; }

        @keyframes slideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}
