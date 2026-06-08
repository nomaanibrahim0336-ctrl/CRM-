import React, { useState } from 'react';
import useIsMobile from './hooks/useIsMobile';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Topbar from './components/layout/Topbar';
import Sidebar from './components/layout/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Customers from './pages/Customers';
import Conversations from './pages/Conversations';
import Products from './pages/Products';
import Analytics from './pages/Analytics';
import Integrations from './pages/Integrations';
import Settings from './pages/Settings';
import Courier from './pages/Courier';
import Inventory from './pages/Inventory';
import Financials from './pages/Financials';

function AppShell() {
  const { user, loading } = useAuth();
  const isMobile = useIsMobile();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', background: '#0D0D0F',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ color: '#6C63FF', fontSize: 16 }}>Loading...</div>
      </div>
    );
  }

  if (!user) return <Login />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0D0D0F', overflow: 'hidden' }}>
      <Topbar onMenuClick={() => setMobileNavOpen(o => !o)} showMenu={isMobile} />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {isMobile
          ? <Sidebar mobile mobileOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
          : <Sidebar />}
        <main style={{ flex: 1, overflow: 'hidden', background: '#0D0D0F' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/conversations" element={<Conversations />} />
            <Route path="/products" element={<Products />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/financials" element={<Financials />} />
            <Route path="/courier" element={<Courier />} />
            <Route path="/integrations" element={<Integrations />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppShell />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
