import React from 'react';

export default function StatCard({ title, value, icon, trend, trendText, color = '#06b6d4' }) {
  const isNumeric = typeof value === 'number';
  const displayVal = isNumeric ? `₹${value.toLocaleString('en-IN')}` : value;

  return (
    <div className="stat-card-dark">
      <div className="stat-card-header-dark">
        <span className="stat-title-dark">{title}</span>
        <div
          className="stat-icon-wrapper-dark"
          style={{
            backgroundColor: `${color}1a`,
            color: color,
            border: `1px solid ${color}40`,
          }}
        >
          {icon}
        </div>
      </div>

      <div className="stat-value-dark" style={{ color: '#f8fafc' }}>
        {displayVal}
      </div>

      {trendText && (
        <div className="stat-footer-dark">
          {trend && (
            <span style={{ color: trend === 'up' ? '#10b981' : '#ef4444', fontWeight: '700', marginRight: '4px' }}>
              {trend === 'up' ? '▲' : '▼'}
            </span>
          )}
          <span>{trendText}</span>
        </div>
      )}
    </div>
  );
}
