import React from 'react';
import { Bell, Search, User } from 'lucide-react';

export function Topbar() {
  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)' }}>
        <Search size={20} />
        <input 
          type="text" 
          placeholder="Search everywhere..." 
          style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none' }}
        />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', color: 'var(--text-secondary)' }}>
        <Bell size={20} style={{ cursor: 'pointer' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: 'var(--bg-surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={20} />
          </div>
          <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>Admin User</span>
        </div>
      </div>
    </header>
  );
}
