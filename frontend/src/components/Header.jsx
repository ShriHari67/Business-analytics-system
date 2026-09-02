import React from 'react';

export default function Header({
  title,
  subtitle,
  totalRecords = 0,
  onToggleMobileMenu,
  onOpenAddModal,
  onOpenUploadModal,
}) {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="top-header-dark">
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <button
          onClick={onToggleMobileMenu}
          className="mobile-menu-btn"
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            fontSize: '1.4rem',
            cursor: 'pointer',
            color: '#f8fafc',
          }}
        >
          ☰
        </button>
        <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#f8fafc', margin: 0, letterSpacing: '-0.01em' }}>
            {title}
          </h2>
          <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0 }}>
            {subtitle}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>📅</span>
          <span>{today}</span>
        </div>

        <div className={`system-badge-dark ${totalRecords > 0 ? 'online' : 'empty'}`}>
          <span className="pulse-dot-cyan"></span>
          {totalRecords > 0 ? `${totalRecords} User Records Live` : 'No Data Entered'}
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={onOpenUploadModal}
            className="btn-outline-dark"
            style={{ padding: '6px 12px', fontSize: '0.78rem' }}
            title="Upload CSV / Excel"
          >
            <span>📥</span> Upload
          </button>
          <button
            onClick={onOpenAddModal}
            className="btn-glow-primary"
            style={{ padding: '6px 12px', fontSize: '0.78rem' }}
          >
            <span>➕</span> Add Record
          </button>
        </div>
      </div>
    </header>
  );
}
