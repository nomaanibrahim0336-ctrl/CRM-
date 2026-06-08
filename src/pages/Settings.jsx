import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import {
  User, Bell, Shield, Users, Save, Zap, Store, MessageCircle,
  Truck, Globe, Smartphone, RefreshCw, Link, Unlink, Eye, EyeOff,
  CheckCircle, XCircle, AlertTriangle, Copy, ExternalLink, Bot,
  Phone, Mail, Key, Webhook, Activity, Settings as SettingsIcon,
  Send, Plus, Trash2, ChevronRight, Info,
} from 'lucide-react';

// ── Shared primitives ─────────────────────────────────────

function Toggle({ checked, onChange, color = '#7C6AF7' }) {
  return (
    <button onClick={() => onChange(!checked)} style={{
      width: '40px', height: '22px', borderRadius: '11px', cursor: 'pointer', border: 'none',
      background: checked ? color : '#2A2A35', position: 'relative', transition: 'background 0.2s', flexShrink: 0,
    }}>
      <span style={{ position: 'absolute', top: '3px', left: checked ? '21px' : '3px', width: '16px', height: '16px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
    </button>
  );
}

function SettingRow({ label, description, children, borderless }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: borderless ? 'none' : '1px solid #1F1F28', gap: '20px' }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '13px', color: '#F0EFF6', fontWeight: 500 }}>{label}</div>
        {description && <div style={{ fontSize: '11px', color: '#55556A', marginTop: '2px', lineHeight: 1.4 }}>{description}</div>}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  );
}

function Field({ label, value, type = 'text', placeholder, mono, onChange, readOnly, onFocus, onBlur }) {
  const [show, setShow] = useState(false);
  const isSecret = type === 'password';
  return (
    <div>
      <label style={{ display: 'block', fontSize: '11px', color: '#8A8A9E', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          type={isSecret && !show ? 'password' : 'text'}
          defaultValue={value}
          placeholder={placeholder}
          readOnly={readOnly}
          onChange={onChange}
          style={{
            width: '100%', background: readOnly ? '#0D0D0F' : '#1C1C22', border: '1px solid #2A2A35', borderRadius: '8px',
            padding: isSecret ? '9px 36px 9px 12px' : '9px 12px', color: '#F0EFF6', fontSize: '13px',
            outline: 'none', boxSizing: 'border-box', fontFamily: mono ? 'JetBrains Mono, monospace' : 'inherit',
            cursor: readOnly ? 'default' : 'text',
          }}
          onFocus={e => { if (!readOnly) e.target.style.borderColor = '#7C6AF7'; if (onFocus) onFocus(e); }}
          onBlur={e => { e.target.style.borderColor = '#2A2A35'; if (onBlur) onBlur(e); }}
        />
        {isSecret && (
          <button onClick={() => setShow(s => !s)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#55556A', display: 'flex' }}>
            {show ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        )}
      </div>
    </div>
  );
}

function StatusPill({ connected }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 600, background: connected ? '#0F3D2A' : '#3D1414', color: connected ? '#1DB87A' : '#E2514A', border: `1px solid ${connected ? '#1DB87A33' : '#E2514A33'}` }}>
      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
      {connected ? 'Connected' : 'Disconnected'}
    </span>
  );
}

function IntegrationCard({ title, subtitle, icon: Icon, iconColor, iconBg, connected, children, onToggle, lastSync, warning }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ background: '#141418', border: `1px solid ${open ? iconColor + '44' : '#2A2A35'}`, borderRadius: '12px', overflow: 'hidden', transition: 'border-color 0.2s' }}>
      {/* Header */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px', cursor: 'pointer', userSelect: 'none' }}
        onMouseEnter={e => e.currentTarget.style.background = '#1A1A20'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={18} color={iconColor} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#F0EFF6', fontWeight: 600, fontSize: '14px' }}>{title}</span>
            <StatusPill connected={connected} />
            {warning && <span style={{ background: '#3D2D0A', color: '#F5A623', fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '999px', border: '1px solid #F5A62333' }}>⚠ {warning}</span>}
          </div>
          <div style={{ fontSize: '11px', color: '#55556A', marginTop: '2px' }}>
            {subtitle} {lastSync && <span>· Last sync: <strong style={{ color: '#8A8A9E' }}>{lastSync}</strong></span>}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Toggle checked={connected} onChange={onToggle} color={iconColor} />
          <ChevronRight size={14} color="#55556A" style={{ transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
        </div>
      </div>
      {/* Expandable body */}
      {open && (
        <div style={{ padding: '0 20px 20px', borderTop: '1px solid #1F1F28' }}>
          <div style={{ paddingTop: '16px' }}>{children}</div>
        </div>
      )}
    </div>
  );
}

function SectionTitle({ children }) {
  return <div style={{ fontSize: '10px', color: '#55556A', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '20px 0 8px' }}>{children}</div>;
}

function CopyField({ label, value }) {
  const [copied, setCopied] = useState(false);
  return (
    <div>
      <label style={{ display: 'block', fontSize: '11px', color: '#8A8A9E', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
      <div style={{ display: 'flex', gap: '8px' }}>
        <div style={{ flex: 1, background: '#0D0D0F', border: '1px solid #2A2A35', borderRadius: '8px', padding: '9px 12px', color: '#8A8A9E', fontSize: '12px', fontFamily: 'JetBrains Mono, monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</div>
        <button onClick={() => { navigator.clipboard?.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
          style={{ padding: '9px 12px', background: copied ? '#0F3D2A' : '#1C1C22', border: `1px solid ${copied ? '#1DB87A33' : '#2A2A35'}`, borderRadius: '8px', color: copied ? '#1DB87A' : '#8A8A9E', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 500 }}>
          {copied ? <CheckCircle size={12} /> : <Copy size={12} />} {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  );
}

function SaveBtn({ label = 'Save Settings', color = '#7C6AF7', onSave }) {
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const handleClick = async () => {
    if (onSave) {
      setBusy(true);
      try {
        const ok = await onSave();
        if (ok !== false) { setSaved(true); setTimeout(() => setSaved(false), 2000); }
      } finally {
        setBusy(false);
      }
    } else {
      setSaved(true); setTimeout(() => setSaved(false), 2000);
    }
  };
  return (
    <button onClick={handleClick} disabled={busy}
      style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 18px', background: saved ? '#0F3D2A' : color, border: 'none', borderRadius: '8px', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: busy ? 'default' : 'pointer', opacity: busy ? 0.7 : 1, transition: 'background 0.2s' }}>
      {saved ? <><CheckCircle size={13} /> Saved!</> : busy ? 'Saving...' : <><Save size={13} /> {label}</>}
    </button>
  );
}

// ── Integration state ─────────────────────────────────────

const INIT = {
  shopify: true, meta: true, whatsapp: true, inro: true,
  telegram: true, messenger: false, tiktok: false, email: true,
  twitter: false, livechat: true,
  tcs: true, leopards: true, blueex: true, postex: false, trax: false,
  website: true, mobileapp: false,
};

// ── Sidebar nav ───────────────────────────────────────────

const SECTIONS = [
  { id: 'profile',       label: 'Profile',         icon: User },
  { id: 'team',          label: 'Team',             icon: Users },
  { id: 'notifications', label: 'Notifications',    icon: Bell },
  { id: 'security',      label: 'Security',         icon: Shield },
  { id: 'ecommerce',     label: 'Ecommerce',        icon: Store,   group: 'INTEGRATIONS' },
  { id: 'messaging',     label: 'Messaging & Chat', icon: MessageCircle },
  { id: 'courier',       label: 'Couriers',         icon: Truck },
  { id: 'channels',      label: 'Web & App',        icon: Globe },
  { id: 'webhooks',      label: 'Webhooks & API',   icon: Webhook },
];

const teamMembers = [
  { name: 'Noman Ibrahim',    role: 'Admin',         avatar: 'NI', email: 'noman@store.pk',    status: 'active' },
  { name: 'Ayesha Khan',      role: 'Sales Manager', avatar: 'AK', email: 'ayesha@store.pk',   status: 'active' },
  { name: 'Raza Ali',         role: 'Support Agent', avatar: 'RA', email: 'raza@store.pk',     status: 'active' },
  { name: 'Mehwish Siddiqui', role: 'Support Agent', avatar: 'MS', email: 'mehwish@store.pk',  status: 'inactive' },
];

export default function Settings() {
  const addToast = useToast();
  const [active, setActive] = useState('profile');
  const [conn, setConn] = useState(INIT);
  const [profile, setProfile] = useState({ businessName: 'My Store PK', phone: '+92 300 0000000', currency: 'PKR – Pakistani Rupee', timezone: 'Asia/Karachi (PKT +5)' });
  const [profileLoaded, setProfileLoaded] = useState(false);

  useEffect(() => {
    api.get('/api/settings?group=profile').then(data => {
      if (data.success && data.data?.length) {
        setProfile(prev => {
          const next = { ...prev };
          data.data.forEach(s => { if (s.key in next) next[s.key] = s.value; });
          return next;
        });
      }
      setProfileLoaded(true);
    }).catch(() => setProfileLoaded(true));
  }, []);

  const saveProfile = async () => {
    try {
      const res = await api.put('/api/settings', {
        settings: [
          { key: 'businessName', value: profile.businessName, group: 'profile' },
          { key: 'phone', value: profile.phone, group: 'profile' },
          { key: 'currency', value: profile.currency, group: 'profile' },
          { key: 'timezone', value: profile.timezone, group: 'profile' },
        ],
      });
      if (res.success) { addToast('Profile settings saved', 'success'); return true; }
      addToast(res.message || 'Failed to save settings', 'error');
      return false;
    } catch (err) {
      addToast(err.message || 'Failed to save settings', 'error');
      return false;
    }
  };
  const [notifs, setNotifs] = useState({ orders: true, messages: true, payments: true, shipping: false, marketing: false, lowStock: true, returns: true });

  const toggle = key => setConn(c => ({ ...c, [key]: !c[key] }));

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: '#0D0D0F' }}>
      <div style={{ padding: '24px', maxWidth: '1300px', margin: '0 auto' }}>

        {/* Page header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{ width: '36px', height: '36px', background: '#1C1C22', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <SettingsIcon size={17} color="#8A8A9E" />
          </div>
          <div>
            <h1 style={{ color: '#F0EFF6', fontSize: '22px', fontWeight: 700, margin: 0 }}>Settings</h1>
            <p style={{ color: '#55556A', fontSize: '12px', margin: 0 }}>Manage integrations, account, and preferences</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '20px', alignItems: 'start' }}>

          {/* ── Left nav ── */}
          <div style={{ background: '#141418', border: '1px solid #2A2A35', borderRadius: '12px', padding: '8px', position: 'sticky', top: '24px' }}>
            {SECTIONS.map((s, i) => {
              const Icon = s.icon;
              const isActive = active === s.id;
              const prevGroup = i > 0 && SECTIONS[i - 1].group !== s.group && s.group;
              return (
                <React.Fragment key={s.id}>
                  {prevGroup && <div style={{ fontSize: '9px', color: '#55556A', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', padding: '12px 12px 4px' }}>{prevGroup}</div>}
                  {i === 4 && !prevGroup && <div style={{ fontSize: '9px', color: '#55556A', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', padding: '12px 12px 4px' }}>INTEGRATIONS</div>}
                  <button onClick={() => setActive(s.id)} style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '9px', padding: '9px 12px',
                    borderRadius: '8px', border: 'none', cursor: 'pointer',
                    background: isActive ? '#2A2550' : 'transparent',
                    color: isActive ? '#7C6AF7' : '#8A8A9E', fontSize: '13px', fontWeight: isActive ? 600 : 400,
                    textAlign: 'left', transition: 'all 0.12s',
                  }}
                    onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = '#1C1C22'; e.currentTarget.style.color = '#F0EFF6'; } }}
                    onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#8A8A9E'; } }}>
                    <Icon size={14} style={{ flexShrink: 0 }} />
                    {s.label}
                    {/* connection dots for integration sections */}
                    {s.id === 'ecommerce' && <span style={{ marginLeft: 'auto', background: '#0F3D2A', color: '#1DB87A', fontSize: '9px', fontWeight: 700, padding: '1px 5px', borderRadius: '4px' }}>2/2</span>}
                    {s.id === 'messaging' && <span style={{ marginLeft: 'auto', background: '#0F3D2A', color: '#1DB87A', fontSize: '9px', fontWeight: 700, padding: '1px 5px', borderRadius: '4px' }}>4/6</span>}
                    {s.id === 'courier' && <span style={{ marginLeft: 'auto', background: '#0F3D2A', color: '#1DB87A', fontSize: '9px', fontWeight: 700, padding: '1px 5px', borderRadius: '4px' }}>2/5</span>}
                    {s.id === 'channels' && <span style={{ marginLeft: 'auto', background: '#3D2D0A', color: '#F5A623', fontSize: '9px', fontWeight: 700, padding: '1px 5px', borderRadius: '4px' }}>1/2</span>}
                  </button>
                </React.Fragment>
              );
            })}
          </div>

          {/* ── Right content ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* PROFILE */}
            {active === 'profile' && (
              <div style={{ background: '#141418', border: '1px solid #2A2A35', borderRadius: '12px', padding: '24px' }}>
                <div style={{ fontWeight: 700, fontSize: '15px', color: '#F0EFF6', marginBottom: '20px' }}>Profile Settings</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #1F1F28' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg,#7C6AF7,#3A8AE8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: 700, color: '#fff' }}>N</div>
                  <div>
                    <div style={{ fontWeight: 600, color: '#F0EFF6' }}>Noman Ibrahim</div>
                    <div style={{ fontSize: '12px', color: '#55556A', marginTop: '2px' }}>Admin · nomaan.ibrahim0336@gmail.com</div>
                  </div>
                  <button style={{ marginLeft: 'auto', padding: '7px 14px', background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '8px', color: '#8A8A9E', fontSize: '12px', cursor: 'pointer' }}>Change Photo</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <Field label="Full Name" value="Noman Ibrahim" readOnly />
                  <Field label="Email" value="nomaan.ibrahim0336@gmail.com" readOnly />
                  <Field key={'phone' + profileLoaded} label="Phone" value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} />
                  <Field key={'biz' + profileLoaded} label="Business Name" value={profile.businessName} onChange={e => setProfile(p => ({ ...p, businessName: e.target.value }))} />
                  <Field key={'cur' + profileLoaded} label="Currency" value={profile.currency} onChange={e => setProfile(p => ({ ...p, currency: e.target.value }))} />
                  <Field key={'tz' + profileLoaded} label="Timezone" value={profile.timezone} onChange={e => setProfile(p => ({ ...p, timezone: e.target.value }))} />
                </div>
                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}><SaveBtn onSave={saveProfile} /></div>
              </div>
            )}

            {/* TEAM */}
            {active === 'team' && (
              <div style={{ background: '#141418', border: '1px solid #2A2A35', borderRadius: '12px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div style={{ fontWeight: 700, fontSize: '15px', color: '#F0EFF6' }}>Team Members</div>
                  <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: '#7C6AF7', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                    <Plus size={13} /> Invite Member
                  </button>
                </div>
                {teamMembers.map(m => (
                  <div key={m.email} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', borderRadius: '8px' }}
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
            )}

            {/* NOTIFICATIONS */}
            {active === 'notifications' && (
              <div style={{ background: '#141418', border: '1px solid #2A2A35', borderRadius: '12px', padding: '24px' }}>
                <div style={{ fontWeight: 700, fontSize: '15px', color: '#F0EFF6', marginBottom: '4px' }}>Notification Preferences</div>
                <div style={{ fontSize: '12px', color: '#55556A', marginBottom: '16px' }}>Choose what you want to be notified about</div>
                {[
                  ['New Orders',          'Get notified when a new order is placed',       'orders'],
                  ['Customer Messages',   'Receive alerts for new DMs across all channels', 'messages'],
                  ['Payment Received',    'Notify on successful payments',                  'payments'],
                  ['Shipping Updates',    'Track courier status changes',                   'shipping'],
                  ['Low Stock Alerts',    'When inventory falls below reorder point',        'lowStock'],
                  ['Returns & Refunds',   'When a return or refund is initiated',            'returns'],
                  ['Marketing Reports',   'Weekly performance summaries',                   'marketing'],
                ].map(([label, desc, key]) => (
                  <SettingRow key={key} label={label} description={desc}>
                    <Toggle checked={notifs[key]} onChange={v => setNotifs(p => ({ ...p, [key]: v }))} />
                  </SettingRow>
                ))}
              </div>
            )}

            {/* SECURITY */}
            {active === 'security' && (
              <div style={{ background: '#141418', border: '1px solid #2A2A35', borderRadius: '12px', padding: '24px' }}>
                <div style={{ fontWeight: 700, fontSize: '15px', color: '#F0EFF6', marginBottom: '16px' }}>Security Settings</div>
                <SettingRow label="Two-Factor Authentication" description="Add an extra layer of security to your account">
                  <button style={{ padding: '7px 14px', background: '#0F3D2A', border: '1px solid #1DB87A33', borderRadius: '8px', color: '#1DB87A', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>Enable 2FA</button>
                </SettingRow>
                <SettingRow label="Change Password" description="Last changed 30 days ago">
                  <button style={{ padding: '7px 14px', background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '8px', color: '#8A8A9E', fontSize: '12px', cursor: 'pointer' }}>Update Password</button>
                </SettingRow>
                <SettingRow label="Active Sessions" description="2 active sessions (Chrome / Safari)">
                  <button style={{ padding: '7px 14px', background: '#3D1414', border: '1px solid #E2514A33', borderRadius: '8px', color: '#E2514A', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>Revoke All</button>
                </SettingRow>
                <SettingRow label="API Keys" description="3 keys active — rotate regularly" borderless>
                  <button style={{ padding: '7px 14px', background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '8px', color: '#8A8A9E', fontSize: '12px', cursor: 'pointer' }}>Manage Keys</button>
                </SettingRow>
              </div>
            )}

            {/* ══ ECOMMERCE INTEGRATIONS ══ */}
            {active === 'ecommerce' && (
              <>
                <div style={{ color: '#8A8A9E', fontSize: '12px', marginBottom: '4px' }}>Connect your ecommerce platforms to sync orders, products, and customers automatically.</div>

                {/* SHOPIFY */}
                <IntegrationCard title="Shopify" subtitle="E-commerce store sync" icon={Store} iconColor="#96BF48" iconBg="#1A2810" connected={conn.shopify} onToggle={() => toggle('shopify')} lastSync="3 min ago">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                    <Field label="Store URL" value="mystore.myshopify.com" />
                    <Field label="API Key" value="shpat_••••••••••••••••3f9a" type="password" />
                    <Field label="API Secret" value="shpss_••••••••••••••••8b2c" type="password" />
                    <Field label="Webhook Secret" value="whsec_••••••••••••••2d1e" type="password" />
                  </div>
                  <SectionTitle>Sync Settings</SectionTitle>
                  <SettingRow label="Auto-sync orders" description="Pull new orders every 5 minutes"><Toggle checked={true} onChange={() => {}} color="#96BF48" /></SettingRow>
                  <SettingRow label="Sync inventory" description="Update stock levels from Shopify"><Toggle checked={true} onChange={() => {}} color="#96BF48" /></SettingRow>
                  <SettingRow label="Push order status back" description="Update Shopify when status changes"><Toggle checked={false} onChange={() => {}} color="#96BF48" /></SettingRow>
                  <SectionTitle>Stats</SectionTitle>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
                    {[['Orders Synced','1,284'],['Products','12'],['Customers','3,410'],['Last Error','None']].map(([l,v]) => (
                      <div key={l} style={{ flex: 1, background: '#1C1C22', borderRadius: '8px', padding: '10px 12px' }}>
                        <div style={{ fontSize: '10px', color: '#55556A', marginBottom: '4px' }}>{l}</div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#F0EFF6' }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <SaveBtn label="Save Shopify Settings" color="#96BF48" />
                    <button style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '9px 14px', background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '8px', color: '#8A8A9E', fontSize: '12px', cursor: 'pointer' }}>
                      <RefreshCw size={12} /> Sync Now
                    </button>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '9px 14px', background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '8px', color: '#8A8A9E', fontSize: '12px', cursor: 'pointer' }}>
                      <ExternalLink size={12} /> Open Shopify
                    </button>
                  </div>
                </IntegrationCard>

                {/* META ADS */}
                <IntegrationCard title="Meta Ads (Facebook & Instagram)" subtitle="Ad campaigns & audience sync" icon={Activity} iconColor="#1877F2" iconBg="#0A1A3D" connected={conn.meta} onToggle={() => toggle('meta')} lastSync="12 min ago">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                    <Field label="App ID" value="548291034872019" mono />
                    <Field label="App Secret" value="••••••••••••••••••••4a8f" type="password" />
                    <Field label="Ad Account ID" value="act_291847362910" mono />
                    <Field label="Access Token" value="EAABsbCS••••••••••••••••••••" type="password" />
                    <Field label="Facebook Page ID" value="109283746512837" mono />
                    <Field label="Instagram Account ID" value="17841409•••••••" mono />
                  </div>
                  <SectionTitle>Pixel & Conversions</SectionTitle>
                  <SettingRow label="Meta Pixel" description="Pixel ID: 4829104738291047"><Toggle checked={true} onChange={() => {}} color="#1877F2" /></SettingRow>
                  <SettingRow label="Conversions API (CAPI)" description="Server-side event tracking"><Toggle checked={true} onChange={() => {}} color="#1877F2" /></SettingRow>
                  <SettingRow label="Auto-create custom audiences" description="From CRM customer segments"><Toggle checked={false} onChange={() => {}} color="#1877F2" /></SettingRow>
                  <SectionTitle>Permissions Granted</SectionTitle>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
                    {['ads_management','ads_read','pages_read_engagement','instagram_basic','leads_retrieval','business_management'].map(p => (
                      <span key={p} style={{ background: '#0A1A3D', color: '#1877F2', padding: '2px 8px', borderRadius: '5px', fontSize: '10px', fontFamily: 'JetBrains Mono, monospace', border: '1px solid #1877F233' }}>{p}</span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <SaveBtn label="Save Meta Settings" color="#1877F2" />
                    <button style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '9px 14px', background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '8px', color: '#8A8A9E', fontSize: '12px', cursor: 'pointer' }}>
                      <RefreshCw size={12} /> Refresh Token
                    </button>
                  </div>
                </IntegrationCard>
              </>
            )}

            {/* ══ MESSAGING & CHAT ══ */}
            {active === 'messaging' && (
              <>
                <div style={{ color: '#8A8A9E', fontSize: '12px', marginBottom: '4px' }}>Configure messaging platform connections and AI bot settings for each channel.</div>

                {/* WHATSAPP / INRO */}
                <IntegrationCard title="WhatsApp Business (via Inrō)" subtitle="WhatsApp messaging & AI bot Zara" icon={Phone} iconColor="#25D366" iconBg="#0A2E1A" connected={conn.whatsapp} onToggle={() => toggle('whatsapp')} lastSync="1 min ago">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                    <Field label="Phone Number" value="+92 300 0000000" />
                    <Field label="Business Account ID" value="109283746512837" mono />
                    <Field label="Inrō API Key" value="inro_live_••••••••••••••••k9x2" type="password" />
                    <Field label="Webhook Verify Token" value="whatsapp_verify_••••••4f2a" type="password" />
                  </div>
                  <SectionTitle>AI Bot — Zara 🤖</SectionTitle>
                  <SettingRow label="Enable AI Auto-replies" description="Zara handles incoming messages automatically"><Toggle checked={true} onChange={() => {}} color="#25D366" /></SettingRow>
                  <SettingRow label="Business Hours Only" description="Only auto-reply 9 AM – 6 PM PKT"><Toggle checked={true} onChange={() => {}} color="#25D366" /></SettingRow>
                  <SettingRow label="Order Status Bot" description="Auto-reply with order tracking info"><Toggle checked={true} onChange={() => {}} color="#25D366" /></SettingRow>
                  <SettingRow label="Handoff to Agent" description="Transfer to human after 2 failed bot replies"><Toggle checked={true} onChange={() => {}} color="#25D366" /></SettingRow>
                  <div style={{ marginTop: '12px' }}>
                    <Field label="Bot Greeting Message" value="Hello! I'm Zara 🤖, your shopping assistant. How can I help you today?" />
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                    <SaveBtn label="Save WhatsApp Settings" color="#25D366" />
                    <button style={{ padding: '9px 14px', background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '8px', color: '#8A8A9E', fontSize: '12px', cursor: 'pointer' }}>Test Connection</button>
                  </div>
                </IntegrationCard>

                {/* INSTAGRAM / META DM */}
                <IntegrationCard title="Instagram DM (Meta)" subtitle="Instagram direct message inbox" icon={MessageCircle} iconColor="#E1306C" iconBg="#2E0A1A" connected={conn.meta} onToggle={() => toggle('meta')} lastSync="5 min ago">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                    <Field label="Instagram Account" value="@mystoreofficial" />
                    <Field label="Connected Page" value="My Store PK" />
                  </div>
                  <SectionTitle>DM Settings</SectionTitle>
                  <SettingRow label="Auto-reply to Story Mentions" description="Reply when tagged in stories"><Toggle checked={true} onChange={() => {}} color="#E1306C" /></SettingRow>
                  <SettingRow label="Keyword Triggers" description="Auto-reply when 'price', 'order', 'buy' detected"><Toggle checked={true} onChange={() => {}} color="#E1306C" /></SettingRow>
                  <SettingRow label="AI Response on New DM" description="Zara responds to first message"><Toggle checked={false} onChange={() => {}} color="#E1306C" /></SettingRow>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                    <SaveBtn label="Save Instagram Settings" color="#E1306C" />
                  </div>
                </IntegrationCard>

                {/* TELEGRAM */}
                <IntegrationCard title="Telegram Bot" subtitle="Telegram messaging channel" icon={Send} iconColor="#2AABEE" iconBg="#0A1E2E" connected={conn.telegram} onToggle={() => toggle('telegram')} lastSync="8 min ago">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                    <Field label="Bot Username" value="@MyStorePKBot" />
                    <Field label="Bot Token" value="7291038476:AAH•••••••••••••••••••_kX9" type="password" />
                    <Field label="Bot Name" value="Zara — My Store" />
                    <Field label="Webhook URL" value="https://api.mystore.pk/telegram/webhook" readOnly />
                  </div>
                  <SectionTitle>Bot Settings</SectionTitle>
                  <SettingRow label="Enable Bot Replies" description="Auto-handle incoming Telegram messages"><Toggle checked={true} onChange={() => {}} color="#2AABEE" /></SettingRow>
                  <SettingRow label="Product Catalog Command /catalog" description="Send catalog on /catalog command"><Toggle checked={true} onChange={() => {}} color="#2AABEE" /></SettingRow>
                  <SettingRow label="Order Tracking /track" description="Let customers track via /track [order-id]"><Toggle checked={true} onChange={() => {}} color="#2AABEE" /></SettingRow>
                  <CopyField label="Webhook URL (set in BotFather)" value="https://api.mystore.pk/telegram/webhook" />
                  <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                    <SaveBtn label="Save Telegram Settings" color="#2AABEE" />
                    <button style={{ padding: '9px 14px', background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '8px', color: '#8A8A9E', fontSize: '12px', cursor: 'pointer' }}>Test Bot</button>
                  </div>
                </IntegrationCard>

                {/* FACEBOOK MESSENGER */}
                <IntegrationCard title="Facebook Messenger" subtitle="Facebook Page inbox" icon={MessageCircle} iconColor="#0084FF" iconBg="#001A2E" connected={conn.messenger} onToggle={() => toggle('messenger')}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                    <Field label="Page Access Token" value="" placeholder="Paste your Page Access Token" type="password" />
                    <Field label="App Verify Token" value="" placeholder="Your custom verify token" />
                  </div>
                  <SectionTitle>Messenger Features</SectionTitle>
                  <SettingRow label="Persistent Menu" description="Show quick-reply menu in Messenger"><Toggle checked={false} onChange={() => {}} color="#0084FF" /></SettingRow>
                  <SettingRow label="Get Started Button" description="Greeting on first message"><Toggle checked={false} onChange={() => {}} color="#0084FF" /></SettingRow>
                  <CopyField label="Callback URL (add in Meta Developer Console)" value="https://api.mystore.pk/messenger/webhook" />
                  <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                    <SaveBtn label="Connect Messenger" color="#0084FF" />
                  </div>
                </IntegrationCard>

                {/* TIKTOK */}
                <IntegrationCard title="TikTok Shop & DMs" subtitle="TikTok business messaging" icon={MessageCircle} iconColor="#FF0050" iconBg="#2E000F" connected={conn.tiktok} onToggle={() => toggle('tiktok')} warning="Re-auth needed">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                    <Field label="TikTok App ID" value="" placeholder="App ID from TikTok Developer" />
                    <Field label="App Secret" value="" placeholder="App secret key" type="password" />
                    <Field label="Access Token" value="" placeholder="OAuth access token" type="password" />
                    <Field label="TikTok Shop ID" value="" placeholder="Your shop ID" mono />
                  </div>
                  <div style={{ background: '#3D000F', border: '1px solid #FF005033', borderRadius: '8px', padding: '12px 14px', fontSize: '12px', color: '#FF0050', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertTriangle size={13} /> Access token expired. Re-authenticate via TikTok Developer Console.
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={{ padding: '9px 16px', background: '#FF0050', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <ExternalLink size={12} /> Authenticate TikTok
                    </button>
                  </div>
                </IntegrationCard>

                {/* EMAIL */}
                <IntegrationCard title="Email (SMTP)" subtitle="Outbound email for order confirmations & support" icon={Mail} iconColor="#F5A623" iconBg="#2E1A00" connected={conn.email} onToggle={() => toggle('email')} lastSync="Active">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                    <Field label="SMTP Host" value="smtp.gmail.com" />
                    <Field label="SMTP Port" value="587" />
                    <Field label="Username / Email" value="noreply@mystore.pk" />
                    <Field label="App Password" value="••••••••••••••••" type="password" />
                    <Field label="From Name" value="My Store PK" />
                    <Field label="Reply-To" value="support@mystore.pk" />
                  </div>
                  <SectionTitle>Email Automations</SectionTitle>
                  <SettingRow label="Order Confirmation Email" description="Send on new order placement"><Toggle checked={true} onChange={() => {}} color="#F5A623" /></SettingRow>
                  <SettingRow label="Shipping Notification" description="Send when order is dispatched"><Toggle checked={true} onChange={() => {}} color="#F5A623" /></SettingRow>
                  <SettingRow label="COD Reminder" description="Remind customer before delivery"><Toggle checked={false} onChange={() => {}} color="#F5A623" /></SettingRow>
                  <SettingRow label="Abandoned Cart Email" description="Follow up after 1 hour" borderless><Toggle checked={false} onChange={() => {}} color="#F5A623" /></SettingRow>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                    <SaveBtn label="Save Email Settings" color="#F5A623" />
                    <button style={{ padding: '9px 14px', background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '8px', color: '#8A8A9E', fontSize: '12px', cursor: 'pointer' }}>Send Test Email</button>
                  </div>
                </IntegrationCard>

                {/* TWITTER */}
                <IntegrationCard title="Twitter / X DMs" subtitle="Twitter business account DM inbox" icon={MessageCircle} iconColor="#1DA1F2" iconBg="#001A2E" connected={conn.twitter} onToggle={() => toggle('twitter')}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                    <Field label="API Key" value="" placeholder="Twitter API Key" />
                    <Field label="API Secret" value="" placeholder="Twitter API Secret" type="password" />
                    <Field label="Access Token" value="" placeholder="Access Token" type="password" />
                    <Field label="Access Secret" value="" placeholder="Access Token Secret" type="password" />
                    <Field label="@Handle" value="" placeholder="@yourbrand" />
                  </div>
                  <SectionTitle>DM Settings</SectionTitle>
                  <SettingRow label="Auto-reply to Mentions" description="Respond to @mentions automatically"><Toggle checked={false} onChange={() => {}} color="#1DA1F2" /></SettingRow>
                  <SettingRow label="Route DMs to Inbox" description="Import DMs into CRM conversations" borderless><Toggle checked={false} onChange={() => {}} color="#1DA1F2" /></SettingRow>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                    <SaveBtn label="Connect Twitter" color="#1DA1F2" />
                  </div>
                </IntegrationCard>

                {/* LIVE CHAT */}
                <IntegrationCard title="Live Chat (Website Widget)" subtitle="Embedded chat widget on your website" icon={MessageCircle} iconColor="#7C6AF7" iconBg="#12102E" connected={conn.livechat} onToggle={() => toggle('livechat')} lastSync="Active">
                  <SectionTitle>Widget Code</SectionTitle>
                  <CopyField label="Embed Script (paste before </body>)" value={`<script src="https://cdn.mystore.pk/chat.js" data-key="lc_k9x2m4p1"></script>`} />
                  <SectionTitle>Widget Settings</SectionTitle>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px', marginTop: '8px' }}>
                    <Field label="Widget Color" value="#7C6AF7" />
                    <Field label="Greeting Text" value="Hi! How can we help?" />
                    <Field label="Bot Name" value="Zara" />
                    <Field label="Offline Message" value="We'll reply within 1 hour" />
                  </div>
                  <SettingRow label="Show on Mobile" description="Display chat widget on mobile browsers"><Toggle checked={true} onChange={() => {}} color="#7C6AF7" /></SettingRow>
                  <SettingRow label="AI First Response" description="Zara replies instantly, then hands off" borderless><Toggle checked={true} onChange={() => {}} color="#7C6AF7" /></SettingRow>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                    <SaveBtn label="Save Widget Settings" color="#7C6AF7" />
                  </div>
                </IntegrationCard>
              </>
            )}

            {/* ══ COURIERS ══ */}
            {active === 'courier' && (
              <>
                <div style={{ color: '#8A8A9E', fontSize: '12px', marginBottom: '4px' }}>Connect courier APIs to book shipments, track parcels, and manage COD directly from CRM.</div>

                {/* TCS */}
                <IntegrationCard title="TCS Courier" subtitle="Book, track & manage TCS shipments" icon={Truck} iconColor="#E2514A" iconBg="#3D1414" connected={conn.tcs} onToggle={() => toggle('tcs')} lastSync="2 min ago">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                    <Field label="Username / Account ID" value="MYSTORE_KHI_001" />
                    <Field label="API Password" value="••••••••••••••8x2" type="password" />
                    <Field label="Cost Center" value="CC-29384" mono />
                    <Field label="Service Type" value="Overnight" />
                  </div>
                  <SectionTitle>Automation</SectionTitle>
                  <SettingRow label="Auto-book on Order Confirmed" description="Create TCS booking when order is confirmed"><Toggle checked={true} onChange={() => {}} color="#E2514A" /></SettingRow>
                  <SettingRow label="Auto-print Label" description="Send label to default printer on booking"><Toggle checked={false} onChange={() => {}} color="#E2514A" /></SettingRow>
                  <SettingRow label="COD Auto-reconcile" description="Match remittances against orders" borderless><Toggle checked={true} onChange={() => {}} color="#E2514A" /></SettingRow>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                    <SaveBtn label="Save TCS Settings" color="#E2514A" />
                    <button style={{ padding: '9px 14px', background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '8px', color: '#8A8A9E', fontSize: '12px', cursor: 'pointer' }}>Test API</button>
                  </div>
                </IntegrationCard>

                {/* LEOPARDS */}
                <IntegrationCard title="Leopards Courier" subtitle="Leopards booking & tracking API" icon={Truck} iconColor="#F5A623" iconBg="#3D2D0A" connected={conn.leopards} onToggle={() => toggle('leopards')} lastSync="5 min ago">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                    <Field label="API Key" value="lc_live_••••••••••••••••••••3b9f" type="password" />
                    <Field label="API Password" value="••••••••••••••••" type="password" />
                    <Field label="Origin City" value="Karachi" />
                    <Field label="Packet Type" value="Express" />
                  </div>
                  <SettingRow label="Auto-book on Process" description="Auto-create booking when status → Processing"><Toggle checked={true} onChange={() => {}} color="#F5A623" /></SettingRow>
                  <SettingRow label="Return Automation" description="Auto-initiate return on 3rd failed attempt" borderless><Toggle checked={false} onChange={() => {}} color="#F5A623" /></SettingRow>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                    <SaveBtn label="Save Leopards Settings" color="#F5A623" />
                  </div>
                </IntegrationCard>

                {/* BLUEEX */}
                <IntegrationCard title="BlueEx Courier" subtitle="BlueEx parcel booking & tracking" icon={Truck} iconColor="#3A8AE8" iconBg="#0D2A4A" connected={conn.blueex} onToggle={() => toggle('blueex')} lastSync="10 min ago">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                    <Field label="Client ID" value="BEX-CLIENT-29841" mono />
                    <Field label="Secret Key" value="bex_••••••••••••••••7c3a" type="password" />
                  </div>
                  <SettingRow label="Enable BlueEx bookings" description="Allow bookings via BlueEx API" borderless><Toggle checked={true} onChange={() => {}} color="#3A8AE8" /></SettingRow>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                    <SaveBtn label="Save BlueEx Settings" color="#3A8AE8" />
                  </div>
                </IntegrationCard>

                {/* POSTEX */}
                <IntegrationCard title="PostEx" subtitle="PostEx courier integration" icon={Truck} iconColor="#7C6AF7" iconBg="#2A2550" connected={conn.postex} onToggle={() => toggle('postex')}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                    <Field label="Token" value="" placeholder="PostEx API token" type="password" />
                    <Field label="Pickup Address ID" value="" placeholder="e.g. ADDR-001" />
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                    <SaveBtn label="Connect PostEx" color="#7C6AF7" />
                  </div>
                </IntegrationCard>

                {/* TRAX */}
                <IntegrationCard title="Trax" subtitle="Trax logistics API" icon={Truck} iconColor="#1DB87A" iconBg="#0F3D2A" connected={conn.trax} onToggle={() => toggle('trax')}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                    <Field label="Username" value="" placeholder="Trax account username" />
                    <Field label="Password" value="" placeholder="Trax account password" type="password" />
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                    <SaveBtn label="Connect Trax" color="#1DB87A" />
                    <button style={{ padding: '9px 14px', background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '8px', color: '#8A8A9E', fontSize: '12px', cursor: 'pointer' }}>Test Credentials</button>
                  </div>
                </IntegrationCard>
              </>
            )}

            {/* ══ WEB & APP ══ */}
            {active === 'channels' && (
              <>
                <div style={{ color: '#8A8A9E', fontSize: '12px', marginBottom: '4px' }}>Manage your website and mobile app connectivity settings.</div>

                {/* WEBSITE */}
                <IntegrationCard title="Website" subtitle="mystore.pk — pixel, orders & analytics" icon={Globe} iconColor="#3A8AE8" iconBg="#0D2A4A" connected={conn.website} onToggle={() => toggle('website')} lastSync="Active">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                    <Field label="Domain" value="mystore.pk" />
                    <Field label="Website Platform" value="WordPress + WooCommerce" />
                    <Field label="WooCommerce API Key" value="ck_••••••••••••••••••••••7a2b" type="password" />
                    <Field label="WooCommerce API Secret" value="cs_••••••••••••••••••••••1d3e" type="password" />
                  </div>
                  <SectionTitle>Pixel & Tracking</SectionTitle>
                  <CopyField label="CRM Tracking Pixel (paste in <head>)" value={`<script src="https://cdn.mystore.pk/pixel.js" data-id="CRM-PX-k9x2"></script>`} />
                  <SectionTitle>Features</SectionTitle>
                  <SettingRow label="Sync WooCommerce orders" description="Pull website orders into CRM"><Toggle checked={true} onChange={() => {}} color="#3A8AE8" /></SettingRow>
                  <SettingRow label="Live chat widget" description="Show chat bubble on website"><Toggle checked={true} onChange={() => {}} color="#3A8AE8" /></SettingRow>
                  <SettingRow label="Abandoned cart tracking" description="Capture and follow up on abandoned carts" borderless><Toggle checked={false} onChange={() => {}} color="#3A8AE8" /></SettingRow>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                    <SaveBtn label="Save Website Settings" color="#3A8AE8" />
                    <button style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '9px 14px', background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '8px', color: '#8A8A9E', fontSize: '12px', cursor: 'pointer' }}>
                      <ExternalLink size={12} /> Open Website
                    </button>
                  </div>
                </IntegrationCard>

                {/* MOBILE APP */}
                <IntegrationCard title="Mobile App" subtitle="Android & iOS customer app" icon={Smartphone} iconColor="#7C6AF7" iconBg="#2A2550" connected={conn.mobileapp} onToggle={() => toggle('mobileapp')} warning="In Development">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                    <Field label="App Bundle ID (Android)" value="pk.mystore.android" mono />
                    <Field label="App Bundle ID (iOS)" value="pk.mystore.ios" mono />
                    <Field label="Firebase Server Key" value="" placeholder="FCM server key for push notifications" type="password" />
                    <Field label="App Version" value="0.9.2 (Beta)" readOnly />
                  </div>
                  <SectionTitle>Push Notifications</SectionTitle>
                  <SettingRow label="Order Status Pushes" description="Notify customers on order updates"><Toggle checked={false} onChange={() => {}} color="#7C6AF7" /></SettingRow>
                  <SettingRow label="Promotional Pushes" description="Send marketing notifications"><Toggle checked={false} onChange={() => {}} color="#7C6AF7" /></SettingRow>
                  <SettingRow label="Flash Sale Alerts" description="Notify on limited-time deals" borderless><Toggle checked={false} onChange={() => {}} color="#7C6AF7" /></SettingRow>
                  <div style={{ margin: '14px 0', padding: '12px 14px', background: '#2A2550', border: '1px solid #7C6AF733', borderRadius: '8px', fontSize: '12px', color: '#7C6AF7', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Info size={13} /> App is in development. Firebase config required before going live.
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <SaveBtn label="Save App Settings" color="#7C6AF7" />
                    <button style={{ padding: '9px 14px', background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '8px', color: '#8A8A9E', fontSize: '12px', cursor: 'pointer' }}>Send Test Push</button>
                  </div>
                </IntegrationCard>
              </>
            )}

            {/* ══ WEBHOOKS & API ══ */}
            {active === 'webhooks' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* CRM API Keys */}
                <div style={{ background: '#141418', border: '1px solid #2A2A35', borderRadius: '12px', padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '15px', color: '#F0EFF6' }}>CRM API Keys</div>
                      <div style={{ fontSize: '12px', color: '#55556A', marginTop: '2px' }}>Use these to connect external apps to your CRM</div>
                    </div>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 14px', background: '#7C6AF7', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                      <Plus size={12} /> New Key
                    </button>
                  </div>
                  {[
                    { name: 'Production Key',   key: 'crm_live_k9x2m4p1••••••••••••••••••••••', created: '2024-10-01', scope: 'Full Access' },
                    { name: 'Shopify Webhook',  key: 'crm_live_sh8f2••••••••••••••••••••••••••', created: '2024-11-15', scope: 'Orders Read' },
                    { name: 'Analytics Key',    key: 'crm_live_an3j9••••••••••••••••••••••••••', created: '2024-12-01', scope: 'Analytics Read' },
                  ].map(k => (
                    <div key={k.name} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '8px', marginBottom: '4px' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#1C1C22'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <Key size={14} color="#7C6AF7" style={{ flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#F0EFF6' }}>{k.name}</div>
                        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#55556A', marginTop: '2px' }}>{k.key}</div>
                      </div>
                      <span style={{ fontSize: '10px', background: '#2A2550', color: '#7C6AF7', padding: '2px 7px', borderRadius: '5px' }}>{k.scope}</span>
                      <span style={{ fontSize: '11px', color: '#55556A' }}>{k.created}</span>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#55556A', display: 'flex', padding: '4px' }}><Trash2 size={13} /></button>
                    </div>
                  ))}
                </div>

                {/* Webhooks */}
                <div style={{ background: '#141418', border: '1px solid #2A2A35', borderRadius: '12px', padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '15px', color: '#F0EFF6' }}>Outbound Webhooks</div>
                      <div style={{ fontSize: '12px', color: '#55556A', marginTop: '2px' }}>Notify external services when CRM events occur</div>
                    </div>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 14px', background: '#7C6AF7', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                      <Plus size={12} /> Add Webhook
                    </button>
                  </div>
                  {[
                    { url: 'https://n8n.myserver.pk/webhook/order-new', events: ['order.created', 'order.paid'], status: 'Active' },
                    { url: 'https://make.com/hook/abc123/crm-dm',       events: ['conversation.new'],            status: 'Active' },
                    { url: 'https://zapier.com/hooks/catch/9x8m2k/crm', events: ['order.delivered', 'order.returned'], status: 'Paused' },
                  ].map((w, i) => (
                    <div key={i} style={{ padding: '14px', background: '#1C1C22', borderRadius: '8px', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#7C6AF7', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, marginRight: '12px' }}>{w.url}</div>
                        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                          <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '5px', background: w.status === 'Active' ? '#0F3D2A' : '#3D2D0A', color: w.status === 'Active' ? '#1DB87A' : '#F5A623', fontWeight: 600 }}>{w.status}</span>
                          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#55556A', display: 'flex' }}><Trash2 size={12} /></button>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {w.events.map(e => (
                          <span key={e} style={{ background: '#2A2550', color: '#7C6AF7', fontSize: '10px', padding: '2px 7px', borderRadius: '4px', fontFamily: 'JetBrains Mono, monospace' }}>{e}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* CRM Endpoints reference */}
                <div style={{ background: '#141418', border: '1px solid #2A2A35', borderRadius: '12px', padding: '24px' }}>
                  <div style={{ fontWeight: 700, fontSize: '15px', color: '#F0EFF6', marginBottom: '4px' }}>API Base URL</div>
                  <div style={{ fontSize: '12px', color: '#55556A', marginBottom: '14px' }}>Use with your API key in Authorization header</div>
                  <CopyField label="Base URL" value="https://api.mystore.pk/v1" />
                  <div style={{ marginTop: '16px' }}>
                    <div style={{ fontSize: '10px', color: '#55556A', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>Key Endpoints</div>
                    {[
                      ['GET',   '/orders',          'List all orders'],
                      ['POST',  '/orders/:id/ship', 'Book courier shipment'],
                      ['GET',   '/customers',       'List customers'],
                      ['GET',   '/analytics/stats', 'Dashboard KPIs'],
                      ['POST',  '/conversations/send', 'Send a message'],
                      ['PATCH', '/inventory/adjust',   'Adjust stock level'],
                    ].map(([method, path, desc]) => (
                      <div key={path} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 10px', borderRadius: '6px', marginBottom: '4px' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#1C1C22'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <span style={{ fontSize: '10px', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', padding: '2px 6px', borderRadius: '4px', minWidth: '36px', textAlign: 'center', background: method === 'GET' ? '#0D2A4A' : method === 'POST' ? '#0F3D2A' : '#3D2D0A', color: method === 'GET' ? '#3A8AE8' : method === 'POST' ? '#1DB87A' : '#F5A623' }}>{method}</span>
                        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: '#7C6AF7', flex: 1 }}>{path}</span>
                        <span style={{ fontSize: '12px', color: '#55556A' }}>{desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
