import React, { useState, useRef, useEffect } from 'react';
import { Search, Download, MoreVertical, X, Package, MessageSquare, Truck, User, ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { orders as mockOrders } from '../data/mockData';
import { exportCsv } from '../utils/exportCsv';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';
import { printInvoice } from '../utils/printDoc';

const tabs = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
const sourceColors = { Instagram: '#E1306C', Shopify: '#96BF48', WhatsApp: '#25D366', Website: '#3A8AE8', 'Mobile App': '#7C6AF7' };
const PAGE_SIZE = 10;

const mockDMs = {
  'Aisha Malik': [
    { sender: 'customer', text: 'Hi, when will my Nike Air Max arrive?', time: '10:30 AM', platform: 'WhatsApp' },
    { sender: 'agent', text: 'Hello Aisha! Your order is out for delivery today. TCS tracking: TCS-88291', time: '10:32 AM', platform: 'WhatsApp' },
    { sender: 'customer', text: 'Thank you! I am excited to receive it.', time: '10:35 AM', platform: 'WhatsApp' },
  ],
  'Sara Khan': [
    { sender: 'customer', text: 'I saw your Zara dress post on Instagram!', time: '9:45 AM', platform: 'Instagram' },
    { sender: 'agent', text: 'Hi Sara! Yes, we have it in stock. Your order is being processed.', time: '9:47 AM', platform: 'Instagram' },
    { sender: 'customer', text: 'Can you add a gift wrap?', time: '9:50 AM', platform: 'Instagram' },
  ],
  default: [
    { sender: 'customer', text: 'Hi, I have a question about my order.', time: '11:00 AM', platform: 'WhatsApp' },
    { sender: 'agent', text: 'Sure! How can I help you?', time: '11:02 AM', platform: 'WhatsApp' },
    { sender: 'customer', text: 'When will it be delivered?', time: '11:05 AM', platform: 'WhatsApp' },
  ],
};

function useClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (e) => {
      if (!ref.current || ref.current.contains(e.target)) return;
      handler();
    };
    document.addEventListener('mousedown', listener);
    return () => document.removeEventListener('mousedown', listener);
  }, [handler]);
}

export default function Orders() {
  const addToast = useToast();
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orders, setOrders] = useState(mockOrders);
  const [page, setPage] = useState(1);
  const [apiLoading, setApiLoading] = useState(true);

  useEffect(() => {
    api.get('/api/orders?limit=100&sort=-createdAt').then(data => {
      if (data.success && data.data?.length > 0) {
        const mapped = data.data.map(o => ({
          id: o.orderId || o._id,
          _id: o._id,
          customer: o.customerSnapshot?.name || '—',
          avatar: (o.customerSnapshot?.name || 'U')[0],
          amount: o.total || 0,
          status: o.status,
          date: new Date(o.createdAt).toLocaleDateString(),
          source: o.source || 'Other',
          city: o.customerSnapshot?.city || '—',
          phone: o.customerSnapshot?.phone || '—',
          items: o.items || [],
          paymentMethod: o.paymentMethod,
          paymentStatus: o.paymentStatus,
          notes: o.notes,
          courier: o.courier,
        }));
        setOrders(mapped);
      }
    }).catch(() => {}).finally(() => setApiLoading(false));
  }, []);

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('All');

  const [actionMenu, setActionMenu] = useState(null);
  const actionMenuRef = useRef(null);

  const [trackingModal, setTrackingModal] = useState(null);
  const [trackingCourier, setTrackingCourier] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');

  // Create Order modal
  const [createModal, setCreateModal] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerResults, setCustomerResults] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [productSearch, setProductSearch] = useState('');
  const [productResults, setProductResults] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [orderForm, setOrderForm] = useState({ paymentMethod: 'COD', source: 'WhatsApp', shippingFee: '200', discount: '0', notes: '' });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  // Status update
  const [statusModal, setStatusModal] = useState(null); // { orderId, _id, currentStatus }

  useClickOutside(actionMenuRef, () => setActionMenu(null));

  const filtered = orders.filter(o => {
    const matchTab = activeTab === 'All' || o.status === activeTab;
    const matchSearch = o.id.toLowerCase().includes(search.toLowerCase()) || o.customer.toLowerCase().includes(search.toLowerCase());
    const matchSource = sourceFilter === 'All' || o.source === sourceFilter;
    const matchPayment = paymentFilter === 'All' || o.payment === paymentFilter;
    const matchDateFrom = !dateFrom || o.date >= dateFrom;
    const matchDateTo = !dateTo || o.date <= dateTo;
    return matchTab && matchSearch && matchSource && matchPayment && matchDateFrom && matchDateTo;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const clearFilters = () => {
    setDateFrom(''); setDateTo(''); setSourceFilter('All'); setPaymentFilter('All'); setSearch(''); setPage(1);
    addToast('Filters cleared', 'info');
  };

  const updateOrderStatus = (orderId, status) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    setSelectedOrder(prev => prev?.id === orderId ? { ...prev, status } : prev);
    addToast(`Order status updated to ${status}`, status === 'Cancelled' ? 'warning' : 'success');
    setActionMenu(null);
  };

  const saveTracking = (orderId) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, courier: trackingCourier, trackingId: trackingNumber, courierStatus: 'In Transit' } : o));
    setSelectedOrder(prev => prev?.id === orderId ? { ...prev, courier: trackingCourier, trackingId: trackingNumber, courierStatus: 'In Transit' } : prev);
    setTrackingModal(null);
    addToast('Tracking number saved', 'success');
  };

  // Search customers for create order
  useEffect(() => {
    if (!customerSearch.trim()) { setCustomerResults([]); return; }
    const t = setTimeout(() => {
      api.get(`/api/customers?search=${encodeURIComponent(customerSearch)}&limit=6`).then(d => {
        if (d.success) setCustomerResults(d.data || []);
      }).catch(() => {});
    }, 300);
    return () => clearTimeout(t);
  }, [customerSearch]);

  // Search products for create order
  useEffect(() => {
    if (!productSearch.trim()) { setProductResults([]); return; }
    const t = setTimeout(() => {
      api.get(`/api/products?search=${encodeURIComponent(productSearch)}&limit=6`).then(d => {
        if (d.success) setProductResults(d.data || []);
      }).catch(() => {});
    }, 300);
    return () => clearTimeout(t);
  }, [productSearch]);

  const addItem = (product) => {
    setOrderItems(prev => {
      const exists = prev.find(i => i.productId === product._id);
      if (exists) return prev.map(i => i.productId === product._id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { productId: product._id, name: product.name, sku: product.sku, salePrice: product.salePrice, qty: 1, stock: product.stock }];
    });
    setProductSearch('');
    setProductResults([]);
  };

  const removeItem = (productId) => setOrderItems(prev => prev.filter(i => i.productId !== productId));
  const updateQty = (productId, qty) => setOrderItems(prev => prev.map(i => i.productId === productId ? { ...i, qty: Math.max(1, parseInt(qty) || 1) } : i));

  const orderSubtotal = orderItems.reduce((s, i) => s + i.salePrice * i.qty, 0);
  const orderTotal = orderSubtotal + parseFloat(orderForm.shippingFee || 0) - parseFloat(orderForm.discount || 0);

  const handleCreateOrder = async () => {
    if (!selectedCustomer) { setCreateError('Please select a customer.'); return; }
    if (orderItems.length === 0) { setCreateError('Please add at least one product.'); return; }
    setCreating(true);
    setCreateError('');
    try {
      const res = await api.post('/api/orders', {
        customerId: selectedCustomer._id,
        items: orderItems.map(i => ({ productId: i.productId, qty: i.qty, salePrice: i.salePrice })),
        paymentMethod: orderForm.paymentMethod,
        source: orderForm.source,
        shippingFee: parseFloat(orderForm.shippingFee) || 0,
        discount: parseFloat(orderForm.discount) || 0,
        notes: orderForm.notes,
      });
      if (res.success) {
        const o = res.data;
        const newOrder = {
          id: o.orderId || o._id, _id: o._id,
          customer: o.customerSnapshot?.name || selectedCustomer.name,
          avatar: (o.customerSnapshot?.name || selectedCustomer.name)[0],
          amount: o.total || orderTotal,
          status: o.status || 'Pending',
          date: new Date(o.createdAt).toLocaleDateString(),
          source: o.source, city: o.customerSnapshot?.city || selectedCustomer.city || '—',
          phone: o.customerSnapshot?.phone || selectedCustomer.phone || '—',
          items: o.items || [], paymentMethod: o.paymentMethod,
          paymentStatus: o.paymentStatus, notes: o.notes,
          products: orderItems.map(i => i.name),
          payment: o.paymentMethod,
        };
        setOrders(prev => [newOrder, ...prev]);
        setCreateModal(false);
        setSelectedCustomer(null); setCustomerSearch(''); setOrderItems([]);
        setOrderForm({ paymentMethod: 'COD', source: 'WhatsApp', shippingFee: '200', discount: '0', notes: '' });
        addToast(`Order ${newOrder.id} created successfully!`, 'success');
      } else {
        setCreateError(res.error || 'Failed to create order');
      }
    } catch (err) {
      setCreateError(err.message || 'Failed to create order');
    } finally {
      setCreating(false);
    }
  };

  const handleStatusUpdate = async (orderId, _id, newStatus) => {
    try {
      const res = await api.put(`/api/orders/${_id}/status`, { status: newStatus });
      if (res.success) {
        updateOrderStatus(orderId, newStatus);
        setStatusModal(null);
        addToast(`Order moved to ${newStatus}`, 'success');
      } else {
        addToast(res.error || 'Status update failed', 'error');
      }
    } catch (err) {
      addToast('Status update failed', 'error');
    }
  };

  const inputStyle = { background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '7px', padding: '7px 10px', color: '#F0EFF6', fontSize: '12px', outline: 'none' };

  const dmMessages = selectedOrder ? (mockDMs[selectedOrder.customer] || mockDMs.default) : [];
  const dmPlatform = dmMessages[0]?.platform || 'WhatsApp';

  return (
    <PageWrapper title="Orders" subtitle={`${orders.length} total orders`}>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '12px', background: '#1C1C22', padding: '4px', borderRadius: '10px', width: 'fit-content' }}>
        {tabs.map(t => (
          <button key={t} onClick={() => { setActiveTab(t); setPage(1); }} style={{ padding: '6px 14px', borderRadius: '7px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', border: 'none', transition: 'all 0.15s', background: activeTab === t ? '#2A2550' : 'transparent', color: activeTab === t ? '#7C6AF7' : '#8A8A9E' }}>{t}</button>
        ))}
      </div>

      {/* Search + Export + New Order */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#55556A' }} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search orders..."
            style={{ width: '100%', background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '8px', padding: '8px 12px 8px 32px', color: '#F0EFF6', fontSize: '13px', outline: 'none' }} />
        </div>
        <button onClick={() => { setCreateModal(true); setCreateError(''); }}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#7C6AF7', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={14} /> New Order
        </button>
        <Button variant="secondary" onClick={() => { exportCsv('orders.csv', filtered.map(o => ({ ID: o.id, Customer: o.customer, Amount: o.amount, Status: o.status, Source: o.source, Payment: o.payment, Date: o.date }))); addToast('CSV exported', 'success'); }}>
          <Download size={14} /> Export
        </Button>
      </div>

      {/* Filters Bar */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '12px', color: '#55556A' }}>From</span>
          <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }} style={inputStyle} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '12px', color: '#55556A' }}>To</span>
          <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }} style={inputStyle} />
        </div>
        <select value={sourceFilter} onChange={e => { setSourceFilter(e.target.value); setPage(1); }} style={inputStyle}>
          {['All', 'Shopify', 'Instagram', 'WhatsApp', 'Website', 'Mobile App'].map(s => <option key={s} value={s}>{s === 'All' ? 'All Sources' : s}</option>)}
        </select>
        <select value={paymentFilter} onChange={e => { setPaymentFilter(e.target.value); setPage(1); }} style={inputStyle}>
          {['All', 'COD', 'Card', 'Easypaisa', 'JazzCash'].map(s => <option key={s} value={s}>{s === 'All' ? 'All Payments' : s}</option>)}
        </select>
        <button onClick={clearFilters} style={{ padding: '7px 12px', background: 'none', border: '1px solid #2A2A35', borderRadius: '7px', color: '#8A8A9E', fontSize: '12px', cursor: 'pointer' }}>Clear Filters</button>
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
            {paginated.map(o => (
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
                  <button onClick={(e) => {
                    e.stopPropagation();
                    const rect = e.currentTarget.getBoundingClientRect();
                    setActionMenu(actionMenu?.orderId === o.id ? null : { orderId: o.id, top: rect.bottom + 4, right: window.innerWidth - rect.right });
                  }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8A8A9E', display: 'flex' }}>
                    <MoreVertical size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr><td colSpan={9} style={{ padding: '32px', textAlign: 'center', color: '#55556A' }}>No orders found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px' }}>
        <span style={{ fontSize: '12px', color: '#55556A' }}>
          Showing {filtered.length === 0 ? 0 : Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} orders
        </span>
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '6px 10px', background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '7px', color: page === 1 ? '#3A3A45' : '#8A8A9E', cursor: page === 1 ? 'default' : 'pointer', display: 'flex', alignItems: 'center' }}>
            <ChevronLeft size={14} />
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let p;
            if (totalPages <= 5) p = i + 1;
            else if (page <= 3) p = i + 1;
            else if (page >= totalPages - 2) p = totalPages - 4 + i;
            else p = page - 2 + i;
            return (
              <button key={p} onClick={() => setPage(p)} style={{ width: '32px', height: '32px', borderRadius: '7px', border: '1px solid', background: page === p ? '#2A2550' : '#1C1C22', borderColor: page === p ? '#7C6AF7' : '#2A2A35', color: page === p ? '#7C6AF7' : '#8A8A9E', fontSize: '12px', cursor: 'pointer' }}>
                {p}
              </button>
            );
          })}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} style={{ padding: '6px 10px', background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '7px', color: page >= totalPages ? '#3A3A45' : '#8A8A9E', cursor: page >= totalPages ? 'default' : 'pointer', display: 'flex', alignItems: 'center' }}>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Action Menu */}
      {actionMenu && (
        <div ref={actionMenuRef} style={{ position: 'fixed', top: actionMenu.top, right: actionMenu.right, width: '200px', background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)', zIndex: 500, overflow: 'hidden' }}>
          {[
            { label: 'View Details', action: () => { setSelectedOrder(orders.find(o => o.id === actionMenu.orderId)); setActionMenu(null); } },
            { label: 'Update Status', action: () => { const o = orders.find(x => x.id === actionMenu.orderId); setStatusModal({ orderId: o.id, _id: o._id, currentStatus: o.status }); setActionMenu(null); } },
            { label: 'Add Tracking Number', action: () => { setTrackingModal(actionMenu.orderId); setTrackingCourier(''); setTrackingNumber(''); setActionMenu(null); } },
            { label: 'Print Invoice', action: () => { const o = orders.find(x => x.id === actionMenu.orderId); printInvoice(o); setActionMenu(null); } },
          ].map(item => (
            <button key={item.label} onClick={item.action} style={{ width: '100%', padding: '10px 14px', background: 'none', border: 'none', textAlign: 'left', fontSize: '13px', color: '#F0EFF6', cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.background = '#2A2A35'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >{item.label}</button>
          ))}
          <div style={{ height: '1px', background: '#2A2A35' }} />
          <button onClick={() => {
            const o = orders.find(x => x.id === actionMenu.orderId);
            if (window.confirm('Cancel this order?')) handleStatusUpdate(o.id, o._id, 'Cancelled');
          }} style={{ width: '100%', padding: '10px 14px', background: 'none', border: 'none', textAlign: 'left', fontSize: '13px', color: '#E2514A', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.background = '#3D141422'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >Cancel Order</button>
        </div>
      )}

      {/* Tracking Modal */}
      {trackingModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#141418', border: '1px solid #2A2A35', borderRadius: '12px', padding: '24px', width: '360px' }}>
            <div style={{ fontWeight: 600, color: '#F0EFF6', marginBottom: '16px', fontSize: '15px' }}>Add Tracking Number</div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', color: '#8A8A9E', display: 'block', marginBottom: '6px' }}>Courier</label>
              <select value={trackingCourier} onChange={e => setTrackingCourier(e.target.value)} style={{ ...inputStyle, width: '100%' }}>
                <option value="">Select courier</option>
                {['TCS', 'Leopard', 'BlueEx', 'PostEx', 'Trax'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', color: '#8A8A9E', display: 'block', marginBottom: '6px' }}>Tracking Number</label>
              <input value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)} placeholder="e.g. TCS-12345" style={{ ...inputStyle, width: '100%' }} />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => saveTracking(trackingModal)} style={{ flex: 1, padding: '9px', background: '#7C6AF7', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>Save</button>
              <button onClick={() => setTrackingModal(null)} style={{ padding: '9px 16px', background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '8px', color: '#8A8A9E', fontSize: '13px', cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Panel */}
      {selectedOrder && (
        <div style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: '480px', background: '#141418', borderLeft: '1px solid #2A2A35', zIndex: 200, overflowY: 'auto', boxShadow: '-8px 0 32px rgba(0,0,0,0.5)' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #1F1F28', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '14px', color: '#7C6AF7', fontWeight: 600 }}>{selectedOrder.id}</div>
              <div style={{ fontSize: '12px', color: '#55556A', marginTop: '2px' }}>{selectedOrder.date}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Badge status={selectedOrder.status} />
              <Button variant="secondary" size="sm" onClick={() => printInvoice(selectedOrder)}>Print Invoice</Button>
              <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8A8A9E', display: 'flex' }}><X size={18} /></button>
            </div>
          </div>

          <div style={{ padding: '20px' }}>
            <Section icon={User} title="Customer">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#2A2550', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: '#7C6AF7' }}>{selectedOrder.avatar}</div>
                <div>
                  <div style={{ fontWeight: 600, color: '#F0EFF6' }}>{selectedOrder.customer}</div>
                  <div style={{ fontSize: '12px', color: '#8A8A9E' }}>{selectedOrder.phone} · {selectedOrder.city}</div>
                </div>
              </div>
            </Section>

            <Section icon={Package} title="Products">
              {selectedOrder.products.map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0', borderBottom: i < selectedOrder.products.length - 1 ? '1px solid #1F1F28' : 'none' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: '#1C1C22', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Package size={14} color="#55556A" /></div>
                  <span style={{ fontSize: '13px', color: '#F0EFF6' }}>{p}</span>
                </div>
              ))}
              <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #1F1F28', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#8A8A9E', fontSize: '13px' }}>Total ({selectedOrder.payment})</span>
                <span style={{ fontWeight: 700, fontSize: '15px', color: '#F0EFF6' }}>PKR {selectedOrder.amount.toLocaleString()}</span>
              </div>
            </Section>

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

            <Section icon={MessageSquare} title="DM History">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '10px', background: dmPlatform === 'Instagram' ? '#E1306C22' : '#25D36622', color: dmPlatform === 'Instagram' ? '#E1306C' : '#25D366', fontWeight: 600, border: `1px solid ${dmPlatform === 'Instagram' ? '#E1306C44' : '#25D36644'}` }}>
                  {dmPlatform}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {dmMessages.map((msg, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: msg.sender === 'customer' ? 'flex-start' : 'flex-end' }}>
                    <div style={{ maxWidth: '80%', padding: '8px 12px', borderRadius: msg.sender === 'customer' ? '4px 12px 12px 12px' : '12px 4px 12px 12px', background: msg.sender === 'customer' ? '#1C1C22' : '#2A2550', border: `1px solid ${msg.sender === 'customer' ? '#2A2A35' : '#7C6AF733'}` }}>
                      <div style={{ fontSize: '12px', color: '#F0EFF6' }}>{msg.text}</div>
                      <div style={{ fontSize: '10px', color: '#55556A', marginTop: '3px', textAlign: msg.sender === 'customer' ? 'left' : 'right' }}>{msg.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <Button variant="primary" style={{ flex: 1 }} onClick={() => { setTrackingModal(selectedOrder.id); setTrackingCourier(''); setTrackingNumber(''); }}><Truck size={14} /> Assign Courier</Button>
              <Button variant="secondary"><MessageSquare size={14} /> Message</Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Status Update Modal ── */}
      {statusModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#141418', border: '1px solid #2A2A35', borderRadius: '12px', padding: '24px', width: '340px' }}>
            <div style={{ fontWeight: 700, color: '#F0EFF6', fontSize: '15px', marginBottom: '6px' }}>Update Order Status</div>
            <div style={{ fontSize: '12px', color: '#55556A', marginBottom: '18px' }}>Current: <span style={{ color: '#F0EFF6' }}>{statusModal.currentStatus}</span></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {['Confirmed', 'Processing', 'Shipped', 'Delivered', 'Returned', 'Cancelled'].map(s => {
                const colors = { Confirmed: '#3A8AE8', Processing: '#F5A623', Shipped: '#7C6AF7', Delivered: '#1DB87A', Returned: '#E2514A', Cancelled: '#55556A' };
                const isCurrent = s === statusModal.currentStatus;
                return (
                  <button key={s} onClick={() => handleStatusUpdate(statusModal.orderId, statusModal._id, s)} disabled={isCurrent}
                    style={{ padding: '10px 14px', background: isCurrent ? '#1C1C22' : '#141418', border: `1px solid ${isCurrent ? colors[s] + '55' : '#2A2A35'}`, borderRadius: '8px', color: isCurrent ? colors[s] : '#F0EFF6', fontSize: '13px', fontWeight: isCurrent ? 600 : 400, cursor: isCurrent ? 'default' : 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                    onMouseEnter={e => { if (!isCurrent) e.currentTarget.style.borderColor = colors[s] + '66'; }}
                    onMouseLeave={e => { if (!isCurrent) e.currentTarget.style.borderColor = '#2A2A35'; }}>
                    {s} {isCurrent && <span style={{ fontSize: '11px' }}>← current</span>}
                  </button>
                );
              })}
            </div>
            <button onClick={() => setStatusModal(null)} style={{ width: '100%', marginTop: '14px', padding: '9px', background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '8px', color: '#8A8A9E', fontSize: '13px', cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* ── Create Order Modal ── */}
      {createModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#141418', border: '1px solid #2A2A35', borderRadius: '16px', width: '640px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #1F1F28', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', background: '#2A2550', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Package size={15} color="#7C6AF7" />
                </div>
                <div style={{ fontWeight: 700, fontSize: '16px', color: '#F0EFF6' }}>Create New Order</div>
              </div>
              <button onClick={() => setCreateModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#55556A' }}><X size={18} /></button>
            </div>

            <div style={{ overflowY: 'auto', flex: 1, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* Customer Search */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#8A8A9E', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Customer *</label>
                {selectedCustomer ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#1C1C22', border: '1px solid #7C6AF755', borderRadius: '8px' }}>
                    <div>
                      <div style={{ fontWeight: 600, color: '#F0EFF6', fontSize: '13px' }}>{selectedCustomer.name}</div>
                      <div style={{ fontSize: '11px', color: '#8A8A9E' }}>{selectedCustomer.phone} · {selectedCustomer.city}</div>
                    </div>
                    <button onClick={() => { setSelectedCustomer(null); setCustomerSearch(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#55556A' }}><X size={14} /></button>
                  </div>
                ) : (
                  <div style={{ position: 'relative' }}>
                    <input value={customerSearch} onChange={e => setCustomerSearch(e.target.value)} placeholder="Type customer name or phone..."
                      style={{ width: '100%', boxSizing: 'border-box', background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '8px', padding: '10px 12px', color: '#F0EFF6', fontSize: '13px', outline: 'none' }} />
                    {customerResults.length > 0 && (
                      <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '8px', marginTop: '4px', zIndex: 10, overflow: 'hidden' }}>
                        {customerResults.map(c => (
                          <button key={c._id} onClick={() => { setSelectedCustomer(c); setCustomerSearch(''); setCustomerResults([]); }}
                            style={{ width: '100%', padding: '10px 14px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', color: '#F0EFF6' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#23232B'}
                            onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                            <div style={{ fontSize: '13px', fontWeight: 500 }}>{c.name}</div>
                            <div style={{ fontSize: '11px', color: '#55556A' }}>{c.phone} · {c.city}</div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Product Search */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#8A8A9E', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Products *</label>
                <div style={{ position: 'relative', marginBottom: '10px' }}>
                  <input value={productSearch} onChange={e => setProductSearch(e.target.value)} placeholder="Search and add products..."
                    style={{ width: '100%', boxSizing: 'border-box', background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '8px', padding: '10px 12px', color: '#F0EFF6', fontSize: '13px', outline: 'none' }} />
                  {productResults.length > 0 && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '8px', marginTop: '4px', zIndex: 10, overflow: 'hidden' }}>
                      {productResults.map(p => (
                        <button key={p._id} onClick={() => addItem(p)}
                          style={{ width: '100%', padding: '10px 14px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', color: '#F0EFF6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#23232B'}
                          onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 500 }}>{p.name}</div>
                            <div style={{ fontSize: '11px', color: '#55556A' }}>{p.sku} · Stock: {p.stock}</div>
                          </div>
                          <div style={{ fontSize: '12px', color: '#7C6AF7', fontWeight: 600 }}>PKR {p.salePrice?.toLocaleString()}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {orderItems.length > 0 && (
                  <div style={{ border: '1px solid #2A2A35', borderRadius: '8px', overflow: 'hidden' }}>
                    {orderItems.map(item => (
                      <div key={item.productId} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderBottom: '1px solid #1F1F28' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '13px', color: '#F0EFF6' }}>{item.name}</div>
                          <div style={{ fontSize: '11px', color: '#55556A' }}>PKR {item.salePrice?.toLocaleString()} each</div>
                        </div>
                        <input type="number" min="1" max={item.stock} value={item.qty} onChange={e => updateQty(item.productId, e.target.value)}
                          style={{ width: '60px', background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '6px', padding: '5px 8px', color: '#F0EFF6', fontSize: '13px', outline: 'none', textAlign: 'center' }} />
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#F0EFF6', minWidth: '80px', textAlign: 'right' }}>PKR {(item.salePrice * item.qty).toLocaleString()}</div>
                        <button onClick={() => removeItem(item.productId)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#E2514A', display: 'flex' }}><Trash2 size={14} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Order Details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#8A8A9E', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Payment Method</label>
                  <select value={orderForm.paymentMethod} onChange={e => setOrderForm(f => ({ ...f, paymentMethod: e.target.value }))}
                    style={{ width: '100%', background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '8px', padding: '10px 12px', color: '#F0EFF6', fontSize: '13px', outline: 'none', cursor: 'pointer' }}>
                    {['COD', 'Card', 'JazzCash', 'EasyPaisa', 'Bank Transfer'].map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#8A8A9E', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Order Source</label>
                  <select value={orderForm.source} onChange={e => setOrderForm(f => ({ ...f, source: e.target.value }))}
                    style={{ width: '100%', background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '8px', padding: '10px 12px', color: '#F0EFF6', fontSize: '13px', outline: 'none', cursor: 'pointer' }}>
                    {['WhatsApp', 'Instagram', 'Shopify', 'Website', 'Phone', 'Walk-in'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#8A8A9E', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Shipping Fee (PKR)</label>
                  <input type="number" value={orderForm.shippingFee} onChange={e => setOrderForm(f => ({ ...f, shippingFee: e.target.value }))}
                    style={{ width: '100%', boxSizing: 'border-box', background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '8px', padding: '10px 12px', color: '#F0EFF6', fontSize: '13px', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#8A8A9E', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Discount (PKR)</label>
                  <input type="number" value={orderForm.discount} onChange={e => setOrderForm(f => ({ ...f, discount: e.target.value }))}
                    style={{ width: '100%', boxSizing: 'border-box', background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '8px', padding: '10px 12px', color: '#F0EFF6', fontSize: '13px', outline: 'none' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#8A8A9E', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Notes</label>
                <textarea value={orderForm.notes} onChange={e => setOrderForm(f => ({ ...f, notes: e.target.value }))} rows={2} placeholder="Special instructions, gift message, etc."
                  style={{ width: '100%', boxSizing: 'border-box', background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '8px', padding: '10px 12px', color: '#F0EFF6', fontSize: '13px', outline: 'none', resize: 'vertical' }} />
              </div>

              {/* Order Summary */}
              {orderItems.length > 0 && (
                <div style={{ background: '#1C1C22', borderRadius: '10px', padding: '14px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#8A8A9E', marginBottom: '6px' }}>
                    <span>Subtotal</span><span>PKR {orderSubtotal.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#8A8A9E', marginBottom: '6px' }}>
                    <span>Shipping</span><span>PKR {(parseFloat(orderForm.shippingFee) || 0).toLocaleString()}</span>
                  </div>
                  {parseFloat(orderForm.discount) > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#1DB87A', marginBottom: '6px' }}>
                      <span>Discount</span><span>- PKR {(parseFloat(orderForm.discount) || 0).toLocaleString()}</span>
                    </div>
                  )}
                  <div style={{ borderTop: '1px solid #2A2A35', paddingTop: '8px', marginTop: '4px', display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 700, color: '#F0EFF6' }}>
                    <span>Total</span><span>PKR {orderTotal.toLocaleString()}</span>
                  </div>
                </div>
              )}

              {/* Error */}
              {createError && (
                <div style={{ padding: '10px 14px', background: '#3D1414', border: '1px solid #E2514A33', borderRadius: '8px', color: '#E2514A', fontSize: '13px' }}>{createError}</div>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid #1F1F28', display: 'flex', gap: '10px', justifyContent: 'flex-end', flexShrink: 0 }}>
              <button onClick={() => setCreateModal(false)} style={{ padding: '9px 18px', background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '8px', color: '#8A8A9E', fontSize: '13px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleCreateOrder} disabled={creating}
                style={{ padding: '9px 22px', background: creating ? '#55556A' : '#7C6AF7', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: creating ? 'default' : 'pointer' }}>
                {creating ? 'Creating...' : 'Create Order'}
              </button>
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
