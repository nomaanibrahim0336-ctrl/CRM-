import React from 'react';

export default function Button({ children, variant = 'primary', size = 'md', onClick, style = {}, disabled = false, type = 'button' }) {
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    borderRadius: '8px',
    fontWeight: 500,
    fontFamily: 'DM Sans, sans-serif',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.15s',
    border: 'none',
    outline: 'none',
    opacity: disabled ? 0.5 : 1,
  };

  const sizes = {
    sm: { padding: '5px 12px', fontSize: '12px' },
    md: { padding: '8px 16px', fontSize: '13px' },
    lg: { padding: '10px 20px', fontSize: '14px' },
  };

  const variants = {
    primary: { background: '#7C6AF7', color: '#fff' },
    secondary: { background: 'transparent', color: '#F0EFF6', border: '1px solid #2A2A35' },
    ghost: { background: 'transparent', color: '#8A8A9E', border: 'none' },
    danger: { background: '#3D1414', color: '#E2514A', border: '1px solid #E2514A33' },
    success: { background: '#0F3D2A', color: '#1DB87A', border: '1px solid #1DB87A33' },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{ ...base, ...sizes[size], ...variants[variant], ...style }}
    >
      {children}
    </button>
  );
}
