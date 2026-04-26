import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      const { data, error } = await supabase.from('Order').select('*, user:User(name, email)').order('createdAt', { ascending: false });
      if (!error && data) setOrders(data);
      setLoading(false);
    }
    fetchOrders();
  }, []);

  return (
    <div>
      <h1 style={{ marginBottom: 32 }}>Orders</h1>

      <div className="table-container">
        {loading ? (
          <div className="loading-state">Loading orders...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Order No</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Status</th>
                <th>Total (Paise)</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>No orders found</td>
                </tr>
              ) : (
                orders.map(order => (
                  <tr key={order.id}>
                    <td style={{ fontWeight: 500 }}>{order.orderNo}</td>
                    <td>{order.user?.name || 'Unknown'}</td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${order.status === 'DELIVERED' ? 'success' : 'warning'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>{order.totalPaise}</td>
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
