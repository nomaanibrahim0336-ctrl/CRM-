import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const typeConfig = {
  success: { bg: '#0F3D2A', border: '#1DB87A44', color: '#1DB87A', Icon: CheckCircle },
  error:   { bg: '#3D1414', border: '#E2514A44', color: '#E2514A', Icon: XCircle },
  warning: { bg: '#3D2D0A', border: '#F5A62344', color: '#F5A623', Icon: AlertCircle },
  info:    { bg: '#2A2550', border: '#7C6AF744', color: '#7C6AF7', Icon: Info },
};

function Toast({ id, message, type, onRemove }) {
  const [visible, setVisible] = useState(false);
  const cfg = typeConfig[type] || typeConfig.info;
  const { Icon } = cfg;

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onRemove(id), 300);
    }, 2700);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      background: cfg.bg,
      border: `1px solid ${cfg.border}`,
      borderRadius: '10px',
      padding: '12px 16px',
      minWidth: '280px',
      maxWidth: '380px',
      boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
      transform: visible ? 'translateX(0)' : 'translateX(120%)',
      opacity: visible ? 1 : 0,
      transition: 'transform 0.3s ease, opacity 0.3s ease',
    }}>
      <Icon size={16} color={cfg.color} style={{ flexShrink: 0 }} />
      <span style={{ fontSize: '13px', color: '#F0EFF6', flex: 1 }}>{message}</span>
      <button
        onClick={() => onRemove(id)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#55556A', display: 'flex', padding: 0 }}
      >
        <X size={14} />
      </button>
    </div>
  );
}

export function ToastContainer({ toasts, removeToast }) {
  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      pointerEvents: 'none',
    }}>
      {toasts.map(t => (
        <div key={t.id} style={{ pointerEvents: 'auto' }}>
          <Toast {...t} onRemove={removeToast} />
        </div>
      ))}
    </div>
  );
}
