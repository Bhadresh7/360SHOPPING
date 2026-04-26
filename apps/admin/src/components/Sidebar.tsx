
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Users, CalendarDays } from 'lucide-react';

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div style={{ width: 32, height: 32, backgroundColor: 'var(--accent-primary)', borderRadius: 8 }}></div>
        <span>Shopie Admin</span>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/products" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Package size={20} />
          <span>Products</span>
        </NavLink>
        <NavLink to="/orders" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <ShoppingCart size={20} />
          <span>Orders</span>
        </NavLink>
        <NavLink to="/users" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Users size={20} />
          <span>Users</span>
        </NavLink>
        <NavLink to="/bookings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <CalendarDays size={20} />
          <span>Bookings</span>
        </NavLink>
      </nav>
    </aside>
  );
}
