import React from 'react';

export default function FilterBar({
  records = [],
  filters = {},
  onFilterChange,
  onResetFilters,
}) {
  // Extract unique options from current dataset
  const products = Array.from(new Set(records.map(r => r.productName).filter(Boolean))).sort();
  const categories = Array.from(new Set(records.map(r => r.category).filter(Boolean))).sort();
  const regions = Array.from(new Set(records.map(r => r.region).filter(Boolean))).sort();
  const customers = Array.from(new Set(records.map(r => r.customerName).filter(Boolean))).sort();
  const salespersons = Array.from(new Set(records.map(r => r.salesperson).filter(Boolean))).sort();

  const hasActiveFilters = Object.values(filters).some(v => v !== undefined && v !== '');

  return (
    <div
      style={{
        background: 'rgba(30, 41, 59, 0.65)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '12px',
        padding: '14px 18px',
        marginBottom: '22px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span>🔍</span> Filters:
        </span>

        {/* Date Range */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <input
            type="date"
            value={filters.startDate || ''}
            onChange={(e) => onFilterChange({ ...filters, startDate: e.target.value })}
            className="filter-input-dark"
            title="Start Date"
          />
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>to</span>
          <input
            type="date"
            value={filters.endDate || ''}
            onChange={(e) => onFilterChange({ ...filters, endDate: e.target.value })}
            className="filter-input-dark"
            title="End Date"
          />
        </div>

        {/* Product Dropdown */}
        <select
          value={filters.product || ''}
          onChange={(e) => onFilterChange({ ...filters, product: e.target.value })}
          className="filter-select-dark"
        >
          <option value="">All Products ({products.length})</option>
          {products.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        {/* Category Dropdown */}
        <select
          value={filters.category || ''}
          onChange={(e) => onFilterChange({ ...filters, category: e.target.value })}
          className="filter-select-dark"
        >
          <option value="">All Categories ({categories.length})</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {/* Region Dropdown */}
        <select
          value={filters.region || ''}
          onChange={(e) => onFilterChange({ ...filters, region: e.target.value })}
          className="filter-select-dark"
        >
          <option value="">All Regions ({regions.length})</option>
          {regions.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>

        {/* Customer Dropdown */}
        <select
          value={filters.customer || ''}
          onChange={(e) => onFilterChange({ ...filters, customer: e.target.value })}
          className="filter-select-dark"
        >
          <option value="">All Customers ({customers.length})</option>
          {customers.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {/* Salesperson Dropdown */}
        <select
          value={filters.salesperson || ''}
          onChange={(e) => onFilterChange({ ...filters, salesperson: e.target.value })}
          className="filter-select-dark"
        >
          <option value="">All Sales Reps ({salespersons.length})</option>
          {salespersons.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {hasActiveFilters && (
        <button
          onClick={onResetFilters}
          style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            borderRadius: '6px',
            padding: '6px 12px',
            fontSize: '0.78rem',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            transition: 'all 0.2s ease',
          }}
        >
          <span>✕</span> Reset Filters
        </button>
      )}
    </div>
  );
}
