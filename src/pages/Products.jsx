import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Eye, Package, X, RefreshCw } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { products as mockProducts } from '../data/mockData';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';

const categoryColors = {
  Footwear: '#7C6AF7', Electronics: '#3A8AE8', Clothing: '#1DB87A',
  Sports: '#F5A623', Accessories: '#E2514A', Bags: '#8A8A9E', Beauty: '#E1306C',
};

const CATEGORIES = ['Footwear', 'Electronics', 'Clothing', 'Sports', 'Accessories', 'Bags', 'Beauty'];

const emptyForm = { name: '', sku: '', category: 'Footwear', costPrice: '', salePrice: '', stock: '', reorderPoint: '', supplier: '', description: '' };

export default function Products() {
  const addToast = useToast();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [products, setProducts] = useState(mockProducts);

  useEffect(() => {
    api.get('/api/products?limit=200').then(data => {
      if (data.success && data.data?.length > 0) {
        const mapped = data.data.map(p => ({
          id: p._id, name: p.name, sku: p.sku || '—',
          category: p.category || 'Other',
          costPrice: p.costPrice || 0, salePrice: p.salePrice || p.price || 0,
          stock: p.stock ?? 0, reorderPoint: p.reorderPoint || 5,
          supplier: p.supplier || '—', description: p.description || '',
          status: (p.stock ?? 0) === 0 ? 'Out of Stock' : (p.stock ?? 0) <= (p.reorderPoint || 5) ? 'Low Stock' : 'In Stock',
          image: p.image || null,
        }));
        setProducts(mapped);
      }
    }).catch(() => {});
  }, []);

  const [modal, setModal] = useState(null); // null | 'add' | 'edit' | 'view'
  const [editProduct, setEditProduct] = useState(null);
  const [viewProduct, setViewProduct] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const categories = ['All', ...new Set(products.map(p => p.category))];
  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'All' || p.category === category;
    return matchSearch && matchCat;
  });

  const margin = form.costPrice && form.salePrice
    ? (((parseFloat(form.salePrice) - parseFloat(form.costPrice)) / parseFloat(form.salePrice)) * 100).toFixed(1)
    : null;

  const openAdd = () => { setForm(emptyForm); setEditProduct(null); setModal('add'); };
  const openEdit = (p, e) => { e.stopPropagation(); setForm({ name: p.name, sku: p.sku, category: p.category, costPrice: p.price, salePrice: p.price, stock: p.stock, reorderPoint: 10, supplier: 'Supplier', description: '' }); setEditProduct(p); setModal('edit'); };
  const openView = (p, e) => { e.stopPropagation(); setViewProduct(p); setModal('view'); };
  const closeModal = () => { setModal(null); setEditProduct(null); setViewProduct(null); };

  const autoSku = () => setForm(f => ({ ...f, sku: 'SKU-' + Math.random().toString(36).substr(2, 5).toUpperCase() }));

  const saveProduct = () => {
    if (!form.name || !form.sku) { addToast('Name and SKU are required', 'error'); return; }
    const price = parseFloat(form.salePrice) || 0;
    const stock = parseInt(form.stock) || 0;
    if (editProduct) {
      setProducts(prev => prev.map(p => p.id === editProduct.id ? { ...p, name: form.name, sku: form.sku, category: form.category, price, stock, status: stock === 0 ? 'Out of Stock' : stock <= 7 ? 'Low Stock' : 'Active' } : p));
      addToast('Product updated', 'success');
    } else {
      const newP = { id: `P${Date.now()}`, name: form.name, sku: form.sku, category: form.category, price, stock, sold: 0, status: stock === 0 ? 'Out of Stock' : stock <= 7 ? 'Low Stock' : 'Active' };
      setProducts(prev => [newP, ...prev]);
      addToast('Product added', 'success');
    }
    closeModal();
  };

  const inputStyle = { width: '100%', background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '8px', padding: '8px 12px', color: '#F0EFF6', fontSize: '13px', outline: 'none' };
  const labelStyle = { fontSize: '12px', color: '#8A8A9E', display: 'block', marginBottom: '5px' };

  return (
    <PageWrapper title="Products" subtitle={`${products.length} products in catalog`}
      actions={<Button variant="primary" onClick={openAdd}><Plus size={14} /> Add Product</Button>}>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '360px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#55556A' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..."
            style={{ width: '100%', background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '8px', padding: '8px 12px 8px 32px', color: '#F0EFF6', fontSize: '13px', outline: 'none' }} />
        </div>
        <div style={{ display: 'flex', gap: '4px', background: '#1C1C22', padding: '4px', borderRadius: '10px' }}>
          {categories.map(c => (
            <button key={c} onClick={() => setCategory(c)} style={{ padding: '5px 12px', borderRadius: '7px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', border: 'none', background: category === c ? '#2A2550' : 'transparent', color: category === c ? '#7C6AF7' : '#8A8A9E', whiteSpace: 'nowrap' }}>{c}</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Total Products', value: products.length, color: '#7C6AF7' },
          { label: 'Active', value: products.filter(p => p.status === 'Active').length, color: '#1DB87A' },
          { label: 'Low Stock', value: products.filter(p => p.status === 'Low Stock').length, color: '#F5A623' },
          { label: 'Out of Stock', value: products.filter(p => p.status === 'Out of Stock').length, color: '#E2514A' },
        ].map(s => (
          <div key={s.label} style={{ background: '#141418', border: '1px solid #2A2A35', borderRadius: '10px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.color, boxShadow: `0 0 8px ${s.color}` }} />
            <div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#F0EFF6' }}>{s.value}</div>
              <div style={{ fontSize: '11px', color: '#55556A' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {filtered.map(p => (
          <div key={p.id} style={{ background: '#141418', border: '1px solid #2A2A35', borderRadius: '12px', overflow: 'hidden', transition: 'border-color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#7C6AF7'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#2A2A35'}>
            <div style={{ height: '160px', background: '#1C1C22', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <Package size={40} color="#2A2A35" />
              <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
                <span style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '5px', background: (categoryColors[p.category] || '#7C6AF7') + '33', color: categoryColors[p.category] || '#7C6AF7', fontWeight: 600, border: `1px solid ${(categoryColors[p.category] || '#7C6AF7')}44` }}>{p.category}</span>
              </div>
              {(p.status === 'Low Stock' || p.status === 'Out of Stock') && (
                <div style={{ position: 'absolute', top: '10px', right: '10px' }}><Badge status={p.status} /></div>
              )}
            </div>
            <div style={{ padding: '14px' }}>
              <div style={{ fontWeight: 600, color: '#F0EFF6', fontSize: '14px', marginBottom: '4px' }}>{p.name}</div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#55556A', marginBottom: '10px' }}>{p.sku}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#F0EFF6' }}>PKR {p.price.toLocaleString()}</div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: p.stock === 0 ? '#E2514A' : p.stock <= 7 ? '#F5A623' : '#1DB87A' }}>{p.stock} in stock</div>
                  <div style={{ fontSize: '11px', color: '#55556A' }}>{p.sold} sold</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button variant="secondary" size="sm" style={{ flex: 1, justifyContent: 'center' }} onClick={e => openView(p, e)}><Eye size={13} /> View</Button>
                <Button variant="primary" size="sm" style={{ flex: 1, justifyContent: 'center' }} onClick={e => openEdit(p, e)}><Edit2 size={13} /> Edit</Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {(modal === 'add' || modal === 'edit') && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#141418', border: '1px solid #2A2A35', borderRadius: '14px', width: '560px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #1F1F28', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '16px', color: '#F0EFF6' }}>{modal === 'add' ? 'Add Product' : 'Edit Product'}</span>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8A8A9E' }}><X size={18} /></button>
            </div>
            <div style={{ overflowY: 'auto', flex: 1, padding: '20px 24px' }}>
              {/* Image placeholder */}
              <div style={{ height: '100px', background: '#1C1C22', border: '2px dashed #2A2A35', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', cursor: 'pointer', gap: '8px' }}>
                <Package size={20} color="#55556A" />
                <span style={{ fontSize: '13px', color: '#55556A' }}>Click to upload image</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Product Name *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Nike Air Max 270" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>SKU *</label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} placeholder="e.g. NK-AM270" style={{ ...inputStyle, flex: 1 }} />
                    <button onClick={autoSku} title="Auto-generate SKU" style={{ padding: '8px 10px', background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '8px', cursor: 'pointer', color: '#8A8A9E', display: 'flex', alignItems: 'center' }}><RefreshCw size={13} /></button>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={inputStyle}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Cost Price (PKR)</label>
                  <input type="number" value={form.costPrice} onChange={e => setForm(f => ({ ...f, costPrice: e.target.value }))} placeholder="0" style={inputStyle} />
                </div>
                <div>
                  <label style={{ ...labelStyle, display: 'flex', justifyContent: 'space-between' }}>
                    <span>Sale Price (PKR)</span>
                    {margin !== null && <span style={{ color: margin > 0 ? '#1DB87A' : '#E2514A' }}>Margin: {margin}%</span>}
                  </label>
                  <input type="number" value={form.salePrice} onChange={e => setForm(f => ({ ...f, salePrice: e.target.value }))} placeholder="0" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Initial Stock</label>
                  <input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} placeholder="0" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Reorder Point</label>
                  <input type="number" value={form.reorderPoint} onChange={e => setForm(f => ({ ...f, reorderPoint: e.target.value }))} placeholder="0" style={inputStyle} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Supplier</label>
                  <input value={form.supplier} onChange={e => setForm(f => ({ ...f, supplier: e.target.value }))} placeholder="Supplier name" style={inputStyle} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Description</label>
                  <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Product description..." rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
                </div>
              </div>
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid #1F1F28', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button onClick={closeModal} style={{ padding: '9px 20px', background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '8px', color: '#8A8A9E', fontSize: '13px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={saveProduct} style={{ padding: '9px 20px', background: '#7C6AF7', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>{modal === 'add' ? 'Add Product' : 'Save Changes'}</button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {modal === 'view' && viewProduct && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#141418', border: '1px solid #2A2A35', borderRadius: '14px', width: '480px', maxHeight: '90vh', overflow: 'auto' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #1F1F28', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '16px', color: '#F0EFF6' }}>Product Details</span>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8A8A9E' }}><X size={18} /></button>
            </div>
            <div style={{ padding: '20px 24px' }}>
              <div style={{ height: '120px', background: '#1C1C22', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', position: 'relative' }}>
                <Package size={48} color="#2A2A35" />
                <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
                  <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '6px', background: (categoryColors[viewProduct.category] || '#7C6AF7') + '33', color: categoryColors[viewProduct.category] || '#7C6AF7', fontWeight: 600, border: `1px solid ${(categoryColors[viewProduct.category] || '#7C6AF7')}44` }}>{viewProduct.category}</span>
                </div>
              </div>
              <div style={{ fontWeight: 700, fontSize: '18px', color: '#F0EFF6', marginBottom: '4px' }}>{viewProduct.name}</div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: '#55556A', marginBottom: '16px' }}>{viewProduct.sku}</div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                {[
                  { label: 'Sale Price', value: `PKR ${viewProduct.price.toLocaleString()}`, color: '#F0EFF6' },
                  { label: 'Units Sold', value: viewProduct.sold, color: '#7C6AF7' },
                  { label: 'Stock Level', value: viewProduct.stock, color: viewProduct.stock === 0 ? '#E2514A' : viewProduct.stock <= 7 ? '#F5A623' : '#1DB87A' },
                  { label: 'Status', value: viewProduct.status, color: '#8A8A9E' },
                ].map(item => (
                  <div key={item.label} style={{ background: '#1C1C22', borderRadius: '8px', padding: '12px 14px' }}>
                    <div style={{ fontSize: '11px', color: '#55556A', marginBottom: '4px' }}>{item.label}</div>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: item.color }}>{item.value}</div>
                  </div>
                ))}
              </div>

              {/* Stock bar */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', color: '#8A8A9E' }}>Stock Level</span>
                  <span style={{ fontSize: '12px', color: '#F0EFF6' }}>{viewProduct.stock} units</span>
                </div>
                <div style={{ height: '6px', background: '#1C1C22', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min(100, (viewProduct.stock / 100) * 100)}%`, background: viewProduct.stock === 0 ? '#E2514A' : viewProduct.stock <= 7 ? '#F5A623' : '#1DB87A', borderRadius: '3px' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
