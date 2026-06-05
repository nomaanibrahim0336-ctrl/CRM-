import React, { useState } from 'react';
import { Search, Plus, Edit2, Eye, Package } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { products } from '../data/mockData';

const categoryColors = {
  Footwear: '#7C6AF7', Electronics: '#3A8AE8', Clothing: '#1DB87A',
  Sports: '#F5A623', Accessories: '#E2514A', Bags: '#8A8A9E', Beauty: '#E1306C',
};

export default function Products() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const categories = ['All', ...new Set(products.map(p => p.category))];
  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'All' || p.category === category;
    return matchSearch && matchCat;
  });

  return (
    <PageWrapper title="Products" subtitle={`${products.length} products in catalog`}
      actions={<Button variant="primary"><Plus size={14} /> Add Product</Button>}>
      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '360px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#55556A' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..."
            style={{ width: '100%', background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '8px', padding: '8px 12px 8px 32px', color: '#F0EFF6', fontSize: '13px', outline: 'none' }} />
        </div>
        <div style={{ display: 'flex', gap: '4px', background: '#1C1C22', padding: '4px', borderRadius: '10px' }}>
          {categories.map(c => (
            <button key={c} onClick={() => setCategory(c)} style={{
              padding: '5px 12px', borderRadius: '7px', fontSize: '12px', fontWeight: 500,
              cursor: 'pointer', border: 'none', background: category === c ? '#2A2550' : 'transparent',
              color: category === c ? '#7C6AF7' : '#8A8A9E', whiteSpace: 'nowrap',
            }}>{c}</button>
          ))}
        </div>
      </div>

      {/* Stats Row */}
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

      {/* Product Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {filtered.map(p => (
          <div key={p.id} style={{ background: '#141418', border: '1px solid #2A2A35', borderRadius: '12px', overflow: 'hidden', transition: 'border-color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#7C6AF7'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#2A2A35'}>
            {/* Image Placeholder */}
            <div style={{ height: '160px', background: '#1C1C22', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <Package size={40} color="#2A2A35" />
              <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
                <span style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '5px', background: (categoryColors[p.category] || '#7C6AF7') + '33', color: categoryColors[p.category] || '#7C6AF7', fontWeight: 600, border: `1px solid ${(categoryColors[p.category] || '#7C6AF7')}44` }}>{p.category}</span>
              </div>
              {(p.status === 'Low Stock' || p.status === 'Out of Stock') && (
                <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                  <Badge status={p.status} />
                </div>
              )}
            </div>
            {/* Info */}
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
                <Button variant="secondary" size="sm" style={{ flex: 1, justifyContent: 'center' }}><Eye size={13} /> View</Button>
                <Button variant="primary" size="sm" style={{ flex: 1, justifyContent: 'center' }}><Edit2 size={13} /> Edit</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </PageWrapper>
  );
}
