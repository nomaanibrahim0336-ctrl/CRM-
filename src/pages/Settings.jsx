import React, { useState } from 'react';
import { User, Bell, Shield, Palette, Users, Save } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
];

const teamMembers = [
  { name: 'Noman Ibrahim', role: 'Admin', avatar: 'NI', email: 'noman@store.pk', status: 'active' },
  { name: 'Ayesha Khan', role: 'Sales Manager', avatar: 'AK', email: 'ayesha@store.pk', status: 'active' },
  { name: 'Raza Ali', role: 'Support Agent', avatar: 'RA', email: 'raza@store.pk', status: 'active' },
  { name: 'Mehwish Siddiqui', role: 'Support Agent', avatar: 'MS', email: 'mehwish@store.pk', status: 'inactive' },
];

function SettingRow({ label, description, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid #1F1F28' }}>
      <div>
        <div style={{ fontSize: '14px', color: '#F0EFF6', fontWeight: 500 }}>{label}</div>
        {description && <div style={{ fontSize: '12px', color: '#55556A', marginTop: '2px' }}>{description}</div>}
      </div>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button onClick={() => onChange(!checked)} style={{
      width: '40px', height: '22px', borderRadius: '11px', cursor: 'pointer', border: 'none',
      background: checked ? '#7C6AF7' : '#2A2A35', position: 'relative', transition: 'background 0.2s',
      flexShrink: 0,
    }}>
      <span style={{ position: 'absolute', top: '3px', left: checked ? '21px' : '3px', width: '16px', height: '16px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
    </button>
  );
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [notifications, setNotifications] = useState({ orders: true, messages: true, payments: true, shipping: false, marketing: false });

  return (
    <PageWrapper title="Settings" subtitle="Manage your account and preferences">
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '20px' }}>
        {/* Sidebar */}
        <div style={{ background: '#141418', border: '1px solid #2A2A35', borderRadius: '12px', padding: '8px', height: 'fit-content' }}>
          {tabs.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                background: active ? '#2A2550' : 'transparent',
                color: active ? '#7C6AF7' : '#8A8A9E', fontSize: '13px', fontWeight: active ? 600 : 400,
                textAlign: 'left', transition: 'all 0.15s',
              }}>
                <Icon size={15} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div>
          {activeTab === 'profile' && (
            <Card>
              <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: '20px' }}>Profile Settings</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #1F1F28' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, #7C6AF7, #3A8AE8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 700, color: '#fff' }}>N</div>
                <div>
                  <div style={{ fontWeight: 600, color: '#F0EFF6' }}>Noman Ibrahim</div>
                  <div style={{ fontSize: '12px', color: '#55556A', marginTop: '2px' }}>nomaan.ibrahim0336@gmail.com</div>
                </div>
                <Button variant="secondary" size="sm" style={{ marginLeft: 'auto' }}>Change Photo</Button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {[['Full Name', 'Noman Ibrahim'], ['Email', 'nomaan.ibrahim0336@gmail.com'], ['Phone', '+92 300 0000000'], ['Business Name', 'My Store PK']].map(([label, val]) => (
                  <div key={label}>
                    <label style={{ fontSize: '12px', color: '#8A8A9E', display: 'block', marginBottom: '6px' }}>{label}</label>
                    <input defaultValue={val} style={{ width: '100%', background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '8px', padding: '9px 12px', color: '#F0EFF6', fontSize: '13px', outline: 'none' }}
                      onFocus={e => e.target.style.borderColor = '#7C6AF7'}
                      onBlur={e => e.target.style.borderColor = '#2A2A35'} />
                  </div>
                ))}
              </div>
              <Button variant="primary" style={{ marginTop: '20px' }}><Save size={14} /> Save Changes</Button>
            </Card>
          )}

          {activeTab === 'team' && (
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ fontWeight: 600, fontSize: '15px' }}>Team Members</div>
                <Button variant="primary" size="sm"><Users size={13} /> Invite Member</Button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {teamMembers.map(m => (
                  <div key={m.email} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', borderRadius: '8px', transition: 'background 0.1s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#1C1C22'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#2A2550', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: '#7C6AF7' }}>{m.avatar}</div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#F0EFF6' }}>{m.name}</div>
                        <div style={{ fontSize: '11px', color: '#55556A' }}>{m.email}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '5px', background: '#1C1C22', color: '#8A8A9E', border: '1px solid #2A2A35' }}>{m.role}</span>
                      <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: m.status === 'active' ? '#1DB87A' : '#55556A' }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: '4px' }}>Notification Preferences</div>
              <div style={{ fontSize: '12px', color: '#55556A', marginBottom: '20px' }}>Choose what you want to be notified about</div>
              {[
                ['New Orders', 'Get notified when a new order is placed', 'orders'],
                ['Customer Messages', 'Receive alerts for new DMs', 'messages'],
                ['Payment Received', 'Notify on successful payments', 'payments'],
                ['Shipping Updates', 'Track courier status changes', 'shipping'],
                ['Marketing Reports', 'Weekly performance summaries', 'marketing'],
              ].map(([label, desc, key]) => (
                <SettingRow key={key} label={label} description={desc}>
                  <Toggle checked={notifications[key]} onChange={v => setNotifications(prev => ({ ...prev, [key]: v }))} />
                </SettingRow>
              ))}
            </Card>
          )}

          {activeTab === 'security' && (
            <Card>
              <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: '20px' }}>Security Settings</div>
              <SettingRow label="Two-Factor Authentication" description="Add an extra layer of security to your account">
                <Button variant="success" size="sm">Enable 2FA</Button>
              </SettingRow>
              <SettingRow label="Change Password" description="Last changed 30 days ago">
                <Button variant="secondary" size="sm">Update Password</Button>
              </SettingRow>
              <SettingRow label="Active Sessions" description="2 active sessions">
                <Button variant="danger" size="sm">Revoke All</Button>
              </SettingRow>
              <SettingRow label="API Keys" description="Manage API access tokens">
                <Button variant="secondary" size="sm">Manage Keys</Button>
              </SettingRow>
            </Card>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
