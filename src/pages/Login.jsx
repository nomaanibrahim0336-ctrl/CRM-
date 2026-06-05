import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        await register(form.name, form.email, form.password);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#0D0D0F', display: 'flex',
      alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif',
    }}>
      <div style={{ width: '100%', maxWidth: 420, padding: '0 24px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: 'linear-gradient(135deg, #6C63FF, #4ECDC4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', fontSize: 24, fontWeight: 800, color: '#fff',
          }}>S</div>
          <h1 style={{ color: '#fff', fontSize: 24, fontWeight: 700, margin: 0 }}>SPUNK CRM</h1>
          <p style={{ color: '#666', fontSize: 14, marginTop: 6 }}>
            {mode === 'login' ? 'Sign in to your dashboard' : 'Create your admin account'}
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: '#18181B', border: '1px solid #27272A',
          borderRadius: 20, padding: 32,
        }}>
          {error && (
            <div style={{
              background: '#3f1515', border: '1px solid #7f2020',
              borderRadius: 10, padding: '12px 16px', marginBottom: 20,
              color: '#ff6b6b', fontSize: 14,
            }}>{error}</div>
          )}

          <form onSubmit={handle}>
            {mode === 'register' && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ color: '#aaa', fontSize: 13, display: 'block', marginBottom: 6 }}>Full Name</label>
                <input
                  type="text" required placeholder="Nomaan Ibrahim"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  style={inputStyle}
                />
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <label style={{ color: '#aaa', fontSize: 13, display: 'block', marginBottom: 6 }}>Email</label>
              <input
                type="email" required placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ color: '#aaa', fontSize: 13, display: 'block', marginBottom: 6 }}>Password</label>
              <input
                type="password" required placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                style={inputStyle}
              />
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '14px',
              background: loading ? '#3a3a4a' : 'linear-gradient(135deg, #6C63FF, #4ECDC4)',
              border: 'none', borderRadius: 12, color: '#fff',
              fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'opacity 0.2s',
            }}>
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', color: '#666', fontSize: 14, marginTop: 20, marginBottom: 0 }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <span
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
              style={{ color: '#6C63FF', cursor: 'pointer', fontWeight: 600 }}
            >
              {mode === 'login' ? 'Create one' : 'Sign in'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '12px 14px',
  background: '#0D0D0F', border: '1px solid #27272A',
  borderRadius: 10, color: '#fff', fontSize: 14,
  outline: 'none', boxSizing: 'border-box',
};
