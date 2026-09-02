import React, { useState } from 'react';
import StatCard from '../components/StatCard';
import {
  getStoredDebits,
  addDebitRecord,
  updateDebitRecord,
  deleteDebitRecord,
  calculateDebitKPIs,
} from '../services/dataStore';

export default function DebitPage({ onDataUpdated, onShowToast }) {
  const [debits, setDebits] = useState(() => getStoredDebits());
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDebit, setEditingDebit] = useState(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    vendorName: '',
    description: '',
    category: 'Inventory & Supplies',
    debitAmount: '',
    paymentStatus: 'PAID',
  });

  const refresh = () => {
    const updated = getStoredDebits();
    setDebits(updated);
    if (onDataUpdated) onDataUpdated();
  };

  const kpis = calculateDebitKPIs(debits);

  const uniqueCategories = Array.from(new Set(debits.map(d => d.category).filter(Boolean)));

  // Filtered dataset
  const filteredDebits = debits.filter(d => {
    if (selectedCategory && d.category !== selectedCategory) return false;
    if (statusFilter && d.paymentStatus !== statusFilter) return false;
    if (search.trim() !== '') {
      const q = search.toLowerCase();
      const match = (d.vendorName && d.vendorName.toLowerCase().includes(q)) ||
                    (d.description && d.description.toLowerCase().includes(q)) ||
                    (d.category && d.category.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const handleOpenAdd = () => {
    setEditingDebit(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      vendorName: '',
      description: '',
      category: 'Inventory & Supplies',
      debitAmount: '',
      paymentStatus: 'PAID',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (d) => {
    setEditingDebit(d);
    setFormData({
      date: d.date,
      vendorName: d.vendorName,
      description: d.description,
      category: d.category,
      debitAmount: String(d.debitAmount),
      paymentStatus: d.paymentStatus,
    });
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.vendorName.trim()) {
      onShowToast('Please enter vendor/business name', 'error');
      return;
    }
    if (!formData.debitAmount || Number(formData.debitAmount) <= 0) {
      onShowToast('Please enter a valid debit amount', 'error');
      return;
    }

    if (editingDebit) {
      updateDebitRecord({
        ...editingDebit,
        ...formData,
      });
      onShowToast('Debit record updated successfully', 'success');
    } else {
      addDebitRecord(formData);
      onShowToast('Debit record added successfully', 'success');
    }

    setIsModalOpen(false);
    refresh();
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Delete debit expense for "${name}"?`)) {
      deleteDebitRecord(id);
      onShowToast('Debit record deleted', 'info');
      refresh();
    }
  };

  const handleToggleStatus = (d) => {
    const nextStatus = d.paymentStatus === 'PAID' ? 'PENDING' : 'PAID';
    updateDebitRecord({
      ...d,
      paymentStatus: nextStatus,
    });
    onShowToast(`Debit status updated to ${nextStatus}`, 'success');
    refresh();
  };

  // Category Distribution for Charts
  const catMap = {};
  debits.forEach(d => {
    const c = d.category || 'General';
    if (!catMap[c]) catMap[c] = { category: c, total: 0, count: 0 };
    catMap[c].total += (Number(d.debitAmount) || 0);
    catMap[c].count += 1;
  });
  const catList = Object.values(catMap).sort((a, b) => b.total - a.total);

  // Monthly Debit Trend
  const monthlyDebitMap = {};
  debits.forEach(d => {
    const m = (d.date || '').substring(0, 7) || 'Current';
    if (!monthlyDebitMap[m]) monthlyDebitMap[m] = { month: m, total: 0 };
    monthlyDebitMap[m].total += (Number(d.debitAmount) || 0);
  });
  const monthlyList = Object.values(monthlyDebitMap).sort((a, b) => a.month.localeCompare(b.month));

  return (
    <div className="space-y-6">
      {/* 4 KPI CARDS */}
      <div className="kpi-grid">
        <StatCard
          title="Total Debit"
          value={kpis.totalDebit}
          icon="📤"
          trendText={`${kpis.transactionCount} Expense Entries`}
          color="#ef4444"
        />

        <StatCard
          title="Paid Debit"
          value={kpis.paidDebit}
          icon="✓"
          trendText="Settled Expenses"
          color="#10b981"
        />

        <StatCard
          title="Pending Debit"
          value={kpis.pendingDebit}
          icon="⏳"
          trendText="Payables Due"
          color="#f59e0b"
        />

        <StatCard
          title="Total Transactions"
          value={`${kpis.transactionCount} Outflows`}
          icon="📑"
          trendText="Accounts Payable"
          color="#8b5cf6"
        />
      </div>

      {/* CHARTS: MONTHLY DEBIT & DEBIT BY CATEGORY */}
      {debits.length > 0 && (
        <div className="grid-2col" style={{ marginBottom: '24px' }}>
          {/* Category Distribution */}
          <div className="card-section-dark">
            <div className="section-header-dark">
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#f8fafc', margin: 0 }}>
                🏷️ Debit Outflows by Category
              </h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {catList.map((c, idx) => {
                const pct = kpis.totalDebit > 0 ? Math.round((c.total / kpis.totalDebit) * 100) : 0;
                return (
                  <div key={idx} style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                      <strong style={{ color: '#f8fafc' }}>{c.category}</strong>
                      <span style={{ color: '#f87171', fontWeight: '700' }}>₹{c.total.toLocaleString('en-IN')}</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${pct}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #ef4444, #f59e0b)',
                          borderRadius: '3px',
                        }}
                      />
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '3px', textAlign: 'right' }}>
                      {pct}% ({c.count} bills)
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Monthly Debit Trend */}
          <div className="card-section-dark">
            <div className="section-header-dark">
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#f8fafc', margin: 0 }}>
                📅 Monthly Debit Trend
              </h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {monthlyList.map((m, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', padding: '12px 14px', borderRadius: '8px' }}>
                  <strong style={{ color: '#f8fafc', fontSize: '0.88rem' }}>{m.month}</strong>
                  <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#f87171' }}>
                    ₹{m.total.toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TABLE SECTION */}
      <div className="card-section-dark">
        <div className="section-header-dark" style={{ flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#f8fafc', margin: '0 0 2px' }}>
              📤 Business Debit Expenses Ledger
            </h3>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0 }}>
              Track supplier bills, vendor payments, and operational payables
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleOpenAdd} className="btn-glow-primary">
              <span>➕</span> Add Debit Record
            </button>
          </div>
        </div>

        {/* SEARCH & FILTERS */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px', alignItems: 'center' }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Search vendor, category or description..."
            className="search-input-dark"
            style={{ width: '280px' }}
          />

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="filter-select-dark"
          >
            <option value="">All Categories</option>
            {uniqueCategories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select-dark"
          >
            <option value="">All Statuses</option>
            <option value="PAID">PAID</option>
            <option value="PENDING">PENDING</option>
          </select>

          {(search || selectedCategory || statusFilter) && (
            <button
              onClick={() => { setSearch(''); setSelectedCategory(''); setStatusFilter(''); }}
              className="btn-outline-dark"
              style={{ padding: '6px 12px', fontSize: '0.78rem' }}
            >
              ✕ Clear Filters
            </button>
          )}

          <div style={{ marginLeft: 'auto', fontSize: '0.78rem', color: '#94a3b8' }}>
            Showing <strong style={{ color: '#38bdf8' }}>{filteredDebits.length}</strong> records
          </div>
        </div>

        {/* TABLE */}
        <div className="table-responsive">
          <table className="data-table-dark">
            <thead>
              <tr>
                <th>Date</th>
                <th>Vendor / Business</th>
                <th>Category</th>
                <th>Description</th>
                <th>Debit Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDebits.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                    {debits.length === 0
                      ? 'No debit records added yet. Click "+ Add Debit Record" to track business expenses.'
                      : 'No debit records match your search filters.'}
                  </td>
                </tr>
              ) : (
                filteredDebits.map((d) => (
                  <tr key={d.id}>
                    <td>{d.date}</td>
                    <td><strong style={{ color: '#f8fafc' }}>{d.vendorName}</strong></td>
                    <td><span className="badge-dark badge-category">{d.category}</span></td>
                    <td style={{ color: '#94a3b8' }}>{d.description || '—'}</td>
                    <td>
                      <strong style={{ color: '#f87171', fontSize: '0.95rem' }}>
                        ₹{Number(d.debitAmount).toLocaleString('en-IN')}
                      </strong>
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleStatus(d)}
                        title="Click to toggle status"
                        style={{
                          background: d.paymentStatus === 'PAID' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                          color: d.paymentStatus === 'PAID' ? '#10b981' : '#f59e0b',
                          border: `1px solid ${d.paymentStatus === 'PAID' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                          borderRadius: '6px',
                          padding: '3px 8px',
                          fontSize: '0.72rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                        }}
                      >
                        {d.paymentStatus === 'PAID' ? '✓ PAID' : '⏳ PENDING'}
                      </button>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => handleOpenEdit(d)}
                          className="btn-action-edit"
                          title="Edit Debit Record"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(d.id, d.vendorName)}
                          className="btn-action-delete"
                          title="Delete Record"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px',
          }}
        >
          <div
            style={{
              backgroundColor: '#0f172a',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '520px',
              padding: '24px',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800', color: '#f8fafc' }}>
                {editingDebit ? '✏️ Edit Debit Record' : '➕ Add Business Debit'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label-dark">Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="form-input-dark"
                  />
                </div>

                <div>
                  <label className="form-label-dark">Debit Amount (₹) *</label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={formData.debitAmount}
                    onChange={(e) => setFormData({ ...formData, debitAmount: e.target.value })}
                    placeholder="18000"
                    className="form-input-dark"
                  />
                </div>
              </div>

              <div>
                <label className="form-label-dark">Vendor / Business Name *</label>
                <input
                  type="text"
                  required
                  value={formData.vendorName}
                  onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                  placeholder="e.g. Star Logistics & Warehousing"
                  className="form-input-dark"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label-dark">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="form-input-dark"
                  >
                    <option value="Inventory & Supplies">Inventory & Supplies</option>
                    <option value="Rent & Facility">Rent & Facility</option>
                    <option value="Utilities & Bills">Utilities & Bills</option>
                    <option value="Marketing & Ads">Marketing & Ads</option>
                    <option value="Software & Cloud">Software & Cloud</option>
                    <option value="Logistics & Shipping">Logistics & Shipping</option>
                    <option value="Maintenance & Repair">Maintenance & Repair</option>
                    <option value="Operations">Operations</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="form-label-dark">Payment Status</label>
                  <select
                    value={formData.paymentStatus}
                    onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                    className="form-input-dark"
                  >
                    <option value="PAID">PAID</option>
                    <option value="PENDING">PENDING</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label-dark">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Monthly office internet & cloud server billing"
                  className="form-input-dark"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-outline-dark"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-glow-primary">
                  {editingDebit ? 'Save Changes' : 'Add Debit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
