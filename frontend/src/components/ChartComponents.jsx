import React, { useState } from 'react';

/**
 * 1. Monthly Revenue Area/Line Chart
 */
export function MonthlyRevenueChart({ data = [], height = 230 }) {
  const [hoverIdx, setHoverIdx] = useState(null);

  if (!data || data.length === 0) {
    return <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '0.85rem' }}>No monthly data available</div>;
  }

  const maxVal = Math.max(...data.map(d => d.revenue || 0), 1000);
  const width = 500;
  const padding = 40;
  const chartW = width - padding * 2;
  const chartH = height - padding * 2;

  const points = data.map((d, i) => {
    const x = padding + (i / Math.max(data.length - 1, 1)) * chartW;
    const y = height - padding - ((d.revenue || 0) / maxVal) * chartH;
    return { x, y, ...d };
  });

  const pathD = points.length > 1
    ? points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '')
    : `M ${padding} ${height - padding} L ${width - padding} ${height - padding}`;

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
        <defs>
          <linearGradient id="cyanRevenueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 0.33, 0.66, 1].map((pct, idx) => (
          <line
            key={idx}
            x1={padding}
            y1={padding + chartH * pct}
            x2={width - padding}
            y2={padding + chartH * pct}
            stroke="rgba(255, 255, 255, 0.05)"
            strokeDasharray="4 4"
          />
        ))}

        {/* Area fill */}
        <path d={areaD} fill="url(#cyanRevenueGrad)" />

        {/* Line stroke */}
        <path d={pathD} fill="none" stroke="#06b6d4" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

        {/* Data points */}
        {points.map((p, idx) => (
          <g key={idx} onMouseEnter={() => setHoverIdx(idx)} onMouseLeave={() => setHoverIdx(null)}>
            <circle
              cx={p.x}
              cy={p.y}
              r={hoverIdx === idx ? 6 : 4}
              fill="#0b0f19"
              stroke="#06b6d4"
              strokeWidth="2.5"
              style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
            />
            <text
              x={p.x}
              y={height - 12}
              fontSize="9"
              fill="#94a3b8"
              textAnchor="middle"
              fontWeight="500"
            >
              {p.label || p.monthKey}
            </text>
          </g>
        ))}
      </svg>

      {hoverIdx !== null && points[hoverIdx] && (
        <div
          style={{
            position: 'absolute',
            top: '8px',
            right: '12px',
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid rgba(6, 182, 212, 0.4)',
            color: '#f8fafc',
            padding: '6px 12px',
            borderRadius: '8px',
            fontSize: '0.78rem',
            boxShadow: '0 8px 16px rgba(0,0,0,0.5)',
            pointerEvents: 'none',
          }}
        >
          <strong style={{ color: '#06b6d4' }}>{points[hoverIdx].label || points[hoverIdx].monthKey}</strong>: ₹{points[hoverIdx].revenue?.toLocaleString('en-IN')} (Profit: ₹{points[hoverIdx].profit?.toLocaleString('en-IN')})
        </div>
      )}
    </div>
  );
}

/**
 * 2. Monthly Profit Bar Chart
 */
export function MonthlyProfitChart({ data = [], height = 230 }) {
  const [hoverIdx, setHoverIdx] = useState(null);

  if (!data || data.length === 0) {
    return <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '0.85rem' }}>No profit data available</div>;
  }

  const maxVal = Math.max(...data.map(d => Math.max(d.profit || 0, d.revenue || 0)), 1000);
  const width = 500;
  const padding = 40;
  const chartW = width - padding * 2;
  const chartH = height - padding * 2;
  const barWidth = Math.min(36, chartW / (data.length * 1.6));

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
        {[0, 0.33, 0.66, 1].map((pct, idx) => (
          <line
            key={idx}
            x1={padding}
            y1={padding + chartH * pct}
            x2={width - padding}
            y2={padding + chartH * pct}
            stroke="rgba(255, 255, 255, 0.05)"
            strokeDasharray="4 4"
          />
        ))}

        {data.map((d, i) => {
          const x = padding + (i / Math.max(data.length - 1, 1)) * (chartW - barWidth);
          const barH = ((d.profit || 0) / maxVal) * chartH;
          const y = height - padding - barH;

          return (
            <g key={i} onMouseEnter={() => setHoverIdx(i)} onMouseLeave={() => setHoverIdx(null)}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(barH, 2)}
                rx="4"
                fill="url(#emeraldGrad)"
                style={{ cursor: 'pointer', transition: 'all 0.2s ease', opacity: hoverIdx === i ? 1 : 0.85 }}
              />
              <text
                x={x + barWidth / 2}
                y={height - 12}
                fontSize="9"
                fill="#94a3b8"
                textAnchor="middle"
                fontWeight="500"
              >
                {d.label || d.monthKey}
              </text>
            </g>
          );
        })}

        <defs>
          <linearGradient id="emeraldGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>
        </defs>
      </svg>

      {hoverIdx !== null && data[hoverIdx] && (
        <div
          style={{
            position: 'absolute',
            top: '8px',
            right: '12px',
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            color: '#f8fafc',
            padding: '6px 12px',
            borderRadius: '8px',
            fontSize: '0.78rem',
            boxShadow: '0 8px 16px rgba(0,0,0,0.5)',
            pointerEvents: 'none',
          }}
        >
          <strong style={{ color: '#10b981' }}>{data[hoverIdx].label || data[hoverIdx].monthKey}</strong>: Net Profit ₹{data[hoverIdx].profit?.toLocaleString('en-IN')}
        </div>
      )}
    </div>
  );
}

/**
 * 3. Sales by Product (Horizontal Ranking Bars)
 */
export function SalesByProductChart({ products = [] }) {
  if (!products || products.length === 0) {
    return <div style={{ color: '#64748b', fontSize: '0.85rem' }}>No product records found</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {products.slice(0, 7).map((p, idx) => (
        <div key={idx}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
            <span style={{ fontWeight: '600', color: '#e2e8f0' }}>{p.name}</span>
            <span style={{ fontWeight: '700', color: '#38bdf8' }}>
              ₹{p.revenue?.toLocaleString('en-IN')} <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>({p.quantity} units)</span>
            </span>
          </div>
          <div style={{ height: '7px', width: '100%', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${p.sharePct || 0}%`,
                background: 'linear-gradient(90deg, #38bdf8, #2563eb)',
                borderRadius: '4px',
                transition: 'width 0.6s ease-out',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * 4. Sales by Category (Distribution Bars & Breakdown)
 */
export function SalesByCategoryChart({ categories = [] }) {
  if (!categories || categories.length === 0) {
    return <div style={{ color: '#64748b', fontSize: '0.85rem' }}>No category records found</div>;
  }

  const colors = ['#06b6d4', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {categories.map((c, idx) => {
        const color = colors[idx % colors.length];
        return (
          <div key={idx}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
              <span style={{ fontWeight: '600', color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: color }}></span>
                {c.name}
              </span>
              <span style={{ fontWeight: '700', color: '#f8fafc' }}>
                ₹{c.revenue?.toLocaleString('en-IN')} <span style={{ color: '#64748b', fontSize: '0.75rem' }}>({c.percentage}%)</span>
              </span>
            </div>
            <div style={{ height: '8px', width: '100%', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${c.percentage || 0}%`,
                  backgroundColor: color,
                  borderRadius: '4px',
                  transition: 'width 0.6s ease-out',
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * 5. Revenue by Region (Geographic Distribution)
 */
export function RevenueByRegionChart({ regions = [] }) {
  if (!regions || regions.length === 0) {
    return <div style={{ color: '#64748b', fontSize: '0.85rem' }}>No regional records found</div>;
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
      {regions.map((r, idx) => (
        <div
          key={idx}
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '10px',
            padding: '12px 14px',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>
            {r.region}
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#f8fafc', margin: '4px 0' }}>
            ₹{r.revenue?.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: '600' }}>
            {r.sharePct}% share ({r.orderCount} orders)
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * 6. Top 5 Products Leaderboard
 */
export function Top5ProductsChart({ products = [] }) {
  if (!products || products.length === 0) {
    return <div style={{ color: '#64748b', fontSize: '0.85rem' }}>No product records found</div>;
  }

  const top5 = products.slice(0, 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {top5.map((p, idx) => (
        <div
          key={idx}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.06)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                backgroundColor: idx === 0 ? 'rgba(250, 204, 21, 0.2)' : idx === 1 ? 'rgba(203, 213, 225, 0.2)' : 'rgba(249, 115, 22, 0.2)',
                color: idx === 0 ? '#facc15' : idx === 1 ? '#cbd5e1' : '#f97316',
                border: `1px solid ${idx === 0 ? '#facc15' : idx === 1 ? '#cbd5e1' : '#f97316'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: '800',
              }}
            >
              #{idx + 1}
            </span>
            <div>
              <div style={{ fontSize: '0.86rem', fontWeight: '700', color: '#f8fafc' }}>{p.name}</div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{p.quantity} units sold • Margin: {p.marginPct}%</div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.92rem', fontWeight: '800', color: '#38bdf8' }}>
              ₹{p.revenue?.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: '700' }}>
              +₹{p.profit?.toLocaleString('en-IN')} profit
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * 7. Profit vs Cost Comparative Bars
 */
export function ProfitVsCostChart({ data = [] }) {
  if (!data || data.length === 0) {
    return <div style={{ color: '#64748b', fontSize: '0.85rem' }}>No financial comparison data</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {data.map((item, idx) => {
        const total = (item.cost || 0) + (item.profit || 0);
        const costPct = total > 0 ? ((item.cost || 0) / total) * 100 : 50;
        const profitPct = total > 0 ? ((item.profit || 0) / total) * 100 : 50;

        return (
          <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '6px' }}>
              <span style={{ fontWeight: '700', color: '#f1f5f9' }}>{item.label || item.monthKey}</span>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Cost: <strong style={{ color: '#f87171' }}>₹{item.cost?.toLocaleString('en-IN')}</strong> | Profit: <strong style={{ color: '#10b981' }}>₹{item.profit?.toLocaleString('en-IN')}</strong>
              </span>
            </div>
            <div style={{ height: '10px', width: '100%', borderRadius: '5px', overflow: 'hidden', display: 'flex' }}>
              <div style={{ width: `${costPct}%`, backgroundColor: '#ef4444', title: `Cost: ${Math.round(costPct)}%` }} />
              <div style={{ width: `${profitPct}%`, backgroundColor: '#10b981', title: `Profit: ${Math.round(profitPct)}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * 8. Customer Performance Top Spenders
 */
export function CustomerPerformanceChart({ customers = [] }) {
  if (!customers || customers.length === 0) {
    return <div style={{ color: '#64748b', fontSize: '0.85rem' }}>No customer records found</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {customers.slice(0, 6).map((c, idx) => (
        <div
          key={idx}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 12px',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
          }}
        >
          <div>
            <div style={{ fontSize: '0.84rem', fontWeight: '700', color: '#f8fafc' }}>{c.name}</div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{c.ordersCount} transaction(s) • Region: {c.region}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#38bdf8' }}>
              ₹{c.totalSpent?.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: '600' }}>
              +₹{c.profitGenerated?.toLocaleString('en-IN')} profit
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
