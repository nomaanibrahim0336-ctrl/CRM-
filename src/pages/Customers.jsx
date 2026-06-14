import React, { useState, useEffect } from 'react';
import { Search, Filter, MessageSquare, Download, ChevronLeft, ChevronRight, Plus, X, Edit2 } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { customers as mockCustomers, orders as mockOrders } from '../data/mockData';
import { exportCsv } from '../utils/exportCsv';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';

const PAGE_SIZE = 8;

const dmHistoryByCustomer = {
  'Aisha Malik': [
    { sender: 'customer', name: 'Aisha Malik', text: 'Hi! I placed an order for Nike Air Max.', time: '10:30 AM', platform: 'WhatsApp' },
    { sender: 'agent', name: 'You', text: 'Hello Aisha! Your order #ORD-7841 is confirmed and will ship today.', time: '10:32 AM', platform: 'WhatsApp' },
    { sender: 'customer', name: 'Aisha Malik', text: 'Great! Can you tell me the tracking number?', time: '10:35 AM', platform: 'WhatsApp' },
    { sender: 'agent', name: 'You', text: 'Sure! Tracking ID: TCS-88291. Expected delivery: tomorrow.', time: '10:36 AM', platform: 'WhatsApp' },
    { sender: 'customer', name: 'Aisha Malik', text: 'Thank you so much!', time: '10:38 AM', platform: 'WhatsApp' },
  ],
  'Sara Khan': [
    { sender: 'customer', name: 'Sara Khan', text: 'I saw the Zara dress on your Instagram page!', time: '9:45 AM', platform: 'Instagram' },
    { sender: 'agent', name: 'You', text: 'Hi Sara! Yes, it is available in sizes S, M, L.', time: '9:47 AM', platform: 'Instagram' },
    { sender: 'customer', name: 'Sara Khan', text: 'Do you have size M in red?', time: '9:50 AM', platform: 'Instagram' },
    { sender: 'agent', name: 'You', text: 'Yes! Only 2 left in stock. Shall I reserve one for you?', time: '9:52 AM', platform: 'Instagram' },
    { sender: 'customer', name: 'Sara Khan', text: 'Yes please! I will order right now.', time: '9:54 AM', platform: 'Instagram' },
  ],
  default: [
    { sender: 'customer', name: 'Customer', text: 'Hi, I want to know about my order.', time: '11:00 AM', platform: 'WhatsApp' },
    { sender: 'agent', name: 'You', text: 'Hi! Sure, let me check for you.', time: '11:02 AM', platform: 'WhatsApp' },
    { sender: 'customer', name: 'Customer', text: 'Order placed 2 days ago, no update.', time: '11:04 AM', platform: 'WhatsApp' },
    { sender: 'agent', name: 'You', text: 'Your order is being processed and will ship within 24 hours.', time: '11:05 AM', platform: 'WhatsApp' },
  ],
};

export default function Customers() {
  const addToast = useToast();
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [activeTab, setActiveTab] = useState('Overview');
  const [page, setPage] = useState(1);
  const [customers, setCustomers] = useState(mockCustomers);

  // Filters
  const [cityFilter, setCityFilter] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [spentFilter, setSpentFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const emptyForm = { name: '', phone: '', email: '', city: '', address: '', source: 'Other', notes: '', tags: '' };
  const [formModal, setFormModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const [noteText, setNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    setNoteText(selectedCustomer?.notes || '');
  }, [selectedCustomer?.id]);

  const handleSaveNote = async () => {
    if (!selectedCustomer) return;
    setSavingNote(true);
    try {
      const res = await api.put(`/api/customers/${selectedCustomer.id}`, { notes: noteText });
      if (res.success) {
        setCustomers(prev => prev.map(c => c.id === selectedCustomer.id ? { ...c, notes: noteText } : c));
        setSelectedCustomer(prev => ({ ...prev, notes: noteText }));
        addToast('Note saved', 'success');
      } else {
        addToast(res.message || 'Failed to save note', 'error');
      }
    } catch (err) {
      addToast(err.message || 'Failed to save note', 'error');
    } finally {
      setSavingNote(false);
    }
  };

  const openAddModal = () => { setEditingId(null); setForm(emptyForm); setSaveError(''); setFormModal(true); };
  const openEditModal = (c) => {
    setEditingId(c.id);
    setForm({ name: c.name, phone: c.phone === '—' ? '' : c.phone, email: c.email === '—' ? '' : c.email, city: c.city === '—' ? '' : c.city, address: c.address || '', source: c.source || 'Other', notes: c.notes || '', tags: (c.tags || []).join(', ') });
    setSaveError('');
    setFormModal(true);
  };

  const handleSaveCustomer = async () => {
    if (!form.name.trim() || !form.phone.trim()) { setSaveError('Name and phone are required'); return; }
    setSaving(true);
    setSaveError('');
    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || undefined,
      city: form.city.trim() || undefined,
      address: form.address.trim() || undefined,
      source: form.source,
      notes: form.notes.trim() || undefined,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
    };
    try {
      const res = editingId
        ? await api.put(`/api/customers/${editingId}`, payload)
        : await api.post('/api/customers', payload);
      if (res.success) {
        const c = res.data;
        const mapped = {
          id: c._id,
          name: c.name,
          phone: c.phone || '—',
          city: c.city || '—',
          email: c.email || '—',
          avatar: c.name[0],
          orders: c.totalOrders || 0,
          spent: c.totalSpent || 0,
          source: c.source || 'Other',
          status: c.isActive ? 'Active' : 'Inactive',
          joinDate: new Date(c.createdAt).toLocaleDateString(),
          lastOrder: c.lastOrderDate ? new Date(c.lastOrderDate).toLocaleDateString() : '—',
          tags: c.tags || [],
          notes: c.notes || '',
          address: c.address || '',
        };
        setCustomers(prev => editingId ? prev.map(x => x.id === editingId ? mapped : x) : [mapped, ...prev]);
        if (editingId && selectedCustomer && selectedCustomer.id === editingId) setSelectedCustomer(mapped);
        addToast(editingId ? 'Customer updated' : 'Customer created', 'success');
        setFormModal(false);
      } else {
        setSaveError(res.message || 'Failed to save customer');
      }
    } catch (err) {
      setSaveError(err.message || 'Failed to save customer');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    api.get('/api/customers?limit=200').then(data => {
      if (data.success && data.data?.length > 0) {
        const mapped = data.data.map(c => ({
          id: c._id,
          name: c.name,
          phone: c.phone || '—',
          city: c.city || '—',
          email: c.email || '—',
          avatar: c.name[0],
          orders: c.totalOrders || 0,
          spent: c.totalSpent || 0,
          source: c.source || 'Other',
          status: c.isActive ? 'Active' : 'Inactive',
          joinDate: new Date(c.createdAt).toLocaleDateString(),
          lastOrder: c.lastOrderDate ? new Date(c.lastOrderDate).toLocaleDateString() : '—',
          tags: c.tags || [],
          notes: c.notes || '',
          address: c.address || '',
        }));
        setCustomers(mapped);
      }
    }).catch(() => {});
  }, []);

  const filtered = customers.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search) || c.city.toLowerCase().includes(search.toLowerCase());
    const matchCity = cityFilter === 'All' || c.city === cityFilter;
    const matchSource = sourceFilter === 'All' || c.source === sourceFilter;
    const matchStatus = statusFilter === 'All' || c.status === statusFilter;
    let matchSpent = true;
    if (spentFilter === 'Under PKR 20K') matchSpent = c.totalSpent < 20000;
    else if (spentFilter === 'PKR 20K–50K') matchSpent = c.totalSpent >= 20000 && c.totalSpent < 50000;
    else if (spentFilter === 'PKR 50K–100K') matchSpent = c.totalSpent >= 50000 && c.totalSpent < 100000;
    else if (spentFilter === 'Over PKR 100K') matchSpent = c.totalSpent >= 100000;
    return matchSearch && matchCity && matchSource && matchStatus && matchSpent;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const inputStyle = { background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '7px', padding: '7px 10px', color: '#F0EFF6', fontSize: '12px', outline: 'none', cursor: 'pointer' };

  if (selectedCustomer) {
    const custOrders = orders.filter(o => o.customer === selectedCustomer.name);
    const dms = dmHistoryByCustomer[selectedCustomer.name] || dmHistoryByCustomer.default;
    const dmPlatform = dms[0]?.platform || 'WhatsApp';

    return (
      <PageWrapper
        title={selectedCustomer.name}
        subtitle={`${selectedCustomer.city} · ${selectedCustomer.phone}`}
        actions={
          <>
            <Button variant="secondary" onClick={() => setSelectedCustomer(null)}>← Back</Button>
            <Button variant="secondary" onClick={() => openEditModal(selectedCustomer)}><Edit2 size={14} /> Edit</Button>
            <Button variant="primary"><MessageSquare size={14} /> Message</Button>
          </>
        }
      >
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

        <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', background: '#1C1C22', padding: '4px', borderRadius: '10px', width: 'fit-content' }}>
          {['Overview', 'Orders', 'DM History', 'Notes'].map(t => (
            <button key={t} onClick={() => setActiveTab(t)} style={{ padding: '6px 16px', borderRadius: '7px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', border: 'none', background: activeTab === t ? '#2A2550' : 'transparent', color: activeTab === t ? '#7C6AF7' : '#8A8A9E', transition: 'all 0.15s' }}>{t}</button>
          ))}
        </div>

        {activeTab === 'Overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Card>
              <div style={{ fontWeight: 600, marginBottom: '12px', color: '#8A8A9E', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Contact Info</div>
              {[['Phone', selectedCustomer.phone], ['Email', selectedCustomer.email], ['City', selectedCustomer.city], ['Source', selectedCustomer.source]].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1F1F28' }}>
                  <span style={{ color: '#8A8A9E', fontSize: '13px' }}>{k}</span>
                  <span style={{ color: '#F0EFF6', fontSize: '13px' }}>{v}</span>
                </div>
              ))}
            </Card>
            <Card>
              <div style={{ fontWeight: 600, marginBottom: '12px', color: '#8A8A9E', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Purchase Summary</div>
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
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #1F1F28' }}>
              <span style={{ fontSize: '10px', padding: '3px 10px', borderRadius: '10px', background: dmPlatform === 'Instagram' ? '#E1306C22' : '#25D36622', color: dmPlatform === 'Instagram' ? '#E1306C' : '#25D366', fontWeight: 600, border: `1px solid ${dmPlatform === 'Instagram' ? '#E1306C44' : '#25D36644'}` }}>
                {dmPlatform}
              </span>
              <span style={{ fontSize: '12px', color: '#55556A' }}>Conversation history with {selectedCustomer.name}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {dms.map((msg, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.sender === 'customer' ? 'flex-start' : 'flex-end' }}>
                  <div style={{ fontSize: '10px', color: '#55556A', marginBottom: '3px', paddingLeft: msg.sender === 'agent' ? 0 : '2px', paddingRight: msg.sender === 'agent' ? '2px' : 0 }}>
                    {msg.name} · {msg.time}
                  </div>
                  <div style={{ maxWidth: '75%', padding: '10px 14px', borderRadius: msg.sender === 'customer' ? '4px 14px 14px 14px' : '14px 4px 14px 14px', background: msg.sender === 'customer' ? '#1C1C22' : '#2A2550', border: `1px solid ${msg.sender === 'customer' ? '#2A2A35' : '#7C6AF733'}` }}>
                    <div style={{ fontSize: '13px', color: '#F0EFF6', lineHeight: 1.5 }}>{msg.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {activeTab === 'Notes' && (
          <Card>
            <textarea value={noteText} onChange={e => setNoteText(e.target.value)} placeholder="Add notes about this customer..." style={{ width: '100%', minHeight: '120px', background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '8px', padding: '12px', color: '#F0EFF6', fontSize: '13px', resize: 'vertical', outline: 'none' }} />
            <Button variant="primary" style={{ marginTop: '12px' }} onClick={handleSaveNote} disabled={savingNote}>{savingNote ? 'Saving...' : 'Save Note'}</Button>
          </Card>
        )}
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="Customers" subtitle={`${customers.length} total customers`}
      actions={<Button variant="primary" onClick={openAddModal}><Plus size={14} /> Add Customer</Button>}>
      {/* Search + Export */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#55556A' }} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search customers..."
            style={{ width: '100%', background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '8px', padding: '8px 12px 8px 32px', color: '#F0EFF6', fontSize: '13px', outline: 'none' }} />
        </div>
        <Button variant="secondary" onClick={() => { exportCsv('customers.csv', filtered.map(c => ({ Name: c.name, Phone: c.phone, Email: c.email, City: c.city, Source: c.source, Status: c.status, TotalOrders: c.totalOrders, TotalSpent: c.totalSpent, LastOrder: c.lastOrder }))); addToast('CSV exported', 'success'); }}>
          <Download size={14} /> Export
        </Button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <select value={cityFilter} onChange={e => { setCityFilter(e.target.value); setPage(1); }} style={inputStyle}>
          {['All', 'Karachi', 'Lahore', 'Islamabad', 'Faisalabad', 'Rawalpindi', 'Multan', 'Peshawar'].map(c => <option key={c} value={c}>{c === 'All' ? 'All Cities' : c}</option>)}
        </select>
        <select value={sourceFilter} onChange={e => { setSourceFilter(e.target.value); setPage(1); }} style={inputStyle}>
          {['All', 'Shopify', 'Instagram', 'WhatsApp', 'Website', 'Mobile App'].map(s => <option key={s} value={s}>{s === 'All' ? 'All Sources' : s}</option>)}
        </select>
        <select value={spentFilter} onChange={e => { setSpentFilter(e.target.value); setPage(1); }} style={inputStyle}>
          {['All', 'Under PKR 20K', 'PKR 20K–50K', 'PKR 50K–100K', 'Over PKR 100K'].map(s => <option key={s} value={s}>{s === 'All' ? 'All Spent' : s}</option>)}
        </select>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} style={inputStyle}>
          {['All', 'VIP', 'Regular', 'New'].map(s => <option key={s} value={s}>{s === 'All' ? 'All Status' : s}</option>)}
        </select>
        <button onClick={() => { setCityFilter('All'); setSourceFilter('All'); setSpentFilter('All'); setStatusFilter('All'); setSearch(''); setPage(1); addToast('Filters cleared', 'info'); }} style={{ padding: '7px 12px', background: 'none', border: '1px solid #2A2A35', borderRadius: '7px', color: '#8A8A9E', fontSize: '12px', cursor: 'pointer' }}>Clear Filters</button>
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
            {paginated.map(c => (
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
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <Button variant="ghost" size="sm" onClick={() => openEditModal(c)}><Edit2 size={13} /></Button>
                    <Button variant="ghost" size="sm"><MessageSquare size={13} /></Button>
                  </div>
                </td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr><td colSpan={9} style={{ padding: '32px', textAlign: 'center', color: '#55556A' }}>No customers found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px' }}>
        <span style={{ fontSize: '12px', color: '#55556A' }}>
          Showing {filtered.length === 0 ? 0 : Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} customers
        </span>
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '6px 10px', background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '7px', color: page === 1 ? '#3A3A45' : '#8A8A9E', cursor: page === 1 ? 'default' : 'pointer', display: 'flex', alignItems: 'center' }}>
            <ChevronLeft size={14} />
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let p = totalPages <= 5 ? i + 1 : page <= 3 ? i + 1 : page >= totalPages - 2 ? totalPages - 4 + i : page - 2 + i;
            return (
              <button key={p} onClick={() => setPage(p)} style={{ width: '32px', height: '32px', borderRadius: '7px', border: '1px solid', background: page === p ? '#2A2550' : '#1C1C22', borderColor: page === p ? '#7C6AF7' : '#2A2A35', color: page === p ? '#7C6AF7' : '#8A8A9E', fontSize: '12px', cursor: 'pointer' }}>{p}</button>
            );
          })}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} style={{ padding: '6px 10px', background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '7px', color: page >= totalPages ? '#3A3A45' : '#8A8A9E', cursor: page >= totalPages ? 'default' : 'pointer', display: 'flex', alignItems: 'center' }}>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {formModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }} onClick={() => setFormModal(false)}>
          <div style={{ background: '#141418', border: '1px solid #2A2A35', borderRadius: '14px', width: '480px', maxHeight: '88vh', overflowY: 'auto', padding: '20px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ fontSize: '16px', fontWeight: 700, color: '#F0EFF6' }}>{editingId ? 'Edit Customer' : 'Add Customer'}</span>
              <button onClick={() => setFormModal(false)} style={{ background: 'none', border: 'none', color: '#8A8A9E', cursor: 'pointer' }}><X size={18} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                ['name', 'Name *'],
                ['phone', 'Phone *'],
                ['email', 'Email'],
                ['city', 'City'],
                ['address', 'Address'],
              ].map(([key, label]) => (
                <div key={key}>
                  <label style={{ fontSize: '11px', color: '#8A8A9E', marginBottom: '4px', display: 'block' }}>{label}</label>
                  <input value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    style={{ width: '100%', background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '7px', padding: '8px 10px', color: '#F0EFF6', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              ))}
              <div>
                <label style={{ fontSize: '11px', color: '#8A8A9E', marginBottom: '4px', display: 'block' }}>Source</label>
                <select value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))} style={{ width: '100%', background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '7px', padding: '8px 10px', color: '#F0EFF6', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}>
                  {['Shopify', 'Instagram', 'WhatsApp', 'Website', 'Mobile App', 'Other'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#8A8A9E', marginBottom: '4px', display: 'block' }}>Tags (comma separated)</label>
                <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                  style={{ width: '100%', background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '7px', padding: '8px 10px', color: '#F0EFF6', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#8A8A9E', marginBottom: '4px', display: 'block' }}>Notes</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  style={{ width: '100%', minHeight: '70px', background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '7px', padding: '8px 10px', color: '#F0EFF6', fontSize: '13px', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
              </div>

              {saveError && <div style={{ fontSize: '12px', color: '#E25C5C', background: '#E25C5C18', border: '1px solid #E25C5C44', borderRadius: '7px', padding: '8px 10px' }}>{saveError}</div>}

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '6px' }}>
                <Button variant="secondary" onClick={() => setFormModal(false)}>Cancel</Button>
                <Button variant="primary" onClick={handleSaveCustomer} disabled={saving}>{saving ? 'Saving...' : editingId ? 'Save Changes' : 'Create Customer'}</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
