import React, { useState, useEffect } from 'react';
import { Send, Bot, MoreVertical, Search, Phone, Video, Info } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { conversations as mockConversations } from '../data/mockData';
import api from '../utils/api';

// Channel config: color, label, icon letter/emoji
const CHANNEL_CONFIG = {
  WhatsApp:  { color: '#25D366', bg: '#0A2E1A', icon: 'W', label: 'WhatsApp' },
  Instagram: { color: '#E1306C', bg: '#2E0A1A', icon: 'I', label: 'Instagram' },
  Telegram:  { color: '#2AABEE', bg: '#0A1E2E', icon: 'T', label: 'Telegram' },
  Messenger: { color: '#0084FF', bg: '#001A2E', icon: 'M', label: 'Messenger' },
  TikTok:    { color: '#FF0050', bg: '#2E000F', icon: '♪', label: 'TikTok' },
  Email:     { color: '#F5A623', bg: '#2E1A00', icon: '@', label: 'Email' },
  Twitter:   { color: '#1DA1F2', bg: '#001A2E', icon: 'X', label: 'Twitter / X' },
  LiveChat:  { color: '#7C6AF7', bg: '#12102E', icon: '●', label: 'Live Chat' },
};

const ALL_CHANNELS = ['All', ...Object.keys(CHANNEL_CONFIG), 'Unread', 'Open', 'Closed'];

// Channel icon pill badge
function ChannelBadge({ channel, size = 'sm' }) {
  const cfg = CHANNEL_CONFIG[channel] || { color: '#8A8A9E', bg: '#1C1C22', icon: '?', label: channel };
  const pad = size === 'sm' ? '2px 7px' : '3px 10px';
  const fs = size === 'sm' ? '10px' : '12px';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: pad, borderRadius: '999px', fontSize: fs, fontWeight: 600,
      background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}33`,
    }}>
      <span style={{ fontSize: size === 'sm' ? '9px' : '11px' }}>{cfg.icon}</span>
      {cfg.label}
    </span>
  );
}

// Dot indicator in avatar corner
function ChannelDot({ channel }) {
  const cfg = CHANNEL_CONFIG[channel] || { color: '#8A8A9E', icon: '?' };
  return (
    <div style={{
      position: 'absolute', bottom: '-2px', right: '-2px',
      width: '14px', height: '14px', borderRadius: '50%',
      background: cfg.color, border: '2px solid #141418',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '6px', color: '#fff', fontWeight: 900, lineHeight: 1,
    }}>{cfg.icon}</div>
  );
}

const quickReplies = [
  'Order is confirmed! ✅',
  'Shipped via TCS 🚚',
  'We have it in stock!',
  'Please share your address',
  'COD available 💰',
  'Use code SAVE10 for 10% off',
];

export default function Conversations() {
  const [activeTab, setActiveTab] = useState('All');
  const [conversations, setConversations] = useState(mockConversations);
  const [selectedConv, setSelectedConv] = useState(mockConversations[0]);
  const [message, setMessage] = useState('');
  const [aiEnabled, setAiEnabled] = useState(true);
  const [localMessages, setLocalMessages] = useState({});
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/api/conversations?limit=100').then(data => {
      if (data.success && data.data?.length > 0) {
        const mapped = data.data.map(c => ({
          id: c._id, customer: c.customerName || c.customer || 'Unknown',
          channel: c.channel || 'WhatsApp', status: c.status || 'Open',
          unread: c.unreadCount || 0,
          lastMessage: c.lastMessage?.text || c.messages?.[c.messages.length - 1]?.text || '',
          time: c.updatedAt ? new Date(c.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
          messages: (c.messages || []).map(m => ({ id: m._id, sender: m.sender === 'agent' ? 'agent' : 'customer', text: m.text, time: m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '' })),
          avatar: c.customerName?.[0]?.toUpperCase() || '?',
        }));
        setConversations(mapped);
        setSelectedConv(mapped[0]);
      }
    }).catch(() => {});
  }, []);

  // Channel filter tabs: show grouped channels + utility filters
  const channelTabs = ['All', ...Object.keys(CHANNEL_CONFIG), 'Unread', 'Open', 'Closed'];

  const filtered = conversations.filter(c => {
    const matchesSearch = !search || c.customer.toLowerCase().includes(search.toLowerCase()) || c.lastMessage.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (activeTab === 'All') return true;
    if (activeTab === 'Unread') return c.unread > 0;
    if (activeTab === 'Open') return c.status === 'Open';
    if (activeTab === 'Closed') return c.status === 'Closed';
    return c.channel === activeTab;
  });

  const currentMessages = [
    ...(selectedConv?.messages || []),
    ...(localMessages[selectedConv?.id] || []),
  ];

  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim() || !selectedConv || sending) return;
    const text = message.trim();
    setMessage('');
    setSending(true);
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg = { id: tempId, sender: 'agent', text, time: 'now', isBot: false };
    setLocalMessages(prev => ({ ...prev, [selectedConv.id]: [...(prev[selectedConv.id] || []), optimisticMsg] }));
    try {
      const res = await api.post(`/api/conversations/${selectedConv.id}/messages`, { body: text, sender: 'agent' });
      if (res.success) {
        const msgs = res.data?.messages || [];
        const saved = msgs[msgs.length - 1];
        setLocalMessages(prev => ({
          ...prev,
          [selectedConv.id]: (prev[selectedConv.id] || []).map(m => m.id === tempId
            ? { id: saved?._id || tempId, sender: 'agent', text: saved?.body || text, time: saved?.sentAt ? new Date(saved.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'now', isBot: false }
            : m),
        }));
        setConversations(prev => prev.map(c => c.id === selectedConv.id ? { ...c, lastMessage: text, time: 'now' } : c));
      } else {
        setLocalMessages(prev => ({ ...prev, [selectedConv.id]: (prev[selectedConv.id] || []).filter(m => m.id !== tempId) }));
        setMessage(text);
      }
    } catch (err) {
      setLocalMessages(prev => ({ ...prev, [selectedConv.id]: (prev[selectedConv.id] || []).filter(m => m.id !== tempId) }));
      setMessage(text);
    } finally {
      setSending(false);
    }
  };

  // Count per channel for badges
  const counts = {};
  conversations.forEach(c => { counts[c.channel] = (counts[c.channel] || 0) + 1; });
  const unreadTotal = conversations.filter(c => c.unread > 0).length;

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>

      {/* ── Left Inbox Panel ── */}
      <div style={{ width: '320px', minWidth: '320px', borderRight: '1px solid #2A2A35', display: 'flex', flexDirection: 'column', height: '100%', background: '#141418' }}>

        {/* Header */}
        <div style={{ padding: '16px', borderBottom: '1px solid #1F1F28', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontWeight: 700, fontSize: '16px', color: '#F0EFF6' }}>Conversations</span>
            <span style={{ background: '#7C6AF7', color: '#fff', borderRadius: '999px', padding: '2px 8px', fontSize: '11px', fontWeight: 700 }}>{conversations.length}</span>
          </div>

          {/* Search */}
          <div style={{ position: 'relative', marginBottom: '12px' }}>
            <Search size={13} color="#55556A" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search conversations..."
              style={{ width: '100%', background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '8px', padding: '8px 10px 8px 30px', color: '#F0EFF6', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {/* Channel filter tabs — scrollable row */}
          <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '2px', scrollbarWidth: 'none' }}>
            {channelTabs.map(t => {
              const cfg = CHANNEL_CONFIG[t];
              const isActive = activeTab === t;
              const count = t === 'Unread' ? unreadTotal : (cfg ? counts[t] : null);
              return (
                <button key={t} onClick={() => setActiveTab(t)} style={{
                  flexShrink: 0,
                  padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 500,
                  cursor: 'pointer', border: 'none', whiteSpace: 'nowrap',
                  background: isActive ? (cfg ? cfg.bg : '#2A2550') : 'transparent',
                  color: isActive ? (cfg ? cfg.color : '#7C6AF7') : '#8A8A9E',
                  transition: 'all 0.15s',
                }}>
                  {cfg ? `${cfg.icon} ${t}` : t}
                  {count > 0 && <span style={{ marginLeft: '4px', background: isActive ? (cfg?.color || '#7C6AF7') : '#2A2A35', color: isActive ? '#fff' : '#8A8A9E', borderRadius: '999px', padding: '0 5px', fontSize: '9px', fontWeight: 700 }}>{count}</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Conversation List */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filtered.length === 0 && (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: '#55556A', fontSize: '13px' }}>No conversations found</div>
          )}
          {filtered.map(conv => (
            <div key={conv.id}
              onClick={() => setSelectedConv(conv)}
              style={{
                padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid #1F1F28',
                background: selectedConv?.id === conv.id ? '#1C1C22' : 'transparent',
                borderLeft: selectedConv?.id === conv.id ? '3px solid #7C6AF7' : '3px solid transparent',
                transition: 'all 0.1s',
              }}
              onMouseEnter={e => { if (selectedConv?.id !== conv.id) e.currentTarget.style.background = '#1A1A20'; }}
              onMouseLeave={e => { if (selectedConv?.id !== conv.id) e.currentTarget.style.background = 'transparent'; }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#2A2550', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#7C6AF7' }}>{conv.avatar}</div>
                  <ChannelDot channel={conv.channel} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                    <span style={{ fontSize: '13px', fontWeight: conv.unread > 0 ? 700 : 500, color: '#F0EFF6', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{conv.customer}</span>
                    <span style={{ fontSize: '10px', color: '#55556A', flexShrink: 0, marginLeft: '6px' }}>{conv.time}</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#8A8A9E', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '6px' }}>{conv.lastMessage}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ChannelBadge channel={conv.channel} />
                    <Badge status={conv.status} />
                    {conv.unread > 0 && (
                      <span style={{ background: '#7C6AF7', color: '#fff', borderRadius: '999px', padding: '1px 6px', fontSize: '10px', fontWeight: 700, marginLeft: 'auto' }}>{conv.unread}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right Chat Panel ── */}
      {selectedConv ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

          {/* Chat Header */}
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #1F1F28', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, background: '#141418' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ position: 'relative' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#2A2550', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: '#7C6AF7' }}>{selectedConv.avatar}</div>
                <ChannelDot channel={selectedConv.channel} />
              </div>
              <div>
                <div style={{ fontWeight: 600, color: '#F0EFF6', fontSize: '15px' }}>{selectedConv.customer}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                  <ChannelBadge channel={selectedConv.channel} size="sm" />
                  <Badge status={selectedConv.status} />
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* AI Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: '#1C1C22', borderRadius: '8px', border: '1px solid #2A2A35' }}>
                <Bot size={13} color={aiEnabled ? '#7C6AF7' : '#55556A'} />
                <span style={{ fontSize: '11px', color: aiEnabled ? '#7C6AF7' : '#55556A', fontWeight: 600 }}>AI {aiEnabled ? 'ON' : 'OFF'}</span>
                <button onClick={() => setAiEnabled(!aiEnabled)} style={{
                  width: '36px', height: '20px', borderRadius: '10px', cursor: 'pointer', border: 'none',
                  background: aiEnabled ? '#7C6AF7' : '#2A2A35', position: 'relative', transition: 'background 0.2s',
                }}>
                  <span style={{ position: 'absolute', top: '2px', left: aiEnabled ? '18px' : '2px', width: '16px', height: '16px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
                </button>
              </div>
              {/* Action icons */}
              {[Phone, Video, Info, MoreVertical].map((Icon, i) => (
                <button key={i} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8A8A9E', display: 'flex', padding: '4px' }}>
                  <Icon size={16} />
                </button>
              ))}
            </div>
          </div>

          {/* Messages area */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', background: '#0D0D0F' }}>
            {/* Channel header */}
            <div style={{ textAlign: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '11px', color: '#55556A', background: '#141418', padding: '4px 12px', borderRadius: '999px', border: '1px solid #1F1F28' }}>
                Conversation via {CHANNEL_CONFIG[selectedConv.channel]?.label || selectedConv.channel}
              </span>
            </div>

            {currentMessages.map(msg => {
              const isCustomer = msg.sender === 'customer';
              const isBot = msg.isBot;
              const channelColor = CHANNEL_CONFIG[selectedConv.channel]?.color || '#7C6AF7';
              return (
                <div key={msg.id} style={{ display: 'flex', justifyContent: isCustomer ? 'flex-start' : 'flex-end', alignItems: 'flex-end', gap: '8px' }}>
                  {isCustomer && (
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#2A2550', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 700, color: '#7C6AF7', flexShrink: 0 }}>{selectedConv.avatar}</div>
                  )}
                  <div style={{ maxWidth: '68%' }}>
                    {isBot && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px', justifyContent: 'flex-end' }}>
                        <Bot size={11} color="#7C6AF7" />
                        <span style={{ fontSize: '10px', color: '#7C6AF7', fontWeight: 600 }}>Zara 🤖</span>
                      </div>
                    )}
                    <div style={{
                      padding: '10px 14px',
                      borderRadius: isCustomer ? '4px 14px 14px 14px' : '14px 4px 14px 14px',
                      background: isCustomer ? '#1C1C22' : isBot ? '#2A2550' : channelColor + '22',
                      color: '#F0EFF6', fontSize: '13px', lineHeight: 1.55,
                      border: isCustomer ? '1px solid #2A2A35' : isBot ? `1px solid #7C6AF733` : `1px solid ${channelColor}44`,
                    }}>{msg.text}</div>
                    <div style={{ fontSize: '10px', color: '#55556A', marginTop: '4px', textAlign: isCustomer ? 'left' : 'right' }}>{msg.time}</div>
                  </div>
                  {!isCustomer && (
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: isBot ? '#2A2550' : CHANNEL_CONFIG[selectedConv.channel]?.bg || '#1C1C22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', flexShrink: 0, border: `1px solid ${CHANNEL_CONFIG[selectedConv.channel]?.color || '#7C6AF7'}44` }}>
                      {isBot ? '🤖' : '👤'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick replies */}
          <div style={{ padding: '10px 20px 6px', display: 'flex', gap: '6px', flexWrap: 'wrap', flexShrink: 0, background: '#141418', borderTop: '1px solid #1F1F28' }}>
            <span style={{ fontSize: '10px', color: '#55556A', alignSelf: 'center', marginRight: '4px' }}>Quick:</span>
            {quickReplies.map(q => (
              <button key={q} onClick={() => setMessage(q)} style={{
                padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 500,
                cursor: 'pointer', border: '1px solid #2A2A35', background: '#1C1C22', color: '#8A8A9E',
                transition: 'all 0.1s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = '#23232B'; e.currentTarget.style.color = '#F0EFF6'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#1C1C22'; e.currentTarget.style.color = '#8A8A9E'; }}
              >{q}</button>
            ))}
          </div>

          {/* Input */}
          <div style={{ padding: '12px 20px', borderTop: '1px solid #1F1F28', display: 'flex', gap: '10px', flexShrink: 0, background: '#141418', alignItems: 'flex-end' }}>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder={`Reply via ${CHANNEL_CONFIG[selectedConv.channel]?.label || selectedConv.channel}...`}
              rows={1}
              style={{ flex: 1, background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '10px', padding: '10px 14px', color: '#F0EFF6', fontSize: '13px', outline: 'none', resize: 'none', fontFamily: 'DM Sans, sans-serif', lineHeight: 1.5 }}
            />
            <button onClick={handleSend} disabled={sending} style={{
              background: CHANNEL_CONFIG[selectedConv.channel]?.color || '#7C6AF7',
              border: 'none', borderRadius: '10px', padding: '10px 14px', cursor: sending ? 'default' : 'pointer', opacity: sending ? 0.6 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Send size={15} color="#fff" />
            </button>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#55556A', gap: '12px' }}>
          <div style={{ fontSize: '40px' }}>💬</div>
          <div style={{ fontSize: '15px', color: '#8A8A9E' }}>Select a conversation</div>
          <div style={{ fontSize: '12px' }}>Choose from {conversations.length} active conversations</div>
        </div>
      )}
    </div>
  );
}
