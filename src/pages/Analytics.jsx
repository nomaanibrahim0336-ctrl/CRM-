import React from 'react';
import { TrendingUp, ShoppingCart, DollarSign, Percent } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import PageWrapper from '../components/layout/PageWrapper';
import StatCard from '../components/ui/StatCard';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { revenueData, topProducts, ordersBySource, metaAdsData, courierData } from '../data/mockData';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '8px', padding: '10px 14px' }}>
        <div style={{ color: '#8A8A9E', fontSize: '11px', marginBottom: '4px' }}>{label}</div>
        <div style={{ color: '#7C6AF7', fontWeight: 600 }}>PKR {payload[0].value.toLocaleString()}</div>
      </div>
    );
  }
  return null;
};

export default function Analytics() {
  return (
    <PageWrapper title="Analytics" subtitle="Performance overview for the last 30 days">
      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <StatCard title="Revenue" value="PKR 842K" change="+8.2%" changeType="positive" icon={DollarSign} iconColor="#1DB87A" />
        <StatCard title="Total Orders" value="1,284" change="+12%" changeType="positive" icon={ShoppingCart} iconColor="#7C6AF7" />
        <StatCard title="Avg Order Value" value="PKR 6,556" change="+3.4%" changeType="positive" icon={TrendingUp} iconColor="#3A8AE8" />
        <StatCard title="Conversion Rate" value="3.8%" change="+0.6%" changeType="positive" icon={Percent} iconColor="#F5A623" />
      </div>

      {/* Revenue Chart */}
      <Card style={{ marginBottom: '20px' }}>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '14px' }}>Revenue Trend</div>
            <div style={{ fontSize: '12px', color: '#55556A', marginTop: '2px' }}>Last 30 days daily revenue</div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#1DB87A' }}>PKR 842,300</div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={revenueData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1F1F28" />
            <XAxis dataKey="date" tick={{ fill: '#55556A', fontSize: 10 }} tickLine={false} axisLine={false} interval={4} />
            <YAxis tick={{ fill: '#55556A', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="revenue" stroke="#7C6AF7" strokeWidth={2.5} dot={false}
              activeDot={{ r: 5, fill: '#7C6AF7', stroke: '#2A2550', strokeWidth: 2 }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        <Card>
          <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '16px' }}>Top Products by Revenue</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={topProducts} layout="vertical" margin={{ top: 0, right: 16, left: 60, bottom: 0 }}>
              <XAxis type="number" tick={{ fill: '#55556A', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#8A8A9E', fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip formatter={v => [`PKR ${v.toLocaleString()}`, 'Revenue']} contentStyle={{ background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '8px', fontSize: '12px' }} />
              <Bar dataKey="revenue" fill="#7C6AF7" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>Orders by Source</div>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
            <PieChart width={180} height={160}>
              <Pie data={ordersBySource} cx={85} cy={75} innerRadius={45} outerRadius={72} paddingAngle={3} dataKey="value">
                {ordersBySource.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip formatter={(v, n) => [`${v}%`, n]} contentStyle={{ background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '8px', fontSize: '12px' }} />
            </PieChart>
          </div>
          {ordersBySource.map(s => (
            <div key={s.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: s.color }} />
                <span style={{ fontSize: '12px', color: '#8A8A9E' }}>{s.name}</span>
              </div>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#F0EFF6' }}>{s.value}%</span>
            </div>
          ))}
        </Card>
      </div>

      {/* Meta Ads */}
      <Card style={{ marginBottom: '20px', padding: 0 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #1F1F28', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '14px' }}>Meta Ads Performance</div>
            <div style={{ fontSize: '12px', color: '#55556A', marginTop: '2px' }}>Active campaigns last 30 days</div>
          </div>
          <span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '6px', background: '#3A8AE833', color: '#3A8AE8', border: '1px solid #3A8AE844' }}>Meta Ads</span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#1C1C22' }}>
              {['Campaign', 'Spend', 'Impressions', 'Clicks', 'Conversions', 'ROAS'].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#55556A', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid #1F1F28' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {metaAdsData.map((ad, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #1F1F28' }}
                onMouseEnter={e => e.currentTarget.style.background = '#23232B'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#F0EFF6', fontWeight: 500 }}>{ad.campaign}</td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#F0EFF6' }}>PKR {ad.spend.toLocaleString()}</td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#8A8A9E' }}>{ad.impressions.toLocaleString()}</td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#8A8A9E' }}>{ad.clicks.toLocaleString()}</td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#1DB87A', fontWeight: 600 }}>{ad.conversions}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ padding: '3px 8px', borderRadius: '5px', fontSize: '12px', fontWeight: 700, background: ad.roas >= 5 ? '#0F3D2A' : '#2A2550', color: ad.roas >= 5 ? '#1DB87A' : '#7C6AF7' }}>{ad.roas}x</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Courier Performance */}
      <Card style={{ padding: 0 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #1F1F28' }}>
          <div style={{ fontWeight: 600, fontSize: '14px' }}>Courier Performance</div>
          <div style={{ fontSize: '12px', color: '#55556A', marginTop: '2px' }}>Delivery success rates this month</div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#1C1C22' }}>
              {['Courier', 'Total Orders', 'Delivered', 'Failed', 'Pending', 'Success Rate'].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#55556A', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid #1F1F28' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {courierData.map((c, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #1F1F28' }}
                onMouseEnter={e => e.currentTarget.style.background = '#23232B'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#F0EFF6', fontWeight: 600 }}>{c.courier}</td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#F0EFF6' }}>{c.orders}</td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#1DB87A', fontWeight: 600 }}>{c.delivered}</td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#E2514A', fontWeight: 600 }}>{c.failed}</td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#F5A623' }}>{c.pending}</td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ flex: 1, height: '6px', background: '#1C1C22', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${c.successRate}%`, height: '100%', background: c.successRate >= 92 ? '#1DB87A' : c.successRate >= 90 ? '#F5A623' : '#E2514A', borderRadius: '3px' }} />
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#F0EFF6', minWidth: '40px' }}>{c.successRate}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </PageWrapper>
  );
}
