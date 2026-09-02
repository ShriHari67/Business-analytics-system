import React, { useState } from 'react';

const MOCK_SALES = [
  { invoice: 'INV-2026-0801', customer: 'Aarav Sharma Tech Services', date: '2026-08-18', amount: 45780.00, paid: 33280.00, due: 12500.00, status: 'PARTIAL', method: 'UPI' },
  { invoice: 'INV-2026-0802', customer: 'Priya Enterprises', date: '2026-08-20', amount: 83930.00, paid: 48930.00, due: 35000.00, status: 'PARTIAL', method: 'BANK_TRANSFER' },
  { invoice: 'INV-2026-0803', customer: 'Green Leaf Retail Store', date: '2026-08-24', amount: 20056.00, paid: 20056.00, due: 0.00, status: 'PAID', method: 'CASH' },
  { invoice: 'INV-2026-0804', customer: 'Apex Solutions Ltd', date: '2026-08-28', amount: 62400.00, paid: 62400.00, due: 0.00, status: 'PAID', method: 'UPI' },
];

const MOCK_PURCHASES = [
  { po: 'PO-2026-0801', supplier: 'Apex Wholesale Distributors', date: '2026-08-08', amount: 60000.00, paid: 35000.00, due: 25000.00, status: 'PARTIAL', method: 'BANK_TRANSFER' },
  { po: 'PO-2026-0802', supplier: 'Zenith Logistics & Supplies', date: '2026-08-12', amount: 42500.00, paid: 25500.00, due: 17000.00, status: 'PARTIAL', method: 'BANK_TRANSFER' },
  { po: 'PO-2026-0803', supplier: 'Prime Packaging Solutions', date: '2026-08-22', amount: 15400.00, paid: 15400.00, due: 0.00, status: 'PAID', method: 'UPI' },
];

export default function SalesPurchases() {
  const [activeSubTab, setActiveSubTab] = useState('sales');

  return (
    <div>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button
          className={`btn ${activeSubTab === 'sales' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveSubTab('sales')}
        >
          🛒 Customer Sales Invoices
        </button>
        <button
          className={`btn ${activeSubTab === 'purchases' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveSubTab('purchases')}
        >
          📦 Supplier Purchase Orders
        </button>
      </div>

      {activeSubTab === 'sales' && (
        <div className="card-section">
          <div className="section-header">
            <h3>Sales & Invoicing Records</h3>
            <button className="btn btn-primary">+ New Sales Invoice</button>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice No</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total Amount</th>
                  <th>Paid Amount</th>
                  <th>Balance Due</th>
                  <th>Payment Mode</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_SALES.map((sale) => (
                  <tr key={sale.invoice}>
                    <td><strong>{sale.invoice}</strong></td>
                    <td>{sale.customer}</td>
                    <td>{sale.date}</td>
                    <td><strong>₹{sale.amount.toLocaleString('en-IN')}</strong></td>
                    <td style={{ color: 'var(--success)', fontWeight: '600' }}>₹{sale.paid.toLocaleString('en-IN')}</td>
                    <td style={{ color: sale.due > 0 ? 'var(--danger)' : 'var(--slate-500)', fontWeight: '600' }}>
                      ₹{sale.due.toLocaleString('en-IN')}
                    </td>
                    <td>{sale.method}</td>
                    <td>
                      <span className={`badge badge-${sale.status.toLowerCase()}`}>
                        {sale.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubTab === 'purchases' && (
        <div className="card-section">
          <div className="section-header">
            <h3>Purchase Orders & Vendor Bills</h3>
            <button className="btn btn-primary">+ New Purchase Order</button>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>PO Number</th>
                  <th>Supplier / Vendor</th>
                  <th>Date</th>
                  <th>Total Bill</th>
                  <th>Paid Amount</th>
                  <th>Payable Due</th>
                  <th>Payment Mode</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_PURCHASES.map((po) => (
                  <tr key={po.po}>
                    <td><strong>{po.po}</strong></td>
                    <td>{po.supplier}</td>
                    <td>{po.date}</td>
                    <td><strong>₹{po.amount.toLocaleString('en-IN')}</strong></td>
                    <td style={{ color: 'var(--success)', fontWeight: '600' }}>₹{po.paid.toLocaleString('en-IN')}</td>
                    <td style={{ color: po.due > 0 ? 'var(--warning)' : 'var(--slate-500)', fontWeight: '600' }}>
                      ₹{po.due.toLocaleString('en-IN')}
                    </td>
                    <td>{po.method}</td>
                    <td>
                      <span className={`badge badge-${po.status.toLowerCase()}`}>
                        {po.status}
                      </span>
                    </td>
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
