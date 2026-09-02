import React, { useState } from 'react';
import StatCard from '../components/StatCard';
import {
  getStoredSalaries,
  addSalaryRecord,
  updateSalaryRecord,
  deleteSalaryRecord,
  calculateSalaryKPIs,
} from '../services/dataStore';

export default function SalariesPage({ onDataUpdated, onShowToast }) {
  const [salaries, setSalaries] = useState(() => getStoredSalaries());
  const [search, setSearch] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSalary, setEditingSalary] = useState(null);
  const [formData, setFormData] = useState({
    employeeName: '',
    employeeId: '',
    department: 'Sales',
    salaryMonth: new Date().toISOString().substring(0, 7),
    basicSalary: '',
    bonus: '0',
    deduction: '0',
    paymentStatus: 'PAID',
    paymentDate: new Date().toISOString().split('T')[0],
  });

  const refresh = () => {
    const updated = getStoredSalaries();
    setSalaries(updated);
    if (onDataUpdated) onDataUpdated();
  };

  const kpis = calculateSalaryKPIs(salaries);

  // Departments for filtering & dropdown
  const uniqueDepts = Array.from(new Set(salaries.map(s => s.department).filter(Boolean)));
  const uniqueMonths = Array.from(new Set(salaries.map(s => s.salaryMonth).filter(Boolean))).sort().reverse();

  // Filtered dataset
  const filteredSalaries = salaries.filter(s => {
    if (selectedMonth && s.salaryMonth !== selectedMonth) return false;
    if (selectedDept && s.department !== selectedDept) return false;
    if (search.trim() !== '') {
      const q = search.toLowerCase();
      const match = (s.employeeName && s.employeeName.toLowerCase().includes(q)) ||
                    (s.employeeId && s.employeeId.toLowerCase().includes(q)) ||
                    (s.department && s.department.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  // Calculate Net Salary live in form
  const currentBasic = Number(formData.basicSalary) || 0;
  const currentBonus = Number(formData.bonus) || 0;
  const currentDeduction = Number(formData.deduction) || 0;
  const calculatedNetSalary = currentBasic + currentBonus - currentDeduction;

  const handleOpenAdd = () => {
    setEditingSalary(null);
    setFormData({
      employeeName: '',
      employeeId: `EMP-${Math.floor(100 + Math.random() * 900)}`,
      department: 'Sales',
      salaryMonth: new Date().toISOString().substring(0, 7),
      basicSalary: '',
      bonus: '0',
      deduction: '0',
      paymentStatus: 'PAID',
      paymentDate: new Date().toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sal) => {
    setEditingSalary(sal);
    setFormData({
      employeeName: sal.employeeName,
      employeeId: sal.employeeId,
      department: sal.department,
      salaryMonth: sal.salaryMonth,
      basicSalary: String(sal.basicSalary),
      bonus: String(sal.bonus),
      deduction: String(sal.deduction),
      paymentStatus: sal.paymentStatus,
      paymentDate: sal.paymentDate,
    });
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.employeeName.trim()) {
      onShowToast('Please enter employee name', 'error');
      return;
    }
    if (!formData.basicSalary || Number(formData.basicSalary) <= 0) {
      onShowToast('Please enter a valid basic salary', 'error');
      return;
    }

    if (editingSalary) {
      updateSalaryRecord({
        ...editingSalary,
        ...formData,
      });
      onShowToast('Salary record updated successfully', 'success');
    } else {
      addSalaryRecord(formData);
      onShowToast('Employee salary added successfully', 'success');
    }

    setIsModalOpen(false);
    refresh();
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete salary record for "${name}"?`)) {
      deleteSalaryRecord(id);
      onShowToast('Salary record deleted', 'info');
      refresh();
    }
  };

  const handleToggleStatus = (sal) => {
    const nextStatus = sal.paymentStatus === 'PAID' ? 'PENDING' : 'PAID';
    updateSalaryRecord({
      ...sal,
      paymentStatus: nextStatus,
    });
    onShowToast(`Salary status updated to ${nextStatus}`, 'success');
    refresh();
  };

  // Department Distribution Data for Chart
  const deptDist = {};
  salaries.forEach(s => {
    const d = s.department || 'Other';
    if (!deptDist[d]) deptDist[d] = { dept: d, totalSalary: 0, count: 0 };
    deptDist[d].totalSalary += (Number(s.netSalary) || 0);
    deptDist[d].count += 1;
  });
  const deptList = Object.values(deptDist).sort((a, b) => b.totalSalary - a.totalSalary);

  return (
    <div className="space-y-6">
      {/* 5 KPI SUMMARY CARDS */}
      <div className="kpi-grid">
        <StatCard
          title="Total Employees"
          value={`${kpis.totalEmployees} Staff`}
          icon="👥"
          trendText={`${kpis.totalRecords} Payroll Records`}
          color="#38bdf8"
        />

        <StatCard
          title="Total Salary Paid"
          value={kpis.totalSalaryPaid}
          icon="💳"
          trendText="Disbursed Payroll"
          color="#10b981"
        />

        <StatCard
          title="Pending Salary"
          value={kpis.pendingSalary}
          icon="⏳"
          trendText="Awaiting Payment"
          color="#f59e0b"
        />

        <StatCard
          title="Total Bonuses"
          value={kpis.totalBonus}
          icon="🎁"
          trendText="Incentives & Perks"
          color="#8b5cf6"
        />

        <StatCard
          title="Total Deductions"
          value={kpis.totalDeduction}
          icon="✂️"
          trendText="TDS, PF & Adjustments"
          color="#ef4444"
        />
      </div>

      {/* SALARY ANALYTICS & DEPARTMENT BREAKDOWN */}
      {salaries.length > 0 && (
        <div className="card-section-dark">
          <div className="section-header-dark">
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#f8fafc', margin: 0 }}>
              📊 Department Payroll Distribution
            </h3>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
              Total Gross Payroll: <strong style={{ color: '#38bdf8' }}>₹{kpis.totalGrossSalary.toLocaleString('en-IN')}</strong>
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            {deptList.map((d, idx) => {
              const pct = kpis.totalGrossSalary > 0 ? Math.round((d.totalSalary / kpis.totalGrossSalary) * 100) : 0;
              return (
                <div
                  key={idx}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '10px',
                    padding: '14px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <strong style={{ color: '#f8fafc', fontSize: '0.88rem' }}>{d.dept}</strong>
                    <span className="badge-dark badge-category">{d.count} Staff</span>
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: '800', color: '#38bdf8', marginBottom: '6px' }}>
                    ₹{d.totalSalary.toLocaleString('en-IN')}
                  </div>
                  <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${pct}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #06b6d4, #3b82f6)',
                        borderRadius: '3px',
                      }}
                    />
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px', textAlign: 'right' }}>
                    {pct}% of payroll
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DATA MANAGEMENT & TABLE SECTION */}
      <div className="card-section-dark">
        <div className="section-header-dark" style={{ flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#f8fafc', margin: '0 0 2px' }}>
              💼 Employee Payroll Ledger
            </h3>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0 }}>
              Manage employee monthly salaries, bonus allocations, and statutory deductions
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleOpenAdd} className="btn-glow-primary">
              <span>➕</span> Add Employee Salary
            </button>
          </div>
        </div>

        {/* SEARCH & FILTERS TOOLBAR */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px', alignItems: 'center' }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Search employee name, ID or department..."
            className="search-input-dark"
            style={{ width: '280px' }}
          />

          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="filter-select-dark"
          >
            <option value="">All Salary Months</option>
            {uniqueMonths.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="filter-select-dark"
          >
            <option value="">All Departments</option>
            {uniqueDepts.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          {(search || selectedMonth || selectedDept) && (
            <button
              onClick={() => { setSearch(''); setSelectedMonth(''); setSelectedDept(''); }}
              className="btn-outline-dark"
              style={{ padding: '6px 12px', fontSize: '0.78rem' }}
            >
              ✕ Clear Filters
            </button>
          )}

          <div style={{ marginLeft: 'auto', fontSize: '0.78rem', color: '#94a3b8' }}>
            Showing <strong style={{ color: '#38bdf8' }}>{filteredSalaries.length}</strong> records
          </div>
        </div>

        {/* TABLE */}
        <div className="table-responsive">
          <table className="data-table-dark">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Employee ID</th>
                <th>Department</th>
                <th>Salary Month</th>
                <th>Basic Salary</th>
                <th>Bonus</th>
                <th>Deduction</th>
                <th>Net Salary</th>
                <th>Status</th>
                <th>Payment Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSalaries.length === 0 ? (
                <tr>
                  <td colSpan="11" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                    {salaries.length === 0
                      ? 'No salary records added yet. Click "+ Add Employee Salary" to get started.'
                      : 'No salary records match your search filters.'}
                  </td>
                </tr>
              ) : (
                filteredSalaries.map((sal) => (
                  <tr key={sal.id}>
                    <td><strong style={{ color: '#f8fafc' }}>{sal.employeeName}</strong></td>
                    <td><span className="badge-dark badge-category">{sal.employeeId}</span></td>
                    <td>{sal.department}</td>
                    <td>{sal.salaryMonth}</td>
                    <td>₹{Number(sal.basicSalary).toLocaleString('en-IN')}</td>
                    <td style={{ color: '#10b981' }}>+₹{Number(sal.bonus).toLocaleString('en-IN')}</td>
                    <td style={{ color: '#ef4444' }}>-₹{Number(sal.deduction).toLocaleString('en-IN')}</td>
                    <td>
                      <strong style={{ color: '#38bdf8', fontSize: '0.92rem' }}>
                        ₹{Number(sal.netSalary).toLocaleString('en-IN')}
                      </strong>
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleStatus(sal)}
                        title="Click to toggle status"
                        style={{
                          background: sal.paymentStatus === 'PAID' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                          color: sal.paymentStatus === 'PAID' ? '#10b981' : '#f59e0b',
                          border: `1px solid ${sal.paymentStatus === 'PAID' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                          borderRadius: '6px',
                          padding: '3px 8px',
                          fontSize: '0.72rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                        }}
                      >
                        {sal.paymentStatus === 'PAID' ? '✓ PAID' : '⏳ PENDING'}
                      </button>
                    </td>
                    <td>{sal.paymentDate || 'N/A'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => handleOpenEdit(sal)}
                          className="btn-action-edit"
                          title="Edit Salary Record"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(sal.id, sal.employeeName)}
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
              maxWidth: '560px',
              padding: '24px',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800', color: '#f8fafc' }}>
                {editingSalary ? '✏️ Edit Employee Salary' : '➕ Add Employee Salary'}
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
                  <label className="form-label-dark">Employee Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.employeeName}
                    onChange={(e) => setFormData({ ...formData, employeeName: e.target.value })}
                    placeholder="e.g. Ramesh Kumar"
                    className="form-input-dark"
                  />
                </div>

                <div>
                  <label className="form-label-dark">Employee ID *</label>
                  <input
                    type="text"
                    required
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    placeholder="e.g. EMP-101"
                    className="form-input-dark"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label-dark">Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="form-input-dark"
                  >
                    <option value="Sales & Marketing">Sales & Marketing</option>
                    <option value="IT & Engineering">IT & Engineering</option>
                    <option value="Operations & Supply">Operations & Supply</option>
                    <option value="Finance & Accounts">Finance & Accounts</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Customer Support">Customer Support</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label className="form-label-dark">Salary Month *</label>
                  <input
                    type="month"
                    required
                    value={formData.salaryMonth}
                    onChange={(e) => setFormData({ ...formData, salaryMonth: e.target.value })}
                    className="form-input-dark"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="form-label-dark">Basic Salary (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={formData.basicSalary}
                    onChange={(e) => setFormData({ ...formData, basicSalary: e.target.value })}
                    placeholder="45000"
                    className="form-input-dark"
                  />
                </div>

                <div>
                  <label className="form-label-dark">Bonus (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.bonus}
                    onChange={(e) => setFormData({ ...formData, bonus: e.target.value })}
                    placeholder="5000"
                    className="form-input-dark"
                  />
                </div>

                <div>
                  <label className="form-label-dark">Deduction (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.deduction}
                    onChange={(e) => setFormData({ ...formData, deduction: e.target.value })}
                    placeholder="2000"
                    className="form-input-dark"
                  />
                </div>
              </div>

              {/* AUTOMATIC NET SALARY CALCULATION PREVIEW */}
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(6, 182, 212, 0.1)',
                  border: '1px solid rgba(6, 182, 212, 0.25)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>
                    Auto Computed Net Salary (Basic + Bonus - Deduction)
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
                    ₹{currentBasic.toLocaleString('en-IN')} + ₹{currentBonus.toLocaleString('en-IN')} - ₹{currentDeduction.toLocaleString('en-IN')}
                  </div>
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#38bdf8' }}>
                  ₹{calculatedNetSalary.toLocaleString('en-IN')}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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

                <div>
                  <label className="form-label-dark">Payment Date</label>
                  <input
                    type="date"
                    value={formData.paymentDate}
                    onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                    className="form-input-dark"
                  />
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
                  {editingSalary ? 'Save Changes' : 'Add Salary'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
