import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, ShoppingBag, MessageSquare, Truck, AlertCircle, CreditCard, User, ChevronDown, Keyboard, HelpCircle, Store, LogOut, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { orders, customers, products } from '../../data/mockData';
import { useKeyboard } from '../../hooks/useKeyboard';
import { useAuth } from '../../context/AuthContext';

const notifications = [
  { id: 1, icon: ShoppingBag, text: 'New order #ORD-7841 from Aisha Malik', time: '2 min ago', unread: true, color: '#7C6AF7' },
  { id: 2, icon: MessageSquare, text: 'Sara Khan sent a message on Instagram', time: '8 min ago', unread: true, color: '#E1306C' },
  { id: 3, icon: Truck, text: 'Order #ORD-7840 shipped via Leopard', time: '22 min ago', unread: true, color: '#F5A623' },
  { id: 4, icon: AlertCircle, text: 'Low stock alert: Samsung Galaxy Buds (7 left)', time: '45 min ago', unread: true, color: '#E2514A' },
  { id: 5, icon: CreditCard, text: 'Payment received PKR 19,800', time: '1 hr ago', unread: false, color: '#1DB87A' },
  { id: 6, icon: MessageSquare, text: 'Zainab Hussain is asking about bulk pricing', time: '2 hr ago', unread: false, color: '#3A8AE8' },
];

const pages = [
  { name: 'Dashboard', path: '/' },
  { name: 'Orders', path: '/orders' },
  { name: 'Customers', path: '/customers' },
  { name: 'Conversations', path: '/conversations' },
  { name: 'Products', path: '/products' },
  { name: 'Analytics', path: '/analytics' },
  { name: 'Inventory', path: '/inventory' },
  { name: 'Financials', path: '/financials' },
  { name: 'Courier', path: '/courier' },
  { name: 'Integrations', path: '/integrations' },
  { name: 'Settings', path: '/settings' },
];

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

export default function Topbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [notifList, setNotifList] = useState(notifications);

  const notifRef = useRef(null);
  const avatarRef = useRef(null);
  const searchInputRef = useRef(null);

  useClickOutside(notifRef, () => setNotifOpen(false));
  useClickOutside(avatarRef, () => setAvatarOpen(false));

  useKeyboard('k', () => setSearchOpen(true), []);

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchInputRef.current?.focus(), 50);
  }, [searchOpen]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') { setSearchOpen(false); setSearchQuery(''); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const unreadCount = notifList.filter(n => n.unread).length;

  const getSearchResults = () => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    const matchedOrders = orders.filter(o => o.id.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q)).slice(0, 3);
    const matchedCustomers = customers.filter(c => c.name.toLowerCase().includes(q) || c.phone.includes(q)).slice(0, 3);
    const matchedProducts = products.filter(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)).slice(0, 3);
    const matchedPages = pages.filter(p => p.name.toLowerCase().includes(q));
    return { orders: matchedOrders, customers: matchedCustomers, products: matchedProducts, pages: matchedPages };
  };

  const results = getSearchResults();

  return (
    <>
      <div style={{
        height: '60px', background: '#141418', borderBottom: '1px solid #2A2A35',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', position: 'sticky', top: 0, zIndex: 100, flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '160px' }}>
          <div style={{ width: '28px', height: '28px', background: 'linear-gradient(135deg, #7C6AF7, #9180FF)', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, color: '#fff' }}>C</div>
          <span style={{ fontWeight: 700, fontSize: '16px', color: '#F0EFF6' }}>CRM</span>
          <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 6px', background: '#2A2550', color: '#7C6AF7', borderRadius: '4px', border: '1px solid #7C6AF733' }}>PRO</span>
        </div>

        {/* Search Bar */}
        <div style={{ flex: 1, maxWidth: '480px', margin: '0 24px', position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#55556A' }} />
          <input
            placeholder="Search orders, customers, products..."
            readOnly
            onClick={() => setSearchOpen(true)}
            style={{ width: '100%', background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '8px', padding: '8px 60px 8px 34px', color: '#F0EFF6', fontSize: '13px', outline: 'none', cursor: 'pointer' }}
          />
          <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: '#2A2A35', borderRadius: '4px', padding: '2px 6px', fontSize: '11px', color: '#55556A', fontFamily: 'monospace' }}>⌘K</div>
        </div>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '160px', justifyContent: 'flex-end' }}>
          {/* Notification Bell */}
          <div ref={notifRef} style={{ position: 'relative' }}>
            <button onClick={() => { setNotifOpen(!notifOpen); setAvatarOpen(false); }} style={{ background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '8px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#8A8A9E' }}>
              <Bell size={16} />
            </button>
            {unreadCount > 0 && (
              <span style={{ position: 'absolute', top: '-4px', right: '-4px', width: '16px', height: '16px', borderRadius: '50%', background: '#E2514A', color: '#fff', fontSize: '10px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{unreadCount}</span>
            )}
            {notifOpen && (
              <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: '360px', background: '#141418', border: '1px solid #2A2A35', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', zIndex: 300 }}>
                <div style={{ padding: '14px 16px', borderBottom: '1px solid #1F1F28', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, color: '#F0EFF6', fontSize: '14px' }}>Notifications</span>
                  <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '10px', background: '#E2514A22', color: '#E2514A', fontWeight: 600 }}>{unreadCount} unread</span>
                </div>
                <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
                  {notifList.map(n => {
                    const Icon = n.icon;
                    return (
                      <div key={n.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px 16px', borderBottom: '1px solid #1F1F28', background: n.unread ? '#1C1C2233' : 'transparent', cursor: 'pointer' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#23232B'}
                        onMouseLeave={e => e.currentTarget.style.background = n.unread ? '#1C1C2233' : 'transparent'}
                      >
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: n.color + '22', border: `1px solid ${n.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Icon size={14} color={n.color} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '12px', color: '#F0EFF6', lineHeight: 1.4 }}>{n.text}</div>
                          <div style={{ fontSize: '11px', color: '#55556A', marginTop: '3px' }}>{n.time}</div>
                        </div>
                        {n.unread && <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#7C6AF7', flexShrink: 0, marginTop: '4px' }} />}
                      </div>
                    );
                  })}
                </div>
                <div style={{ padding: '10px 16px' }}>
                  <button onClick={() => setNotifList(prev => prev.map(n => ({ ...n, unread: false })))} style={{ width: '100%', padding: '8px', background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '8px', color: '#8A8A9E', fontSize: '12px', cursor: 'pointer', fontWeight: 500 }}>
                    Mark all read
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Avatar */}
          <div ref={avatarRef} style={{ position: 'relative' }}>
            <div onClick={() => { setAvatarOpen(!avatarOpen); setNotifOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '4px 8px', borderRadius: '8px', border: '1px solid transparent' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#2A2A35'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
            >
              <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg, #7C6AF7, #3A8AE8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: '#fff' }}>{(user?.name || 'U')[0].toUpperCase()}</div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#F0EFF6', lineHeight: 1.2 }}>{user?.name?.split(' ')[0] || 'User'}</div>
                <div style={{ fontSize: '11px', color: '#55556A' }}>{user?.role || 'Admin'}</div>
              </div>
              <ChevronDown size={12} color="#55556A" />
            </div>
            {avatarOpen && (
              <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: '240px', background: '#141418', border: '1px solid #2A2A35', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', zIndex: 300, overflow: 'hidden' }}>
                {/* User header */}
                <div style={{ padding: '16px', background: '#1C1C22', borderBottom: '1px solid #1F1F28', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #7C6AF7, #3A8AE8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: 700, color: '#fff' }}>{(user?.name || 'U')[0].toUpperCase()}</div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#F0EFF6' }}>{user?.name || 'User'}</div>
                    <div style={{ fontSize: '11px', color: '#55556A', marginTop: '1px' }}>{user?.email || ''}</div>
                  </div>
                </div>
                {/* Menu items */}
                {[
                  { icon: User, label: 'Profile Settings', path: '/settings' },
                  { icon: Store, label: 'My Store', path: null },
                  { icon: HelpCircle, label: 'Help & Support', path: null },
                  { icon: Keyboard, label: 'Keyboard Shortcuts', path: null },
                ].map(item => {
                  const Icon = item.icon;
                  return (
                    <button key={item.label} onClick={() => { setAvatarOpen(false); if (item.path) navigate(item.path); }}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', color: '#8A8A9E', fontSize: '13px', textAlign: 'left' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#23232B'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      <Icon size={14} /> {item.label}
                    </button>
                  );
                })}
                <div style={{ borderTop: '1px solid #1F1F28', margin: '4px 0' }} />
                <button onClick={() => { setAvatarOpen(false); logout(); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', color: '#E2514A', fontSize: '13px', textAlign: 'left' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#3D141422'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search Modal */}
      {searchOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '80px' }}
          onClick={(e) => { if (e.target === e.currentTarget) { setSearchOpen(false); setSearchQuery(''); } }}>
          <div style={{ width: '620px', background: '#141418', border: '1px solid #2A2A35', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.7)', maxHeight: '70vh', display: 'flex', flexDirection: 'column' }}>
            {/* Search input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', borderBottom: '1px solid #1F1F28' }}>
              <Search size={18} color="#7C6AF7" />
              <input
                ref={searchInputRef}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search orders, customers, products, pages..."
                style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#F0EFF6', fontSize: '15px' }}
              />
              <kbd style={{ background: '#2A2A35', border: '1px solid #3A3A45', borderRadius: '4px', padding: '2px 6px', fontSize: '11px', color: '#55556A' }}>ESC</kbd>
            </div>

            <div style={{ overflowY: 'auto', flex: 1 }}>
              {!searchQuery.trim() ? (
                <div style={{ padding: '24px', textAlign: 'center', color: '#55556A', fontSize: '13px' }}>
                  <Search size={32} color="#2A2A35" style={{ marginBottom: '8px' }} />
                  <div>Start typing to search...</div>
                  <div style={{ marginTop: '8px', fontSize: '12px' }}>Orders · Customers · Products · Pages</div>
                </div>
              ) : results && Object.values(results).every(a => a.length === 0) ? (
                <div style={{ padding: '24px', textAlign: 'center', color: '#55556A', fontSize: '13px' }}>No results for "{searchQuery}"</div>
              ) : results && (
                <>
                  {results.orders.length > 0 && (
                    <ResultGroup title="Orders">
                      {results.orders.map(o => (
                        <ResultItem key={o.id} onClick={() => { navigate('/orders'); setSearchOpen(false); setSearchQuery(''); }}>
                          <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#7C6AF7', fontSize: '12px' }}>{o.id}</span>
                          <span style={{ color: '#F0EFF6', fontSize: '13px' }}>{o.customer}</span>
                          <span style={{ color: '#55556A', fontSize: '12px', marginLeft: 'auto' }}>PKR {o.amount.toLocaleString()}</span>
                        </ResultItem>
                      ))}
                    </ResultGroup>
                  )}
                  {results.customers.length > 0 && (
                    <ResultGroup title="Customers">
                      {results.customers.map(c => (
                        <ResultItem key={c.id} onClick={() => { navigate('/customers'); setSearchOpen(false); setSearchQuery(''); }}>
                          <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#2A2550', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 700, color: '#7C6AF7', flexShrink: 0 }}>{c.avatar}</div>
                          <span style={{ color: '#F0EFF6', fontSize: '13px' }}>{c.name}</span>
                          <span style={{ color: '#55556A', fontSize: '12px', marginLeft: 'auto' }}>{c.city}</span>
                        </ResultItem>
                      ))}
                    </ResultGroup>
                  )}
                  {results.products.length > 0 && (
                    <ResultGroup title="Products">
                      {results.products.map(p => (
                        <ResultItem key={p.id} onClick={() => { navigate('/products'); setSearchOpen(false); setSearchQuery(''); }}>
                          <span style={{ color: '#F0EFF6', fontSize: '13px' }}>{p.name}</span>
                          <span style={{ color: '#55556A', fontSize: '11px', fontFamily: 'monospace' }}>{p.sku}</span>
                          <span style={{ color: '#55556A', fontSize: '12px', marginLeft: 'auto' }}>PKR {p.price.toLocaleString()}</span>
                        </ResultItem>
                      ))}
                    </ResultGroup>
                  )}
                  {results.pages.length > 0 && (
                    <ResultGroup title="Pages">
                      {results.pages.map(p => (
                        <ResultItem key={p.path} onClick={() => { navigate(p.path); setSearchOpen(false); setSearchQuery(''); }}>
                          <span style={{ color: '#F0EFF6', fontSize: '13px' }}>{p.name}</span>
                          <span style={{ color: '#55556A', fontSize: '11px', marginLeft: 'auto' }}>{p.path}</span>
                        </ResultItem>
                      ))}
                    </ResultGroup>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ResultGroup({ title, children }) {
  return (
    <div style={{ padding: '8px 0' }}>
      <div style={{ padding: '6px 20px', fontSize: '10px', fontWeight: 600, color: '#55556A', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{title}</div>
      {children}
    </div>
  );
}

function ResultItem({ onClick, children }) {
  return (
    <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 20px', cursor: 'pointer' }}
      onMouseEnter={e => e.currentTarget.style.background = '#1C1C22'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      {children}
    </div>
  );
}
