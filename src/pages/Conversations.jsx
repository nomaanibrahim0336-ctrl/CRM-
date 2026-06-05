import React, { useState } from 'react';
import { Send, Bot, Zap, MoreVertical } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { conversations } from '../data/mockData';

const channelColors = { WhatsApp: '#25D366', Instagram: '#E1306C' };
const tabs = ['All', 'WhatsApp', 'Instagram', 'Unread', 'Open', 'Closed'];

export default function Conversations() {
  const [activeTab, setActiveTab] = useState('All');
  const [selectedConv, setSelectedConv] = useState(conversations[0]);
  const [message, setMessage] = useState('');
  const [aiEnabled, setAiEnabled] = useState(true);
  const [localMessages, setLocalMessages] = useState({});

  const filtered = conversations.filter(c => {
    if (activeTab === 'All') return true;
    if (activeTab === 'WhatsApp') return c.channel === 'WhatsApp';
    if (activeTab === 'Instagram') return c.channel === 'Instagram';
    if (activeTab === 'Unread') return c.unread > 0;
    if (activeTab === 'Open') return c.status === 'Open';
    if (activeTab === 'Closed') return c.status === 'Closed';
    return true;
  });

  const currentMessages = [
    ...(selectedConv?.messages || []),
    ...(localMessages[selectedConv?.id] || []),
  ];

  const handleSend = () => {
    if (!message.trim() || !selectedConv) return;
    const newMsg = { id: Date.now(), sender: 'agent', text: message, time: 'now', isBot: false };
    setLocalMessages(prev => ({ ...prev, [selectedConv.id]: [...(prev[selectedConv.id] || []), newMsg] }));
    setMessage('');
  };

  const quickReplies = ['Order is confirmed!', 'Shipped via TCS', 'We have it in stock!', 'Please share your address'];

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Inbox List */}
      <div style={{ width: '320px', minWidth: '320px', borderRight: '1px solid #2A2A35', display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid #1F1F28' }}>
          <div style={{ fontWeight: 700, fontSize: '16px', color: '#F0EFF6', marginBottom: '12px' }}>DM Conversations</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {tabs.map(t => (
              <button key={t} onClick={() => setActiveTab(t)} style={{
                padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 500,
                cursor: 'pointer', border: 'none', background: activeTab === t ? '#2A2550' : 'transparent',
                color: activeTab === t ? '#7C6AF7' : '#8A8A9E', transition: 'all 0.15s',
              }}>{t}</button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filtered.map(conv => (
            <div key={conv.id}
              onClick={() => setSelectedConv(conv)}
              style={{
                padding: '14px 16px', cursor: 'pointer', borderBottom: '1px solid #1F1F28',
                background: selectedConv?.id === conv.id ? '#2A2550' : 'transparent',
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => { if (selectedConv?.id !== conv.id) e.currentTarget.style.background = '#23232B'; }}
              onMouseLeave={e => { if (selectedConv?.id !== conv.id) e.currentTarget.style.background = 'transparent'; }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#2A2550', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#7C6AF7' }}>{conv.avatar}</div>
                  <div style={{ position: 'absolute', bottom: '-1px', right: '-1px', width: '12px', height: '12px', borderRadius: '50%', background: channelColors[conv.channel] || '#8A8A9E', border: '2px solid #141418', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '7px', color: '#fff', fontWeight: 700 }}>
                    {conv.channel === 'WhatsApp' ? 'W' : 'I'}
                  </div>
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#F0EFF6' }}>{conv.customer}</span>
                    <span style={{ fontSize: '11px', color: '#55556A' }}>{conv.time}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#8A8A9E', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '2px' }}>{conv.lastMessage}</div>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                    <Badge status={conv.status} />
                    {conv.unread > 0 && (
                      <span style={{ background: '#7C6AF7', color: '#fff', borderRadius: '999px', padding: '0 6px', fontSize: '10px', fontWeight: 700, display: 'inline-flex', alignItems: 'center' }}>{conv.unread}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat View */}
      {selectedConv ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
          {/* Chat Header */}
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #1F1F28', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#2A2550', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#7C6AF7' }}>{selectedConv.avatar}</div>
              <div>
                <div style={{ fontWeight: 600, color: '#F0EFF6', fontSize: '14px' }}>{selectedConv.customer}</div>
                <div style={{ fontSize: '11px', color: channelColors[selectedConv.channel] || '#8A8A9E' }}>{selectedConv.channel}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bot size={14} color={aiEnabled ? '#7C6AF7' : '#55556A'} />
                <span style={{ fontSize: '12px', color: aiEnabled ? '#7C6AF7' : '#55556A' }}>AI {aiEnabled ? 'ON' : 'OFF'}</span>
                <button onClick={() => setAiEnabled(!aiEnabled)} style={{
                  width: '36px', height: '20px', borderRadius: '10px', cursor: 'pointer', border: 'none',
                  background: aiEnabled ? '#7C6AF7' : '#2A2A35', position: 'relative', transition: 'background 0.2s',
                }}>
                  <span style={{ position: 'absolute', top: '2px', left: aiEnabled ? '18px' : '2px', width: '16px', height: '16px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
                </button>
              </div>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8A8A9E', display: 'flex' }}><MoreVertical size={16} /></button>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {currentMessages.map(msg => {
              const isAgent = msg.sender === 'agent';
              const isBot = msg.isBot;
              const isCustomer = msg.sender === 'customer';
              return (
                <div key={msg.id} style={{ display: 'flex', justifyContent: isCustomer ? 'flex-start' : 'flex-end', alignItems: 'flex-end', gap: '6px' }}>
                  {isCustomer && (
                    <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#2A2550', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 700, color: '#7C6AF7', flexShrink: 0 }}>{selectedConv.avatar}</div>
                  )}
                  <div style={{ maxWidth: '70%' }}>
                    {isBot && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px', justifyContent: 'flex-end' }}>
                        <Bot size={11} color="#7C6AF7" />
                        <span style={{ fontSize: '10px', color: '#7C6AF7', fontWeight: 600 }}>AI Bot</span>
                      </div>
                    )}
                    <div style={{
                      padding: '10px 14px', borderRadius: isCustomer ? '12px 12px 12px 4px' : '12px 12px 4px 12px',
                      background: isCustomer ? '#1C1C22' : (isBot ? '#2A2550' : '#7C6AF7'),
                      color: '#F0EFF6', fontSize: '13px', lineHeight: 1.5,
                      border: isCustomer ? '1px solid #2A2A35' : 'none',
                    }}>{msg.text}</div>
                    <div style={{ fontSize: '10px', color: '#55556A', marginTop: '4px', textAlign: isCustomer ? 'left' : 'right' }}>{msg.time}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Replies */}
          <div style={{ padding: '0 20px 10px', display: 'flex', gap: '6px', flexWrap: 'wrap', flexShrink: 0 }}>
            {quickReplies.map(q => (
              <button key={q} onClick={() => setMessage(q)} style={{
                padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 500,
                cursor: 'pointer', border: '1px solid #2A2A35', background: '#1C1C22', color: '#8A8A9E',
              }}>{q}</button>
            ))}
          </div>

          {/* Input */}
          <div style={{ padding: '12px 20px', borderTop: '1px solid #1F1F28', display: 'flex', gap: '10px', flexShrink: 0 }}>
            <input value={message} onChange={e => setMessage(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Type a message..."
              style={{ flex: 1, background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '8px', padding: '10px 14px', color: '#F0EFF6', fontSize: '13px', outline: 'none' }} />
            <Button variant="primary" onClick={handleSend}><Send size={14} /></Button>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#55556A' }}>
          Select a conversation to start chatting
        </div>
      )}
    </div>
  );
}
