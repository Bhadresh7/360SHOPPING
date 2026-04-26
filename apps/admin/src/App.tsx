
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from './components/AdminLayout';
import { Dashboard } from './pages/Dashboard';
import { Products } from './pages/Products';
import { Orders } from './pages/Orders';
import { Users } from './pages/Users';

export default function App() {
  return (
    <BrowserRouter basename="/admin">
      <Routes>
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="orders" element={<Orders />} />
          <Route path="users" element={<Users />} />
          <Route path="bookings" element={<div style={{padding: 32}}>Bookings module coming soon.</div>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
