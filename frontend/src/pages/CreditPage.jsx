import React, { useState } from 'react';
import StatCard from '../components/StatCard';
import {
  getStoredCredits,
  addCreditRecord,
  updateCreditRecord,
  deleteCreditRecord,
  calculateCreditKPIs,
} from '../services/dataStore';

export default function CreditPage({ onDataUpdated, onShowToast }) {
  const [credits, setCredits] = useState(() => getStoredCredits());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCredit, setEditingCredit] = useState(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    customerName: '',
    description: '',
    creditAmount: '',
    dueDate: '',
    paymentStatus: 'PENDING',
  });

  const refresh = () => {
    const updated = getStoredCredits();
    setCredits(updated);
    if (onDataUpdated) onDataUpdated();
  };

  const kpis = calculateCreditKPIs(credits);

  // Filtered list
  const filteredCredits = credits.filter(c => {
    if (statusFilter && c.paymentStatus !== statusFilter) return false;
    if (search.trim() !== '') {
      const q = search.toLowerCase();
      const match = (c.customerName && c.customerName.toLowerCase().includes(q)) ||
                    (c.description && c.description.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const handleOpenAdd = () => {
    setEditingCredit(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      customerName: '',
      description: '',
      creditAmount: '',
      dueDate: '',
      paymentStatus: 'PENDING',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c) => {
    setEditingCredit(c);
    setFormData({
      date: c.date,
      customerName: c.customerName,
      description: c.description,
      creditAmount: String(c.creditAmount),
      dueDate: c.dueDate || '',
      paymentStatus: c.paymentStatus,
    });
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.customerName.trim()) {
      onShowToast('Please enter customer/business name', 'error');
      return;
    }
    if (!formData.creditAmount || Number(formData.creditAmount) <= 0) {
      onShowToast('Please enter a valid credit amount', 'error');
      return;
    }

    if (editingCredit) {
      updateCreditRecord({
        ...editingCredit,
        ...formData,
      });
      onShowToast('Credit record updated successfully', 'success');
    } else {
      addCreditRecord(formData);
      onShowToast('Credit record added successfully', 'success');
    }

    setIsModalOpen(false);
    refresh();
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Delete credit transaction for "${name}"?`)) {
      deleteCreditRecord(id);
      onShowToast('Credit record deleted', 'info');
      refresh();
    }
  };

  const handleToggleStatus = (c) => {
    const nextStatus = c.paymentStatus === 'PAID' ? 'PENDING' : 'PAID';
    updateCreditRecord({
      ...c,
      paymentStatus: nextStatus,
    });
    onShowToast(`Credit status updated to ${nextStatus}`, 'success');
    refresh();
  };

  // Monthly Credit Trend
  const monthlyCreditMap = {};
  credits.forEach(c => {
    const m = (c.date || '').substring(0, 7) || 'Current';
    if (!monthlyCreditMap[m]) monthlyCreditMap[m] = { month: m, total: 0, paid: 0, pending: 0 };
    const amt = Number(c.creditAmount) || 0;
    monthlyCreditMap[m].total += amt;
    if (c.paymentStatus === 'PAID') monthlyCreditMap[m].paid += amt;
    else monthlyCreditMap[m].pending += amt;
  });
  const monthlyList = Object.values(monthlyCreditMap).sort((a, b) => a.month.localeCompare(b.month));

  const paidRatio = kpis.totalCredit > 0 ? Math.round((kpis.paidCredit / kpis.totalCredit) * 100) : 0;
  const pendingRatio = 100 - paidRatio;

  return (
    <div className="space-y-6">
      {/* 4 KPI CARDS */}
      <div className="kpi-grid">
        <StatCard
          title="Total Credit"
          value={kpis.totalCredit}
          icon="📥"
          trendText={`${kpis.transactionCount} Total Invoices`}
          color="#06b6d4"
        />

        <StatCard
          title="Paid Credit"
          value={kpis.paidCredit}
          icon="✓"
          trendText={`${paidRatio}% Recovered`}
          color="#10b981"
        />

        <StatCard
          title="Pending Credit"
          value={kpis.pendingCredit}
          icon="⏳"
          trendText={`${pendingRatio}% Outstanding`}
          color="#f59e0b"
        />

        <StatCard
          title="Total Transactions"
          value={`${kpis.transactionCount} Receivables`}
          icon="📑"
          trendText="Active Credit Ledger"
          color="#8b5cf6"
        />
      </div>

      {/* CHARTS: MONTHLY CREDIT & PENDING VS PAID RATIO */}
      {credits.length > 0 && (
        <div className="grid-2col" style={{ marginBottom: '24px' }}>
          {/* Monthly Credit Trend */}
          <div className="card-section-dark">
            <div className="section-header-dark">
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#f8fafc', margin: 0 }}>
                📈 Monthly Credit Receivables
              </h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {monthlyList.map((m, idx) => (
                <div key={idx} style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '6px' }}>
                    <strong style={{ color: '#f8fafc' }}>{m.month}</strong>
                    <span style={{ color: '#38bdf8', fontWeight: '700' }}>₹{m.total.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', height: '8px', borderRadius: '4px', overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.08)' }}>
                    <div style={{ width: `${m.total > 0 ? (m.paid / m.total) * 100 : 0}%`, backgroundColor: '#10b981' }} title={`Paid: ₹${m.paid}`} />
                    <div style={{ width: `${m.total > 0 ? (m.pending / m.total) * 100 : 0}%`, backgroundColor: '#f59e0b' }} title={`Pending: ₹${m.pending}`} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#94a3b8', marginTop: '4px' }}>
                    <span style={{ color: '#10b981' }}>Paid: ₹{m.paid.toLocaleString('en-IN')}</span>
                    <span style={{ color: '#f59e0b' }}>Pending: ₹{m.pending.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending vs Paid Ratio Card */}
          <div className="card-section-dark">
            <div className="section-header-dark">
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#f8fafc', margin: 0 }}>
                ⚖️ Recovery Status Ratio
              </h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'center', height: 'calc(100% - 50px)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '10px' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#6ee7b7', fontWeight: '700', textTransform: 'uppercase' }}>Recovered / Paid Amount</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: '800', color: '#10b981' }}>₹{kpis.paidCredit.toLocaleString('en-IN')}</div>
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#10b981' }}>{paidRatio}%</div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px', backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '10px' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#fcd34d', fontWeight: '700', textTransform: 'uppercase' }}>Outstanding / Pending Amount</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: '800', color: '#f59e0b' }}>₹{kpis.pendingCredit.toLocaleString('en-IN')}</div>
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#f59e0b' }}>{pendingRatio}%</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TABLE SECTION */}
      <div className="card-section-dark">
        <div className="section-header-dark" style={{ flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#f8fafc', margin: '0 0 2px' }}>
              📥 Business Credit Receivables Ledger
            </h3>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0 }}>
              Track outstanding customer dues and incoming accounts receivable
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleOpenAdd} className="btn-glow-primary">
              <span>➕</span> Add Credit Record
            </button>
          </div>
        </div>

        {/* SEARCH & FILTERS */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px', alignItems: 'center' }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Search customer or description..."
            className="search-input-dark"
            style={{ width: '280px' }}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select-dark"
          >
            <option value="">All Statuses</option>
            <option value="PAID">PAID</option>
            <option value="PENDING">PENDING</option>
          </select>

          {(search || statusFilter) && (
            <button
              onClick={() => { setSearch(''); setStatusFilter(''); }}
              className="btn-outline-dark"
              style={{ padding: '6px 12px', fontSize: '0.78rem' }}
            >
              ✕ Clear Filters
            </button>
          )}

          <div style={{ marginLeft: 'auto', fontSize: '0.78rem', color: '#94a3b8' }}>
            Showing <strong style={{ color: '#38bdf8' }}>{filteredCredits.length}</strong> records
          </div>
        </div>

        {/* TABLE */}
        <div className="table-responsive">
          <table className="data-table-dark">
            <thead>
              <tr>
                <th>Date</th>
                <th>Customer / Business</th>
                <th>Description</th>
                <th>Credit Amount</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCredits.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                    {credits.length === 0
                      ? 'No credit records added yet. Click "+ Add Credit Record" to track receivables.'
                      : 'No credit records match your search filters.'}
                  </td>
                </tr>
              ) : (
                filteredCredits.map((c) => (
                  <tr key={c.id}>
                    <td>{c.date}</td>
                    <td><strong style={{ color: '#f8fafc' }}>{c.customerName}</strong></td>
                    <td style={{ color: '#94a3b8' }}>{c.description || '—'}</td>
                    <td>
                      <strong style={{ color: '#06b6d4', fontSize: '0.95rem' }}>
                        ₹{Number(c.creditAmount).toLocaleString('en-IN')}
                      </strong>
                    </td>
                    <td>{c.dueDate || 'Immediate'}</td>
                    <td>
                      <button
                        onClick={() => handleToggleStatus(c)}
                        title="Click to toggle status"
                        style={{
                          background: c.paymentStatus === 'PAID' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                          color: c.paymentStatus === 'PAID' ? '#10b981' : '#f59e0b',
                          border: `1px solid ${c.paymentStatus === 'PAID' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                          borderRadius: '6px',
                          padding: '3px 8px',
                          fontSize: '0.72rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                        }}
                      >
                        {c.paymentStatus === 'PAID' ? '✓ PAID' : '⏳ PENDING'}
                      </button>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => handleOpenEdit(c)}
                          className="btn-action-edit"
                          title="Edit Credit Record"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(c.id, c.customerName)}
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
                {editingCredit ? '✏️ Edit Credit Record' : '➕ Add Business Credit'}
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
                  <label className="form-label-dark">Credit Amount (₹) *</label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={formData.creditAmount}
                    onChange={(e) => setFormData({ ...formData, creditAmount: e.target.value })}
                    placeholder="25000"
                    className="form-input-dark"
                  />
                </div>
              </div>

              <div>
                <label className="form-label-dark">Customer / Business Name *</label>
                <input
                  type="text"
                  required
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  placeholder="e.g. Apex Innovations Ltd"
                  className="form-input-dark"
                />
              </div>

              <div>
                <label className="form-label-dark">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Hardware shipment invoice #INV-401"
                  className="form-input-dark"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label-dark">Due Date</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="form-input-dark"
                  />
                </div>

                <div>
                  <label className="form-label-dark">Payment Status</label>
                  <select
                    value={formData.paymentStatus}
                    onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                    className="form-input-dark"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="PAID">PAID</option>
                  </select>
                </div>
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
                  {editingCredit ? 'Save Changes' : 'Add Credit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
