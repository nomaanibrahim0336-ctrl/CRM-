import React, { useState, useEffect } from 'react';
import {
  Package, AlertTriangle, TrendingDown, TrendingUp, Plus, Search,
  Download, RefreshCw, ChevronDown, ChevronUp, RotateCcw, Truck,
  Edit, ArrowUpCircle, ArrowDownCircle, Filter, Box, BarChart2,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { inventoryProducts as mockInventory, stockMovements } from '../data/mockData';
import api from '../utils/api';

const CATEGORIES = ['All', 'Footwear', 'Electronics', 'Clothing', 'Sports', 'Accessories', 'Bags', 'Beauty'];

const MOVE_TYPE_CFG = {
  'Sale':             { color: '#E2514A', bg: '#3D1414', icon: ArrowDownCircle },
  'Restock':          { color: '#1DB87A', bg: '#0F3D2A', icon: ArrowUpCircle },
  'Return':           { color: '#F5A623', bg: '#3D2D0A', icon: RotateCcw },
  'Damage Write-off': { color: '#55556A', bg: '#1C1C22', icon: AlertTriangle },
};

function KPI({ label, value, sub, color, icon: Icon }) {
  return (
    <div style={{ flex: 1, minWidth: 0, background: '#141418', border: '1px solid #2A2A35', borderRadius: '12px', padding: '18px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
        <span style={{ fontSize: '11px', color: '#8A8A9E', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
        {Icon && <div style={{ width: '28px', height: '28px', background: '#1C1C22', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={13} color={color || '#7C6AF7'} /></div>}
      </div>
      <div style={{ fontSize: '26px', fontWeight: 700, color: color || '#F0EFF6' }}>{value}</div>
      {sub && <div style={{ fontSize: '12px', color: '#55556A', marginTop: '4px' }}>{sub}</div>}
    </div>
  );
}

function StockBar({ stock, reorderPoint, maxStock = 100 }) {
  const pct = Math.min((stock / maxStock) * 100, 100);
  const color = stock === 0 ? '#E2514A' : stock <= reorderPoint ? '#F5A623' : '#1DB87A';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ flex: 1, height: '5px', background: '#1C1C22', borderRadius: '3px', overflow: 'hidden', minWidth: '60px' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '3px', transition: 'width 0.3s' }} />
      </div>
      <span style={{ fontSize: '12px', fontWeight: 600, color, minWidth: '28px', textAlign: 'right' }}>{stock}</span>
    </div>
  );
}

function StockBadge({ stock, reorderPoint }) {
  if (stock === 0) return <span style={{ background: '#3D1414', color: '#E2514A', padding: '2px 8px', borderRadius: '999px', fontSize: '10px', fontWeight: 700 }}>Out of Stock</span>;
  if (stock <= reorderPoint) return <span style={{ background: '#3D2D0A', color: '#F5A623', padding: '2px 8px', borderRadius: '999px', fontSize: '10px', fontWeight: 700 }}>Low Stock</span>;
  return <span style={{ background: '#0F3D2A', color: '#1DB87A', padding: '2px 8px', borderRadius: '999px', fontSize: '10px', fontWeight: 700 }}>In Stock</span>;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '8px', padding: '10px 14px', fontSize: '12px' }}>
      <div style={{ color: '#8A8A9E', marginBottom: '4px' }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || '#F0EFF6' }}>{p.name}: <strong>{p.value}</strong></div>
      ))}
    </div>
  );
};

const TABS = ['Stock Overview', 'Products', 'Stock Movements', 'Low Stock Alerts', 'Valuation'];

export default function Inventory() {
  const [inventoryProducts, setInventoryProducts] = useState(mockInventory);

  useEffect(() => {
    api.get('/api/products?limit=200').then(data => {
      if (data.success && data.data?.length > 0) {
        const mapped = data.data.map(p => ({
          id: p._id, name: p.name, sku: p.sku || '—',
          category: p.category || 'Other',
          costPrice: p.costPrice || 0, salePrice: p.salePrice || p.price || 0,
          stock: p.stock ?? 0, reorderPoint: p.reorderPoint || 5,
        }));
        setInventoryProducts(mapped);
      }
    }).catch(() => {});
  }, []);

  const [activeTab, setActiveTab] = useState('Stock Overview');
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [expandedProduct, setExpandedProduct] = useState(null);
  const [adjustProduct, setAdjustProduct] = useState(null);
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustNote, setAdjustNote] = useState('');
  const [adjustType, setAdjustType] = useState('Restock');

  const filtered = inventoryProducts.filter(p => {
    if (category !== 'All' && p.category !== category) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.sku.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalSkus = inventoryProducts.length;
  const totalUnits = inventoryProducts.reduce((s, p) => s + p.stock, 0);
  const outOfStock = inventoryProducts.filter(p => p.stock === 0).length;
  const lowStock = inventoryProducts.filter(p => p.stock > 0 && p.stock <= p.reorderPoint).length;
  const totalValue = inventoryProducts.reduce((s, p) => s + p.stock * p.costPrice, 0);
  const totalRetailValue = inventoryProducts.reduce((s, p) => s + p.stock * p.salePrice, 0);

  const chartData = inventoryProducts.map(p => ({ name: p.name.split(' ').slice(0, 2).join(' '), stock: p.stock, reorder: p.reorderPoint }));

  const totalInventoryValue = inventoryProducts.reduce((s, p) => s + p.stock * p.costPrice, 0);

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: '#0D0D0F' }}>
      <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', background: '#0F3D2A', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Box size={18} color="#1DB87A" />
            </div>
            <div>
              <h1 style={{ color: '#F0EFF6', fontSize: '22px', fontWeight: 700, margin: 0 }}>Inventory</h1>
              <p style={{ color: '#55556A', fontSize: '12px', margin: 0 }}>Stock levels, movements, and valuation</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', background: '#1DB87A', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
              <Plus size={14} /> Add Product
            </button>
            <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 14px', background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '8px', color: '#8A8A9E', fontSize: '13px', cursor: 'pointer' }}>
              <Download size={14} /> Export
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '2px', borderBottom: '1px solid #2A2A35', marginBottom: '24px' }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setActiveTab(t)} style={{
              padding: '10px 16px', background: 'none', border: 'none',
              borderBottom: activeTab === t ? '2px solid #1DB87A' : '2px solid transparent',
              color: activeTab === t ? '#1DB87A' : '#8A8A9E', fontSize: '13px',
              fontWeight: activeTab === t ? 600 : 400, cursor: 'pointer', marginBottom: '-1px',
            }}>{t}</button>
          ))}
        </div>

        {/* ── STOCK OVERVIEW ── */}
        {activeTab === 'Stock Overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* KPIs */}
            <div style={{ display: 'flex', gap: '14px' }}>
              <KPI label="Total SKUs"       value={totalSkus}                            sub="Across all categories"      icon={Package}       color="#7C6AF7" />
              <KPI label="Total Units"      value={totalUnits.toLocaleString()}           sub="In stock today"             icon={Box}            color="#3A8AE8" />
              <KPI label="Out of Stock"     value={outOfStock}                           sub="Need immediate restock"     icon={AlertTriangle}  color="#E2514A" />
              <KPI label="Low Stock"        value={lowStock}                             sub="Below reorder point"        icon={TrendingDown}   color="#F5A623" />
              <KPI label="Inventory Value"  value={`PKR ${(totalValue/1000).toFixed(0)}K`}  sub="At cost price"          icon={BarChart2}      color="#1DB87A" />
              <KPI label="Retail Value"     value={`PKR ${(totalRetailValue/1000).toFixed(0)}K`} sub="At sale price"     icon={TrendingUp}     color="#7C6AF7" />
            </div>

            {/* Stock bar chart */}
            <div style={{ background: '#141418', border: '1px solid #2A2A35', borderRadius: '12px', padding: '20px' }}>
              <div style={{ fontSize: '13px', color: '#8A8A9E', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' }}>
                Current Stock Levels vs Reorder Points
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2A35" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#55556A', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#55556A', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="stock" name="Stock" radius={[3, 3, 0, 0]}>
                    {chartData.map((e, i) => {
                      const p = inventoryProducts[i];
                      const color = p.stock === 0 ? '#E2514A' : p.stock <= p.reorderPoint ? '#F5A623' : '#1DB87A';
                      return <Cell key={i} fill={color} />;
                    })}
                  </Bar>
                  <Bar dataKey="reorder" name="Reorder Point" fill="#2A2A35" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Category summary */}
            <div style={{ background: '#141418', border: '1px solid #2A2A35', borderRadius: '12px', padding: '20px' }}>
              <div style={{ fontSize: '13px', color: '#8A8A9E', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '14px' }}>By Category</div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {['Footwear','Electronics','Clothing','Sports','Accessories','Bags','Beauty'].map(cat => {
                  const prods = inventoryProducts.filter(p => p.category === cat);
                  const units = prods.reduce((s, p) => s + p.stock, 0);
                  const val = prods.reduce((s, p) => s + p.stock * p.costPrice, 0);
                  const hasAlert = prods.some(p => p.stock <= p.reorderPoint);
                  return (
                    <div key={cat} style={{ flex: '1 1 160px', background: '#1C1C22', borderRadius: '10px', padding: '14px 16px', border: `1px solid ${hasAlert ? '#F5A62322' : '#2A2A35'}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#F0EFF6' }}>{cat}</span>
                        {hasAlert && <AlertTriangle size={11} color="#F5A623" />}
                      </div>
                      <div style={{ fontSize: '20px', fontWeight: 700, color: '#F0EFF6' }}>{units} <span style={{ fontSize: '11px', color: '#55556A', fontWeight: 400 }}>units</span></div>
                      <div style={{ fontSize: '11px', color: '#55556A', marginTop: '2px' }}>PKR {val.toLocaleString()}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── PRODUCTS ── */}
        {activeTab === 'Products' && (
          <div>
            {/* Filters */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                <Search size={13} color="#55556A" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or SKU..."
                  style={{ width: '100%', background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '8px', padding: '9px 10px 9px 30px', color: '#F0EFF6', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <select value={category} onChange={e => setCategory(e.target.value)}
                style={{ background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '8px', padding: '9px 12px', color: '#F0EFF6', fontSize: '13px', outline: 'none', cursor: 'pointer' }}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            {/* Table */}
            <div style={{ background: '#141418', border: '1px solid #2A2A35', borderRadius: '12px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#1C1C22', borderBottom: '1px solid #2A2A35' }}>
                    {['', 'Product', 'SKU', 'Category', 'Cost', 'Sale Price', 'Margin', 'Stock', 'Reserved', 'Status', 'Supplier', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontSize: '10px', color: '#55556A', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(p => {
                    const margin = (((p.salePrice - p.costPrice) / p.salePrice) * 100).toFixed(1);
                    const isExpanded = expandedProduct === p.id;
                    return (
                      <React.Fragment key={p.id}>
                        <tr style={{ borderBottom: '1px solid #1F1F28', cursor: 'pointer', background: isExpanded ? '#1A1A20' : 'transparent' }}
                          onMouseEnter={e => { if (!isExpanded) e.currentTarget.style.background = '#1A1A20'; }}
                          onMouseLeave={e => { if (!isExpanded) e.currentTarget.style.background = 'transparent'; }}>
                          <td style={{ padding: '12px 14px' }}>
                            <button onClick={() => setExpandedProduct(isExpanded ? null : p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8A8A9E', display: 'flex' }}>
                              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{ width: '32px', height: '32px', background: '#1C1C22', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Package size={14} color="#55556A" />
                              </div>
                              <div>
                                <div style={{ color: '#F0EFF6', fontWeight: 500 }}>{p.name}</div>
                                <div style={{ color: '#55556A', fontSize: '11px' }}>{p.variants.length} variants</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '12px 14px', fontFamily: 'JetBrains Mono, monospace', color: '#7C6AF7', fontSize: '11px' }}>{p.sku}</td>
                          <td style={{ padding: '12px 14px' }}><span style={{ background: '#1C1C22', color: '#8A8A9E', padding: '2px 8px', borderRadius: '6px', fontSize: '11px' }}>{p.category}</span></td>
                          <td style={{ padding: '12px 14px', color: '#8A8A9E', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px' }}>PKR {p.costPrice.toLocaleString()}</td>
                          <td style={{ padding: '12px 14px', color: '#1DB87A', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', fontWeight: 600 }}>PKR {p.salePrice.toLocaleString()}</td>
                          <td style={{ padding: '12px 14px' }}>
                            <span style={{ color: parseFloat(margin) >= 50 ? '#1DB87A' : parseFloat(margin) >= 35 ? '#F5A623' : '#E2514A', fontWeight: 700, fontSize: '13px' }}>{margin}%</span>
                          </td>
                          <td style={{ padding: '12px 14px', minWidth: '130px' }}>
                            <StockBar stock={p.stock} reorderPoint={p.reorderPoint} maxStock={Math.max(...inventoryProducts.map(x => x.stock), 100)} />
                          </td>
                          <td style={{ padding: '12px 14px', color: '#8A8A9E', textAlign: 'center' }}>{p.reserved}</td>
                          <td style={{ padding: '12px 14px' }}><StockBadge stock={p.stock} reorderPoint={p.reorderPoint} /></td>
                          <td style={{ padding: '12px 14px', color: '#55556A', fontSize: '12px' }}>{p.supplier}</td>
                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button onClick={() => { setAdjustProduct(p); setAdjustQty(''); setAdjustNote(''); setAdjustType('Restock'); }} style={{ padding: '4px 8px', background: '#0F3D2A', border: '1px solid #1DB87A33', borderRadius: '6px', color: '#1DB87A', cursor: 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                <ArrowUpCircle size={11} /> Adjust
                              </button>
                              <button style={{ padding: '4px 8px', background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '6px', color: '#8A8A9E', cursor: 'pointer', fontSize: '11px' }}>
                                <Edit size={11} />
                              </button>
                            </div>
                          </td>
                        </tr>
                        {/* Expanded variants row */}
                        {isExpanded && (
                          <tr style={{ background: '#12121A', borderBottom: '1px solid #1F1F28' }}>
                            <td colSpan={12} style={{ padding: '0 14px 14px 60px' }}>
                              <div style={{ fontSize: '11px', color: '#55556A', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '12px 0 8px' }}>Variants</div>
                              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {p.variants.map(v => (
                                  <div key={v.label} style={{ background: '#1C1C22', border: `1px solid ${v.stock === 0 ? '#E2514A33' : v.stock <= 3 ? '#F5A62333' : '#2A2A35'}`, borderRadius: '8px', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ color: '#F0EFF6', fontSize: '12px' }}>{v.label}</span>
                                    <span style={{ color: v.stock === 0 ? '#E2514A' : v.stock <= 3 ? '#F5A623' : '#1DB87A', fontWeight: 700, fontSize: '13px' }}>{v.stock}</span>
                                    <span style={{ color: '#55556A', fontSize: '11px' }}>units</span>
                                  </div>
                                ))}
                              </div>
                              <div style={{ marginTop: '10px', fontSize: '12px', color: '#8A8A9E' }}>
                                Reorder Point: <strong style={{ color: '#F5A623' }}>{p.reorderPoint}</strong> &nbsp;|&nbsp;
                                Supplier: <strong style={{ color: '#F0EFF6' }}>{p.supplier}</strong> &nbsp;|&nbsp;
                                Potential Revenue: <strong style={{ color: '#1DB87A' }}>PKR {(p.stock * p.salePrice).toLocaleString()}</strong>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── STOCK MOVEMENTS ── */}
        {activeTab === 'Stock Movements' && (
          <div style={{ background: '#141418', border: '1px solid #2A2A35', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #2A2A35', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#F0EFF6', fontWeight: 600 }}>Stock Movement Log</span>
              <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 12px', background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '7px', color: '#8A8A9E', fontSize: '12px', cursor: 'pointer' }}>
                <Download size={12} /> Export Log
              </button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#1C1C22' }}>
                  {['Date', 'Product', 'SKU', 'Type', 'Qty Change', 'Balance After', 'Reference', 'Note'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '10px', color: '#55556A', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stockMovements.map(m => {
                  const cfg = MOVE_TYPE_CFG[m.type] || { color: '#8A8A9E', bg: '#1C1C22', icon: Package };
                  const Icon = cfg.icon;
                  return (
                    <tr key={m.id} style={{ borderBottom: '1px solid #1F1F28' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#1A1A20'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '12px 14px', color: '#55556A', fontSize: '12px', fontFamily: 'JetBrains Mono, monospace' }}>{m.date}</td>
                      <td style={{ padding: '12px 14px', color: '#F0EFF6' }}>{m.product}</td>
                      <td style={{ padding: '12px 14px', fontFamily: 'JetBrains Mono, monospace', color: '#7C6AF7', fontSize: '11px' }}>{m.sku}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: cfg.bg, color: cfg.color, padding: '3px 9px', borderRadius: '999px', fontSize: '11px', fontWeight: 600 }}>
                          <Icon size={10} /> {m.type}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', fontWeight: 700, fontSize: '14px', color: m.qty > 0 ? '#1DB87A' : '#E2514A', fontFamily: 'JetBrains Mono, monospace' }}>
                        {m.qty > 0 ? `+${m.qty}` : m.qty}
                      </td>
                      <td style={{ padding: '12px 14px', color: '#F0EFF6', fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>{m.balance}</td>
                      <td style={{ padding: '12px 14px', fontFamily: 'JetBrains Mono, monospace', color: '#3A8AE8', fontSize: '11px' }}>{m.ref}</td>
                      <td style={{ padding: '12px 14px', color: '#8A8A9E', fontSize: '12px' }}>{m.note}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ── LOW STOCK ALERTS ── */}
        {activeTab === 'Low Stock Alerts' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '14px' }}>
              <div style={{ flex: 1, background: '#3D1414', border: '1px solid #E2514A33', borderRadius: '12px', padding: '18px 20px' }}>
                <div style={{ fontSize: '11px', color: '#E2514A', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>⚠ Out of Stock ({inventoryProducts.filter(p => p.stock === 0).length} SKUs)</div>
                {inventoryProducts.filter(p => p.stock === 0).map(p => (
                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #2A2A1A' }}>
                    <div>
                      <div style={{ color: '#F0EFF6', fontSize: '13px' }}>{p.name}</div>
                      <div style={{ color: '#55556A', fontSize: '11px' }}>{p.sku} · {p.supplier}</div>
                    </div>
                    <button style={{ padding: '5px 12px', background: '#7C6AF7', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>Order Now</button>
                  </div>
                ))}
              </div>
              <div style={{ flex: 1, background: '#3D2D0A', border: '1px solid #F5A62333', borderRadius: '12px', padding: '18px 20px' }}>
                <div style={{ fontSize: '11px', color: '#F5A623', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>⚡ Low Stock ({inventoryProducts.filter(p => p.stock > 0 && p.stock <= p.reorderPoint).length} SKUs)</div>
                {inventoryProducts.filter(p => p.stock > 0 && p.stock <= p.reorderPoint).map(p => (
                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #2A2A1A' }}>
                    <div>
                      <div style={{ color: '#F0EFF6', fontSize: '13px' }}>{p.name}</div>
                      <div style={{ color: '#55556A', fontSize: '11px' }}>{p.stock} left · reorder at {p.reorderPoint}</div>
                    </div>
                    <button style={{ padding: '5px 12px', background: '#3D2D0A', border: '1px solid #F5A62333', borderRadius: '6px', color: '#F5A623', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>Reorder</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Reorder suggestions table */}
            <div style={{ background: '#141418', border: '1px solid #2A2A35', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #2A2A35' }}>
                <span style={{ color: '#F0EFF6', fontWeight: 600 }}>Suggested Purchase Orders</span>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#1C1C22' }}>
                    {['Product', 'Current Stock', 'Reorder Point', 'Suggested Qty', 'Unit Cost', 'Total Cost', 'Supplier', 'Action'].map(h => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '10px', color: '#55556A', fontWeight: 600, textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {inventoryProducts.filter(p => p.stock <= p.reorderPoint).map(p => {
                    const suggestedQty = Math.max(p.reorderPoint * 3 - p.stock, p.reorderPoint);
                    return (
                      <tr key={p.id} style={{ borderBottom: '1px solid #1F1F28' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#1A1A20'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '12px 14px', color: '#F0EFF6' }}>{p.name}</td>
                        <td style={{ padding: '12px 14px', color: p.stock === 0 ? '#E2514A' : '#F5A623', fontWeight: 700 }}>{p.stock}</td>
                        <td style={{ padding: '12px 14px', color: '#8A8A9E' }}>{p.reorderPoint}</td>
                        <td style={{ padding: '12px 14px', color: '#1DB87A', fontWeight: 700 }}>{suggestedQty}</td>
                        <td style={{ padding: '12px 14px', fontFamily: 'JetBrains Mono, monospace', color: '#8A8A9E', fontSize: '12px' }}>PKR {p.costPrice.toLocaleString()}</td>
                        <td style={{ padding: '12px 14px', fontFamily: 'JetBrains Mono, monospace', color: '#7C6AF7', fontWeight: 600, fontSize: '12px' }}>PKR {(suggestedQty * p.costPrice).toLocaleString()}</td>
                        <td style={{ padding: '12px 14px', color: '#55556A', fontSize: '12px' }}>{p.supplier}</td>
                        <td style={{ padding: '12px 14px' }}>
                          <button style={{ padding: '5px 12px', background: '#2A2550', border: '1px solid #7C6AF733', borderRadius: '6px', color: '#7C6AF7', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>Create PO</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── VALUATION ── */}
        {activeTab === 'Valuation' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '14px' }}>
              <div style={{ flex: 1, background: '#141418', border: '1px solid #2A2A35', borderRadius: '12px', padding: '20px' }}>
                <div style={{ fontSize: '11px', color: '#8A8A9E', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Total Cost Value</div>
                <div style={{ fontSize: '28px', fontWeight: 700, color: '#F0EFF6' }}>PKR {totalValue.toLocaleString()}</div>
                <div style={{ fontSize: '12px', color: '#55556A', marginTop: '4px' }}>Capital tied up in inventory</div>
              </div>
              <div style={{ flex: 1, background: '#141418', border: '1px solid #2A2A35', borderRadius: '12px', padding: '20px' }}>
                <div style={{ fontSize: '11px', color: '#8A8A9E', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Total Retail Value</div>
                <div style={{ fontSize: '28px', fontWeight: 700, color: '#1DB87A' }}>PKR {totalRetailValue.toLocaleString()}</div>
                <div style={{ fontSize: '12px', color: '#55556A', marginTop: '4px' }}>If all units sold at full price</div>
              </div>
              <div style={{ flex: 1, background: '#141418', border: '1px solid #2A2A35', borderRadius: '12px', padding: '20px' }}>
                <div style={{ fontSize: '11px', color: '#8A8A9E', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Potential Gross Profit</div>
                <div style={{ fontSize: '28px', fontWeight: 700, color: '#7C6AF7' }}>PKR {(totalRetailValue - totalValue).toLocaleString()}</div>
                <div style={{ fontSize: '12px', color: '#55556A', marginTop: '4px' }}>Margin: {(((totalRetailValue - totalValue) / totalRetailValue) * 100).toFixed(1)}%</div>
              </div>
            </div>

            <div style={{ background: '#141418', border: '1px solid #2A2A35', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #2A2A35' }}>
                <span style={{ color: '#F0EFF6', fontWeight: 600 }}>Per-Product Valuation</span>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#1C1C22' }}>
                    {['Product', 'SKU', 'Units', 'Cost/Unit', 'Sale/Unit', 'Margin %', 'Cost Value', 'Retail Value', 'Potential Profit'].map(h => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '10px', color: '#55556A', fontWeight: 600, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {inventoryProducts.map(p => {
                    const margin = (((p.salePrice - p.costPrice) / p.salePrice) * 100).toFixed(1);
                    const costVal = p.stock * p.costPrice;
                    const retailVal = p.stock * p.salePrice;
                    const profit = retailVal - costVal;
                    return (
                      <tr key={p.id} style={{ borderBottom: '1px solid #1F1F28' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#1A1A20'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '11px 14px', color: '#F0EFF6' }}>{p.name}</td>
                        <td style={{ padding: '11px 14px', fontFamily: 'JetBrains Mono, monospace', color: '#7C6AF7', fontSize: '11px' }}>{p.sku}</td>
                        <td style={{ padding: '11px 14px', color: p.stock === 0 ? '#E2514A' : '#F0EFF6', fontWeight: 600 }}>{p.stock}</td>
                        <td style={{ padding: '11px 14px', fontFamily: 'JetBrains Mono, monospace', color: '#8A8A9E', fontSize: '12px' }}>PKR {p.costPrice.toLocaleString()}</td>
                        <td style={{ padding: '11px 14px', fontFamily: 'JetBrains Mono, monospace', color: '#1DB87A', fontSize: '12px' }}>PKR {p.salePrice.toLocaleString()}</td>
                        <td style={{ padding: '11px 14px', color: parseFloat(margin) >= 50 ? '#1DB87A' : parseFloat(margin) >= 35 ? '#F5A623' : '#E2514A', fontWeight: 700 }}>{margin}%</td>
                        <td style={{ padding: '11px 14px', fontFamily: 'JetBrains Mono, monospace', color: '#8A8A9E', fontSize: '12px' }}>PKR {costVal.toLocaleString()}</td>
                        <td style={{ padding: '11px 14px', fontFamily: 'JetBrains Mono, monospace', color: '#F0EFF6', fontSize: '12px', fontWeight: 600 }}>PKR {retailVal.toLocaleString()}</td>
                        <td style={{ padding: '11px 14px', fontFamily: 'JetBrains Mono, monospace', color: '#7C6AF7', fontSize: '12px', fontWeight: 600 }}>PKR {profit.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                  {/* Total row */}
                  <tr style={{ background: '#1C1C22', borderTop: '2px solid #2A2A35' }}>
                    <td colSpan={6} style={{ padding: '12px 14px', color: '#8A8A9E', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase' }}>Total</td>
                    <td style={{ padding: '12px 14px', fontFamily: 'JetBrains Mono, monospace', color: '#F0EFF6', fontWeight: 700 }}>PKR {totalValue.toLocaleString()}</td>
                    <td style={{ padding: '12px 14px', fontFamily: 'JetBrains Mono, monospace', color: '#1DB87A', fontWeight: 700 }}>PKR {totalRetailValue.toLocaleString()}</td>
                    <td style={{ padding: '12px 14px', fontFamily: 'JetBrains Mono, monospace', color: '#7C6AF7', fontWeight: 700 }}>PKR {(totalRetailValue - totalValue).toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── Stock Adjustment Modal ── */}
      {adjustProduct && (
        <>
          <div onClick={() => setAdjustProduct(null)} style={{ position: 'fixed', inset: 0, background: '#00000077', zIndex: 40 }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: '#141418', border: '1px solid #2A2A35', borderRadius: '16px', padding: '28px', width: '400px', zIndex: 50 }}>
            <div style={{ fontWeight: 700, fontSize: '16px', color: '#F0EFF6', marginBottom: '4px' }}>Adjust Stock</div>
            <div style={{ color: '#55556A', fontSize: '12px', marginBottom: '20px' }}>{adjustProduct.name} — Current: {adjustProduct.stock} units</div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
              {['Restock', 'Sale', 'Return', 'Damage Write-off'].map(t => (
                <button key={t} onClick={() => setAdjustType(t)} style={{ flex: 1, padding: '7px 4px', borderRadius: '7px', fontSize: '10px', fontWeight: 600, cursor: 'pointer', border: 'none', background: adjustType === t ? MOVE_TYPE_CFG[t]?.bg || '#2A2550' : '#1C1C22', color: adjustType === t ? MOVE_TYPE_CFG[t]?.color || '#7C6AF7' : '#55556A' }}>{t}</button>
              ))}
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#8A8A9E', marginBottom: '6px' }}>Quantity *</label>
              <input type="number" min="1" value={adjustQty} onChange={e => setAdjustQty(e.target.value)} placeholder="Enter quantity"
                style={{ width: '100%', background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '8px', padding: '10px 12px', color: '#F0EFF6', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#8A8A9E', marginBottom: '6px' }}>Note</label>
              <input value={adjustNote} onChange={e => setAdjustNote(e.target.value)} placeholder="Reason for adjustment"
                style={{ width: '100%', background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '8px', padding: '10px 12px', color: '#F0EFF6', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setAdjustProduct(null)} style={{ flex: 1, padding: '10px', background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '8px', color: '#8A8A9E', cursor: 'pointer', fontWeight: 500 }}>Cancel</button>
              <button onClick={() => setAdjustProduct(null)} style={{ flex: 2, padding: '10px', background: '#7C6AF7', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>Save Adjustment</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
