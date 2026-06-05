import React, { useState } from 'react';
import { Store, Zap, MessageSquare, Truck, Globe, Smartphone, RefreshCw, Settings, FileText, X, Download } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import Button from '../components/ui/Button';
import StatusDot from '../components/ui/StatusDot';
import { exportCsv } from '../utils/exportCsv';
import { useToast } from '../context/ToastContext';

const integrations = [
  { id: 'shopify', name: 'Shopify', description: 'Sync orders, products, and inventory from your Shopify store.', icon: Store, iconColor: '#96BF48', status: 'connected', lastSync: '2 min ago', stats: [{ label: 'Products Synced', value: '247' }, { label: 'Orders Today', value: '34' }] },
  { id: 'meta', name: 'Meta Ads', description: 'Track Facebook & Instagram ad performance, leads, and conversions.', icon: Zap, iconColor: '#1877F2', status: 'connected', lastSync: '15 min ago', stats: [{ label: 'Active Campaigns', value: '4' }, { label: 'Daily Spend', value: 'PKR 2.4K' }] },
  { id: 'whatsapp', name: 'WhatsApp / Inro', description: 'AI-powered WhatsApp automation for order taking and customer support.', icon: MessageSquare, iconColor: '#25D366', status: 'connected', lastSync: '1 min ago', stats: [{ label: 'Active Convs', value: '23' }, { label: 'Bot Handled', value: '89%' }] },
  { id: 'courier', name: 'Courier Services', description: 'TCS, Leopard, BlueEx, PostEx — unified courier management.', icon: Truck, iconColor: '#F5A623', status: 'connected', lastSync: '5 min ago', stats: [{ label: 'Active Couriers', value: '4' }, { label: 'Shipments Today', value: '18' }] },
  { id: 'website', name: 'Website', description: 'Connect your website to sync leads, orders, and customer data.', icon: Globe, iconColor: '#3A8AE8', status: 'disconnected', lastSync: 'Never', stats: [] },
  { id: 'mobile', name: 'Mobile App', description: 'Link your iOS and Android app for push notifications and order sync.', icon: Smartphone, iconColor: '#7C6AF7', status: 'disconnected', lastSync: 'Never', stats: [] },
];

const generateLogs = (name) => [
  { time: '2024-12-04 10:32', event: `${name} sync completed`, status: 'Success', details: '247 records updated' },
  { time: '2024-12-04 10:00', event: 'Webhook received', status: 'Success', details: 'Order #ORD-7841 synced' },
  { time: '2024-12-04 09:45', event: 'API rate limit warning', status: 'Warning', details: '80% of hourly quota used' },
  { time: '2024-12-04 09:30', event: 'Product inventory update', status: 'Success', details: '12 products updated' },
  { time: '2024-12-04 09:00', event: 'Sync failed — timeout', status: 'Error', details: 'Connection timed out after 30s' },
  { time: '2024-12-04 08:30', event: `${name} sync completed`, status: 'Success', details: '198 records updated' },
  { time: '2024-12-04 08:00', event: 'Auth token refreshed', status: 'Success', details: 'Token valid for 24h' },
  { time: '2024-12-03 22:00', event: 'Nightly sync completed', status: 'Success', details: '312 records processed' },
  { time: '2024-12-03 18:00', event: 'Partial sync failure', status: 'Warning', details: '3 records failed to sync' },
  { time: '2024-12-03 12:00', event: 'Manual sync triggered', status: 'Success', details: 'Triggered by admin' },
];

const statusColor = { Success: '#1DB87A', Warning: '#F5A623', Error: '#E2514A' };
const statusBg = { Success: '#0F3D2A', Warning: '#3D2D0A', Error: '#3D1414' };

export default function Integrations() {
  const addToast = useToast();
  const [syncState, setSyncState] = useState({});
  const [lastSyncMap, setLastSyncMap] = useState({});
  const [logsModal, setLogsModal] = useState(null);
  const [logFilter, setLogFilter] = useState('All');

  const handleSync = (id) => {
    setSyncState(prev => ({ ...prev, [id]: 'syncing' }));
    setTimeout(() => {
      setSyncState(prev => ({ ...prev, [id]: 'done' }));
      setLastSyncMap(prev => ({ ...prev, [id]: 'just now' }));
      setTimeout(() => setSyncState(prev => ({ ...prev, [id]: null })), 1000);
    }, 2000);
  };

  const openLogs = (name) => { setLogsModal({ name, logs: generateLogs(name) }); setLogFilter('All'); };

  const filteredLogs = logsModal?.logs.filter(l => logFilter === 'All' || l.status === logFilter) || [];

  return (
    <PageWrapper title="Integrations" subtitle="Connect your tools and services">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {integrations.map(integration => {
          const Icon = integration.icon;
          const isConnected = integration.status === 'connected';
          const state = syncState[integration.id];
          const syncLabel = state === 'syncing' ? 'Syncing...' : state === 'done' ? '✓ Synced' : 'Sync Now';

          return (
            <div key={integration.id} style={{ background: '#141418', border: '1px solid #2A2A35', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', transition: 'border-color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = integration.iconColor + '44'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#2A2A35'}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: integration.iconColor + '22', border: `1px solid ${integration.iconColor}33`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={22} color={integration.iconColor} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px', color: '#F0EFF6' }}>{integration.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '3px' }}>
                      <StatusDot status={integration.status} />
                      <span style={{ fontSize: '11px', color: isConnected ? '#1DB87A' : '#E2514A', fontWeight: 500 }}>{isConnected ? 'Connected' : 'Disconnected'}</span>
                    </div>
                  </div>
                </div>
                {isConnected && <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#55556A', display: 'flex', padding: '4px' }}><Settings size={14} /></button>}
              </div>

              <p style={{ fontSize: '12px', color: '#8A8A9E', lineHeight: 1.5, margin: 0 }}>{integration.description}</p>

              {isConnected && integration.stats.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {integration.stats.map(stat => (
                    <div key={stat.label} style={{ background: '#1C1C22', borderRadius: '8px', padding: '10px 12px' }}>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: '#F0EFF6' }}>{stat.value}</div>
                      <div style={{ fontSize: '11px', color: '#55556A', marginTop: '2px' }}>{stat.label}</div>
                    </div>
                  ))}
                </div>
              )}

              {isConnected && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#55556A' }}>
                  <RefreshCw size={11} />
                  <span>Last synced {lastSyncMap[integration.id] || integration.lastSync}</span>
                </div>
              )}

              <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                {isConnected ? (
                  <>
                    <button onClick={() => handleSync(integration.id)} disabled={state === 'syncing'} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px 12px', background: state === 'done' ? '#0F3D2A' : '#1C1C22', border: `1px solid ${state === 'done' ? '#1DB87A33' : '#2A2A35'}`, borderRadius: '8px', color: state === 'done' ? '#1DB87A' : '#8A8A9E', fontSize: '12px', fontWeight: 500, cursor: state === 'syncing' ? 'default' : 'pointer' }}>
                      <RefreshCw size={12} className={state === 'syncing' ? 'spin' : ''} />
                      {syncLabel}
                    </button>
                    <button onClick={() => openLogs(integration.name)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 12px', background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '8px', color: '#8A8A9E', fontSize: '12px', cursor: 'pointer' }}>
                      <FileText size={12} /> Logs
                    </button>
                    <button style={{ padding: '8px 12px', background: 'none', border: '1px solid #E2514A33', borderRadius: '8px', color: '#E2514A', fontSize: '12px', cursor: 'pointer' }}>Disconnect</button>
                  </>
                ) : (
                  <Button variant="primary" size="sm" style={{ flex: 1, justifyContent: 'center', background: integration.iconColor }}>Connect {integration.name}</Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Logs Modal */}
      {logsModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#141418', border: '1px solid #2A2A35', borderRadius: '14px', width: '700px', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #1F1F28', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '16px', color: '#F0EFF6' }}>{logsModal.name} Logs</span>
              <button onClick={() => setLogsModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8A8A9E' }}><X size={18} /></button>
            </div>
            <div style={{ padding: '12px 24px', borderBottom: '1px solid #1F1F28', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '4px', background: '#1C1C22', padding: '4px', borderRadius: '8px' }}>
                {['All', 'Success', 'Warning', 'Error'].map(f => (
                  <button key={f} onClick={() => setLogFilter(f)} style={{ padding: '5px 12px', borderRadius: '6px', fontSize: '12px', border: 'none', cursor: 'pointer', background: logFilter === f ? '#2A2550' : 'transparent', color: logFilter === f ? '#7C6AF7' : '#8A8A9E' }}>{f}</button>
                ))}
              </div>
              <button onClick={() => { exportCsv(`${logsModal.name.toLowerCase().replace(/\s/g, '-')}-logs.csv`, filteredLogs); addToast('Logs exported', 'success'); }}
                style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '7px', color: '#8A8A9E', fontSize: '12px', cursor: 'pointer' }}>
                <Download size={12} /> Export Logs
              </button>
            </div>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#1C1C22', position: 'sticky', top: 0 }}>
                    {['Timestamp', 'Event', 'Status', 'Details'].map(h => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#55556A', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid #1F1F28' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #1F1F28' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#23232B'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '10px 16px', fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#55556A', whiteSpace: 'nowrap' }}>{log.time}</td>
                      <td style={{ padding: '10px 16px', fontSize: '13px', color: '#F0EFF6' }}>{log.event}</td>
                      <td style={{ padding: '10px 16px' }}>
                        <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '5px', background: statusBg[log.status], color: statusColor[log.status], fontWeight: 600 }}>{log.status}</span>
                      </td>
                      <td style={{ padding: '10px 16px', fontSize: '12px', color: '#8A8A9E' }}>{log.details}</td>
                    </tr>
                  ))}
                  {filteredLogs.length === 0 && (
                    <tr><td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: '#55556A' }}>No logs matching filter</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </PageWrapper>
  );
}
