import React from 'react';
import { Search, Bell } from 'lucide-react';

export default function Topbar() {
  return (
    <div style={{
      height: '60px',
      background: '#141418',
      borderBottom: '1px solid #2A2A35',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '160px' }}>
        <div style={{
          width: '28px', height: '28px',
          background: 'linear-gradient(135deg, #7C6AF7, #9180FF)',
          borderRadius: '7px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '12px', fontWeight: 800, color: '#fff',
        }}>C</div>
        <span style={{ fontWeight: 700, fontSize: '16px', color: '#F0EFF6' }}>CRM</span>
        <span style={{
          fontSize: '10px', fontWeight: 600, padding: '2px 6px',
          background: '#2A2550', color: '#7C6AF7', borderRadius: '4px',
          border: '1px solid #7C6AF733',
        }}>PRO</span>
      </div>

      {/* Search */}
      <div style={{
        flex: 1, maxWidth: '480px', margin: '0 24px',
        position: 'relative',
      }}>
        <Search size={14} style={{
          position: 'absolute', left: '12px', top: '50%',
          transform: 'translateY(-50%)', color: '#55556A',
        }} />
        <input
          placeholder="Search orders, customers, products..."
          style={{
            width: '100%',
            background: '#1C1C22',
            border: '1px solid #2A2A35',
            borderRadius: '8px',
            padding: '8px 12px 8px 34px',
            color: '#F0EFF6',
            fontSize: '13px',
            outline: 'none',
          }}
          onFocus={e => e.target.style.borderColor = '#7C6AF7'}
          onBlur={e => e.target.style.borderColor = '#2A2A35'}
        />
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '160px', justifyContent: 'flex-end' }}>
        <div style={{ position: 'relative' }}>
          <button style={{
            background: '#1C1C22', border: '1px solid #2A2A35',
            borderRadius: '8px', width: '36px', height: '36px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#8A8A9E',
          }}>
            <Bell size={16} />
          </button>
          <span style={{
            position: 'absolute', top: '-4px', right: '-4px',
            width: '16px', height: '16px', borderRadius: '50%',
            background: '#E2514A', color: '#fff',
            fontSize: '10px', fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>3</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #7C6AF7, #3A8AE8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '13px', fontWeight: 700, color: '#fff',
            cursor: 'pointer',
          }}>N</div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#F0EFF6', lineHeight: 1.2 }}>Noman</div>
            <div style={{ fontSize: '11px', color: '#55556A' }}>Admin</div>
          </div>
        </div>
      </div>
    </div>
  );
}
