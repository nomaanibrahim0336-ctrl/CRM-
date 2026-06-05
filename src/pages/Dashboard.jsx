import React from 'react';
import { ShoppingCart, DollarSign, Users, Clock, ShoppingBag, MessageSquare, Truck, UserPlus, CreditCard, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import PageWrapper from '../components/layout/PageWrapper';
import StatCard from '../components/ui/StatCard';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { revenueData, ordersBySource, orders, activityFeed } from '../data/mockData';

const iconMap = { ShoppingBag, MessageSquare, Truck, UserPlus, CreditCard, RefreshCw };
const activityColors = { order: '#7C6AF7', message: '#3A8AE8', customer: '#1DB87A', payment: '#F5A623' };

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '8px', padding: '10px 14px' }}>
        <div style={{ color: '#8A8A9E', fontSize: '11px', marginBottom: '4px' }}>{label}</div>
        <div style={{ color: '#7C6AF7', fontWeight: 600, fontSize: '14px' }}>PKR {payload[0].value.toLocaleString()}</div>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  return (
    <PageWrapper title="Dashboard" subtitle="Welcome back, here's what's happening today">
      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <StatCard title="Total Orders" value="1,284" change="+12%" changeType="positive" icon={ShoppingCart} iconColor="#7C6AF7" />
        <StatCard title="Revenue" value="PKR 842K" change="+8.2%" changeType="positive" icon={DollarSign} iconColor="#1DB87A" />
        <StatCard title="Customers" value="3,410" change="+5.1%" changeType="positive" icon={Users} iconColor="#3A8AE8" />
        <StatCard title="Pending Shipment" value="47" icon={Clock} iconColor="#F5A623" />
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '16px', marginBottom: '24px' }}>
        <Card>
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '14px', color: '#F0EFF6' }}>Revenue Last 30 Days</div>
              <div style={{ fontSize: '12px', color: '#55556A', marginTop: '2px' }}>Nov 5 – Dec 4, 2024</div>
            </div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#1DB87A' }}>PKR 842K</div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={revenueData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <XAxis dataKey="date" tick={{ fill: '#55556A', fontSize: 10 }} tickLine={false} axisLine={false}
                interval={4} />
              <YAxis tick={{ fill: '#55556A', fontSize: 10 }} tickLine={false} axisLine={false}
                tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="revenue" stroke="#7C6AF7" strokeWidth={2} dot={false}
                activeDot={{ r: 4, fill: '#7C6AF7', stroke: '#2A2550', strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <div style={{ fontWeight: 600, fontSize: '14px', color: '#F0EFF6', marginBottom: '16px' }}>Orders by Source</div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <PieChart width={180} height={180}>
              <Pie data={ordersBySource} cx={85} cy={85} innerRadius={50} outerRadius={80}
                paddingAngle={3} dataKey="value">
                {ordersBySource.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(v, n) => [`${v}%`, n]} contentStyle={{ background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '8px', fontSize: '12px' }} />
            </PieChart>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
            {ordersBySource.map((s) => (
              <div key={s.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: s.color }} />
                  <span style={{ fontSize: '12px', color: '#8A8A9E' }}>{s.name}</span>
                </div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#F0EFF6' }}>{s.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Bottom Row: Table + Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '16px' }}>
        <Card style={{ padding: 0 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #1F1F28', fontWeight: 600, fontSize: '14px' }}>
            Recent Orders
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#1C1C22' }}>
                {['Order ID', 'Customer', 'Amount', 'Status', 'Date'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#55556A', letterSpacing: '0.05em', textTransform: 'uppercase', borderBottom: '1px solid #1F1F28' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 8).map(o => (
                <tr key={o.id}
                  onMouseEnter={e => e.currentTarget.style.background = '#23232B'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  style={{ borderBottom: '1px solid #1F1F28', cursor: 'pointer', transition: 'background 0.1s' }}>
                  <td style={{ padding: '11px 16px', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: '#7C6AF7' }}>{o.id}</td>
                  <td style={{ padding: '11px 16px', fontSize: '13px', color: '#F0EFF6' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#2A2550', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: '#7C6AF7', flexShrink: 0 }}>{o.avatar}</div>
                      {o.customer}
                    </div>
                  </td>
                  <td style={{ padding: '11px 16px', fontSize: '13px', color: '#F0EFF6', fontWeight: 500 }}>PKR {o.amount.toLocaleString()}</td>
                  <td style={{ padding: '11px 16px' }}><Badge status={o.status} /></td>
                  <td style={{ padding: '11px 16px', fontSize: '12px', color: '#8A8A9E' }}>{o.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card>
          <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '16px' }}>Live Activity</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {activityFeed.map((item, i) => {
              const Icon = iconMap[item.icon] || ShoppingBag;
              const color = activityColors[item.type] || '#8A8A9E';
              return (
                <div key={item.id} style={{
                  display: 'flex', gap: '12px', paddingBottom: '14px',
                  borderLeft: i < activityFeed.length - 1 ? `2px solid #1F1F28` : 'none',
                  marginLeft: '10px', paddingLeft: '14px', position: 'relative',
                }}>
                  <div style={{
                    position: 'absolute', left: '-9px', top: '2px',
                    width: '16px', height: '16px', borderRadius: '50%',
                    background: color + '22', border: `2px solid ${color}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Icon size={8} color={color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '12px', color: '#F0EFF6', lineHeight: 1.4 }}>{item.text}</div>
                    <div style={{ fontSize: '11px', color: '#55556A', marginTop: '2px' }}>{item.time}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </PageWrapper>
  );
}
