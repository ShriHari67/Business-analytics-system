import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import { getCategories, createCategoryApi, updateCategoryApi, deleteCategoryApi } from '../services/api';

export default function CategoriesPage({ onShowToast }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCat, setSelectedCat] = useState(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');

  const loadCategories = async () => {
    setLoading(true);
    const data = await getCategories();
    setCategories(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openAddModal = () => {
    setFormName('');
    setFormDescription('');
    setIsAddModalOpen(true);
  };

  const openEditModal = (c) => {
    setSelectedCat(c);
    setFormName(c.name || '');
    setFormDescription(c.description || '');
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (c) => {
    setSelectedCat(c);
    setIsDeleteModalOpen(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createCategoryApi({ name: formName, description: formDescription });
      setIsAddModalOpen(false);
      onShowToast('Category created successfully', 'success');
      loadCategories();
    } catch (err) {
      onShowToast(err.message || 'Error creating category', 'error');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateCategoryApi(selectedCat.id, { name: formName, description: formDescription });
      setIsEditModalOpen(false);
      onShowToast('Category updated successfully', 'success');
      loadCategories();
    } catch (err) {
      onShowToast(err.message || 'Error updating category', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCategoryApi(selectedCat.id);
      setIsDeleteModalOpen(false);
      onShowToast('Category deleted successfully', 'success');
      loadCategories();
    } catch (err) {
      onShowToast(err.message || 'Error deleting category', 'error');
    }
  };

  return (
    <div className="card-section">
      <div className="section-header">
        <div>
          <h3>Product Category Classification</h3>
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Organize catalog inventory into distinct analytical revenue segments
          </div>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          + Add New Category
        </button>
      </div>

      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Category Name</th>
              <th>Description</th>
              <th>Products Linked</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '24px' }}>Loading categories...</td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>No categories found</td>
              </tr>
            ) : (
              categories.map((c) => (
                <tr key={c.id}>
                  <td><code>#{c.id}</code></td>
                  <td><strong>{c.name}</strong></td>
                  <td>{c.description || '—'}</td>
                  <td><span className="badge badge-sale">{c.productCount || 0} products</span></td>
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

      {/* ADD CATEGORY MODAL */}
      <Modal isOpen={isAddModalOpen} title="Create Product Category" onClose={() => setIsAddModalOpen(false)}>
        <form onSubmit={handleCreate}>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Category Name</label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              required
              placeholder="e.g. Peripherals & Storage"
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Description</label>
            <textarea
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              rows={3}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" className="btn btn-outline" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Create Category</button>
          </div>
        </form>
      </Modal>

      {/* EDIT MODAL */}
      <Modal isOpen={isEditModalOpen} title={`Edit Category: ${selectedCat?.name}`} onClose={() => setIsEditModalOpen(false)}>
        <form onSubmit={handleUpdate}>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Category Name</label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              required
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Description</label>
            <textarea
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              rows={3}
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
      <Modal isOpen={isDeleteModalOpen} title="Confirm Category Deletion" onClose={() => setIsDeleteModalOpen(false)}>
        <p style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '20px' }}>
          Are you sure you want to delete category <strong>{selectedCat?.name}</strong>?
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
