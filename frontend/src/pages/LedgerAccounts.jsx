import React, { useState } from 'react';

const CHART_OF_ACCOUNTS = [
  { code: '1010', name: 'Cash on Hand', type: 'ASSET', balance: 45000.00, status: 'Active' },
  { code: '1020', name: 'Business Current Bank Account', type: 'ASSET', balance: 285000.00, status: 'Active' },
  { code: '1100', name: 'Accounts Receivable (Customer Credit)', type: 'ASSET', balance: 68000.00, status: 'Active' },
  { code: '1200', name: 'Inventory Stock Asset', type: 'ASSET', balance: 150000.00, status: 'Active' },
  { code: '2010', name: 'Accounts Payable (Supplier Credit)', type: 'LIABILITY', balance: 42000.00, status: 'Active' },
  { code: '4010', name: 'Sales Revenue', type: 'REVENUE', balance: 520000.00, status: 'Active' },
  { code: '5010', name: 'Cost of Goods Sold (COGS)', type: 'EXPENSE', balance: 290000.00, status: 'Active' },
  { code: '5020', name: 'Store Rent & Utilities', type: 'EXPENSE', balance: 47500.00, status: 'Active' },
  { code: '5040', name: 'Employee Salaries', type: 'EXPENSE', balance: 103000.00, status: 'Active' },
];

export default function LedgerAccounts() {
  const [activeSubView, setActiveSubView] = useState('accounts');

  return (
    <div>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button
          className={`btn ${activeSubView === 'accounts' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveSubView('accounts')}
        >
          📑 Chart of Accounts
        </button>
        <button
          className={`btn ${activeSubView === 'pnl' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveSubView('pnl')}
        >
          📊 Profit & Loss Summary
        </button>
        <button
          className={`btn ${activeSubView === 'cashflow' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveSubView('cashflow')}
        >
          🏦 Cash Flow Velocity
        </button>
      </div>

      {activeSubView === 'accounts' && (
        <div className="card-section">
          <div className="section-header">
            <h3>General Ledger & Chart of Accounts</h3>
            <button className="btn btn-primary">+ Add Account</button>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Account Code</th>
                  <th>Account Name</th>
                  <th>Classification</th>
                  <th>Current Balance</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {CHART_OF_ACCOUNTS.map((acc) => (
                  <tr key={acc.code}>
                    <td><code>{acc.code}</code></td>
                    <td><strong>{acc.name}</strong></td>
                    <td>
                      <span className={`badge badge-${acc.type === 'ASSET' || acc.type === 'REVENUE' ? 'paid' : 'due'}`}>
                        {acc.type}
                      </span>
                    </td>
                    <td><strong>₹{acc.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></td>
                    <td><span className="badge badge-paid">{acc.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubView === 'pnl' && (
        <div className="card-section">
          <div className="section-header">
            <h3>Monthly Profit & Loss Statement (August 2026)</h3>
          </div>

          <div style={{ maxWidth: '650px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--slate-200)' }}>
              <span style={{ fontWeight: '600' }}>Gross Sales Revenue</span>
              <span style={{ fontWeight: '700', color: 'var(--primary)' }}>₹5,20,000.00</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--slate-200)' }}>
              <span>Less: Cost of Purchases (COGS)</span>
              <span style={{ color: 'var(--danger)' }}>- ₹2,90,000.00</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', background: 'var(--slate-50)', fontWeight: '700' }}>
              <span>GROSS PROFIT (Margin: 44.2%)</span>
              <span style={{ color: 'var(--success)' }}>₹2,30,000.00</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--slate-200)' }}>
              <span>Operating Expenses (Rent, Utilities, Marketing)</span>
              <span style={{ color: 'var(--danger)' }}>- ₹61,750.00</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--slate-200)' }}>
              <span>Staff Salaries & Payroll</span>
              <span style={{ color: 'var(--danger)' }}>- ₹1,03,000.00</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: 'var(--success-bg)', borderRadius: '8px', border: '1px solid var(--success-border)', fontWeight: '800', fontSize: '1.1rem' }}>
              <span style={{ color: 'var(--success)' }}>NET OPERATING PROFIT</span>
              <span style={{ color: 'var(--success)' }}>₹65,250.00</span>
            </div>
          </div>
        </div>
      )}

      {activeSubView === 'cashflow' && (
        <div className="card-section">
          <div className="section-header">
            <h3>Cash Flow Velocity & Liquidity Management</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div style={{ padding: '20px', background: 'var(--slate-50)', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', textTransform: 'uppercase' }}>Total Cash Inflow</div>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--success)', marginTop: '8px' }}>₹5,20,000.00</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '4px' }}>From sales & receivables collected</div>
            </div>
            <div style={{ padding: '20px', background: 'var(--slate-50)', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', textTransform: 'uppercase' }}>Total Cash Outflow</div>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--danger)', marginTop: '8px' }}>₹4,54,750.00</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '4px' }}>Inventory, salaries & operating expenses</div>
            </div>
            <div style={{ padding: '20px', background: 'var(--primary-light)', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--primary-dark)', textTransform: 'uppercase' }}>Net Cash Surplus</div>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--primary)', marginTop: '8px' }}>+ ₹65,250.00</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--slate-600)', marginTop: '4px' }}>Positive operating liquidity</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
