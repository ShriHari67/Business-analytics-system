import React from 'react';
import StatCard from '../components/StatCard';
import FilterBar from '../components/FilterBar';
import EmptyState from '../components/EmptyState';
import {
  MonthlyRevenueChart,
  MonthlyProfitChart,
  SalesByCategoryChart,
  RevenueByRegionChart,
  Top5ProductsChart,
} from '../components/ChartComponents';
import {
  filterRecords,
  calculateKPIs,
  getMonthlyTrend,
  getSalesByProduct,
  getSalesByCategory,
  getRevenueByRegion,
  calculateIntegratedBusinessBalance,
} from '../services/dataStore';

export default function Dashboard({
  records = [],
  salaries = [],
  credits = [],
  debits = [],
  filters = {},
  onFilterChange,
  onResetFilters,
  onNavigate,
}) {
  // If user has zero records across all modules, show empty state
  const hasAnyData = records.length > 0 || salaries.length > 0 || credits.length > 0 || debits.length > 0;

  if (!hasAnyData) {
    return (
      <EmptyState
        onAddRecord={() => onNavigate('data')}
        onUploadFile={() => onNavigate('data')}
      />
    );
  }

  // Filter records based on global filters
  const filtered = filterRecords(records, filters);
  const kpis = calculateKPIs(filtered);
  const monthlyTrend = getMonthlyTrend(filtered);
  const productStats = getSalesByProduct(filtered);
  const categoryStats = getSalesByCategory(filtered);
  const regionStats = getRevenueByRegion(filtered);

  // Integrated Balance Calculations (Dynamically from User Data)
  const balanceData = calculateIntegratedBusinessBalance(credits, debits, salaries);

  return (
    <div>
      {/* Global Filter Bar */}
      {records.length > 0 && (
        <FilterBar
          records={records}
          filters={filters}
          onFilterChange={onFilterChange}
          onResetFilters={onResetFilters}
        />
      )}

      {/* INTEGRATED BUSINESS BALANCE & CASH FLOW SECTION */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.85) 100%)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(6, 182, 212, 0.3)',
          borderRadius: '16px',
          padding: '20px 24px',
          marginBottom: '24px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.35)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '3px 10px', background: 'rgba(6, 182, 212, 0.15)', border: '1px solid rgba(6, 182, 212, 0.3)', borderRadius: '20px', fontSize: '0.72rem', fontWeight: '700', color: '#38bdf8', marginBottom: '6px' }}>
              <span>⚖️ Integrated Business Balance</span>
              <span>• Net Balance = Total Credit - Total Debit</span>
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#f8fafc', margin: 0 }}>
              Financial Balance & Working Capital Overview
            </h2>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => onNavigate('salary')} className="btn-outline-dark" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
              💼 Salaries
            </button>
            <button onClick={() => onNavigate('credit')} className="btn-outline-dark" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
              📥 Credit
            </button>
            <button onClick={() => onNavigate('debit')} className="btn-outline-dark" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
              📤 Debit
            </button>
          </div>
        </div>

        {/* 4 CORE CASHFLOW / BALANCE TILES */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
          {/* Total Credit */}
          <div
            onClick={() => onNavigate('credit')}
            style={{
              padding: '14px',
              borderRadius: '10px',
              backgroundColor: 'rgba(6, 182, 212, 0.08)',
              border: '1px solid rgba(6, 182, 212, 0.25)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>
              📥 Total Credit (Receivables)
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#06b6d4', marginTop: '2px' }}>
              ₹{balanceData.totalCredit.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#38bdf8', marginTop: '2px' }}>
              Paid: ₹{balanceData.paidCredit.toLocaleString('en-IN')} • Pending: ₹{balanceData.pendingCredit.toLocaleString('en-IN')}
            </div>
          </div>

          {/* Total Debit */}
          <div
            onClick={() => onNavigate('debit')}
            style={{
              padding: '14px',
              borderRadius: '10px',
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>
              📤 Total Debit (Payables)
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#f87171', marginTop: '2px' }}>
              ₹{balanceData.totalDebit.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#fca5a5', marginTop: '2px' }}>
              Paid: ₹{balanceData.paidDebit.toLocaleString('en-IN')} • Pending: ₹{balanceData.pendingDebit.toLocaleString('en-IN')}
            </div>
          </div>

          {/* Total Salary */}
          <div
            onClick={() => onNavigate('salary')}
            style={{
              padding: '14px',
              borderRadius: '10px',
              backgroundColor: 'rgba(139, 92, 246, 0.08)',
              border: '1px solid rgba(139, 92, 246, 0.25)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>
              💼 Total Payroll (Salaries)
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#c084fc', marginTop: '2px' }}>
              ₹{balanceData.totalSalary.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#d8b4fe', marginTop: '2px' }}>
              Disbursed: ₹{balanceData.totalSalaryPaid.toLocaleString('en-IN')}
            </div>
          </div>

          {/* Net Business Balance */}
          <div
            style={{
              padding: '14px',
              borderRadius: '10px',
              backgroundColor: balanceData.netBusinessBalance >= 0 ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
              border: `1px solid ${balanceData.netBusinessBalance >= 0 ? 'rgba(16, 185, 129, 0.35)' : 'rgba(239, 68, 68, 0.35)'}`,
            }}
          >
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>
              💎 Net Business Balance
            </div>
            <div
              style={{
                fontSize: '1.4rem',
                fontWeight: '800',
                color: balanceData.netBusinessBalance >= 0 ? '#10b981' : '#ef4444',
                marginTop: '2px',
              }}
            >
              ₹{balanceData.netBusinessBalance.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.7rem', color: balanceData.netBusinessBalance >= 0 ? '#6ee7b7' : '#fca5a5', marginTop: '2px' }}>
              {balanceData.netBusinessBalance >= 0 ? 'Positive Working Capital' : 'Deficit / Higher Outflows'}
            </div>
          </div>
        </div>
      </div>

      {/* 8 DYNAMIC KPI CARDS (From User Sales Data) */}
      <div className="kpi-grid">
        <StatCard
          title="Total Revenue"
          value={kpis.totalRevenue}
          icon="💰"
          trendText={`${kpis.recordCount} Transactions`}
          color="#06b6d4"
        />

        <StatCard
          title="Total Sales"
          value={`${kpis.totalSales.toLocaleString('en-IN')} Units`}
          icon="🛒"
          trendText="Gross Unit Volume"
          color="#3b82f6"
        />

        <StatCard
          title="Total Cost"
          value={kpis.totalCost}
          icon="📉"
          trendText="Cost of Goods (COGS)"
          color="#ef4444"
        />

        <StatCard
          title="Total Profit"
          value={kpis.totalProfit}
          icon="📈"
          trend="up"
          trendText={`${kpis.profitMargin}% Net Margin`}
          color="#10b981"
        />

        <StatCard
          title="Unique Products"
          value={`${kpis.totalProducts} Items`}
          icon="📦"
          trendText="Active Catalog"
          color="#8b5cf6"
        />

        <StatCard
          title="Total Customers"
          value={`${kpis.totalCustomers} Clients`}
          icon="👥"
          trendText="Distinct Buyers"
          color="#f59e0b"
        />

        <StatCard
          title="Avg Order Value"
          value={Math.round(kpis.averageOrderValue)}
          icon="🎯"
          trendText="Per Transaction"
          color="#38bdf8"
        />

        <StatCard
          title="Profit Margin"
          value={`${kpis.profitMargin}%`}
          icon="💎"
          trendText="Margin Health"
          color="#10b981"
        />
      </div>

      {/* CHARTS GRID: Monthly Revenue Velocity & Category Breakdown */}
      <div className="grid-2col" style={{ marginBottom: '24px' }}>
        <div className="card-section-dark">
          <div className="section-header-dark">
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#f8fafc', margin: '0 0 2px' }}>
                Monthly Revenue Trajectory
              </h3>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Revenue generated over sequential monthly periods
              </div>
            </div>
            <button className="btn-outline-dark" onClick={() => onNavigate('analytics')}>
              Explore Analytics →
            </button>
          </div>
          <MonthlyRevenueChart data={monthlyTrend} height={230} />
        </div>

        <div className="card-section-dark">
          <div className="section-header-dark">
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#f8fafc', margin: '0 0 2px' }}>
                Category Contribution
              </h3>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Share of revenue by product category
              </div>
            </div>
          </div>
          <SalesByCategoryChart categories={categoryStats} />
        </div>
      </div>

      {/* CHARTS GRID: Top 5 Products & Regional Performance */}
      <div className="grid-2col" style={{ marginBottom: '24px' }}>
        <div className="card-section-dark">
          <div className="section-header-dark">
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#f8fafc', margin: '0 0 2px' }}>
                Top 5 Products Leaderboard
              </h3>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Highest revenue contributing products
              </div>
            </div>
            <button className="btn-outline-dark" onClick={() => onNavigate('data')}>
              Manage Data
            </button>
          </div>
          <Top5ProductsChart products={productStats} />
        </div>

        <div className="card-section-dark">
          <div className="section-header-dark">
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#f8fafc', margin: '0 0 2px' }}>
                Revenue by Geographic Region
              </h3>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Territorial breakdown of customer sales
              </div>
            </div>
          </div>
          <RevenueByRegionChart regions={regionStats} />
        </div>
      </div>

      {/* RECENT BUSINESS TRANSACTIONS TABLE */}
      {records.length > 0 && (
        <div className="card-section-dark">
          <div className="section-header-dark">
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#f8fafc', margin: '0 0 2px' }}>
                Recent User-Entered Transactions
              </h3>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Latest entries in your business analytics dataset
              </div>
            </div>
            <button className="btn-glow-primary" onClick={() => onNavigate('data')}>
              + Add New Entry
            </button>
          </div>

          <div className="table-responsive">
            <table className="data-table-dark">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Units</th>
                  <th>Revenue</th>
                  <th>Profit</th>
                  <th>Customer</th>
                  <th>Region</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 6).map((r) => (
                  <tr key={r.id}>
                    <td style={{ color: '#94a3b8' }}>{r.date}</td>
                    <td><strong style={{ color: '#f8fafc' }}>{r.productName}</strong></td>
                    <td><span className="badge-dark badge-category">{r.category}</span></td>
                    <td>{r.quantity}</td>
                    <td><strong style={{ color: '#38bdf8' }}>₹{Number(r.revenue).toLocaleString('en-IN')}</strong></td>
                    <td>
                      <strong style={{ color: r.profit >= 0 ? '#10b981' : '#ef4444' }}>
                        +₹{Number(r.profit).toLocaleString('en-IN')}
                      </strong>
                    </td>
                    <td>{r.customerName}</td>
                    <td><span className="badge-dark badge-region">{r.region}</span></td>
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
