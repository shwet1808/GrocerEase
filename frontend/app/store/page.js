"use client";
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import ProductCard from '../../components/ProductCard';

export default function StoreCatalog() {
  const { user, token, loading } = useAuth();
  const [products, setProducts] = useState([]);
  const [fetchingProducts, setFetchingProducts] = useState(true);
  const router = useRouter();

  // Protect this route: Only logged in users can see the store catalog
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchProducts();
    }
  }, [user]);

  const fetchProducts = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/products`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setFetchingProducts(false);
    }
  };

  if (loading || (!user && !loading)) {
    return <div className="loader-container" style={{ minHeight: '60vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><div className="loader"></div></div>;
  }

  return (
    <div className="store-container">
      <div className="store-header">
         <h2>Product Catalog</h2>
         <p>View our currently available inventory and pricing.</p>
      </div>

      {fetchingProducts ? (
        <div className="loading-grid">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(skeleton => (
            <div key={skeleton} className="skeleton-card"></div>
          ))}
        </div>
      ) : (
        <div className="products-grid">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      <style jsx>{`
        .store-container {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          animation: fadeIn 0.5s ease-out;
        }

        .store-header {
          margin-bottom: 3rem;
          text-align: center;
        }

        .store-header h2 {
          font-size: 2.5rem;
          color: var(--color-dark);
          font-weight: 800;
          letter-spacing: -1px;
        }

        .store-header p {
          color: var(--color-text-muted);
          font-size: 1.1rem;
        }

        .products-grid, .loading-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 2rem;
          padding: 1rem 0;
        }

        .skeleton-card {
          height: 250px;
          background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
          background-size: 200% 100%;
          animation: pulse 1.5s infinite;
          border-radius: var(--radius-lg);
        }

        @keyframes pulse {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
