import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import { getOrders, getCustomers, getProducts, createOrderApi, updateOrderStatusApi, deleteOrderApi } from '../services/api';

export default function OrdersPage({ onShowToast }) {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // New Order Form state
  const [orderCustomerId, setOrderCustomerId] = useState('');
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [orderNotes, setOrderNotes] = useState('');
  const [orderItems, setOrderItems] = useState([
    { productId: '', quantity: 1, unitPrice: 0, unitCost: 0, total: 0 }
  ]);

  const loadData = async () => {
    setLoading(true);
    const [oList, cList, pList] = await Promise.all([getOrders(), getCustomers(), getProducts()]);
    setOrders(oList || []);
    setCustomers(cList || []);
    setProducts(pList || []);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setOrderCustomerId(customers[0]?.id || '');
    setOrderDate(new Date().toISOString().split('T')[0]);
    setPaymentMethod('UPI');
    setDiscountAmount(0);
    setTaxAmount(0);
    setOrderNotes('');
    
    // Default first product
    const firstP = products[0];
    setOrderItems([
      {
        productId: firstP ? firstP.id : '',
        quantity: 1,
        unitPrice: firstP ? firstP.sellingPrice : 0,
        unitCost: firstP ? firstP.costPrice : 0,
        total: firstP ? firstP.sellingPrice : 0
      }
    ]);
    setIsCreateModalOpen(true);
  };

  const handleProductChange = (index, prodId) => {
    const prod = products.find(p => p.id === Number(prodId));
    const newItems = [...orderItems];
    newItems[index].productId = prodId;
    if (prod) {
      newItems[index].unitPrice = prod.sellingPrice;
      newItems[index].unitCost = prod.costPrice;
      newItems[index].total = prod.sellingPrice * (newItems[index].quantity || 1);
    }
    setOrderItems(newItems);
  };

  const handleQuantityChange = (index, qty) => {
    const quantity = Math.max(1, Number(qty) || 1);
    const newItems = [...orderItems];
    newItems[index].quantity = quantity;
    newItems[index].total = (newItems[index].unitPrice || 0) * quantity;
    setOrderItems(newItems);
  };

  const addItemRow = () => {
    const firstP = products[0];
    setOrderItems([
      ...orderItems,
      {
        productId: firstP ? firstP.id : '',
        quantity: 1,
        unitPrice: firstP ? firstP.sellingPrice : 0,
        unitCost: firstP ? firstP.costPrice : 0,
        total: firstP ? firstP.sellingPrice : 0
      }
    ]);
  };

  const removeItemRow = (index) => {
    if (orderItems.length === 1) return;
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  // Calculations
  const calculatedSubtotal = orderItems.reduce((sum, item) => sum + (item.total || 0), 0);
  const calculatedTotalCost = orderItems.reduce((sum, item) => sum + ((item.unitCost || 0) * (item.quantity || 1)), 0);
  const calculatedTotal = calculatedSubtotal - Number(discountAmount || 0) + Number(taxAmount || 0);
  const calculatedProfit = calculatedTotal - calculatedTotalCost;

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!orderCustomerId) {
      onShowToast('Please select a customer', 'warning');
      return;
    }
    if (orderItems.some(i => !i.productId)) {
      onShowToast('Please select products for all item rows', 'warning');
      return;
    }

    try {
      await createOrderApi({
        customerId: Number(orderCustomerId),
        orderDate,
        paymentMethod,
        discountAmount: Number(discountAmount),
        taxAmount: Number(taxAmount),
        notes: orderNotes,
        items: orderItems.map(i => ({
          productId: Number(i.productId),
          quantity: Number(i.quantity),
          unitPrice: Number(i.unitPrice),
          unitCost: Number(i.unitCost)
        }))
      });

      setIsCreateModalOpen(false);
      onShowToast('Order placed successfully & stock deducted!', 'success');
      loadData();
    } catch (err) {
      onShowToast(err.message || 'Error creating order', 'error');
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatusApi(orderId, newStatus);
      onShowToast(`Order status updated to ${newStatus}`, 'success');
      loadData();
    } catch (err) {
      onShowToast(err.message || 'Error updating status', 'error');
    }
  };

  const handleDeleteOrder = async () => {
    try {
      await deleteOrderApi(selectedOrder.id);
      setIsDeleteModalOpen(false);
      onShowToast('Order deleted & inventory restored', 'success');
      loadData();
    } catch (err) {
      onShowToast(err.message || 'Error deleting order', 'error');
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
    const matchesSearch = o.orderNumber?.toLowerCase().includes(search.toLowerCase()) || o.customerName?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="card-section">
      <div className="section-header">
        <div>
          <h3>Sales Transactions & Order Management</h3>
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Create real orders, compute profit margins, generate invoices, and manage client orders
          </div>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>
          + Create New Sales Order
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '18px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Search by Order # or Customer..."
            style={{ width: '280px', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
          />

          <div style={{ display: 'flex', backgroundColor: '#f1f5f9', borderRadius: '8px', padding: '3px' }}>
            {['ALL', 'COMPLETED', 'PENDING', 'CANCELLED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  backgroundColor: statusFilter === st ? '#2563eb' : 'transparent',
                  color: statusFilter === st ? '#ffffff' : '#64748b'
                }}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Order No</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total Revenue</th>
              <th>Net Profit</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '24px' }}>Loading orders...</td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>No orders found</td>
              </tr>
            ) : (
              filteredOrders.map((o) => (
                <tr key={o.id}>
                  <td><code>{o.orderNumber}</code></td>
                  <td>{o.orderDate}</td>
                  <td><strong>{o.customerName}</strong></td>
                  <td>{o.items?.length || 1} items</td>
                  <td><strong style={{ color: '#0f172a' }}>₹{Number(o.totalAmount || 0).toLocaleString('en-IN')}</strong></td>
                  <td><strong style={{ color: '#10b981' }}>+₹{Number(o.profit || 0).toLocaleString('en-IN')}</strong></td>
                  <td><span className="badge badge-sale">{o.paymentMethod}</span></td>
                  <td>
                    <select
                      value={o.status}
                      onChange={(e) => handleStatusChange(o.id, e.target.value)}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        backgroundColor: o.status === 'COMPLETED' ? '#ecfdf5' : (o.status === 'PENDING' ? '#fffbeb' : '#fef2f2'),
                        color: o.status === 'COMPLETED' ? '#065f46' : (o.status === 'PENDING' ? '#92400e' : '#991b1b'),
                        cursor: 'pointer'
                      }}
                    >
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="PENDING">PENDING</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        className="btn btn-outline"
                        style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                        onClick={() => { setSelectedOrder(o); setIsInvoiceModalOpen(true); }}
                      >
                        📄 Invoice
                      </button>
                      <button
                        className="btn btn-outline"
                        style={{ padding: '4px 8px', fontSize: '0.75rem', color: '#dc2626', borderColor: '#fecaca' }}
                        onClick={() => { setSelectedOrder(o); setIsDeleteModalOpen(true); }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* CREATE ORDER MODAL */}
      <Modal isOpen={isCreateModalOpen} title="Create Sales Order & Invoicing" onClose={() => setIsCreateModalOpen(false)} maxWidth="720px">
        <form onSubmit={handleCreateOrder}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Select Customer *</label>
              <select
                value={orderCustomerId}
                onChange={(e) => setOrderCustomerId(e.target.value)}
                required
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              >
                <option value="">Choose Customer</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.customerCode})</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Order Date</label>
              <input
                type="date"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                required
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Payment Mode</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              >
                <option value="UPI">UPI</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="CASH">Cash</option>
                <option value="CARD">Debit/Credit Card</option>
                <option value="CREDIT">Net Credit</option>
              </select>
            </div>
          </div>

          {/* Dynamic Line Items Table */}
          <div style={{ marginBottom: '16px', background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <strong style={{ fontSize: '0.85rem', color: '#1e293b' }}>Order Line Items</strong>
              <button
                type="button"
                onClick={addItemRow}
                style={{
                  background: '#eff6ff',
                  color: '#2563eb',
                  border: '1px solid #bfdbfe',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                + Add Product
              </button>
            </div>

            {orderItems.map((item, idx) => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1.5fr 1.5fr auto', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                <select
                  value={item.productId}
                  onChange={(e) => handleProductChange(idx, e.target.value)}
                  required
                  style={{ padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                >
                  <option value="">Select Item</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (Stock: {p.stockQuantity}) - ₹{p.sellingPrice}</option>
                  ))}
                </select>

                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => handleQuantityChange(idx, e.target.value)}
                  style={{ padding: '7px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem', textAlign: 'center' }}
                  placeholder="Qty"
                />

                <input
                  type="number"
                  readOnly
                  value={item.unitPrice}
                  style={{ padding: '7px 8px', borderRadius: '6px', border: '1px solid #e2e8f0', backgroundColor: '#ffffff', fontSize: '0.82rem', color: '#64748b' }}
                  placeholder="Price"
                />

                <div style={{ fontWeight: '700', fontSize: '0.88rem', color: '#0f172a', textAlign: 'right' }}>
                  ₹{(item.total || 0).toLocaleString('en-IN')}
                </div>

                <button
                  type="button"
                  onClick={() => removeItemRow(idx)}
                  disabled={orderItems.length === 1}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: orderItems.length > 1 ? '#dc2626' : '#cbd5e1',
                    cursor: orderItems.length > 1 ? 'pointer' : 'not-allowed',
                    fontSize: '1.1rem',
                    padding: '4px'
                  }}
                  title="Remove row"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>

          {/* Pricing & Profit Summary Preview */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '18px' }}>
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', marginBottom: '2px' }}>Discount (₹)</label>
                  <input
                    type="number"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(e.target.value)}
                    style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', marginBottom: '2px' }}>Tax (₹)</label>
                  <input
                    type="number"
                    value={taxAmount}
                    onChange={(e) => setTaxAmount(e.target.value)}
                    style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                  />
                </div>
              </div>
              <input
                type="text"
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="Optional order notes / memo..."
                style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
              />
            </div>

            {/* Live Totals Card */}
            <div style={{ backgroundColor: '#f1f5f9', padding: '12px 16px', borderRadius: '8px', fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Subtotal:</span>
                <strong>₹{calculatedSubtotal.toLocaleString('en-IN')}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#dc2626' }}>
                <span>Discount:</span>
                <span>- ₹{Number(discountAmount || 0).toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Tax:</span>
                <span>+ ₹{Number(taxAmount || 0).toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #cbd5e1', paddingTop: '6px', marginTop: '4px', fontSize: '0.95rem' }}>
                <strong>Total Revenue:</strong>
                <strong style={{ color: '#2563eb' }}>₹{calculatedTotal.toLocaleString('en-IN')}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981', fontWeight: '700' }}>
                <span>Estimated Net Profit:</span>
                <span>+₹{calculatedProfit.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" className="btn btn-outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Submit & Place Order</button>
          </div>
        </form>
      </Modal>

      {/* INVOICE MODAL */}
      <Modal isOpen={isInvoiceModalOpen} title={`Tax Invoice #${selectedOrder?.orderNumber}`} onClose={() => setIsInvoiceModalOpen(false)} maxWidth="640px">
        {selectedOrder && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #e2e8f0', paddingBottom: '14px', marginBottom: '16px' }}>
              <div>
                <h4 style={{ margin: '0 0 4px', fontSize: '1.2rem', color: '#0f172a' }}>Business Analytics System</h4>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Enterprise Billing & Commerce</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: '800', color: '#2563eb', fontSize: '1.1rem' }}>{selectedOrder.orderNumber}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Date: {selectedOrder.orderDate}</div>
              </div>
            </div>

            <div style={{ marginBottom: '16px', fontSize: '0.85rem' }}>
              <strong>Billed To:</strong>
              <div>{selectedOrder.customerName} ({selectedOrder.customerCode})</div>
              <div style={{ color: '#64748b' }}>Payment Mode: {selectedOrder.paymentMethod}</div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', marginBottom: '16px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #cbd5e1' }}>
                  <th style={{ padding: '8px', textAlign: 'left' }}>Item Description</th>
                  <th style={{ padding: '8px', textAlign: 'center' }}>Qty</th>
                  <th style={{ padding: '8px', textAlign: 'right' }}>Unit Price</th>
                  <th style={{ padding: '8px', textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrder.items?.map((it, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '8px' }}>{it.productName}</td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>{it.quantity}</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>₹{Number(it.unitPrice).toLocaleString('en-IN')}</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}><strong>₹{Number(it.totalPrice).toLocaleString('en-IN')}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
              <div style={{ width: '220px', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Subtotal:</span>
                  <span>₹{Number(selectedOrder.subtotal).toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#dc2626' }}>
                  <span>Discount:</span>
                  <span>-₹{Number(selectedOrder.discountAmount || 0).toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Tax:</span>
                  <span>+₹{Number(selectedOrder.taxAmount || 0).toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #0f172a', paddingTop: '6px', fontWeight: '800', fontSize: '1rem' }}>
                  <span>Grand Total:</span>
                  <span style={{ color: '#2563eb' }}>₹{Number(selectedOrder.totalAmount).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="btn btn-outline" onClick={() => window.print()}>🖨️ Print Invoice</button>
              <button className="btn btn-primary" onClick={() => setIsInvoiceModalOpen(false)}>Close</button>
            </div>
          </div>
        )}
      </Modal>

      {/* DELETE MODAL */}
      <Modal isOpen={isDeleteModalOpen} title="Confirm Order Deletion" onClose={() => setIsDeleteModalOpen(false)}>
        <p style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '20px' }}>
          Are you sure you want to delete order <strong>{selectedOrder?.orderNumber}</strong>? Inventory stock will be automatically restored.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button type="button" className="btn btn-outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
          <button
            type="button"
            className="btn btn-primary"
            style={{ backgroundColor: '#dc2626' }}
            onClick={handleDeleteOrder}
          >
            Confirm Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}
