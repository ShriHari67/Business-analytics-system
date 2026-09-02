import React, { useState, useRef } from 'react';
import Modal from '../components/Modal';
import {
  addBusinessRecord,
  updateBusinessRecord,
  deleteBusinessRecord,
  clearAllBusinessRecords,
  bulkImportBusinessRecords,
  validateImportedData,
  downloadSampleCSVTemplate,
  exportRecordsToCSV,
} from '../services/dataStore';

export default function DataManagementPage({ records = [], onDataUpdated, onShowToast }) {
  // Modal states
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);

  // Form State
  const [editingId, setEditingId] = useState(null);
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formProduct, setFormProduct] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formQuantity, setFormQuantity] = useState('');
  const [formSales, setFormSales] = useState('');
  const [formRevenue, setFormRevenue] = useState('');
  const [formCost, setFormCost] = useState('');
  const [formProfit, setFormProfit] = useState('');
  const [formCustomer, setFormCustomer] = useState('');
  const [formRegion, setFormRegion] = useState('North');
  const [formSalesperson, setFormSalesperson] = useState('');
  const [autoCalculateProfit, setAutoCalculateProfit] = useState(true);

  // Search & Filter & Sort state
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [sortField, setSortField] = useState('date');
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedRecordToDelete, setSelectedRecordToDelete] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // File Upload State
  const fileInputRef = useRef(null);
  const [uploadFileName, setUploadFileName] = useState('');
  const [validationResult, setValidationResult] = useState(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingId(null);
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormProduct('');
    setFormCategory('');
    setFormQuantity('1');
    setFormSales('1');
    setFormRevenue('');
    setFormCost('');
    setFormProfit('');
    setFormCustomer('');
    setFormRegion('North');
    setFormSalesperson('');
    setAutoCalculateProfit(true);
    setIsAddEditModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (r) => {
    setEditingId(r.id);
    setFormDate(r.date || '');
    setFormProduct(r.productName || '');
    setFormCategory(r.category || '');
    setFormQuantity(String(r.quantity || 1));
    setFormSales(String(r.sales || r.quantity || 1));
    setFormRevenue(String(r.revenue || 0));
    setFormCost(String(r.cost || 0));
    setFormProfit(String(r.profit || 0));
    setFormCustomer(r.customerName || '');
    setFormRegion(r.region || 'North');
    setFormSalesperson(r.salesperson || '');
    setAutoCalculateProfit(false);
    setIsAddEditModalOpen(true);
  };

  // Auto-calculate profit when revenue or cost changes
  const handleRevenueChange = (val) => {
    setFormRevenue(val);
    if (autoCalculateProfit) {
      const rev = Number(val) || 0;
      const c = Number(formCost) || 0;
      setFormProfit(String(rev - c));
    }
  };

  const handleCostChange = (val) => {
    setFormCost(val);
    if (autoCalculateProfit) {
      const rev = Number(formRevenue) || 0;
      const c = Number(val) || 0;
      setFormProfit(String(rev - c));
    }
  };

  // Save manual record (Add or Update)
  const handleSaveRecord = (e) => {
    e.preventDefault();
    if (!formProduct.trim()) {
      onShowToast('Product Name is required', 'error');
      return;
    }
    if (formRevenue === '' || isNaN(Number(formRevenue))) {
      onShowToast('Valid Revenue amount is required', 'error');
      return;
    }

    try {
      const recordPayload = {
        date: formDate,
        productName: formProduct.trim(),
        category: formCategory.trim() || 'General',
        quantity: Number(formQuantity) || 1,
        sales: Number(formSales) || Number(formQuantity) || 1,
        revenue: Number(formRevenue),
        cost: Number(formCost) || 0,
        profit: Number(formProfit) || (Number(formRevenue) - (Number(formCost) || 0)),
        customerName: formCustomer.trim() || 'Direct Client',
        region: formRegion.trim() || 'North',
        salesperson: formSalesperson.trim() || 'Direct',
      };

      if (editingId) {
        updateBusinessRecord(editingId, recordPayload);
        onShowToast('Record updated successfully', 'success');
      } else {
        addBusinessRecord(recordPayload);
        onShowToast('New business record added successfully', 'success');
      }

      setIsAddEditModalOpen(false);
      onDataUpdated();
    } catch (err) {
      onShowToast(err.message || 'Error saving record', 'error');
    }
  };

  // Delete Record
  const handleConfirmDelete = () => {
    if (!selectedRecordToDelete) return;
    deleteBusinessRecord(selectedRecordToDelete.id);
    setIsDeleteModalOpen(false);
    setSelectedRecordToDelete(null);
    onShowToast('Record deleted', 'info');
    onDataUpdated();
  };

  // Clear All Data
  const handleConfirmClearAll = () => {
    clearAllBusinessRecords();
    setIsClearAllModalOpen(false);
    onShowToast('All business records cleared', 'info');
    onDataUpdated();
  };

  // Parse CSV / Excel File
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadFileName(file.name);
    setIsProcessingFile(true);
    setValidationResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result;
        if (typeof text !== 'string') {
          throw new Error('Could not read text from file');
        }

        // Simple CSV parser
        const lines = text.split(/\r\n|\n/).filter(l => l.trim() !== '');
        if (lines.length < 2) {
          throw new Error('File must contain a header row and at least one data row');
        }

        // Parse header
        const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));

        const rawRows = [];
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          // Handle quoted commas
          const values = [];
          let current = '';
          let inQuotes = false;
          for (let char of line) {
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              values.push(current.trim().replace(/^["']|["']$/g, ''));
              current = '';
            } else {
              current += char;
            }
          }
          values.push(current.trim().replace(/^["']|["']$/g, ''));

          if (values.some(v => v !== '')) {
            const rowObj = {};
            headers.forEach((h, hIdx) => {
              rowObj[h] = values[hIdx] !== undefined ? values[hIdx] : '';
            });
            rawRows.push(rowObj);
          }
        }

        const diagnostics = validateImportedData(rawRows);
        setValidationResult(diagnostics);
        setIsProcessingFile(false);
      } catch (err) {
        setIsProcessingFile(false);
        onShowToast(err.message || 'Error parsing CSV file', 'error');
      }
    };

    reader.onerror = () => {
      setIsProcessingFile(false);
      onShowToast('Failed to read file from disk', 'error');
    };

    reader.readAsText(file);
  };

  // Import validated records
  const handleImportValidRecords = () => {
    if (!validationResult || validationResult.validRows.length === 0) {
      onShowToast('No valid records found to import', 'warning');
      return;
    }

    bulkImportBusinessRecords(validationResult.validRows);
    onShowToast(`Successfully imported ${validationResult.validRows.length} business records!`, 'success');
    setIsUploadModalOpen(false);
    setValidationResult(null);
    setUploadFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    onDataUpdated();
  };

  // Sorting & Filtering
  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const categories = Array.from(new Set(records.map(r => r.category).filter(Boolean))).sort();
  const regions = Array.from(new Set(records.map(r => r.region).filter(Boolean))).sort();

  let filtered = records.filter(r => {
    if (categoryFilter && r.category !== categoryFilter) return false;
    if (regionFilter && r.region !== regionFilter) return false;
    if (search.trim() !== '') {
      const q = search.toLowerCase();
      const match =
        (r.productName && r.productName.toLowerCase().includes(q)) ||
        (r.customerName && r.customerName.toLowerCase().includes(q)) ||
        (r.category && r.category.toLowerCase().includes(q)) ||
        (r.region && r.region.toLowerCase().includes(q)) ||
        (r.salesperson && r.salesperson.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  if (sortField) {
    filtered.sort((a, b) => {
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

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="card-section-dark">
      {/* Top Action Bar */}
      <div className="section-header-dark" style={{ flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#f8fafc', margin: '0 0 4px' }}>
            Data Management & Business Catalog
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
            Manually create records, upload bulk spreadsheets, and manage your operational transaction dataset
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={downloadSampleCSVTemplate}
            className="btn-outline-dark"
            title="Download formatted CSV template"
          >
            <span>📄</span> Template
          </button>

          <button
            onClick={() => { setValidationResult(null); setUploadFileName(''); setIsUploadModalOpen(true); }}
            className="btn-glow-cyan"
          >
            <span>📥</span> Upload CSV / Excel
          </button>

          <button
            onClick={handleOpenAdd}
            className="btn-glow-primary"
          >
            <span>➕</span> Add Record
          </button>

          {records.length > 0 && (
            <>
              <button
                onClick={() => exportRecordsToCSV(records)}
                className="btn-outline-dark"
                title="Export current records to CSV"
              >
                <span>💾</span> Export CSV
              </button>
              <button
                onClick={() => setIsClearAllModalOpen(true)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  color: '#f87171',
                  fontSize: '0.82rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                }}
              >
                <span>🗑️</span> Clear All
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filter and Search Row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '18px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="🔍 Search product, customer, sales rep..."
            className="search-input-dark"
            style={{ width: '280px' }}
          />

          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
            className="filter-select-dark"
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select
            value={regionFilter}
            onChange={(e) => { setRegionFilter(e.target.value); setCurrentPage(1); }}
            className="filter-select-dark"
          >
            <option value="">All Regions</option>
            {regions.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <div style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: '600' }}>
          Showing <strong style={{ color: '#38bdf8' }}>{filtered.length}</strong> of {records.length} records
        </div>
      </div>

      {/* Main Data Table */}
      <div className="table-responsive">
        <table className="data-table-dark">
          <thead>
            <tr>
              <th onClick={() => handleSort('date')} style={{ cursor: 'pointer' }}>Date {sortField === 'date' ? (sortAsc ? '▲' : '▼') : '↕'}</th>
              <th onClick={() => handleSort('productName')} style={{ cursor: 'pointer' }}>Product {sortField === 'productName' ? (sortAsc ? '▲' : '▼') : '↕'}</th>
              <th>Category</th>
              <th onClick={() => handleSort('quantity')} style={{ cursor: 'pointer' }}>Qty</th>
              <th onClick={() => handleSort('revenue')} style={{ cursor: 'pointer' }}>Revenue {sortField === 'revenue' ? (sortAsc ? '▲' : '▼') : '↕'}</th>
              <th onClick={() => handleSort('cost')} style={{ cursor: 'pointer' }}>Cost</th>
              <th onClick={() => handleSort('profit')} style={{ cursor: 'pointer' }}>Profit {sortField === 'profit' ? (sortAsc ? '▲' : '▼') : '↕'}</th>
              <th>Customer</th>
              <th>Region</th>
              <th>Salesperson</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan="11" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                  {records.length === 0 ? 'No business data available. Click "+ Add Record" or "Upload CSV / Excel" above.' : 'No records match your search filter.'}
                </td>
              </tr>
            ) : (
              paginated.map((r) => (
                <tr key={r.id}>
                  <td style={{ whiteSpace: 'nowrap', color: '#94a3b8' }}>{r.date}</td>
                  <td><strong style={{ color: '#f8fafc' }}>{r.productName}</strong></td>
                  <td><span className="badge-dark badge-category">{r.category}</span></td>
                  <td>{r.quantity}</td>
                  <td><strong style={{ color: '#38bdf8' }}>₹{Number(r.revenue).toLocaleString('en-IN')}</strong></td>
                  <td style={{ color: '#94a3b8' }}>₹{Number(r.cost).toLocaleString('en-IN')}</td>
                  <td>
                    <strong style={{ color: r.profit >= 0 ? '#10b981' : '#ef4444' }}>
                      {r.profit >= 0 ? '+' : ''}₹{Number(r.profit).toLocaleString('en-IN')}
                    </strong>
                  </td>
                  <td>{r.customerName}</td>
                  <td><span className="badge-dark badge-region">{r.region}</span></td>
                  <td style={{ color: '#94a3b8' }}>{r.salesperson}</td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                      <button
                        onClick={() => handleOpenEdit(r)}
                        className="btn-action-edit"
                        title="Edit record"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => { setSelectedRecordToDelete(r); setIsDeleteModalOpen(true); }}
                        className="btn-action-delete"
                        title="Delete record"
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

      {/* Pagination Footer */}
      {filtered.length > pageSize && (
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

      {/* ====================================================================
          MODAL: ADD / EDIT RECORD
          ==================================================================== */}
      <Modal
        isOpen={isAddEditModalOpen}
        title={editingId ? 'Edit Business Record' : 'Add New Business Record'}
        onClose={() => setIsAddEditModalOpen(false)}
        maxWidth="680px"
      >
        <form onSubmit={handleSaveRecord}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1.5fr', gap: '12px', marginBottom: '14px' }}>
            <div>
              <label className="form-label-dark">Date *</label>
              <input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                required
                className="form-input-dark"
              />
            </div>
            <div>
              <label className="form-label-dark">Product Name *</label>
              <input
                type="text"
                value={formProduct}
                onChange={(e) => setFormProduct(e.target.value)}
                required
                placeholder="e.g. Wireless Ergonomic Mouse"
                className="form-input-dark"
              />
            </div>
            <div>
              <label className="form-label-dark">Category</label>
              <input
                type="text"
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                placeholder="e.g. Electronics"
                className="form-input-dark"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr 1.5fr', gap: '12px', marginBottom: '14px' }}>
            <div>
              <label className="form-label-dark">Quantity</label>
              <input
                type="number"
                min="1"
                value={formQuantity}
                onChange={(e) => {
                  setFormQuantity(e.target.value);
                  setFormSales(e.target.value);
                }}
                required
                className="form-input-dark"
              />
            </div>
            <div>
              <label className="form-label-dark">Sales (Units)</label>
              <input
                type="number"
                min="1"
                value={formSales}
                onChange={(e) => setFormSales(e.target.value)}
                className="form-input-dark"
              />
            </div>
            <div>
              <label className="form-label-dark">Gross Revenue (₹) *</label>
              <input
                type="number"
                step="0.01"
                value={formRevenue}
                onChange={(e) => handleRevenueChange(e.target.value)}
                required
                placeholder="0.00"
                className="form-input-dark"
              />
            </div>
            <div>
              <label className="form-label-dark">Total Cost (₹)</label>
              <input
                type="number"
                step="0.01"
                value={formCost}
                onChange={(e) => handleCostChange(e.target.value)}
                placeholder="0.00"
                className="form-input-dark"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 2fr', gap: '12px', marginBottom: '14px', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label className="form-label-dark" style={{ margin: 0 }}>Net Profit (₹)</label>
                <label style={{ fontSize: '0.72rem', color: '#38bdf8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <input
                    type="checkbox"
                    checked={autoCalculateProfit}
                    onChange={(e) => setAutoCalculateProfit(e.target.checked)}
                  />
                  Auto-calc (Rev - Cost)
                </label>
              </div>
              <input
                type="number"
                step="0.01"
                value={formProfit}
                onChange={(e) => { setAutoCalculateProfit(false); setFormProfit(e.target.value); }}
                className="form-input-dark"
              />
            </div>

            <div>
              <label className="form-label-dark">Customer Name</label>
              <input
                type="text"
                value={formCustomer}
                onChange={(e) => setFormCustomer(e.target.value)}
                placeholder="e.g. Apex Tech Solutions"
                className="form-input-dark"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '22px' }}>
            <div>
              <label className="form-label-dark">Region / Territory</label>
              <select
                value={formRegion}
                onChange={(e) => setFormRegion(e.target.value)}
                className="form-input-dark"
              >
                <option value="North">North</option>
                <option value="South">South</option>
                <option value="East">East</option>
                <option value="West">West</option>
                <option value="Central">Central</option>
                <option value="International">International</option>
              </select>
            </div>
            <div>
              <label className="form-label-dark">Salesperson / Representative</label>
              <input
                type="text"
                value={formSalesperson}
                onChange={(e) => setFormSalesperson(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="form-input-dark"
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              onClick={() => setIsAddEditModalOpen(false)}
              className="btn-outline-dark"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-glow-primary"
            >
              {editingId ? 'Save Changes' : 'Save Business Record'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ====================================================================
          MODAL: CSV / EXCEL UPLOAD & VALIDATION REPORT
          ==================================================================== */}
      <Modal
        isOpen={isUploadModalOpen}
        title="Upload Business Data (CSV / Excel)"
        onClose={() => setIsUploadModalOpen(false)}
        maxWidth="620px"
      >
        <div style={{ marginBottom: '18px' }}>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0 0 12px' }}>
            Upload your sales CSV or spreadsheet file. The validator will inspect all records for formatting, numbers, and duplicates before importing.
          </p>

          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: '2px dashed rgba(6, 182, 212, 0.4)',
              borderRadius: '12px',
              padding: '28px 20px',
              textAlign: 'center',
              backgroundColor: 'rgba(6, 182, 212, 0.05)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📥</div>
            <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#f8fafc', marginBottom: '4px' }}>
              {uploadFileName ? uploadFileName : 'Click to Browse or Drag & Drop CSV File'}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Supports comma-separated values (.csv) with standard column headers
            </div>
          </div>
        </div>

        {isProcessingFile && (
          <div style={{ textAlign: 'center', padding: '16px', color: '#38bdf8', fontSize: '0.85rem' }}>
            Validating dataset fields...
          </div>
        )}

        {/* Validation Diagnostic Report */}
        {validationResult && (
          <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.7)', borderRadius: '10px', padding: '16px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '20px' }}>
            <div style={{ fontSize: '0.88rem', fontWeight: '800', color: '#f8fafc', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>🔍</span> Validation Analysis Results
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '12px' }}>
              <div style={{ padding: '10px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>Total Records</div>
                <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#f8fafc' }}>{validationResult.total}</div>
              </div>
              <div style={{ padding: '10px', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                <div style={{ fontSize: '0.7rem', color: '#6ee7b7', textTransform: 'uppercase' }}>Valid Records</div>
                <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#10b981' }}>{validationResult.valid}</div>
              </div>
              <div style={{ padding: '10px', backgroundColor: validationResult.invalid > 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.03)', borderRadius: '8px', border: `1px solid ${validationResult.invalid > 0 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255,255,255,0.06)'}` }}>
                <div style={{ fontSize: '0.7rem', color: validationResult.invalid > 0 ? '#fca5a5' : '#94a3b8', textTransform: 'uppercase' }}>Invalid Rows</div>
                <div style={{ fontSize: '1.2rem', fontWeight: '800', color: validationResult.invalid > 0 ? '#ef4444' : '#94a3b8' }}>{validationResult.invalid}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', fontSize: '0.78rem', color: '#cbd5e1' }}>
              <div>• Missing Required Values: <strong style={{ color: validationResult.missingCount > 0 ? '#f59e0b' : '#10b981' }}>{validationResult.missingCount}</strong></div>
              <div>• Duplicates Detected: <strong style={{ color: validationResult.duplicateCount > 0 ? '#f59e0b' : '#10b981' }}>{validationResult.duplicateCount}</strong></div>
            </div>

            {validationResult.invalidRows?.length > 0 && (
              <div style={{ marginTop: '10px', fontSize: '0.75rem', color: '#fca5a5', maxHeight: '80px', overflowY: 'auto' }}>
                {validationResult.invalidRows.slice(0, 3).map((inv, idx) => (
                  <div key={idx}>Row {inv.rowNumber}: {inv.reasons.join(', ')}</div>
                ))}
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            type="button"
            onClick={downloadSampleCSVTemplate}
            className="btn-outline-dark"
            style={{ fontSize: '0.8rem' }}
          >
            Download CSV Format
          </button>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(false)}
              className="btn-outline-dark"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!validationResult || validationResult.valid === 0}
              onClick={handleImportValidRecords}
              className="btn-glow-primary"
            >
              Import {validationResult?.valid || 0} Valid Records →
            </button>
          </div>
        </div>
      </Modal>

      {/* ====================================================================
          MODAL: CONFIRM SINGLE DELETE
          ==================================================================== */}
      <Modal
        isOpen={isDeleteModalOpen}
        title="Confirm Deletion"
        onClose={() => setIsDeleteModalOpen(false)}
      >
        <p style={{ fontSize: '0.9rem', color: '#cbd5e1', marginBottom: '20px' }}>
          Are you sure you want to delete the record for <strong>{selectedRecordToDelete?.productName}</strong> (₹{Number(selectedRecordToDelete?.revenue).toLocaleString('en-IN')})?
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button onClick={() => setIsDeleteModalOpen(false)} className="btn-outline-dark">Cancel</button>
          <button
            onClick={handleConfirmDelete}
            style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#dc2626', color: 'white', fontWeight: '700', cursor: 'pointer' }}
          >
            Confirm Delete
          </button>
        </div>
      </Modal>

      {/* ====================================================================
          MODAL: CONFIRM CLEAR ALL
          ==================================================================== */}
      <Modal
        isOpen={isClearAllModalOpen}
        title="Confirm Clear Entire Dataset"
        onClose={() => setIsClearAllModalOpen(false)}
      >
        <p style={{ fontSize: '0.9rem', color: '#cbd5e1', marginBottom: '20px' }}>
          Are you sure you want to wipe all <strong>{records.length}</strong> business records? The dashboard will return to its initial empty state.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button onClick={() => setIsClearAllModalOpen(false)} className="btn-outline-dark">Cancel</button>
          <button
            onClick={handleConfirmClearAll}
            style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#dc2626', color: 'white', fontWeight: '700', cursor: 'pointer' }}
          >
            Yes, Wipe All Data
          </button>
        </div>
      </Modal>
    </div>
  );
}
