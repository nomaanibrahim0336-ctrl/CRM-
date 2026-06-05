import React from 'react';

export default function Card({ children, style = {}, className = '' }) {
  return (
    <div
      className={className}
      style={{
        background: '#141418',
        border: '1px solid #2A2A35',
        borderRadius: '12px',
        padding: '20px',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
