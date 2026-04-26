import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Plus } from 'lucide-react';

export function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase.from('Product').select('*').order('createdAt', { ascending: false });
      if (!error && data) setProducts(data);
      setLoading(false);
    }
    fetchProducts();
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <h1>Products</h1>
        <button style={{ 
          backgroundColor: 'var(--accent-primary)', 
          color: 'white', 
          border: 'none', 
          padding: '10px 16px', 
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          cursor: 'pointer',
          fontWeight: 500
        }}>
          <Plus size={18} /> Add Product
        </button>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="loading-state">Loading products...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price (Paise)</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>No products found</td>
                </tr>
              ) : (
                products.map(product => (
                  <tr key={product.id}>
                    <td>{product.sku}</td>
                    <td style={{ fontWeight: 500 }}>{product.name}</td>
                    <td>{product.category}</td>
                    <td>{product.pricePaise}</td>
                    <td>
                      <span className={`badge ${product.stock > 10 ? 'success' : 'warning'}`}>
                        {product.stock} in stock
                      </span>
                    </td>
                    <td>
                      <button style={{ background: 'transparent', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer' }}>Edit</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
