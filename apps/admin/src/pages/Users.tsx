import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function Users() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      const { data, error } = await supabase.from('User').select('*').order('createdAt', { ascending: false });
      if (!error && data) setUsers(data);
      setLoading(false);
    }
    fetchUsers();
  }, []);

  return (
    <div>
      <h1 style={{ marginBottom: 32 }}>Users</h1>

      <div className="table-container">
        {loading ? (
          <div className="loading-state">Loading users...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Loyalty Points</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>No users found</td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user.id}>
                    <td style={{ fontWeight: 500 }}>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.phone || '-'}</td>
                    <td>{user.loyaltyPoints}</td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
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
