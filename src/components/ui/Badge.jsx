import React from 'react';

const statusColors = {
  Delivered: { bg: '#0F3D2A', color: '#1DB87A', border: '#1DB87A33' },
  Shipped: { bg: '#0D2A4A', color: '#3A8AE8', border: '#3A8AE833' },
  Processing: { bg: '#2A2550', color: '#7C6AF7', border: '#7C6AF733' },
  Pending: { bg: '#3D2D0A', color: '#F5A623', border: '#F5A62333' },
  Cancelled: { bg: '#3D1414', color: '#E2514A', border: '#E2514A33' },
  'Low Stock': { bg: '#3D2D0A', color: '#F5A623', border: '#F5A62333' },
  'Out of Stock': { bg: '#3D1414', color: '#E2514A', border: '#E2514A33' },
  Active: { bg: '#0F3D2A', color: '#1DB87A', border: '#1DB87A33' },
  VIP: { bg: '#2A2550', color: '#7C6AF7', border: '#7C6AF733' },
  Regular: { bg: '#1C1C22', color: '#8A8A9E', border: '#2A2A35' },
  New: { bg: '#0D2A4A', color: '#3A8AE8', border: '#3A8AE833' },
  Open: { bg: '#0F3D2A', color: '#1DB87A', border: '#1DB87A33' },
  Closed: { bg: '#1C1C22', color: '#8A8A9E', border: '#2A2A35' },
  Connected: { bg: '#0F3D2A', color: '#1DB87A', border: '#1DB87A33' },
  Disconnected: { bg: '#3D1414', color: '#E2514A', border: '#E2514A33' },
};

export default function Badge({ status, children }) {
  const label = status || children;
  const colors = statusColors[label] || { bg: '#1C1C22', color: '#8A8A9E', border: '#2A2A35' };

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '2px 10px',
      borderRadius: '999px',
      fontSize: '11px',
      fontWeight: 600,
      letterSpacing: '0.02em',
      background: colors.bg,
      color: colors.color,
      border: `1px solid ${colors.border}`,
      whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  );
}
