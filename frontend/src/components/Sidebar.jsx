import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ activeTab, onSelectTab, isMobileOpen, totalRecords = 0 }) {
  const { user, logout } = useAuth();
  const CORE_NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'data', label: 'Data Management', icon: '📝' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'insights', label: 'Business Insights', icon: '💡' },
    { id: 'reports', label: 'Reports', icon: '📑' },
  ];

  const BUSINESS_MODULES = [
    { id: 'salary', label: 'Employee Salary', icon: '💼' },
    { id: 'credit', label: 'Business Credit', icon: '📥' },
    { id: 'debit', label: 'Business Debit', icon: '📤' },
  ];

  return (
    <aside className={`sidebar-dark ${isMobileOpen ? 'mobile-open' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-header-dark">
        <div className="logo-badge-cyan">BA</div>
        <div className="brand-text-dark">
          <h1>Business Analytics</h1>
          <p>Enterprise SaaS</p>
        </div>
      </div>

      {/* Dataset Records Indicator */}
      <div style={{ padding: '14px 18px 6px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '8px',
            fontSize: '0.75rem',
            color: '#94a3b8',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: totalRecords > 0 ? '#10b981' : '#64748b',
              }}
            />
            Sales Ledger:
          </span>
          <span style={{ fontWeight: '800', color: totalRecords > 0 ? '#38bdf8' : '#94a3b8' }}>
            {totalRecords} records
          </span>
        </div>
      </div>

      {/* Main Nav Items */}
      <nav className="sidebar-nav-dark">
        <div className="nav-section-title-dark">Analytics Core</div>
        {CORE_NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item-dark ${isActive ? 'active' : ''}`}
              onClick={() => onSelectTab(item.id)}
            >
              <span className="nav-icon-dark">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}

        <div className="nav-section-title-dark" style={{ marginTop: '10px' }}>Business Operations</div>
        {BUSINESS_MODULES.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item-dark ${isActive ? 'active' : ''}`}
              onClick={() => onSelectTab(item.id)}
            >
              <span className="nav-icon-dark">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}

        <div className="nav-section-title-dark" style={{ marginTop: '10px' }}>System</div>
        <button
          className={`nav-item-dark ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => onSelectTab('settings')}
        >
          <span className="nav-icon-dark">⚙️</span>
          <span>Settings</span>
        </button>
      </nav>

      {/* Sidebar Footer */}
      <div className="sidebar-footer-dark">
        <div className="user-avatar-dark">
          AD
        </div>
        <div className="user-meta-dark" style={{ flex: 1 }}>
          <div className="name">{user?.fullName || user?.username || 'Demo User'}</div>
          <div className="role">{user?.role || 'ADMIN'}</div>
        </div>
        <button
          type="button"
          onClick={logout}
          title="Sign out"
          style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            color: '#f87171',
            borderRadius: '7px',
            padding: '6px 8px',
            cursor: 'pointer',
            fontSize: '0.75rem'
          }}
        >
          ↪
        </button>
      </div>
    </aside>
  );
}
