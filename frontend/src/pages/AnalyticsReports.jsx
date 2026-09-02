import React, { useEffect, useState } from 'react';
import { getPythonAnalytics } from '../services/api';

export default function AnalyticsReports() {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      const res = await getPythonAnalytics();
      setAnalyticsData(res.data);
      setLoading(false);
    };
    fetchAnalytics();
  }, []);

  if (loading || !analyticsData) {
    return <div style={{ padding: '20px' }}>Processing NumPy & Pandas statistical calculations...</div>;
  }

  const pnl = analyticsData.profit_and_loss || {};
  const cf = analyticsData.cash_flow || {};
  const trends = analyticsData.sales_trends || {};
  const expenses = analyticsData.expense_breakdown || [];

  return (
    <div>
      <div className="card-section">
        <div className="section-header">
          <div>
            <h3>Python Analytics Engine (Pandas + NumPy)</h3>
            <div style={{ fontSize: '0.82rem', color: 'var(--slate-500)', marginTop: '4px' }}>
              Advanced numerical analytics, margin ratios, cash flow projections, and moving averages
            </div>
          </div>
          <span className="badge badge-sale">Engine v1.0 (Active)</span>
        </div>

        {/* Statistical Metrics Highlights */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div style={{ padding: '16px', background: 'var(--slate-50)', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', textTransform: 'uppercase' }}>Gross Margin Ratio</div>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--primary)', marginTop: '4px' }}>
              {pnl.gross_margin_percent}%
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)' }}>Revenue minus COGS</div>
          </div>

          <div style={{ padding: '16px', background: 'var(--slate-50)', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', textTransform: 'uppercase' }}>Net Margin Ratio</div>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--success)', marginTop: '4px' }}>
              {pnl.net_margin_percent}%
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)' }}>Post overheads & payroll</div>
          </div>

          <div style={{ padding: '16px', background: 'var(--slate-50)', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', textTransform: 'uppercase' }}>Moving Average Trend</div>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#06b6d4', marginTop: '4px' }}>
              ₹{trends.latest_moving_average?.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)' }}>NumPy convolution window</div>
          </div>

          <div style={{ padding: '16px', background: 'var(--slate-50)', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', textTransform: 'uppercase' }}>Next Sale Estimate</div>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#8b5cf6', marginTop: '4px' }}>
              ₹{trends.projected_next_sale_estimate?.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)' }}>Linear regression slope</div>
          </div>
        </div>

        {/* Expense Breakdown via Pandas GroupBy */}
        <div style={{ marginTop: '20px' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '14px', color: 'var(--slate-800)' }}>
            Expense Pareto Distribution (Pandas Aggregation)
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {expenses.map((exp, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '160px', fontSize: '0.82rem', fontWeight: '600', color: 'var(--slate-700)' }}>
                  {exp.category}
                </div>
                <div style={{ flex: 1, backgroundColor: 'var(--slate-100)', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${exp.percentage}%`,
                      backgroundColor: index === 0 ? 'var(--primary)' : index === 1 ? '#06b6d4' : '#f59e0b',
                      height: '100%',
                    }}
                  ></div>
                </div>
                <div style={{ width: '100px', textAlign: 'right', fontSize: '0.82rem', fontWeight: '700' }}>
                  ₹{exp.amount?.toLocaleString('en-IN')} ({exp.percentage}%)
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
