import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import { getProducts, getCategories, createProductApi, updateProductApi, deleteProductApi } from '../services/api';

export default function ProductsPage({ onShowToast }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCatFilter, setSelectedCatFilter] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Form states
  const [formSku, setFormSku] = useState('');
  const [formName, setFormName] = useState('');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formUnit, setFormUnit] = useState('pcs');
  const [formCostPrice, setFormCostPrice] = useState('');
  const [formSellingPrice, setFormSellingPrice] = useState('');
  const [formStock, setFormStock] = useState('');
  const [formReorder, setFormReorder] = useState('5');

  const loadData = async () => {
    setLoading(true);
    const [pList, cList] = await Promise.all([getProducts(), getCategories()]);
    setProducts(pList || []);
    setCategories(cList || []);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setFormSku('PRD-' + Math.random().toString(36).substring(2, 6).toUpperCase());
    setFormName('');
    setFormCategoryId(categories[0]?.id || '');
    setFormUnit('pcs');
    setFormCostPrice('');
    setFormSellingPrice('');
    setFormStock('20');
    setFormReorder('5');
    setIsAddModalOpen(true);
  };

  const openEditModal = (p) => {
    setSelectedProduct(p);
    setFormSku(p.sku || '');
    setFormName(p.name || '');
    setFormCategoryId(p.categoryId || '');
    setFormUnit(p.unit || 'pcs');
    setFormCostPrice(p.costPrice || '');
    setFormSellingPrice(p.sellingPrice || '');
    setFormStock(p.stockQuantity || '');
    setFormReorder(p.reorderLevel || '5');
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (p) => {
    setSelectedProduct(p);
    setIsDeleteModalOpen(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createProductApi({
        sku: formSku,
        name: formName,
        categoryId: formCategoryId ? Number(formCategoryId) : undefined,
        unit: formUnit,
        costPrice: Number(formCostPrice),
        sellingPrice: Number(formSellingPrice),
        stockQuantity: Number(formStock),
        reorderLevel: Number(formReorder),
      });
      setIsAddModalOpen(false);
      onShowToast('Product catalog updated successfully', 'success');
      loadData();
    } catch (err) {
      onShowToast(err.message || 'Error creating product', 'error');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateProductApi(selectedProduct.id, {
        name: formName,
        categoryId: formCategoryId ? Number(formCategoryId) : undefined,
        unit: formUnit,
        costPrice: Number(formCostPrice),
        sellingPrice: Number(formSellingPrice),
        stockQuantity: Number(formStock),
        reorderLevel: Number(formReorder),
      });
      setIsEditModalOpen(false);
      onShowToast('Product updated successfully', 'success');
      loadData();
    } catch (err) {
      onShowToast(err.message || 'Error updating product', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteProductApi(selectedProduct.id);
      setIsDeleteModalOpen(false);
      onShowToast('Product deleted from inventory', 'success');
      loadData();
    } catch (err) {
      onShowToast(err.message || 'Error deleting product', 'error');
    }
  };

  const filtered = products.filter((p) => {
    const matchesSearch = p.name?.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase());
    const matchesCat = !selectedCatFilter || Number(p.categoryId) === Number(selectedCatFilter);
    return matchesSearch && matchesCat;
  });

  return (
    <div className="card-section">
      <div className="section-header">
        <div>
          <h3>Products Catalog & Inventory Stock</h3>
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Manage pricing, cost margins, warehouse inventory, and low stock thresholds
          </div>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          + Add New Product
        </button>
      </div>

      {/* Search and Category Filter */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '18px', flexWrap: 'wrap' }}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Search product by SKU or name..."
          style={{ width: '280px', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
        />
        <select
          value={selectedCatFilter}
          onChange={(e) => setSelectedCatFilter(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', color: '#334155' }}
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Cost Price</th>
              <th>Selling Price</th>
              <th>Stock Qty</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '24px' }}>Loading products catalog...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>No products found</td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id}>
                  <td><code>{p.sku}</code></td>
                  <td><strong>{p.name}</strong></td>
                  <td><span className="badge badge-sale">{p.categoryName || 'General'}</span></td>
                  <td>₹{Number(p.costPrice || 0).toLocaleString('en-IN')}</td>
                  <td><strong style={{ color: '#0f172a' }}>₹{Number(p.sellingPrice || 0).toLocaleString('en-IN')}</strong></td>
                  <td>
                    <span style={{ fontWeight: '700', color: p.isLowStock ? '#dc2626' : '#1e293b' }}>
                      {p.stockQuantity} {p.unit}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${p.isLowStock ? 'badge-due' : 'badge-paid'}`}>
                      {p.isLowStock ? '⚠️ LOW STOCK' : 'IN STOCK'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="btn btn-outline"
                        style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                        onClick={() => openEditModal(p)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-outline"
                        style={{ padding: '4px 8px', fontSize: '0.75rem', color: '#dc2626', borderColor: '#fecaca' }}
                        onClick={() => openDeleteModal(p)}
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

      {/* ADD PRODUCT MODAL */}
      <Modal isOpen={isAddModalOpen} title="Add New Product to Catalog" onClose={() => setIsAddModalOpen(false)}>
        <form onSubmit={handleCreate}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>SKU Code</label>
              <input
                type="text"
                value={formSku}
                onChange={(e) => setFormSku(e.target.value)}
                required
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Product Name</label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                required
                placeholder="e.g. Ergonomic Office Mouse"
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Category</label>
              <select
                value={formCategoryId}
                onChange={(e) => setFormCategoryId(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Unit</label>
              <select
                value={formUnit}
                onChange={(e) => setFormUnit(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              >
                <option value="pcs">Pieces (pcs)</option>
                <option value="box">Box</option>
                <option value="kg">Kilogram (kg)</option>
                <option value="hours">Hours (Service)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Cost Price (₹)</label>
              <input
                type="number"
                step="0.01"
                value={formCostPrice}
                onChange={(e) => setFormCostPrice(e.target.value)}
                required
                placeholder="Purchase cost"
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Selling Price (₹)</label>
              <input
                type="number"
                step="0.01"
                value={formSellingPrice}
                onChange={(e) => setFormSellingPrice(e.target.value)}
                required
                placeholder="Retail price"
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Stock Quantity</label>
              <input
                type="number"
                value={formStock}
                onChange={(e) => setFormStock(e.target.value)}
                required
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Reorder Threshold</label>
              <input
                type="number"
                value={formReorder}
                onChange={(e) => setFormReorder(e.target.value)}
                required
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" className="btn btn-outline" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Product</button>
          </div>
        </form>
      </Modal>

      {/* EDIT MODAL */}
      <Modal isOpen={isEditModalOpen} title={`Edit Product: ${selectedProduct?.name}`} onClose={() => setIsEditModalOpen(false)}>
        <form onSubmit={handleUpdate}>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Product Name</label>
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
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Category</label>
              <select
                value={formCategoryId}
                onChange={(e) => setFormCategoryId(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Unit</label>
              <input
                type="text"
                value={formUnit}
                onChange={(e) => setFormUnit(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Cost Price (₹)</label>
              <input
                type="number"
                step="0.01"
                value={formCostPrice}
                onChange={(e) => setFormCostPrice(e.target.value)}
                required
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Selling Price (₹)</label>
              <input
                type="number"
                step="0.01"
                value={formSellingPrice}
                onChange={(e) => setFormSellingPrice(e.target.value)}
                required
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Stock Quantity</label>
              <input
                type="number"
                value={formStock}
                onChange={(e) => setFormStock(e.target.value)}
                required
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Reorder Threshold</label>
              <input
                type="number"
                value={formReorder}
                onChange={(e) => setFormReorder(e.target.value)}
                required
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" className="btn btn-outline" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Changes</button>
          </div>
        </form>
      </Modal>

      {/* DELETE MODAL */}
      <Modal isOpen={isDeleteModalOpen} title="Confirm Product Deletion" onClose={() => setIsDeleteModalOpen(false)}>
        <p style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '20px' }}>
          Are you sure you want to remove <strong>{selectedProduct?.name}</strong> (SKU: {selectedProduct?.sku})?
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
