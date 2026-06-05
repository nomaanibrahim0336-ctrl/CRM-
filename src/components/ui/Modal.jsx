import React from 'react';
import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, children, width = '480px' }) {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={onClose}>
      <div style={{
        background: '#141418',
        border: '1px solid #2A2A35',
        borderRadius: '16px',
        width,
        maxWidth: '95vw',
        maxHeight: '90vh',
        overflow: 'auto',
      }} onClick={e => e.stopPropagation()}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid #1F1F28',
        }}>
          <span style={{ fontWeight: 600, fontSize: '15px', color: '#F0EFF6' }}>{title}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8A8A9E', display: 'flex' }}>
            <X size={18} />
          </button>
        </div>
        <div style={{ padding: '20px' }}>{children}</div>
      </div>
    </div>
  );
}
