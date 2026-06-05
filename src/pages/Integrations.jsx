import React from 'react';
import { Store, Zap, MessageSquare, Truck, Globe, Smartphone, RefreshCw, Settings, CheckCircle, XCircle } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import Button from '../components/ui/Button';
import StatusDot from '../components/ui/StatusDot';

const integrations = [
  {
    id: 'shopify',
    name: 'Shopify',
    description: 'Sync orders, products, and inventory from your Shopify store.',
    icon: Store,
    iconColor: '#96BF48',
    status: 'connected',
    lastSync: '2 min ago',
    stats: [{ label: 'Products Synced', value: '247' }, { label: 'Orders Today', value: '34' }],
  },
  {
    id: 'meta',
    name: 'Meta Ads',
    description: 'Track Facebook & Instagram ad performance, leads, and conversions.',
    icon: Zap,
    iconColor: '#1877F2',
    status: 'connected',
    lastSync: '15 min ago',
    stats: [{ label: 'Active Campaigns', value: '4' }, { label: 'Daily Spend', value: 'PKR 2.4K' }],
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp / Inro',
    description: 'AI-powered WhatsApp automation for order taking and customer support.',
    icon: MessageSquare,
    iconColor: '#25D366',
    status: 'connected',
    lastSync: '1 min ago',
    stats: [{ label: 'Active Convs', value: '23' }, { label: 'Bot Handled', value: '89%' }],
  },
  {
    id: 'courier',
    name: 'Courier Services',
    description: 'TCS, Leopard, BlueEx, PostEx — unified courier management.',
    icon: Truck,
    iconColor: '#F5A623',
    status: 'connected',
    lastSync: '5 min ago',
    stats: [{ label: 'Active Couriers', value: '4' }, { label: 'Shipments Today', value: '18' }],
  },
  {
    id: 'website',
    name: 'Website',
    description: 'Connect your website to sync leads, orders, and customer data.',
    icon: Globe,
    iconColor: '#3A8AE8',
    status: 'disconnected',
    lastSync: 'Never',
    stats: [{ label: 'Visitors Today', value: '—' }, { label: 'Conversions', value: '—' }],
  },
  {
    id: 'mobile',
    name: 'Mobile App',
    description: 'Link your iOS and Android app for push notifications and order sync.',
    icon: Smartphone,
    iconColor: '#7C6AF7',
    status: 'disconnected',
    lastSync: 'Never',
    stats: [{ label: 'App Installs', value: '—' }, { label: 'Active Users', value: '—' }],
  },
];

export default function Integrations() {
  return (
    <PageWrapper title="Integrations" subtitle="Connect your tools and services">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {integrations.map(integration => {
          const Icon = integration.icon;
          const isConnected = integration.status === 'connected';
          return (
            <div key={integration.id} style={{
              background: '#141418',
              border: `1px solid ${isConnected ? '#2A2A35' : '#2A2A35'}`,
              borderRadius: '12px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              transition: 'border-color 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = integration.iconColor + '44'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#2A2A35'}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '10px',
                    background: integration.iconColor + '22',
                    border: `1px solid ${integration.iconColor}33`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={22} color={integration.iconColor} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px', color: '#F0EFF6' }}>{integration.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '3px' }}>
                      <StatusDot status={integration.status} />
                      <span style={{ fontSize: '11px', color: isConnected ? '#1DB87A' : '#E2514A', fontWeight: 500 }}>
                        {isConnected ? 'Connected' : 'Disconnected'}
                      </span>
                    </div>
                  </div>
                </div>
                {isConnected && (
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#55556A', display: 'flex', padding: '4px' }}>
                    <Settings size={14} />
                  </button>
                )}
              </div>

              {/* Description */}
              <p style={{ fontSize: '12px', color: '#8A8A9E', lineHeight: 1.5, margin: 0 }}>{integration.description}</p>

              {/* Stats */}
              {isConnected && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {integration.stats.map(stat => (
                    <div key={stat.label} style={{ background: '#1C1C22', borderRadius: '8px', padding: '10px 12px' }}>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: '#F0EFF6' }}>{stat.value}</div>
                      <div style={{ fontSize: '11px', color: '#55556A', marginTop: '2px' }}>{stat.label}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Last Sync */}
              {isConnected && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#55556A' }}>
                  <RefreshCw size={11} />
                  <span>Last synced {integration.lastSync}</span>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                {isConnected ? (
                  <>
                    <Button variant="secondary" size="sm" style={{ flex: 1, justifyContent: 'center' }}><RefreshCw size={12} /> Sync Now</Button>
                    <Button variant="ghost" size="sm" style={{ color: '#E2514A', border: '1px solid #E2514A33' }}>Disconnect</Button>
                  </>
                ) : (
                  <Button variant="primary" size="sm" style={{ flex: 1, justifyContent: 'center', background: integration.iconColor }}>Connect {integration.name}</Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </PageWrapper>
  );
}
