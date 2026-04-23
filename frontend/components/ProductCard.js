"use client";
import React from 'react';

export default function ProductCard({ product }) {
  return (
    <div className="glass-card product-card">
      <div className="product-info">
        <h3>{product.name}</h3>
        <p className="description">{product.description}</p>
      </div>
      <div className="product-footer">
        <span className="price">₹{parseFloat(product.price).toFixed(2)}</span>
        <div className="stock-status">
          {product.stock_quantity > 0 ? (
            <span className="in-stock">Available ({product.stock_quantity} in stock)</span>
          ) : (
            <span className="out-of-stock">Out of Stock</span>
          )}
        </div>
      </div>

      <style jsx>{`
        .product-card {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          padding: 1.8rem;
          border-top: 4px solid transparent;
        }

        .product-card:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-strong);
          border-top: 4px solid var(--color-primary);
        }

        .product-info h3 {
          font-size: 1.3rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          color: var(--color-dark);
        }

        .description {
          color: var(--color-text-muted);
          font-size: 0.95rem;
          line-height: 1.5;
          margin-bottom: 1.5rem;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .product-footer {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-top: auto;
          border-top: 1px solid var(--color-table-border);
          padding-top: 1rem;
        }

        .price {
          font-size: 1.6rem;
          font-weight: 800;
          color: var(--color-primary-dark);
        }

        .stock-status {
          display: flex;
          align-items: center;
        }

        .in-stock {
          background: #D1FAE5;
          color: #065F46;
          padding: 0.4rem 1rem;
          border-radius: 999px;
          font-size: 0.85rem;
          font-weight: 600;
          border: 1px solid #A7F3D0;
        }

        .out-of-stock {
          background: #FEE2E2;
          color: #991B1B;
          padding: 0.4rem 1rem;
          border-radius: 999px;
          font-size: 0.85rem;
          font-weight: 600;
          border: 1px solid #FECACA;
        }
      `}</style>
    </div>
  );
}
