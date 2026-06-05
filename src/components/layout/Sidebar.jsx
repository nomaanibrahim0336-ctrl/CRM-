import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingCart, Users, MessageSquare,
  Package, BarChart2, Zap, Settings, ChevronLeft, ChevronRight,
  TrendingUp, Truck, Globe, Smartphone, Store, Layers, DollarSign,
} from 'lucide-react';

const navGroups = [
  {
    label: 'OVERVIEW',
    items: [{ label: 'Dashboard', icon: LayoutDashboard, path: '/' }],
  },
  {
    label: 'SALES',
    items: [
      { label: 'Orders', icon: ShoppingCart, path: '/orders' },
      { label: 'Customers', icon: Users, path: '/customers' },
      { label: 'DM Conversations', icon: MessageSquare, path: '/conversations' },
    ],
  },
  {
    label: 'CATALOG',
    items: [
      { label: 'Products', icon: Package, path: '/products' },
      { label: 'Inventory', icon: Layers, path: '/inventory' },
    ],
  },
  {
    label: 'PERFORMANCE',
    items: [
      { label: 'Analytics', icon: BarChart2, path: '/analytics' },
      { label: 'Financials', icon: DollarSign, path: '/financials' },
    ],
  },
  {
    label: 'LOGISTICS',
    items: [
      { label: 'Courier', icon: Truck, path: '/courier' },
    ],
  },
  {
    label: 'INTEGRATIONS',
    items: [
      { label: 'Integrations', icon: Zap, path: '/integrations' },
    ],
  },
  {
    label: 'SETTINGS',
    items: [
      { label: 'Settings', icon: Settings, path: '/settings' },
    ],
  },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const w = collapsed ? '64px' : '240px';

  return (
    <div style={{
      width: w,
      minWidth: w,
      height: '100%',
      background: '#141418',
      borderRight: '1px solid #2A2A35',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.2s ease, min-width 0.2s ease',
      overflow: 'hidden',
      position: 'relative',
    }}>
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', paddingTop: '8px' }}>
        {navGroups.map((group) => (
          <div key={group.label} style={{ marginBottom: '4px' }}>
            {!collapsed && (
              <div style={{
                padding: '12px 16px 4px',
                fontSize: '10px',
                fontWeight: 700,
                color: '#55556A',
                letterSpacing: '0.08em',
                whiteSpace: 'nowrap',
              }}>
                {group.label}
              </div>
            )}
            {collapsed && <div style={{ height: '8px' }} />}
            {group.items.map((item) => {
              const active = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: collapsed ? '10px' : '9px 16px',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    textDecoration: 'none',
                    color: active ? '#7C6AF7' : '#8A8A9E',
                    background: active ? '#2A2550' : 'transparent',
                    borderLeft: active ? '3px solid #7C6AF7' : '3px solid transparent',
                    borderRadius: collapsed ? '8px' : '0',
                    margin: collapsed ? '2px 8px' : '0',
                    transition: 'all 0.1s',
                    fontSize: '13px',
                    fontWeight: active ? 600 : 400,
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={e => {
                    if (!active) {
                      e.currentTarget.style.background = '#23232B';
                      e.currentTarget.style.color = '#F0EFF6';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!active) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#8A8A9E';
                    }
                  }}
                >
                  <Icon size={16} style={{ flexShrink: 0 }} />
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              );
            })}
          </div>
        ))}
      </div>

      {/* Collapse toggle */}
      <div style={{
        borderTop: '1px solid #2A2A35',
        padding: '12px',
        display: 'flex',
        justifyContent: collapsed ? 'center' : 'flex-end',
      }}>
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            background: '#1C1C22',
            border: '1px solid #2A2A35',
            borderRadius: '6px',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#8A8A9E',
          }}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>
    </div>
  );
}
