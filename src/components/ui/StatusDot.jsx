import React from 'react';

const colors = {
  connected: '#1DB87A',
  disconnected: '#E2514A',
  online: '#1DB87A',
  offline: '#E2514A',
  pending: '#F5A623',
};

export default function StatusDot({ status }) {
  const color = colors[status?.toLowerCase()] || '#8A8A9E';
  return (
    <span style={{
      display: 'inline-block',
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      background: color,
      boxShadow: `0 0 6px ${color}88`,
      flexShrink: 0,
    }} />
  );
}
