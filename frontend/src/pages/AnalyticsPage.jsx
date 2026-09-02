import React from 'react';
import FilterBar from '../components/FilterBar';
import EmptyState from '../components/EmptyState';
import {
  MonthlyRevenueChart,
  MonthlyProfitChart,
  SalesByProductChart,
  SalesByCategoryChart,
  RevenueByRegionChart,
  Top5ProductsChart,
  ProfitVsCostChart,
  CustomerPerformanceChart,
} from '../components/ChartComponents';
import {
  filterRecords,
  getMonthlyTrend,
  getSalesByProduct,
  getSalesByCategory,
  getRevenueByRegion,
  getCustomerPerformance,
} from '../services/dataStore';

export default function AnalyticsPage({
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
  const monthlyTrend = getMonthlyTrend(filtered);
  const productStats = getSalesByProduct(filtered);
  const categoryStats = getSalesByCategory(filtered);
  const regionStats = getRevenueByRegion(filtered);
  const customerStats = getCustomerPerformance(filtered);

  return (
    <div>
      {/* Global Filter Bar */}
      <FilterBar
        records={records}
        filters={filters}
        onFilterChange={onFilterChange}
        onResetFilters={onResetFilters}
      />

      {/* ROW 1: Monthly Revenue & Monthly Profit */}
      <div className="grid-2col" style={{ marginBottom: '24px' }}>
        <div className="card-section-dark">
          <div className="section-header-dark">
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#f8fafc', margin: '0 0 2px' }}>
                1. Monthly Revenue Progression
              </h3>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Total gross billings grouped by calendar month
              </div>
            </div>
          </div>
          <MonthlyRevenueChart data={monthlyTrend} height={220} />
        </div>

        <div className="card-section-dark">
          <div className="section-header-dark">
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#f8fafc', margin: '0 0 2px' }}>
                2. Monthly Net Profit Progression
              </h3>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Bottom-line earnings generated each month
              </div>
            </div>
          </div>
          <MonthlyProfitChart data={monthlyTrend} height={220} />
        </div>
      </div>

      {/* ROW 2: Sales by Product & Sales by Category */}
      <div className="grid-2col" style={{ marginBottom: '24px' }}>
        <div className="card-section-dark">
          <div className="section-header-dark">
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#f8fafc', margin: '0 0 2px' }}>
                3. Sales by Product Catalog
              </h3>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Revenue contribution and unit volume per product
              </div>
            </div>
          </div>
          <SalesByProductChart products={productStats} />
        </div>

        <div className="card-section-dark">
          <div className="section-header-dark">
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#f8fafc', margin: '0 0 2px' }}>
                4. Sales by Category Breakdown
              </h3>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Percentage distribution across market segments
              </div>
            </div>
          </div>
          <SalesByCategoryChart categories={categoryStats} />
        </div>
      </div>

      {/* ROW 3: Revenue by Region & Top 5 Products */}
      <div className="grid-2col" style={{ marginBottom: '24px' }}>
        <div className="card-section-dark">
          <div className="section-header-dark">
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#f8fafc', margin: '0 0 2px' }}>
                5. Revenue by Geographic Region
              </h3>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Geographical distribution of transactions
              </div>
            </div>
          </div>
          <RevenueByRegionChart regions={regionStats} />
        </div>

        <div className="card-section-dark">
          <div className="section-header-dark">
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#f8fafc', margin: '0 0 2px' }}>
                6. Top 5 Best-Selling Products
              </h3>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Ranked by total revenue and profit margin
              </div>
            </div>
          </div>
          <Top5ProductsChart products={productStats} />
        </div>
      </div>

      {/* ROW 4: Profit vs Cost & Customer Performance */}
      <div className="grid-2col" style={{ marginBottom: '24px' }}>
        <div className="card-section-dark">
          <div className="section-header-dark">
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#f8fafc', margin: '0 0 2px' }}>
                7. Profit vs. Cost Ratio Analysis
              </h3>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Comparative breakdown of COGS vs. Net Profit
              </div>
            </div>
          </div>
          <ProfitVsCostChart data={monthlyTrend} />
        </div>

        <div className="card-section-dark">
          <div className="section-header-dark">
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#f8fafc', margin: '0 0 2px' }}>
                8. Customer Lifetime Spend Ranking
              </h3>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Top enterprise buyers and revenue contribution
              </div>
            </div>
          </div>
          <CustomerPerformanceChart customers={customerStats} />
        </div>
      </div>
    </div>
  );
}
