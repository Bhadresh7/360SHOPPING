import React, { useState, useEffect } from "react";
import axios from "axios";
import { useApp } from "../context/AppContext";

export function SellerDashboard() {
  const { token } = useApp();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "1"
  });

  const fetchMyProducts = async () => {
    try {
      const res = await axios.get("http://localhost:4000/api/products/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(res.data);
    } catch (err) {
      console.error("Failed to fetch products", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchMyProducts();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://localhost:4000/api/products",
        {
          ...formData,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock)
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setShowForm(false);
      setFormData({ name: "", description: "", price: "", category: "", stock: "1" });
      fetchMyProducts();
    } catch (err) {
      alert("Failed to create product");
    }
  };

  return (
    <div className="view active">
      <div className="view-header">
        <h1 className="text-3xl font-bold">Seller Dashboard</h1>
        <p className="text-muted">Manage your listings and sales</p>
      </div>

      <div className="mt-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">My Products</h2>
          <button 
            className="btn-gold" 
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "Cancel" : "List New Product"}
          </button>
        </div>

        {showForm && (
          <div className="card mb-8 p-6 bg-surface border border-border rounded-xl">
            <h3 className="text-lg font-medium mb-4">List a new product</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  className="bg-bg border border-border p-3 rounded-lg w-full"
                  placeholder="Product Name"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  required
                />
                <input
                  className="bg-bg border border-border p-3 rounded-lg w-full"
                  placeholder="Category"
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  required
                />
                <input
                  className="bg-bg border border-border p-3 rounded-lg w-full"
                  placeholder="Price (INR)"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: e.target.value})}
                  required
                />
                <input
                  className="bg-bg border border-border p-3 rounded-lg w-full"
                  placeholder="Stock"
                  type="number"
                  value={formData.stock}
                  onChange={e => setFormData({...formData, stock: e.target.value})}
                  required
                />
              </div>
              <textarea
                className="bg-bg border border-border p-3 rounded-lg w-full"
                placeholder="Description"
                rows={3}
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                required
              />
              <button type="submit" className="btn-gold w-full py-3 rounded-lg font-bold">Create Listing</button>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center py-20">Loading your products...</div>
        ) : products.length === 0 ? (
          <div className="card p-12 text-center bg-surface border border-border rounded-xl">
            <div className="text-4xl mb-4">📦</div>
            <h3 className="text-lg font-medium">You haven't listed any products yet</h3>
            <p className="text-muted mt-2">Start selling by clicking the "List New Product" button above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(product => (
              <div key={product.id} className="card p-4 bg-surface border border-border rounded-xl flex flex-col">
                <div className="text-4xl mb-3">{product.imageEmoji}</div>
                <h3 className="font-bold text-lg">{product.name}</h3>
                <p className="text-sm text-muted flex-grow">{product.description}</p>
                <div className="mt-4 flex justify-between items-center">
                  <span className="font-bold text-gold">{product.price}</span>
                  <span className="text-xs px-2 py-1 bg-bg rounded border border-border">Stock: {product.stock}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
