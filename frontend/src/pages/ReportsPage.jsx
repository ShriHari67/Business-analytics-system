import React, { useState } from 'react';
import FilterBar from '../components/FilterBar';
import EmptyState from '../components/EmptyState';
import {
  filterRecords,
  getSalesByProduct,
  getRevenueByRegion,
  exportRecordsToCSV,
} from '../services/dataStore';

export default function ReportsPage({
  records = [],
  filters = {},
  onFilterChange,
  onResetFilters,
  onShowToast,
  onNavigate,
}) {
  const [reportType, setReportType] = useState('sales');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Sorting
  const [sortField, setSortField] = useState('');
  const [sortAsc, setSortAsc] = useState(true);

  if (!records || records.length === 0) {
    return (
      <EmptyState
        onAddRecord={() => onNavigate('data')}
        onUploadFile={() => onNavigate('data')}
      />
    );
  }

  const filtered = filterRecords(records, filters);

  const REPORT_TABS = [
    { id: 'sales', label: '🛒 Sales Invoices Report' },
    { id: 'revenue', label: '💰 Revenue Statement' },
    { id: 'profit', label: '📈 Net Profit Analysis' },
    { id: 'product', label: '📦 Product Performance Report' },
    { id: 'regional', label: '🌍 Regional Performance Report' },
  ];

  // Build report dataset based on selected report type
  let reportData = [];

  if (reportType === 'sales') {
    reportData = filtered.map(r => ({
      date: r.date,
      product: r.productName,
      category: r.category,
      quantity: r.quantity,
      sales: r.sales,
      revenue: r.revenue,
      customer: r.customerName,
      salesperson: r.salesperson,
    }));
  } else if (reportType === 'revenue') {
    reportData = filtered.map(r => ({
      date: r.date,
      customer: r.customerName,
      product: r.productName,
      revenue: r.revenue,
      cost: r.cost,
      region: r.region,
    }));
  } else if (reportType === 'profit') {
    reportData = filtered.map(r => ({
      date: r.date,
      product: r.productName,
      revenue: r.revenue,
      cost: r.cost,
      profit: r.profit,
      margin: r.revenue > 0 ? `${Math.round((r.profit / r.revenue) * 1000) / 10}%` : '0%',
      customer: r.customerName,
    }));
  } else if (reportType === 'product') {
    reportData = getSalesByProduct(filtered).map(p => ({
      product: p.name,
      category: p.category || 'General',
      unitsSold: p.quantity,
      totalRevenue: p.revenue,
      totalCost: p.cost,
      netProfit: p.profit,
      margin: `${p.marginPct}%`,
      revenueShare: `${p.sharePct}%`,
    }));
  } else if (reportType === 'regional') {
    reportData = getRevenueByRegion(filtered).map(r => ({
      region: r.region,
      totalOrders: r.orderCount,
      unitsSold: r.sales,
      totalRevenue: r.revenue,
      netProfit: r.profit,
      revenueShare: `${r.sharePct}%`,
    }));
  }

  // Filter search
  if (search.trim() !== '') {
    const q = search.toLowerCase();
    reportData = reportData.filter(row =>
      Object.values(row).some(val => String(val).toLowerCase().includes(q))
    );
  }

  // Sort
  if (sortField) {
    reportData.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortAsc ? valA - valB : valB - valA;
      }
      valA = String(valA || '').toLowerCase();
      valB = String(valB || '').toLowerCase();
      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }

  const totalPages = Math.ceil(reportData.length / pageSize) || 1;
  const paginated = reportData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // CSV Export
  const handleExportCSV = () => {
    if (reportData.length === 0) {
      onShowToast('No data to export', 'warning');
      return;
    }
    const headers = Object.keys(reportData[0]);
    const rows = reportData.map(r =>
      headers.map(h => `"${String(r[h] ?? '').replace(/"/g, '""')}"`).join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    onShowToast('CSV report exported successfully', 'success');
  };

  // Excel (.xlsx XML compatible / TSV spreadsheet format)
  const handleExportExcel = () => {
    if (reportData.length === 0) {
      onShowToast('No data to export', 'warning');
      return;
    }
    const headers = Object.keys(reportData[0]);
    const rows = reportData.map(r =>
      headers.map(h => `${String(r[h] ?? '').replace(/\t/g, ' ')}`).join('\t')
    );
    const tsv = [headers.join('\t'), ...rows].join('\n');
    const blob = new Blob([tsv], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType}_report_${new Date().toISOString().split('T')[0]}.xls`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    onShowToast('Excel spreadsheet exported successfully', 'success');
  };

  // Print PDF view
  const handlePrintPDF = () => {
    window.print();
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  return (
    <div className="card-section-dark">
      {/* Top Header */}
      <div className="section-header-dark" style={{ flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#f8fafc', margin: '0 0 4px' }}>
            Enterprise Reports & Audit Statements
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
            Generate compliant accounting statements and export your live analytics in CSV, Excel or PDF
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={handlePrintPDF} className="btn-outline-dark">
            <span>🖨️</span> PDF / Print View
          </button>
          <button onClick={handleExportExcel} className="btn-outline-dark" style={{ borderColor: 'rgba(16, 185, 129, 0.4)', color: '#6ee7b7' }}>
            <span>📊</span> Export Excel
          </button>
          <button onClick={handleExportCSV} className="btn-glow-primary">
            <span>💾</span> Export CSV
          </button>
        </div>
      </div>

      {/* Report Types Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {REPORT_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setReportType(tab.id); setCurrentPage(1); }}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '0.82rem',
              fontWeight: '700',
              cursor: 'pointer',
              backgroundColor: reportType === tab.id ? '#06b6d4' : 'rgba(255, 255, 255, 0.05)',
              color: reportType === tab.id ? '#0f172a' : '#cbd5e1',
              boxShadow: reportType === tab.id ? '0 2px 10px rgba(6, 182, 212, 0.3)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Global Filter Bar */}
      <FilterBar
        records={records}
        filters={filters}
        onFilterChange={onFilterChange}
        onResetFilters={onResetFilters}
      />

      {/* Search & Counter Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          placeholder="🔍 Filter report rows..."
          className="search-input-dark"
          style={{ width: '260px' }}
        />

        <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
          Total Rows: <strong style={{ color: '#38bdf8' }}>{reportData.length}</strong>
        </div>
      </div>

      {/* Dynamic Data Table */}
      <div className="table-responsive">
        <table className="data-table-dark">
          <thead>
            <tr>
              {reportData.length > 0 &&
                Object.keys(reportData[0]).map((col) => (
                  <th
                    key={col}
                    onClick={() => handleSort(col)}
                    style={{ cursor: 'pointer' }}
                  >
                    {col.replace(/([A-Z])/g, ' $1').toUpperCase()} {sortField === col ? (sortAsc ? '▲' : '▼') : '↕'}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan="10" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                  No matching records for this report configuration.
                </td>
              </tr>
            ) : (
              paginated.map((row, idx) => (
                <tr key={idx}>
                  {Object.entries(row).map(([key, val], cellIdx) => (
                    <td key={cellIdx}>
                      {typeof val === 'number' ? (
                        key.toLowerCase().includes('revenue') || key.toLowerCase().includes('profit') || key.toLowerCase().includes('cost') ? (
                          <strong style={{ color: key.toLowerCase().includes('profit') ? '#10b981' : (key.toLowerCase().includes('revenue') ? '#38bdf8' : '#f87171') }}>
                            ₹{val.toLocaleString('en-IN')}
                          </strong>
                        ) : (
                          val
                        )
                      ) : key.toLowerCase().includes('category') ? (
                        <span className="badge-dark badge-category">{val}</span>
                      ) : key.toLowerCase().includes('region') ? (
                        <span className="badge-dark badge-region">{val}</span>
                      ) : (
                        val
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {reportData.length > pageSize && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '18px',
            paddingTop: '14px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            fontSize: '0.82rem',
            color: '#94a3b8',
          }}
        >
          <div>
            Page {currentPage} of {totalPages}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="btn-outline-dark"
              style={{ padding: '4px 10px', fontSize: '0.78rem' }}
            >
              ← Prev
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="btn-outline-dark"
              style={{ padding: '4px 10px', fontSize: '0.78rem' }}
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
