import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ title, value, change, changeType = 'positive', icon: Icon, iconColor = '#7C6AF7' }) {
  const isPositive = changeType === 'positive';
  return (
    <div style={{
      background: '#141418',
      border: '1px solid #2A2A35',
      borderRadius: '12px',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ color: '#8A8A9E', fontSize: '13px', fontWeight: 500 }}>{title}</span>
        {Icon && (
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: iconColor + '22',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Icon size={18} color={iconColor} />
          </div>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
        <span style={{ fontSize: '26px', fontWeight: 700, color: '#F0EFF6', lineHeight: 1 }}>{value}</span>
        {change && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            color: isPositive ? '#1DB87A' : '#E2514A',
            fontSize: '12px',
            fontWeight: 500,
            paddingBottom: '2px',
          }}>
            {isPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
            {change}
          </div>
        )}
      </div>
    </div>
  );
}
