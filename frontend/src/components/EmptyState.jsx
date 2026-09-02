import React from 'react';
import { downloadSampleCSVTemplate } from '../services/dataStore';

export default function EmptyState({ onAddRecord, onUploadFile }) {
  return (
    <div
      style={{
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        padding: '56px 32px',
        textAlign: 'center',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
        maxWidth: '720px',
        margin: '40px auto',
      }}
    >
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(59, 130, 246, 0.3))',
          border: '1px solid rgba(6, 182, 212, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem',
          margin: '0 auto 20px',
        }}
      >
        📊
      </div>

      <h2
        style={{
          fontSize: '1.6rem',
          fontWeight: '800',
          color: '#f8fafc',
          marginBottom: '10px',
          letterSpacing: '-0.02em',
        }}
      >
        No business data available.
      </h2>

      <p
        style={{
          fontSize: '0.95rem',
          color: '#94a3b8',
          maxWidth: '480px',
          margin: '0 auto 28px',
          lineHeight: '1.6',
        }}
      >
        Start entering your actual sales, revenue, and product records or upload your existing CSV/Excel business spreadsheet. All KPIs, interactive charts, and AI insights will generate dynamically.
      </p>

      <div
        style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}
      >
        <button
          onClick={onAddRecord}
          className="btn-glow-primary"
          style={{
            padding: '12px 24px',
            borderRadius: '10px',
            fontSize: '0.92rem',
            fontWeight: '700',
            cursor: 'pointer',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>➕</span> Add Your First Record
        </button>

        <button
          onClick={onUploadFile}
          className="btn-glow-cyan"
          style={{
            padding: '12px 24px',
            borderRadius: '10px',
            fontSize: '0.92rem',
            fontWeight: '700',
            cursor: 'pointer',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>📥</span> Upload CSV / Excel
        </button>

        <button
          onClick={downloadSampleCSVTemplate}
          style={{
            padding: '12px 20px',
            borderRadius: '10px',
            fontSize: '0.92rem',
            fontWeight: '600',
            cursor: 'pointer',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#cbd5e1',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>📄</span> Download Sample CSV Template
        </button>
      </div>
    </div>
  );
}
