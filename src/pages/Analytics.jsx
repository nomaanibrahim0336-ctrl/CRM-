import React, { useState, useEffect } from 'react';
import { TrendingUp, ShoppingCart, DollarSign, Percent, Download } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import PageWrapper from '../components/layout/PageWrapper';
import StatCard from '../components/ui/StatCard';
import Card from '../components/ui/Card';
import { revenueData, topProducts, ordersBySource, metaAdsData, courierData } from '../data/mockData';
import { exportCsv } from '../utils/exportCsv';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';

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

const RANGE_OPTIONS = ['7D', '30D', '90D', 'This Month', 'Custom'];

function getDataForRange(range) {
  if (range === '7D') return revenueData.slice(-7);
  if (range === '30D') return revenueData;
  if (range === '90D') {
    // repeat data 3x with shifted dates
    return [...revenueData, ...revenueData.map((d, i) => ({ ...d, date: `D+${revenueData.length + i}` })), ...revenueData.map((d, i) => ({ ...d, date: `D+${revenueData.length * 2 + i}` }))];
  }
  if (range === 'This Month') return revenueData.filter(d => d.date.startsWith('Dec'));
  return revenueData;
}

function getKpiMultiplier(range) {
  if (range === '7D') return 7 / 30;
  if (range === '90D') return 3;
  if (range === 'This Month') return 1;
  return 1;
}

export default function Analytics() {
  const addToast = useToast();
  const [range, setRange] = useState('30D');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  const chartData = getDataForRange(range);
  const mult = getKpiMultiplier(range);
  const totalRevenue = Math.round(chartData.reduce((s, d) => s + d.revenue, 0));

  const kpis = {
    revenue: `PKR ${(842000 * mult / 1000).toFixed(0)}K`,
    orders: Math.round(1284 * mult).toLocaleString(),
    aov: `PKR ${Math.round(6556 * (range === '90D' ? 1 : mult > 1 ? 1 : 1)).toLocaleString()}`,
    convRate: `${(3.8 * (range === '7D' ? 0.95 : range === '90D' ? 1.05 : 1)).toFixed(1)}%`,
  };

  const inputStyle = { background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '7px', padding: '6px 10px', color: '#F0EFF6', fontSize: '12px', outline: 'none' };

  return (
    <PageWrapper title="Analytics" subtitle={`Performance overview — ${range === 'Custom' ? `${customFrom || 'From'} to ${customTo || 'To'}` : range}`}>
      {/* Date Range Selector */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '4px', background: '#1C1C22', padding: '4px', borderRadius: '10px' }}>
          {RANGE_OPTIONS.map(r => (
            <button key={r} onClick={() => setRange(r)} style={{ padding: '6px 14px', borderRadius: '7px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', border: 'none', background: range === r ? '#2A2550' : 'transparent', color: range === r ? '#7C6AF7' : '#8A8A9E', transition: 'all 0.15s' }}>{r}</button>
          ))}
        </div>
        {range === 'Custom' && (
          <>
            <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)} style={inputStyle} />
            <span style={{ color: '#55556A', fontSize: '12px' }}>to</span>
            <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)} style={inputStyle} />
          </>
        )}
        <button onClick={() => { exportCsv('revenue.csv', chartData); addToast('CSV exported', 'success'); }}
          style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '8px', color: '#8A8A9E', fontSize: '12px', cursor: 'pointer' }}>
          <Download size={13} /> Export
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <StatCard title="Revenue" value={kpis.revenue} change="+8.2%" changeType="positive" icon={DollarSign} iconColor="#1DB87A" />
        <StatCard title="Total Orders" value={kpis.orders} change="+12%" changeType="positive" icon={ShoppingCart} iconColor="#7C6AF7" />
        <StatCard title="Avg Order Value" value={kpis.aov} change="+3.4%" changeType="positive" icon={TrendingUp} iconColor="#3A8AE8" />
        <StatCard title="Conversion Rate" value={kpis.convRate} change="+0.6%" changeType="positive" icon={Percent} iconColor="#F5A623" />
      </div>

      {/* Revenue Chart */}
      <Card style={{ marginBottom: '20px' }}>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '14px' }}>Revenue Trend</div>
            <div style={{ fontSize: '12px', color: '#55556A', marginTop: '2px' }}>{range} revenue</div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#1DB87A' }}>PKR {totalRevenue.toLocaleString()}</div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={chartData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1F1F28" />
            <XAxis dataKey="date" tick={{ fill: '#55556A', fontSize: 10 }} tickLine={false} axisLine={false} interval={Math.max(0, Math.floor(chartData.length / 8))} />
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
            <div style={{ fontSize: '12px', color: '#55556A', marginTop: '2px' }}>Active campaigns — {range}</div>
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
                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#F0EFF6' }}>PKR {Math.round(ad.spend * mult).toLocaleString()}</td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#8A8A9E' }}>{Math.round(ad.impressions * mult).toLocaleString()}</td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#8A8A9E' }}>{Math.round(ad.clicks * mult).toLocaleString()}</td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#1DB87A', fontWeight: 600 }}>{Math.round(ad.conversions * mult)}</td>
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
          <div style={{ fontSize: '12px', color: '#55556A', marginTop: '2px' }}>Delivery success rates — {range}</div>
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
                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#F0EFF6' }}>{Math.round(c.orders * mult)}</td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#1DB87A', fontWeight: 600 }}>{Math.round(c.delivered * mult)}</td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#E2514A', fontWeight: 600 }}>{Math.round(c.failed * mult)}</td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#F5A623' }}>{Math.round(c.pending * mult)}</td>
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
