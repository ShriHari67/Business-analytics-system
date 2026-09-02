import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import { getUsers, createUserApi, updateUserApi, deleteUserApi } from '../services/api';

export default function UsersPage({ onShowToast }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Form states
  const [formFullName, setFormFullName] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState('USER');
  const [formIsActive, setFormIsActive] = useState(true);

  const loadUsers = async () => {
    setLoading(true);
    const data = await getUsers();
    setUsers(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const openAddModal = () => {
    setFormFullName('');
    setFormUsername('');
    setFormEmail('');
    setFormPassword('');
    setFormRole('USER');
    setFormIsActive(true);
    setIsAddModalOpen(true);
  };

  const openEditModal = (u) => {
    setSelectedUser(u);
    setFormFullName(u.fullName || '');
    setFormUsername(u.username || '');
    setFormEmail(u.email || '');
    setFormRole(u.role || 'USER');
    setFormIsActive(u.isActive !== false);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (u) => {
    setSelectedUser(u);
    setIsDeleteModalOpen(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createUserApi({
        fullName: formFullName,
        username: formUsername,
        email: formEmail,
        password: formPassword,
        role: formRole,
      });
      setIsAddModalOpen(false);
      onShowToast('User created successfully', 'success');
      loadUsers();
    } catch (err) {
      onShowToast(err.message || 'Error creating user', 'error');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateUserApi(selectedUser.id, {
        fullName: formFullName,
        role: formRole,
        isActive: formIsActive,
      });
      setIsEditModalOpen(false);
      onShowToast('User updated successfully', 'success');
      loadUsers();
    } catch (err) {
      onShowToast(err.message || 'Error updating user', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteUserApi(selectedUser.id);
      setIsDeleteModalOpen(false);
      onShowToast('User deleted successfully', 'success');
      loadUsers();
    } catch (err) {
      onShowToast(err.message || 'Error deleting user', 'error');
    }
  };

  const filteredUsers = users.filter((u) =>
    (u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
     u.username?.toLowerCase().includes(search.toLowerCase()) ||
     u.email?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="card-section">
      <div className="section-header">
        <div>
          <h3>System User Management & Access Control</h3>
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Manage administrative privileges, team accounts, and role permissions
          </div>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          + Add New User
        </button>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: '18px', maxWidth: '340px' }}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Search user by name, username or email..."
          style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
        />
      </div>

      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Full Name</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '24px' }}>Loading users...</td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>No users found</td>
              </tr>
            ) : (
              filteredUsers.map((u) => (
                <tr key={u.id}>
                  <td><code>#{u.id}</code></td>
                  <td><strong>{u.fullName || u.username}</strong></td>
                  <td>{u.username}</td>
                  <td>{u.email}</td>
                  <td>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        backgroundColor: u.role === 'ADMIN' ? '#dbeafe' : '#f1f5f9',
                        color: u.role === 'ADMIN' ? '#1e40af' : '#475569'
                      }}
                    >
                      {u.role === 'ADMIN' ? '🛡️ ADMIN' : '👤 USER'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${u.isActive !== false ? 'badge-paid' : 'badge-due'}`}>
                      {u.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="btn btn-outline"
                        style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                        onClick={() => openEditModal(u)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-outline"
                        style={{ padding: '4px 8px', fontSize: '0.75rem', color: '#dc2626', borderColor: '#fecaca' }}
                        onClick={() => openDeleteModal(u)}
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

      {/* ADD USER MODAL */}
      <Modal isOpen={isAddModalOpen} title="Create New System User" onClose={() => setIsAddModalOpen(false)}>
        <form onSubmit={handleCreate}>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Full Name</label>
            <input
              type="text"
              value={formFullName}
              onChange={(e) => setFormFullName(e.target.value)}
              required
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Username</label>
            <input
              type="text"
              value={formUsername}
              onChange={(e) => setFormUsername(e.target.value)}
              required
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Email Address</label>
            <input
              type="email"
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Initial Password</label>
            <input
              type="password"
              value={formPassword}
              onChange={(e) => setFormPassword(e.target.value)}
              required
              minLength={6}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Role</label>
            <select
              value={formRole}
              onChange={(e) => setFormRole(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            >
              <option value="USER">User (Standard Access)</option>
              <option value="ADMIN">Admin (Full Access)</option>
            </select>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" className="btn btn-outline" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Create User</button>
          </div>
        </form>
      </Modal>

      {/* EDIT USER MODAL */}
      <Modal isOpen={isEditModalOpen} title={`Edit User: ${selectedUser?.username}`} onClose={() => setIsEditModalOpen(false)}>
        <form onSubmit={handleUpdate}>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Full Name</label>
            <input
              type="text"
              value={formFullName}
              onChange={(e) => setFormFullName(e.target.value)}
              required
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Role</label>
            <select
              value={formRole}
              onChange={(e) => setFormRole(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            >
              <option value="USER">User (Standard Access)</option>
              <option value="ADMIN">Admin (Full Access)</option>
            </select>
          </div>
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: '600' }}>
              <input
                type="checkbox"
                checked={formIsActive}
                onChange={(e) => setFormIsActive(e.target.checked)}
              />
              Account Active
            </label>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" className="btn btn-outline" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Changes</button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRM MODAL */}
      <Modal isOpen={isDeleteModalOpen} title="Confirm Deletion" onClose={() => setIsDeleteModalOpen(false)}>
        <p style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '20px' }}>
          Are you sure you want to delete user <strong>{selectedUser?.fullName || selectedUser?.username}</strong>? This action cannot be undone.
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
