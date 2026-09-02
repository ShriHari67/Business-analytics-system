import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import { getCustomers, createCustomerApi, updateCustomerApi, deleteCustomerApi } from '../services/api';

export default function CustomersPage({ onShowToast }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formCreditLimit, setFormCreditLimit] = useState(0);

  const loadCustomers = async () => {
    setLoading(true);
    const data = await getCustomers();
    setCustomers(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const openAddModal = () => {
    setFormName('');
    setFormCode('');
    setFormPhone('');
    setFormEmail('');
    setFormAddress('');
    setFormCreditLimit(50000);
    setIsAddModalOpen(true);
  };

  const openEditModal = (c) => {
    setSelectedCustomer(c);
    setFormName(c.name || '');
    setFormCode(c.customerCode || '');
    setFormPhone(c.phone || '');
    setFormEmail(c.email || '');
    setFormAddress(c.address || '');
    setFormCreditLimit(c.creditLimit || 0);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (c) => {
    setSelectedCustomer(c);
    setIsDeleteModalOpen(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createCustomerApi({
        name: formName,
        customerCode: formCode,
        phone: formPhone,
        email: formEmail,
        address: formAddress,
        creditLimit: Number(formCreditLimit),
      });
      setIsAddModalOpen(false);
      onShowToast('Customer added successfully', 'success');
      loadCustomers();
    } catch (err) {
      onShowToast(err.message || 'Error creating customer', 'error');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateCustomerApi(selectedCustomer.id, {
        name: formName,
        phone: formPhone,
        email: formEmail,
        address: formAddress,
        creditLimit: Number(formCreditLimit),
      });
      setIsEditModalOpen(false);
      onShowToast('Customer updated successfully', 'success');
      loadCustomers();
    } catch (err) {
      onShowToast(err.message || 'Error updating customer', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCustomerApi(selectedCustomer.id);
      setIsDeleteModalOpen(false);
      onShowToast('Customer deleted successfully', 'success');
      loadCustomers();
    } catch (err) {
      onShowToast(err.message || 'Error deleting customer', 'error');
    }
  };

  const filtered = customers.filter((c) =>
    (c.name?.toLowerCase().includes(search.toLowerCase()) ||
     c.customerCode?.toLowerCase().includes(search.toLowerCase()) ||
     c.phone?.includes(search) ||
     c.email?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="card-section">
      <div className="section-header">
        <div>
          <h3>Customer Relationship & Accounts Directory</h3>
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Track client purchase histories, credit allowances, and contact details
          </div>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          + Add New Customer
        </button>
      </div>

      <div style={{ marginBottom: '18px', maxWidth: '340px' }}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Search customer by name, code or phone..."
          style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
        />
      </div>

      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Customer Name</th>
              <th>Contact Info</th>
              <th>Total Orders</th>
              <th>Total Revenue</th>
              <th>Credit Limit</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '24px' }}>Loading customers...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>No customers found</td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.id}>
                  <td><code>{c.customerCode}</code></td>
                  <td><strong>{c.name}</strong></td>
                  <td>
                    <div style={{ fontSize: '0.82rem' }}>{c.phone}</div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{c.email}</div>
                  </td>
                  <td><span className="badge badge-sale">{c.totalOrdersCount || 0} orders</span></td>
                  <td><strong style={{ color: '#10b981' }}>₹{Number(c.totalSpent || 0).toLocaleString('en-IN')}</strong></td>
                  <td>₹{Number(c.creditLimit || 0).toLocaleString('en-IN')}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="btn btn-outline"
                        style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                        onClick={() => openEditModal(c)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-outline"
                        style={{ padding: '4px 8px', fontSize: '0.75rem', color: '#dc2626', borderColor: '#fecaca' }}
                        onClick={() => openDeleteModal(c)}
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

      {/* ADD MODAL */}
      <Modal isOpen={isAddModalOpen} title="Register New Customer" onClose={() => setIsAddModalOpen(false)}>
        <form onSubmit={handleCreate}>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Customer / Company Name</label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              required
              placeholder="e.g. Apex Tech Solutions"
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Phone Number</label>
              <input
                type="text"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder="+91 98765 43210"
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Email Address</label>
              <input
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="contact@company.com"
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Billing & Shipping Address</label>
            <textarea
              value={formAddress}
              onChange={(e) => setFormAddress(e.target.value)}
              rows={2}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Credit Limit (₹)</label>
            <input
              type="number"
              value={formCreditLimit}
              onChange={(e) => setFormCreditLimit(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" className="btn btn-outline" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Customer</button>
          </div>
        </form>
      </Modal>

      {/* EDIT MODAL */}
      <Modal isOpen={isEditModalOpen} title={`Edit Customer: ${selectedCustomer?.name}`} onClose={() => setIsEditModalOpen(false)}>
        <form onSubmit={handleUpdate}>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Customer Name</label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              required
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Phone Number</label>
              <input
                type="text"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Email Address</label>
              <input
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Address</label>
            <textarea
              value={formAddress}
              onChange={(e) => setFormAddress(e.target.value)}
              rows={2}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Credit Limit (₹)</label>
            <input
              type="number"
              value={formCreditLimit}
              onChange={(e) => setFormCreditLimit(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" className="btn btn-outline" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Changes</button>
          </div>
        </form>
      </Modal>

      {/* DELETE MODAL */}
      <Modal isOpen={isDeleteModalOpen} title="Confirm Customer Deletion" onClose={() => setIsDeleteModalOpen(false)}>
        <p style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '20px' }}>
          Are you sure you want to remove customer <strong>{selectedCustomer?.name}</strong>?
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button type="button" className="btn btn-outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
          <button
            type="button"
            className="btn btn-primary"
            style={{ backgroundColor: '#dc2626' }}
            onClick={handleDelete}
          >
            Confirm Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}
