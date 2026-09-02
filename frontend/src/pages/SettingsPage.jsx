import React, { useRef } from 'react';
import {
  getStoredRecords,
  saveStoredRecords,
  clearAllBusinessRecords,
} from '../services/dataStore';

export default function SettingsPage({ records = [], onDataUpdated, onShowToast }) {
  const fileInputRef = useRef(null);

  // Export JSON Backup
  const handleBackupJSON = () => {
    if (records.length === 0) {
      onShowToast('No data to backup', 'warning');
      return;
    }
    const dataStr = JSON.stringify(records, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `business_analytics_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    onShowToast('JSON backup file generated and downloaded', 'success');
  };

  // Restore JSON Backup
  const handleRestoreJSON = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result);
        if (!Array.isArray(parsed)) {
          throw new Error('Invalid JSON backup format (must be an array of records)');
        }
        saveStoredRecords(parsed);
        onShowToast(`Successfully restored ${parsed.length} business records!`, 'success');
        onDataUpdated();
      } catch (err) {
        onShowToast(err.message || 'Failed to restore backup', 'error');
      }
    };
    reader.readAsText(file);
  };

  // Clear all
  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to permanently clear all stored business data?')) {
      clearAllBusinessRecords();
      onShowToast('All data cleared', 'info');
      onDataUpdated();
    }
  };

  return (
    <div>
      {/* DATA MANAGEMENT & BACKUPS */}
      <div className="grid-2col" style={{ marginBottom: '24px' }}>
        <div className="card-section-dark">
          <div className="section-header-dark">
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#f8fafc', margin: 0 }}>
              💾 Data Backup & Restore
            </h3>
          </div>

          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '20px', lineHeight: '1.6' }}>
            Export your entire business analytics dataset to a local JSON archive or restore a previously exported snapshot.
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button onClick={handleBackupJSON} className="btn-glow-cyan">
              <span>📥</span> Download JSON Backup
            </button>

            <button onClick={() => fileInputRef.current?.click()} className="btn-outline-dark">
              <span>📤</span> Restore Backup File
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleRestoreJSON}
              style={{ display: 'none' }}
            />
          </div>
        </div>

        <div className="card-section-dark">
          <div className="section-header-dark">
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#fca5a5', margin: 0 }}>
              🗑️ Dataset Reset
            </h3>
          </div>

          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '20px', lineHeight: '1.6' }}>
            Currently managing <strong style={{ color: '#38bdf8' }}>{records.length}</strong> active business transaction records. Wiping will reset the dashboard to zero data.
          </p>

          <button
            onClick={handleClearAll}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              color: '#f87171',
              fontWeight: '700',
              cursor: 'pointer',
            }}
          >
            Wipe All Records & Return to Empty State
          </button>
        </div>
      </div>

      {/* SYSTEM ARCHITECTURE & CONNECTIVITY DIAGNOSTICS */}
      <div className="card-section-dark">
        <div className="section-header-dark">
          <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#f8fafc', margin: 0 }}>
            ⚡ System Diagnostics & Microservices Architecture
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <strong style={{ color: '#f8fafc' }}>Frontend UI</strong>
              <span className="badge-dark badge-category">React 18 + Vite</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
              Port 5173 • Responsive Dark Glassmorphism SaaS Client
            </div>
          </div>

          <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <strong style={{ color: '#f8fafc' }}>Backend REST API</strong>
              <span className="badge-dark badge-category">Spring Boot 3</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
              Port 8080 • Java JPA / Hibernate Relational Layer
            </div>
          </div>

          <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <strong style={{ color: '#f8fafc' }}>Python Microservice</strong>
              <span className="badge-dark badge-region">NumPy + Pandas</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
              Port 5000 • Machine statistical analytics & forecasting
            </div>
          </div>

          <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <strong style={{ color: '#f8fafc' }}>Data Persistence</strong>
              <span className="badge-dark badge-category">Persistent Browser DB</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
              Stores {records.length} records • Survives page reloads
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
