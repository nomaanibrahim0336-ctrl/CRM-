import React, { useState } from 'react';
import { Search, Filter, ShoppingCart, MessageSquare, FileText, BarChart2 } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { customers, orders } from '../data/mockData';

export default function Customers() {
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [activeTab, setActiveTab] = useState('Overview');

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search) ||
    c.city.toLowerCase().includes(search.toLowerCase())
  );

  if (selectedCustomer) {
    const custOrders = orders.filter(o => o.customer === selectedCustomer.name);
    return (
      <PageWrapper
        title={selectedCustomer.name}
        subtitle={`${selectedCustomer.city} · ${selectedCustomer.phone}`}
        actions={
          <>
            <Button variant="secondary" onClick={() => setSelectedCustomer(null)}>← Back</Button>
            <Button variant="primary"><MessageSquare size={14} /> Message</Button>
          </>
        }
      >
        {/* Customer Header */}
        <Card style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, #7C6AF7, #3A8AE8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 700, color: '#fff', flexShrink: 0 }}>{selectedCustomer.avatar}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '18px', fontWeight: 700, color: '#F0EFF6' }}>{selectedCustomer.name}</span>
                <Badge status={selectedCustomer.status} />
              </div>
              <div style={{ fontSize: '13px', color: '#8A8A9E', marginTop: '4px' }}>{selectedCustomer.email}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', textAlign: 'center' }}>
              {[
                { label: 'Total Orders', value: selectedCustomer.totalOrders },
                { label: 'Total Spent', value: `PKR ${selectedCustomer.totalSpent.toLocaleString()}` },
                { label: 'Last Order', value: selectedCustomer.lastOrder },
              ].map(s => (
                <div key={s.label}>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#F0EFF6' }}>{s.value}</div>
                  <div style={{ fontSize: '11px', color: '#55556A', marginTop: '2px' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', background: '#1C1C22', padding: '4px', borderRadius: '10px', width: 'fit-content' }}>
          {['Overview', 'Orders', 'DM History', 'Notes'].map(t => (
            <button key={t} onClick={() => setActiveTab(t)} style={{
              padding: '6px 16px', borderRadius: '7px', fontSize: '13px', fontWeight: 500,
              cursor: 'pointer', border: 'none', background: activeTab === t ? '#2A2550' : 'transparent',
              color: activeTab === t ? '#7C6AF7' : '#8A8A9E', transition: 'all 0.15s',
            }}>{t}</button>
          ))}
        </div>

        {activeTab === 'Overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Card><div style={{ fontWeight: 600, marginBottom: '12px', color: '#8A8A9E', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Contact Info</div>
              {[['Phone', selectedCustomer.phone], ['Email', selectedCustomer.email], ['City', selectedCustomer.city], ['Source', selectedCustomer.source]].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1F1F28' }}>
                  <span style={{ color: '#8A8A9E', fontSize: '13px' }}>{k}</span>
                  <span style={{ color: '#F0EFF6', fontSize: '13px' }}>{v}</span>
                </div>
              ))}
            </Card>
            <Card><div style={{ fontWeight: 600, marginBottom: '12px', color: '#8A8A9E', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Purchase Summary</div>
              {[['Total Orders', selectedCustomer.totalOrders], ['Total Spent', `PKR ${selectedCustomer.totalSpent.toLocaleString()}`], ['Avg Order Value', `PKR ${Math.round(selectedCustomer.totalSpent / selectedCustomer.totalOrders).toLocaleString()}`], ['Last Order', selectedCustomer.lastOrder]].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1F1F28' }}>
                  <span style={{ color: '#8A8A9E', fontSize: '13px' }}>{k}</span>
                  <span style={{ color: '#F0EFF6', fontSize: '13px', fontWeight: 500 }}>{v}</span>
                </div>
              ))}
            </Card>
          </div>
        )}

        {activeTab === 'Orders' && (
          <Card style={{ padding: 0 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: '#1C1C22' }}>
                {['Order ID', 'Products', 'Amount', 'Status', 'Date'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#55556A', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid #1F1F28' }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {custOrders.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#55556A' }}>No orders found</td></tr>
                ) : custOrders.map(o => (
                  <tr key={o.id} style={{ borderBottom: '1px solid #1F1F28' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#23232B'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '12px 16px', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: '#7C6AF7' }}>{o.id}</td>
                    <td style={{ padding: '12px 16px', fontSize: '12px', color: '#8A8A9E' }}>{o.products.join(', ')}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#F0EFF6' }}>PKR {o.amount.toLocaleString()}</td>
                    <td style={{ padding: '12px 16px' }}><Badge status={o.status} /></td>
                    <td style={{ padding: '12px 16px', fontSize: '12px', color: '#8A8A9E' }}>{o.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {activeTab === 'DM History' && (
          <Card><div style={{ textAlign: 'center', padding: '40px', color: '#55556A' }}>DM history will appear here</div></Card>
        )}
        {activeTab === 'Notes' && (
          <Card>
            <textarea placeholder="Add notes about this customer..." style={{ width: '100%', minHeight: '120px', background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '8px', padding: '12px', color: '#F0EFF6', fontSize: '13px', resize: 'vertical', outline: 'none' }} />
            <Button variant="primary" style={{ marginTop: '12px' }}>Save Note</Button>
          </Card>
        )}
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="Customers" subtitle={`${customers.length} total customers`}>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#55556A' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customers..."
            style={{ width: '100%', background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '8px', padding: '8px 12px 8px 32px', color: '#F0EFF6', fontSize: '13px', outline: 'none' }} />
        </div>
        <Button variant="secondary"><Filter size={14} /> Filters</Button>
      </div>

      <div style={{ background: '#141418', border: '1px solid #2A2A35', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#1C1C22' }}>
              {['Customer', 'Phone', 'City', 'Orders', 'Spent', 'Last Order', 'Source', 'Status', 'Actions'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#55556A', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid #1F1F28', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id}
                onMouseEnter={e => e.currentTarget.style.background = '#23232B'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                style={{ borderBottom: '1px solid #1F1F28', cursor: 'pointer', transition: 'background 0.1s' }}
                onClick={() => setSelectedCustomer(c)}>
                <td style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#2A2550', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: '#7C6AF7', flexShrink: 0 }}>{c.avatar}</div>
                    <div>
                      <div style={{ fontSize: '13px', color: '#F0EFF6', fontWeight: 500 }}>{c.name}</div>
                      <div style={{ fontSize: '11px', color: '#55556A' }}>{c.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '12px 14px', fontSize: '12px', color: '#8A8A9E', whiteSpace: 'nowrap' }}>{c.phone}</td>
                <td style={{ padding: '12px 14px', fontSize: '13px', color: '#F0EFF6' }}>{c.city}</td>
                <td style={{ padding: '12px 14px', fontSize: '13px', fontWeight: 600, color: '#F0EFF6', textAlign: 'center' }}>{c.totalOrders}</td>
                <td style={{ padding: '12px 14px', fontSize: '13px', fontWeight: 600, color: '#1DB87A', whiteSpace: 'nowrap' }}>PKR {c.totalSpent.toLocaleString()}</td>
                <td style={{ padding: '12px 14px', fontSize: '12px', color: '#8A8A9E', whiteSpace: 'nowrap' }}>{c.lastOrder}</td>
                <td style={{ padding: '12px 14px', fontSize: '12px', color: '#8A8A9E' }}>{c.source}</td>
                <td style={{ padding: '12px 14px' }}><Badge status={c.status} /></td>
                <td style={{ padding: '12px 14px' }} onClick={e => e.stopPropagation()}>
                  <Button variant="ghost" size="sm"><MessageSquare size={13} /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageWrapper>
  );
}
