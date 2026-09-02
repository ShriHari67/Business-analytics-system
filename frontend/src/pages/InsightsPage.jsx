import React from 'react';
import FilterBar from '../components/FilterBar';
import EmptyState from '../components/EmptyState';
import {
  filterRecords,
  generateBusinessInsights,
  calculateKPIs,
} from '../services/dataStore';

export default function InsightsPage({
  records = [],
  filters = {},
  onFilterChange,
  onResetFilters,
  onNavigate,
}) {
  if (!records || records.length === 0) {
    return (
      <EmptyState
        onAddRecord={() => onNavigate('data')}
        onUploadFile={() => onNavigate('data')}
      />
    );
  }

  const filtered = filterRecords(records, filters);
  const insightsData = generateBusinessInsights(filtered);
  const kpis = calculateKPIs(filtered);

  return (
    <div>
      {/* Global Filter Bar */}
      <FilterBar
        records={records}
        filters={filters}
        onFilterChange={onFilterChange}
        onResetFilters={onResetFilters}
      />

      {/* Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.85) 100%)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(6, 182, 212, 0.3)',
          borderRadius: '16px',
          padding: '24px 28px',
          marginBottom: '24px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: 'rgba(6, 182, 212, 0.15)', border: '1px solid rgba(6, 182, 212, 0.3)', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700', color: '#38bdf8', marginBottom: '8px' }}>
              <span>💡 Dynamic Intelligence</span>
              <span>• Evaluated on {kpis.recordCount} records</span>
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#f8fafc', margin: '0 0 6px' }}>
              Automated Business Insights & Anomaly Detection
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
              Algorithmic pattern discovery derived strictly from your user-entered transactions
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>Overall Profit Margin</div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: kpis.profitMargin >= 20 ? '#10b981' : '#f59e0b' }}>
              {kpis.profitMargin}%
            </div>
          </div>
        </div>
      </div>

      {/* CORE 6 HIGHLIGHT DISCOVERY CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {/* 1. Best-Selling Product */}
        <div className="card-section-dark">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <span style={{ fontSize: '1.5rem' }}>🏆</span>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>Best-Selling Product</div>
              <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#f8fafc' }}>
                {insightsData.bestProduct ? insightsData.bestProduct.name : 'N/A'}
              </div>
            </div>
          </div>
          <div style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
            {insightsData.bestProduct ? (
              <>Generated <strong style={{ color: '#38bdf8' }}>₹{insightsData.bestProduct.revenue.toLocaleString('en-IN')}</strong> across {insightsData.bestProduct.quantity} units ({insightsData.bestProduct.sharePct}% revenue share).</>
            ) : 'Insufficient data.'}
          </div>
        </div>

        {/* 2. Most Profitable Product */}
        <div className="card-section-dark">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <span style={{ fontSize: '1.5rem' }}>💰</span>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>Most Profitable Product</div>
              <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#f8fafc' }}>
                {insightsData.mostProfitableProduct ? insightsData.mostProfitableProduct.name : 'N/A'}
              </div>
            </div>
          </div>
          <div style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
            {insightsData.mostProfitableProduct ? (
              <>Yielded <strong style={{ color: '#10b981' }}>₹{insightsData.mostProfitableProduct.profit.toLocaleString('en-IN')}</strong> in net profit ({insightsData.mostProfitableProduct.marginPct}% margin).</>
            ) : 'Insufficient data.'}
          </div>
        </div>

        {/* 3. Lowest-Performing Product */}
        <div className="card-section-dark">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <span style={{ fontSize: '1.5rem' }}>⚠️</span>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>Lowest-Performing Product</div>
              <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#f8fafc' }}>
                {insightsData.lowestProduct ? insightsData.lowestProduct.name : 'N/A'}
              </div>
            </div>
          </div>
          <div style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
            {insightsData.lowestProduct ? (
              <>Recorded <strong style={{ color: '#f87171' }}>₹{insightsData.lowestProduct.revenue.toLocaleString('en-IN')}</strong> revenue ({insightsData.lowestProduct.sharePct}% share). Review pricing or marketing.</>
            ) : 'Single product in catalog.'}
          </div>
        </div>

        {/* 4. Best-Performing Region */}
        <div className="card-section-dark">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <span style={{ fontSize: '1.5rem' }}>🌍</span>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>Leading Sales Territory</div>
              <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#f8fafc' }}>
                {insightsData.bestRegion ? `${insightsData.bestRegion.region} Region` : 'N/A'}
              </div>
            </div>
          </div>
          <div style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
            {insightsData.bestRegion ? (
              <>Generated <strong style={{ color: '#38bdf8' }}>₹{insightsData.bestRegion.revenue.toLocaleString('en-IN')}</strong> ({insightsData.bestRegion.sharePct}% of total regional revenue).</>
            ) : 'Insufficient data.'}
          </div>
        </div>

        {/* 5. Peak Revenue Month */}
        <div className="card-section-dark">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <span style={{ fontSize: '1.5rem' }}>📅</span>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>Peak Revenue Month</div>
              <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#f8fafc' }}>
                {insightsData.peakRevenueMonth ? insightsData.peakRevenueMonth.label : 'N/A'}
              </div>
            </div>
          </div>
          <div style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
            {insightsData.peakRevenueMonth ? (
              <>Highest sales volume recorded at <strong style={{ color: '#38bdf8' }}>₹{insightsData.peakRevenueMonth.revenue.toLocaleString('en-IN')}</strong>.</>
            ) : 'Insufficient data.'}
          </div>
        </div>

        {/* 6. Growth Rate */}
        <div className="card-section-dark">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <span style={{ fontSize: '1.5rem' }}>{insightsData.salesGrowth >= 0 ? '📈' : '📉'}</span>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>Sequential Revenue Trend</div>
              <div style={{ fontSize: '1.05rem', fontWeight: '800', color: insightsData.salesGrowth >= 0 ? '#10b981' : '#f87171' }}>
                {insightsData.salesGrowth >= 0 ? `+${insightsData.salesGrowth}%` : `${insightsData.salesGrowth}%`}
              </div>
            </div>
          </div>
          <div style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
            Profit momentum shifted by {insightsData.profitGrowth >= 0 ? `+${insightsData.profitGrowth}%` : `${insightsData.profitGrowth}%`} over chronological periods.
          </div>
        </div>
      </div>

      {/* AI INSIGHTS NARRATIVE STREAM */}
      <div className="card-section-dark" style={{ marginBottom: '24px' }}>
        <div className="section-header-dark">
          <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#f8fafc', margin: 0 }}>
            🧠 Automated Narrative Insights
          </h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {insightsData.insights.map((item, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '14px',
                padding: '14px 18px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(6, 182, 212, 0.1)',
                  border: '1px solid rgba(6, 182, 212, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.1rem',
                  flexShrink: 0,
                }}
              >
                {item.icon}
              </div>
              <div>
                <h4 style={{ margin: '0 0 4px', fontSize: '0.92rem', fontWeight: '700', color: '#f8fafc' }}>
                  {item.title}
                </h4>
                <p style={{ margin: 0, fontSize: '0.84rem', color: '#cbd5e1', lineHeight: '1.5' }}>
                  {item.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MARGIN OPTIMIZATION ADVISORY TABLE */}
      {insightsData.lowMarginItems && insightsData.lowMarginItems.length > 0 && (
        <div className="card-section-dark">
          <div className="section-header-dark">
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#fca5a5', margin: '0 0 2px' }}>
                🚨 Low Profit Margin Warning List
              </h3>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Products yielding below 15% profit margin based on your cost vs revenue inputs
              </div>
            </div>
          </div>

          <div className="table-responsive">
            <table className="data-table-dark">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Total Revenue</th>
                  <th>Total Cost</th>
                  <th>Net Profit</th>
                  <th>Profit Margin</th>
                  <th>Action Required</th>
                </tr>
              </thead>
              <tbody>
                {insightsData.lowMarginItems.map((p, idx) => (
                  <tr key={idx}>
                    <td><strong style={{ color: '#f8fafc' }}>{p.name}</strong></td>
                    <td><span className="badge-dark badge-category">{p.category}</span></td>
                    <td>₹{p.revenue.toLocaleString('en-IN')}</td>
                    <td style={{ color: '#ef4444' }}>₹{p.cost.toLocaleString('en-IN')}</td>
                    <td style={{ color: p.profit >= 0 ? '#10b981' : '#ef4444', fontWeight: '700' }}>
                      ₹{p.profit.toLocaleString('en-IN')}
                    </td>
                    <td>
                      <span className="badge-dark badge-warning">{p.marginPct}%</span>
                    </td>
                    <td style={{ fontSize: '0.78rem', color: '#f59e0b' }}>
                      {p.profit <= 0 ? 'Operating at a loss; renegotiate cost' : 'Low margin; adjust retail markup'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
