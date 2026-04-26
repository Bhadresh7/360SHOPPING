import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Users, Package, ShoppingCart, IndianRupee } from 'lucide-react';

export function Dashboard() {
  const [stats, setStats] = useState({ products: 0, users: 0, orders: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [productsRes, usersRes, ordersRes] = await Promise.all([
          supabase.from('Product').select('*', { count: 'exact', head: true }),
          supabase.from('User').select('*', { count: 'exact', head: true }),
          supabase.from('Order').select('*', { count: 'exact', head: true })
        ]);
        
        setStats({
          products: productsRes.count || 0,
          users: usersRes.count || 0,
          orders: ordersRes.count || 0
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <div>
      <h1 style={{ marginBottom: 32 }}>Dashboard Overview</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span>Total Revenue</span>
            <IndianRupee size={20} color="var(--accent-success)" />
          </div>
          <div className="stat-value">₹124,500</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <span>Total Orders</span>
            <ShoppingCart size={20} color="var(--accent-primary)" />
          </div>
          <div className="stat-value">{loading ? '...' : stats.orders}</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <span>Products</span>
            <Package size={20} color="var(--accent-warning)" />
          </div>
          <div className="stat-value">{loading ? '...' : stats.products}</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <span>Active Users</span>
            <Users size={20} color="var(--text-secondary)" />
          </div>
          <div className="stat-value">{loading ? '...' : stats.users}</div>
        </div>
      </div>
      
      <div className="table-container">
        <div style={{ padding: 24, borderBottom: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '1.125rem' }}>Recent Activity</h2>
        </div>
        <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
          System activity will appear here.
        </div>
      </div>
    </div>
  );
}
