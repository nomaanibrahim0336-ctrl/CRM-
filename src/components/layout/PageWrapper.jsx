import React from 'react';

export default function PageWrapper({ title, subtitle, actions, children }) {
  return (
    <div style={{ padding: '28px', height: '100%', overflowY: 'auto' }}>
      {(title || actions) && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          marginBottom: '24px',
        }}>
          <div>
            {title && <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#F0EFF6', marginBottom: '4px' }}>{title}</h1>}
            {subtitle && <p style={{ fontSize: '13px', color: '#8A8A9E' }}>{subtitle}</p>}
          </div>
          {actions && <div style={{ display: 'flex', gap: '8px' }}>{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
