import React, { useState } from 'react';
import { Search, Download, MoreVertical, X, Package, MessageSquare, Truck, User } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { orders } from '../data/mockData';

const tabs = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
const sourceColors = { Instagram: '#E1306C', Shopify: '#96BF48', WhatsApp: '#25D366', Website: '#3A8AE8', 'Mobile App': '#7C6AF7' };

export default function Orders() {
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const filtered = orders.filter(o => {
    const matchTab = activeTab === 'All' || o.status === activeTab;
    const matchSearch = o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  return (
    <PageWrapper title="Orders" subtitle={`${orders.length} total orders`}>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', background: '#1C1C22', padding: '4px', borderRadius: '10px', width: 'fit-content' }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={{
            padding: '6px 14px', borderRadius: '7px', fontSize: '12px', fontWeight: 500,
            cursor: 'pointer', border: 'none', transition: 'all 0.15s',
            background: activeTab === t ? '#2A2550' : 'transparent',
            color: activeTab === t ? '#7C6AF7' : '#8A8A9E',
          }}>{t}</button>
        ))}
      </div>

      {/* Search + Export */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#55556A' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search orders..."
            style={{ width: '100%', background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '8px', padding: '8px 12px 8px 32px', color: '#F0EFF6', fontSize: '13px', outline: 'none' }} />
        </div>
        <Button variant="secondary"><Download size={14} /> Export</Button>
      </div>

      {/* Table */}
      <div style={{ background: '#141418', border: '1px solid #2A2A35', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#1C1C22' }}>
              {['Order ID', 'Customer', 'Products', 'Amount', 'Payment', 'Status', 'Source', 'Date', 'Actions'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#55556A', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid #1F1F28', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(o => (
              <tr key={o.id}
                onMouseEnter={e => e.currentTarget.style.background = '#23232B'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                style={{ borderBottom: '1px solid #1F1F28', cursor: 'pointer', transition: 'background 0.1s' }}
                onClick={() => setSelectedOrder(o)}>
                <td style={{ padding: '12px 14px', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: '#7C6AF7', whiteSpace: 'nowrap' }}>{o.id}</td>
                <td style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#2A2550', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: '#7C6AF7', flexShrink: 0 }}>{o.avatar}</div>
                    <div>
                      <div style={{ fontSize: '13px', color: '#F0EFF6', fontWeight: 500 }}>{o.customer}</div>
                      <div style={{ fontSize: '11px', color: '#55556A' }}>{o.city}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '12px 14px', fontSize: '12px', color: '#8A8A9E', maxWidth: '180px' }}>
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.products.join(', ')}</div>
                </td>
                <td style={{ padding: '12px 14px', fontSize: '13px', fontWeight: 600, color: '#F0EFF6', whiteSpace: 'nowrap' }}>PKR {o.amount.toLocaleString()}</td>
                <td style={{ padding: '12px 14px' }}>
                  <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '5px', background: '#1C1C22', color: '#8A8A9E', border: '1px solid #2A2A35' }}>{o.payment}</span>
                </td>
                <td style={{ padding: '12px 14px' }}><Badge status={o.status} /></td>
                <td style={{ padding: '12px 14px' }}>
                  <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '5px', background: (sourceColors[o.source] || '#7C6AF7') + '22', color: sourceColors[o.source] || '#7C6AF7', border: `1px solid ${(sourceColors[o.source] || '#7C6AF7')}44`, whiteSpace: 'nowrap' }}>{o.source}</span>
                </td>
                <td style={{ padding: '12px 14px', fontSize: '12px', color: '#8A8A9E', whiteSpace: 'nowrap' }}>{o.date}</td>
                <td style={{ padding: '12px 14px' }} onClick={e => e.stopPropagation()}>
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8A8A9E', display: 'flex' }}>
                    <MoreVertical size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail Panel */}
      {selectedOrder && (
        <div style={{
          position: 'fixed', right: 0, top: 0, bottom: 0, width: '480px',
          background: '#141418', borderLeft: '1px solid #2A2A35',
          zIndex: 200, overflowY: 'auto',
          boxShadow: '-8px 0 32px rgba(0,0,0,0.5)',
          animation: 'slideIn 0.2s ease',
        }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #1F1F28', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '14px', color: '#7C6AF7', fontWeight: 600 }}>{selectedOrder.id}</div>
              <div style={{ fontSize: '12px', color: '#55556A', marginTop: '2px' }}>{selectedOrder.date}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Badge status={selectedOrder.status} />
              <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8A8A9E', display: 'flex' }}><X size={18} /></button>
            </div>
          </div>

          <div style={{ padding: '20px' }}>
            {/* Customer */}
            <Section icon={User} title="Customer">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#2A2550', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: '#7C6AF7' }}>{selectedOrder.avatar}</div>
                <div>
                  <div style={{ fontWeight: 600, color: '#F0EFF6' }}>{selectedOrder.customer}</div>
                  <div style={{ fontSize: '12px', color: '#8A8A9E' }}>{selectedOrder.phone} · {selectedOrder.city}</div>
                </div>
              </div>
            </Section>

            {/* Products */}
            <Section icon={Package} title="Products">
              {selectedOrder.products.map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < selectedOrder.products.length - 1 ? '1px solid #1F1F28' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: '#1C1C22', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Package size={14} color="#55556A" /></div>
                    <span style={{ fontSize: '13px', color: '#F0EFF6' }}>{p}</span>
                  </div>
                </div>
              ))}
              <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #1F1F28', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#8A8A9E', fontSize: '13px' }}>Total ({selectedOrder.payment})</span>
                <span style={{ fontWeight: 700, fontSize: '15px', color: '#F0EFF6' }}>PKR {selectedOrder.amount.toLocaleString()}</span>
              </div>
            </Section>

            {/* Courier */}
            {selectedOrder.courier && (
              <Section icon={Truck} title="Courier Tracking">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', color: '#8A8A9E' }}>Courier</span>
                  <span style={{ fontSize: '13px', color: '#F0EFF6', fontWeight: 500 }}>{selectedOrder.courier}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', color: '#8A8A9E' }}>Tracking ID</span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: '#7C6AF7' }}>{selectedOrder.trackingId}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', color: '#8A8A9E' }}>Status</span>
                  <Badge status={selectedOrder.courierStatus === 'Delivered' ? 'Delivered' : 'Shipped'} />
                </div>
              </Section>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <Button variant="primary" style={{ flex: 1 }}><Truck size={14} /> Assign Courier</Button>
              <Button variant="secondary"><MessageSquare size={14} /> Message</Button>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}

function Section({ icon: Icon, title, children }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
        <Icon size={14} color="#7C6AF7" />
        <span style={{ fontSize: '12px', fontWeight: 600, color: '#8A8A9E', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{title}</span>
      </div>
      <div style={{ background: '#1C1C22', borderRadius: '8px', padding: '12px', border: '1px solid #1F1F28' }}>
        {children}
      </div>
    </div>
  );
}
