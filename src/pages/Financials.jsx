import React, { useState } from 'react';
import {
  DollarSign, TrendingUp, TrendingDown, BarChart2, FileText,
  Download, ArrowUpRight, ArrowDownRight, Calculator, PieChart as PieIcon,
  CreditCard, ShoppingBag, Truck, Users, Megaphone, Package, AlertCircle,
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  monthlyFinancials, expenseBreakdown, productProfitability, cashflow, taxSummary,
} from '../data/mockData';

// ── Helpers ──────────────────────────────────────────────

const fmt = n => `PKR ${Number(n).toLocaleString()}`;
const fmtK = n => n >= 1000000 ? `PKR ${(n / 1000000).toFixed(2)}M` : `PKR ${(n / 1000).toFixed(0)}K`;

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '8px', padding: '10px 14px', fontSize: '12px' }}>
      <div style={{ color: '#8A8A9E', marginBottom: '6px' }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, marginBottom: '2px' }}>
          {p.name}: <strong>PKR {Number(p.value).toLocaleString()}</strong>
        </div>
      ))}
    </div>
  );
};

// ── Sub-components ───────────────────────────────────────

function KPI({ label, value, sub, trend, trendUp, color, icon: Icon, border }) {
  return (
    <div style={{ flex: 1, minWidth: 0, background: '#141418', border: `1px solid ${border || '#2A2A35'}`, borderRadius: '12px', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <span style={{ fontSize: '11px', color: '#8A8A9E', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
        {Icon && <div style={{ width: '30px', height: '30px', background: '#1C1C22', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={14} color={color || '#7C6AF7'} /></div>}
      </div>
      <div style={{ fontSize: '26px', fontWeight: 700, color: color || '#F0EFF6', marginBottom: '6px' }}>{value}</div>
      {sub && <div style={{ fontSize: '12px', color: '#55556A' }}>{sub}</div>}
      {trend && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px' }}>
          {trendUp ? <ArrowUpRight size={13} color="#1DB87A" /> : <ArrowDownRight size={13} color="#E2514A" />}
          <span style={{ fontSize: '12px', color: trendUp ? '#1DB87A' : '#E2514A', fontWeight: 600 }}>{trend}</span>
        </div>
      )}
    </div>
  );
}

function AccountingRow({ label, value, indent = 0, bold, color, borderTop, borderBottom, highlight }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: `${bold ? '14px' : '10px'} 0`,
      paddingLeft: indent * 20,
      borderTop: borderTop ? '1px solid #2A2A35' : undefined,
      borderBottom: borderBottom ? '1px solid #2A2A35' : undefined,
      background: highlight ? '#1C1C22' : 'transparent',
      margin: highlight ? '0 -20px' : undefined,
      paddingLeft: highlight ? 20 + indent * 20 : indent * 20,
      paddingRight: highlight ? 20 : 0,
    }}>
      <span style={{ fontSize: bold ? '14px' : '13px', color: bold ? '#F0EFF6' : '#8A8A9E', fontWeight: bold ? 700 : 400 }}>{label}</span>
      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: bold ? '15px' : '13px', fontWeight: bold ? 700 : 500, color: color || (bold ? '#F0EFF6' : '#8A8A9E') }}>{value}</span>
    </div>
  );
}

const TABS = ['P&L Statement', 'Revenue', 'Expenses', 'Cash Flow', 'Product Profitability', 'Tax & Compliance'];

// current month
const cur = monthlyFinancials[monthlyFinancials.length - 1];
const prev = monthlyFinancials[monthlyFinancials.length - 2];

export default function Financials() {
  const [activeTab, setActiveTab] = useState('P&L Statement');
  const [period, setPeriod] = useState('Dec 2024');

  const grossMarginPct = ((cur.grossProfit / cur.revenue) * 100).toFixed(1);
  const netMarginPct = ((cur.netProfit / cur.revenue) * 100).toFixed(1);
  const revenueGrowth = (((cur.revenue - prev.revenue) / prev.revenue) * 100).toFixed(1);
  const profitGrowth = (((cur.netProfit - prev.netProfit) / prev.netProfit) * 100).toFixed(1);

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: '#0D0D0F' }}>
      <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', background: '#2A2550', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={18} color="#7C6AF7" />
            </div>
            <div>
              <h1 style={{ color: '#F0EFF6', fontSize: '22px', fontWeight: 700, margin: 0 }}>Financials</h1>
              <p style={{ color: '#55556A', fontSize: '12px', margin: 0 }}>P&L, costing, profit margins, cash flow, and tax</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <select value={period} onChange={e => setPeriod(e.target.value)}
              style={{ background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '8px', padding: '9px 12px', color: '#F0EFF6', fontSize: '13px', outline: 'none', cursor: 'pointer' }}>
              {monthlyFinancials.map(m => <option key={m.month}>{m.month} 2024</option>)}
            </select>
            <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 14px', background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '8px', color: '#8A8A9E', fontSize: '13px', cursor: 'pointer' }}>
              <Download size={14} /> Export PDF
            </button>
          </div>
        </div>

        {/* Top KPIs — always visible */}
        <div style={{ display: 'flex', gap: '14px', marginBottom: '24px' }}>
          <KPI label="Gross Revenue"   value={fmtK(cur.revenue)}    sub="Dec 2024"             trend={`+${revenueGrowth}% vs Nov`} trendUp color="#F0EFF6"  icon={ShoppingBag} />
          <KPI label="Gross Profit"    value={fmtK(cur.grossProfit)} sub={`${grossMarginPct}% margin`} trend="+3.2% vs Nov" trendUp color="#1DB87A"  icon={TrendingUp}  border="#1DB87A22" />
          <KPI label="Total Expenses"  value={fmtK(cur.cogs + cur.opEx)} sub="COGS + OpEx"     trend="+5.1% vs Nov" trendUp={false} color="#E2514A" icon={TrendingDown} border="#E2514A22" />
          <KPI label="Net Profit"      value={fmtK(cur.netProfit)}   sub={`${netMarginPct}% net margin`} trend={`+${profitGrowth}% vs Nov`} trendUp color="#7C6AF7"  icon={DollarSign}  border="#7C6AF722" />
          <KPI label="Total Orders"    value={cur.orders}             sub="This month"          trend="+8.0% vs Nov" trendUp color="#3A8AE8"  icon={Package} />
          <KPI label="Avg Order Value" value={`PKR ${Math.round(cur.revenue / cur.orders).toLocaleString()}`} sub="Per order" color="#F5A623" icon={Calculator} />
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '2px', borderBottom: '1px solid #2A2A35', marginBottom: '24px' }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setActiveTab(t)} style={{
              padding: '10px 16px', background: 'none', border: 'none',
              borderBottom: activeTab === t ? '2px solid #7C6AF7' : '2px solid transparent',
              color: activeTab === t ? '#7C6AF7' : '#8A8A9E', fontSize: '13px',
              fontWeight: activeTab === t ? 600 : 400, cursor: 'pointer', marginBottom: '-1px',
            }}>{t}</button>
          ))}
        </div>

        {/* ── P&L STATEMENT ── */}
        {activeTab === 'P&L Statement' && (
          <div style={{ display: 'flex', gap: '20px' }}>
            {/* P&L Sheet */}
            <div style={{ flex: 1, background: '#141418', border: '1px solid #2A2A35', borderRadius: '12px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <div style={{ color: '#F0EFF6', fontWeight: 700, fontSize: '16px' }}>Profit & Loss Statement</div>
                  <div style={{ color: '#55556A', fontSize: '12px' }}>December 2024</div>
                </div>
                <FileText size={18} color="#55556A" />
              </div>

              {/* Revenue section */}
              <div style={{ marginBottom: '4px' }}>
                <div style={{ fontSize: '10px', color: '#55556A', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px', paddingBottom: '6px', borderBottom: '1px solid #1F1F28' }}>REVENUE</div>
                <AccountingRow label="Gross Sales"           value={fmt(cur.revenue)}                        indent={1} />
                <AccountingRow label="Less: Returns (–)"     value={`(${fmt(18200)})`}                       indent={1} color="#E2514A" />
                <AccountingRow label="Less: Discounts (–)"   value={`(${fmt(12400)})`}                       indent={1} color="#E2514A" />
                <AccountingRow label="Net Revenue"           value={fmt(cur.revenue - 18200 - 12400)}        bold borderTop borderBottom color="#F0EFF6" />
              </div>

              {/* COGS */}
              <div style={{ margin: '12px 0 4px' }}>
                <div style={{ fontSize: '10px', color: '#55556A', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px', paddingBottom: '6px', borderBottom: '1px solid #1F1F28' }}>COST OF GOODS SOLD</div>
                <AccountingRow label="Product Cost"          value={fmt(cur.cogs)}                           indent={1} />
                <AccountingRow label="Packaging"             value={fmt(12800)}                              indent={1} />
                <AccountingRow label="Courier Charges"       value={fmt(68400)}                              indent={1} />
                <AccountingRow label="Total COGS"            value={fmt(cur.cogs + 12800 + 68400)}           bold borderTop borderBottom color="#E2514A" />
              </div>

              {/* Gross Profit */}
              <AccountingRow label="GROSS PROFIT" value={fmt(cur.grossProfit - 12800 - 68400)} bold highlight color="#1DB87A" />
              <div style={{ color: '#55556A', fontSize: '11px', textAlign: 'right', marginBottom: '12px' }}>
                Gross Margin: <strong style={{ color: '#1DB87A' }}>{grossMarginPct}%</strong>
              </div>

              {/* OpEx */}
              <div style={{ margin: '4px 0' }}>
                <div style={{ fontSize: '10px', color: '#55556A', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px', paddingBottom: '6px', borderBottom: '1px solid #1F1F28' }}>OPERATING EXPENSES</div>
                <AccountingRow label="Staff Salaries"        value={fmt(42000)}  indent={1} />
                <AccountingRow label="Meta Ads Spend"        value={fmt(48200)}  indent={1} />
                <AccountingRow label="Platform Fees"         value={fmt(8600)}   indent={1} />
                <AccountingRow label="Other OpEx"            value={fmt(9000)}   indent={1} />
                <AccountingRow label="Total OpEx"            value={fmt(cur.opEx)} bold borderTop borderBottom color="#E2514A" />
              </div>

              {/* EBIT */}
              <AccountingRow label="OPERATING PROFIT (EBIT)" value={fmt(cur.netProfit + 42760)} bold highlight color="#7C6AF7" />

              {/* Tax */}
              <div style={{ margin: '12px 0 4px' }}>
                <AccountingRow label="Estimated Income Tax (20%)" value={`(${fmt(taxSummary.estimatedTax)})`} indent={1} color="#E2514A" />
                <AccountingRow label="Sales Tax Owed (17%)"       value={`(${fmt(taxSummary.salesTaxOwed)})`} indent={1} color="#E2514A" />
              </div>

              {/* Net Profit */}
              <div style={{ marginTop: '8px', padding: '16px', background: '#12102E', border: '1px solid #7C6AF733', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#F0EFF6', fontWeight: 700, fontSize: '16px' }}>NET PROFIT (After Tax)</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '20px', fontWeight: 800, color: '#7C6AF7' }}>{fmt(taxSummary.netAfterTax)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '8px', fontSize: '12px', color: '#55556A' }}>
                <span>Net Margin: <strong style={{ color: '#7C6AF7' }}>{netMarginPct}%</strong></span>
                <span>Net After Tax Margin: <strong style={{ color: '#7C6AF7' }}>{((taxSummary.netAfterTax / cur.revenue) * 100).toFixed(1)}%</strong></span>
              </div>
            </div>

            {/* Side panel — monthly comparison */}
            <div style={{ width: '300px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ background: '#141418', border: '1px solid #2A2A35', borderRadius: '12px', padding: '18px' }}>
                <div style={{ fontSize: '11px', color: '#8A8A9E', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '14px' }}>6-Month Snapshot</div>
                {monthlyFinancials.map(m => (
                  <div key={m.month} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #1F1F28' }}>
                    <span style={{ color: '#8A8A9E', fontSize: '12px', width: '36px' }}>{m.month}</span>
                    <div style={{ flex: 1, height: '4px', background: '#1C1C22', borderRadius: '2px', overflow: 'hidden', margin: '0 10px' }}>
                      <div style={{ width: `${(m.netProfit / 290000) * 100}%`, height: '100%', background: '#7C6AF7', borderRadius: '2px' }} />
                    </div>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#7C6AF7', fontWeight: 600 }}>PKR {(m.netProfit / 1000).toFixed(0)}K</span>
                  </div>
                ))}
              </div>

              <div style={{ background: '#141418', border: '1px solid #2A2A35', borderRadius: '12px', padding: '18px' }}>
                <div style={{ fontSize: '11px', color: '#8A8A9E', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '14px' }}>Key Ratios</div>
                {[
                  { label: 'Gross Margin', value: `${grossMarginPct}%`, color: '#1DB87A' },
                  { label: 'Net Margin', value: `${netMarginPct}%`, color: '#7C6AF7' },
                  { label: 'COGS Ratio', value: `${((cur.cogs / cur.revenue) * 100).toFixed(1)}%`, color: '#E2514A' },
                  { label: 'OpEx Ratio', value: `${((cur.opEx / cur.revenue) * 100).toFixed(1)}%`, color: '#F5A623' },
                  { label: 'Return Rate', value: '2.2%', color: '#55556A' },
                  { label: 'Revenue Growth', value: `+${revenueGrowth}%`, color: '#3A8AE8' },
                ].map(r => (
                  <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1F1F28', fontSize: '13px' }}>
                    <span style={{ color: '#8A8A9E' }}>{r.label}</span>
                    <span style={{ color: r.color, fontWeight: 700 }}>{r.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── REVENUE ── */}
        {activeTab === 'Revenue' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Monthly revenue & profit area chart */}
            <div style={{ background: '#141418', border: '1px solid #2A2A35', borderRadius: '12px', padding: '20px' }}>
              <div style={{ fontSize: '13px', color: '#8A8A9E', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' }}>Revenue vs Profit — 6 Months</div>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={monthlyFinancials}>
                  <defs>
                    <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#7C6AF7" stopOpacity={0.3} /><stop offset="95%" stopColor="#7C6AF7" stopOpacity={0} /></linearGradient>
                    <linearGradient id="prof" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#1DB87A" stopOpacity={0.3} /><stop offset="95%" stopColor="#1DB87A" stopOpacity={0} /></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2A35" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: '#55556A', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#55556A', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '12px', color: '#8A8A9E' }} />
                  <Area type="monotone" dataKey="revenue"    name="Revenue"     stroke="#7C6AF7" fill="url(#rev)"  strokeWidth={2} />
                  <Area type="monotone" dataKey="grossProfit" name="Gross Profit" stroke="#1DB87A" fill="url(#prof)" strokeWidth={2} />
                  <Area type="monotone" dataKey="netProfit"  name="Net Profit"  stroke="#3A8AE8" fill="none"        strokeWidth={2} strokeDasharray="4 2" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Revenue by source + margin trend side by side */}
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1, background: '#141418', border: '1px solid #2A2A35', borderRadius: '12px', padding: '20px' }}>
                <div style={{ fontSize: '13px', color: '#8A8A9E', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '14px' }}>Revenue by Source (Dec)</div>
                {[
                  { source: 'Shopify',     pct: 38, amount: 319960, color: '#7C6AF7' },
                  { source: 'Instagram DM', pct: 28, amount: 235760, color: '#E1306C' },
                  { source: 'WhatsApp',    pct: 21, amount: 176820, color: '#25D366' },
                  { source: 'Website',     pct: 10, amount: 84200,  color: '#3A8AE8' },
                  { source: 'Mobile App',  pct: 3,  amount: 25260,  color: '#F5A623' },
                ].map(r => (
                  <div key={r.source} style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '12px' }}>
                      <span style={{ color: '#F0EFF6' }}>{r.source}</span>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <span style={{ color: r.color, fontWeight: 600 }}>{r.pct}%</span>
                        <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#8A8A9E', fontSize: '11px' }}>PKR {r.amount.toLocaleString()}</span>
                      </div>
                    </div>
                    <div style={{ height: '6px', background: '#1C1C22', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${r.pct}%`, height: '100%', background: r.color, borderRadius: '3px' }} />
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ flex: 1, background: '#141418', border: '1px solid #2A2A35', borderRadius: '12px', padding: '20px' }}>
                <div style={{ fontSize: '13px', color: '#8A8A9E', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '14px' }}>Margin Trend</div>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={monthlyFinancials.map(m => ({ month: m.month, gross: +((m.grossProfit / m.revenue) * 100).toFixed(1), net: +((m.netProfit / m.revenue) * 100).toFixed(1) }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2A2A35" vertical={false} />
                    <XAxis dataKey="month" tick={{ fill: '#55556A', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#55556A', fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: '12px', color: '#8A8A9E' }} />
                    <Line type="monotone" dataKey="gross" name="Gross Margin %" stroke="#1DB87A" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="net"   name="Net Margin %"   stroke="#7C6AF7" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Monthly revenue table */}
            <div style={{ background: '#141418', border: '1px solid #2A2A35', borderRadius: '12px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#1C1C22' }}>
                    {['Month', 'Revenue', 'COGS', 'Gross Profit', 'Gross Margin', 'OpEx', 'Net Profit', 'Net Margin', 'Orders', 'AOV'].map(h => (
                      <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontSize: '10px', color: '#55556A', fontWeight: 600, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {monthlyFinancials.map((m, i) => {
                    const grossM = ((m.grossProfit / m.revenue) * 100).toFixed(1);
                    const netM = ((m.netProfit / m.revenue) * 100).toFixed(1);
                    const isCurrent = i === monthlyFinancials.length - 1;
                    return (
                      <tr key={m.month} style={{ borderBottom: '1px solid #1F1F28', background: isCurrent ? '#1A1A20' : 'transparent' }}>
                        <td style={{ padding: '11px 14px', color: isCurrent ? '#7C6AF7' : '#F0EFF6', fontWeight: isCurrent ? 700 : 400 }}>{m.month} {isCurrent && <span style={{ fontSize: '10px', background: '#2A2550', padding: '1px 5px', borderRadius: '4px', marginLeft: '4px' }}>Current</span>}</td>
                        <td style={{ padding: '11px 14px', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: '#F0EFF6' }}>PKR {(m.revenue / 1000).toFixed(0)}K</td>
                        <td style={{ padding: '11px 14px', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: '#E2514A' }}>PKR {(m.cogs / 1000).toFixed(0)}K</td>
                        <td style={{ padding: '11px 14px', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: '#1DB87A', fontWeight: 600 }}>PKR {(m.grossProfit / 1000).toFixed(0)}K</td>
                        <td style={{ padding: '11px 14px', color: parseFloat(grossM) >= 45 ? '#1DB87A' : '#F5A623', fontWeight: 600 }}>{grossM}%</td>
                        <td style={{ padding: '11px 14px', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: '#F5A623' }}>PKR {(m.opEx / 1000).toFixed(0)}K</td>
                        <td style={{ padding: '11px 14px', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: '#7C6AF7', fontWeight: 700 }}>PKR {(m.netProfit / 1000).toFixed(0)}K</td>
                        <td style={{ padding: '11px 14px', color: '#7C6AF7', fontWeight: 600 }}>{netM}%</td>
                        <td style={{ padding: '11px 14px', color: '#8A8A9E' }}>{m.orders}</td>
                        <td style={{ padding: '11px 14px', fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#8A8A9E' }}>PKR {Math.round(m.revenue / m.orders).toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── EXPENSES ── */}
        {activeTab === 'Expenses' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', gap: '16px' }}>
              {/* Expense pie */}
              <div style={{ flex: 1, background: '#141418', border: '1px solid #2A2A35', borderRadius: '12px', padding: '20px' }}>
                <div style={{ fontSize: '13px', color: '#8A8A9E', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' }}>Expense Breakdown — Dec 2024</div>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                  <div style={{ flexShrink: 0 }}>
                    <ResponsiveContainer width={180} height={180}>
                      <PieChart>
                        <Pie data={expenseBreakdown} cx="50%" cy="50%" outerRadius={80} dataKey="amount" paddingAngle={2}>
                          {expenseBreakdown.map((e, i) => <Cell key={i} fill={e.color} />)}
                        </Pie>
                        <Tooltip formatter={v => `PKR ${Number(v).toLocaleString()}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{ flex: 1 }}>
                    {expenseBreakdown.map(e => (
                      <div key={e.category} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: e.color, display: 'inline-block', flexShrink: 0 }} />
                          <span style={{ color: '#8A8A9E', fontSize: '12px' }}>{e.category}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                          <span style={{ color: e.color, fontWeight: 600, fontSize: '12px' }}>{e.pct}%</span>
                          <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#F0EFF6', fontSize: '11px', minWidth: '80px', textAlign: 'right' }}>PKR {e.amount.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                    <div style={{ borderTop: '1px solid #2A2A35', marginTop: '8px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#F0EFF6', fontWeight: 700 }}>Total Expenses</span>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#E2514A', fontWeight: 700 }}>
                        PKR {expenseBreakdown.reduce((s, e) => s + e.amount, 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expense icons breakdown */}
              <div style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { label: 'Cost of Goods', value: 421000, icon: Package,    color: '#E2514A' },
                  { label: 'Courier',        value: 68400,  icon: Truck,      color: '#F5A623' },
                  { label: 'Meta Ads',       value: 48200,  icon: Megaphone,  color: '#1877F2' },
                  { label: 'Staff',          value: 42000,  icon: Users,      color: '#7C6AF7' },
                  { label: 'Packaging',      value: 12800,  icon: Package,    color: '#3A8AE8' },
                  { label: 'Returns',        value: 18200,  icon: CreditCard, color: '#55556A' },
                ].map(e => (
                  <div key={e.label} style={{ background: '#141418', border: '1px solid #2A2A35', borderRadius: '10px', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '32px', height: '32px', background: '#1C1C22', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <e.icon size={14} color={e.color} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '12px', color: '#8A8A9E' }}>{e.label}</div>
                      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', color: e.color, fontWeight: 700 }}>PKR {e.value.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── CASH FLOW ── */}
        {activeTab === 'Cash Flow' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', gap: '14px' }}>
              <KPI label="Total Inflow"   value={fmtK(cashflow.reduce((s, c) => s + c.inflow, 0))}   sub="Nov–Dec collections" color="#1DB87A" icon={ArrowUpRight} />
              <KPI label="Total Outflow"  value={fmtK(cashflow.reduce((s, c) => s + c.outflow, 0))}  sub="Nov–Dec payments"    color="#E2514A" icon={ArrowDownRight} />
              <KPI label="Net Cash Flow"  value={fmtK(cashflow.reduce((s, c) => s + c.net, 0))}      sub="Net positive"        color="#7C6AF7" icon={TrendingUp} />
              <KPI label="COD Pending"    value="PKR 3.84L" sub="Awaiting courier remit" color="#F5A623" icon={Truck} />
            </div>

            {/* Cash flow bar chart */}
            <div style={{ background: '#141418', border: '1px solid #2A2A35', borderRadius: '12px', padding: '20px' }}>
              <div style={{ fontSize: '13px', color: '#8A8A9E', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' }}>Weekly Cash Flow — Nov & Dec</div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={cashflow} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2A35" vertical={false} />
                  <XAxis dataKey="week" tick={{ fill: '#55556A', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#55556A', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '12px', color: '#8A8A9E' }} />
                  <Bar dataKey="inflow"  name="Inflow"  fill="#1DB87A" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="outflow" name="Outflow" fill="#E2514A" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="net"     name="Net"     fill="#7C6AF7" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Cash flow table */}
            <div style={{ background: '#141418', border: '1px solid #2A2A35', borderRadius: '12px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#1C1C22' }}>
                    {['Week', 'Cash Inflow', 'Cash Outflow', 'Net', 'Running Balance'].map(h => (
                      <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontSize: '10px', color: '#55556A', fontWeight: 600, textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cashflow.reduce((acc, row) => {
                    const prev = acc.length > 0 ? acc[acc.length - 1].running : 480000;
                    acc.push({ ...row, running: prev + row.net });
                    return acc;
                  }, []).map(row => (
                    <tr key={row.week} style={{ borderBottom: '1px solid #1F1F28' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#1A1A20'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '12px 14px', color: '#F0EFF6', fontWeight: 500 }}>{row.week}</td>
                      <td style={{ padding: '12px 14px', fontFamily: 'JetBrains Mono, monospace', color: '#1DB87A', fontWeight: 600 }}>PKR {row.inflow.toLocaleString()}</td>
                      <td style={{ padding: '12px 14px', fontFamily: 'JetBrains Mono, monospace', color: '#E2514A' }}>PKR {row.outflow.toLocaleString()}</td>
                      <td style={{ padding: '12px 14px', fontFamily: 'JetBrains Mono, monospace', color: '#7C6AF7', fontWeight: 600 }}>PKR {row.net.toLocaleString()}</td>
                      <td style={{ padding: '12px 14px', fontFamily: 'JetBrains Mono, monospace', color: '#F0EFF6', fontSize: '12px' }}>PKR {row.running.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── PRODUCT PROFITABILITY ── */}
        {activeTab === 'Product Profitability' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ background: '#141418', border: '1px solid #2A2A35', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #2A2A35', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#F0EFF6', fontWeight: 600 }}>Product P&L — All Time</span>
                <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 12px', background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '7px', color: '#8A8A9E', fontSize: '12px', cursor: 'pointer' }}>
                  <Download size={12} /> Export
                </button>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#1C1C22' }}>
                    {['Product', 'Cost Price', 'Sale Price', 'Markup', 'Units Sold', 'Revenue', 'COGS', 'Gross Profit', 'Margin', 'Contribution'].map(h => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '10px', color: '#55556A', fontWeight: 600, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {productProfitability.sort((a, b) => b.grossProfit - a.grossProfit).map(p => {
                    const markup = (((p.salePrice - p.costPrice) / p.costPrice) * 100).toFixed(0);
                    const totalRevenue = productProfitability.reduce((s, x) => s + x.revenue, 0);
                    const contribution = ((p.revenue / totalRevenue) * 100).toFixed(1);
                    return (
                      <tr key={p.name} style={{ borderBottom: '1px solid #1F1F28' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#1A1A20'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '12px 14px', color: '#F0EFF6', fontWeight: 500, maxWidth: '180px' }}>{p.name}</td>
                        <td style={{ padding: '12px 14px', fontFamily: 'JetBrains Mono, monospace', color: '#8A8A9E', fontSize: '11px' }}>PKR {p.costPrice.toLocaleString()}</td>
                        <td style={{ padding: '12px 14px', fontFamily: 'JetBrains Mono, monospace', color: '#1DB87A', fontSize: '11px' }}>PKR {p.salePrice.toLocaleString()}</td>
                        <td style={{ padding: '12px 14px', color: '#F5A623', fontWeight: 600 }}>{markup}%</td>
                        <td style={{ padding: '12px 14px', color: '#F0EFF6', textAlign: 'center' }}>{p.unitsSold}</td>
                        <td style={{ padding: '12px 14px', fontFamily: 'JetBrains Mono, monospace', color: '#F0EFF6', fontSize: '11px' }}>PKR {(p.revenue / 1000).toFixed(0)}K</td>
                        <td style={{ padding: '12px 14px', fontFamily: 'JetBrains Mono, monospace', color: '#E2514A', fontSize: '11px' }}>PKR {(p.cogs / 1000).toFixed(0)}K</td>
                        <td style={{ padding: '12px 14px', fontFamily: 'JetBrains Mono, monospace', color: '#7C6AF7', fontWeight: 700, fontSize: '11px' }}>PKR {(p.grossProfit / 1000).toFixed(0)}K</td>
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '48px', height: '5px', background: '#1C1C22', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ width: `${p.margin}%`, height: '100%', background: p.margin >= 55 ? '#1DB87A' : p.margin >= 40 ? '#F5A623' : '#E2514A', borderRadius: '3px' }} />
                            </div>
                            <span style={{ color: p.margin >= 55 ? '#1DB87A' : p.margin >= 40 ? '#F5A623' : '#E2514A', fontWeight: 700, fontSize: '12px' }}>{p.margin}%</span>
                          </div>
                        </td>
                        <td style={{ padding: '12px 14px', color: '#55556A', fontSize: '12px' }}>{contribution}%</td>
                      </tr>
                    );
                  })}
                  {/* Totals */}
                  <tr style={{ background: '#1C1C22', borderTop: '2px solid #2A2A35' }}>
                    <td colSpan={4} style={{ padding: '12px 14px', color: '#8A8A9E', fontWeight: 600, textTransform: 'uppercase', fontSize: '11px' }}>Total</td>
                    <td style={{ padding: '12px 14px', color: '#F0EFF6', fontWeight: 700, textAlign: 'center' }}>{productProfitability.reduce((s, p) => s + p.unitsSold, 0)}</td>
                    <td style={{ padding: '12px 14px', fontFamily: 'JetBrains Mono, monospace', color: '#F0EFF6', fontWeight: 700, fontSize: '12px' }}>PKR {(productProfitability.reduce((s, p) => s + p.revenue, 0) / 1000).toFixed(0)}K</td>
                    <td style={{ padding: '12px 14px', fontFamily: 'JetBrains Mono, monospace', color: '#E2514A', fontWeight: 700, fontSize: '12px' }}>PKR {(productProfitability.reduce((s, p) => s + p.cogs, 0) / 1000).toFixed(0)}K</td>
                    <td style={{ padding: '12px 14px', fontFamily: 'JetBrains Mono, monospace', color: '#7C6AF7', fontWeight: 700, fontSize: '12px' }}>PKR {(productProfitability.reduce((s, p) => s + p.grossProfit, 0) / 1000).toFixed(0)}K</td>
                    <td colSpan={2} style={{ padding: '12px 14px', color: '#7C6AF7', fontWeight: 700 }}>{((productProfitability.reduce((s, p) => s + p.grossProfit, 0) / productProfitability.reduce((s, p) => s + p.revenue, 0)) * 100).toFixed(1)}% avg</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAX & COMPLIANCE ── */}
        {activeTab === 'Tax & Compliance' && (
          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Income tax card */}
              <div style={{ background: '#141418', border: '1px solid #2A2A35', borderRadius: '12px', padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                  <Calculator size={16} color="#7C6AF7" />
                  <span style={{ color: '#F0EFF6', fontWeight: 600, fontSize: '15px' }}>Income Tax Estimate — Dec 2024</span>
                </div>
                <AccountingRow label="Gross Revenue"         value={fmt(taxSummary.grossRevenue)}    />
                <AccountingRow label="Total Deductible Expenses" value={`(${fmt(taxSummary.totalExpenses)})`} color="#E2514A" />
                <AccountingRow label="Taxable Income"        value={fmt(taxSummary.taxableIncome)}   bold borderTop borderBottom color="#F5A623" />
                <div style={{ height: '8px' }} />
                <AccountingRow label="Income Tax Rate"       value="20%"                             />
                <AccountingRow label="Estimated Tax Owed"    value={fmt(taxSummary.estimatedTax)}    bold color="#E2514A" />
                <div style={{ height: '8px' }} />
                <AccountingRow label="Net Income After Tax"  value={fmt(taxSummary.netAfterTax)}     bold highlight color="#7C6AF7" />
              </div>

              {/* Sales tax card */}
              <div style={{ background: '#141418', border: '1px solid #2A2A35', borderRadius: '12px', padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                  <FileText size={16} color="#F5A623" />
                  <span style={{ color: '#F0EFF6', fontWeight: 600, fontSize: '15px' }}>Sales Tax (GST) — Dec 2024</span>
                </div>
                <AccountingRow label="Total Sales (Taxable)"    value={fmt(taxSummary.grossRevenue)} />
                <AccountingRow label="GST Rate"                  value={`${taxSummary.salesTaxRate}%`} />
                <AccountingRow label="Sales Tax Collected (est)" value={fmt(taxSummary.salesTaxOwed)} bold color="#F5A623" borderTop borderBottom />
                <div style={{ marginTop: '14px', padding: '12px 14px', background: '#3D2D0A', border: '1px solid #F5A62333', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <AlertCircle size={14} color="#F5A623" />
                  <span style={{ color: '#F5A623', fontSize: '12px' }}>File quarterly FBR return by Dec 31, 2024</span>
                </div>
              </div>
            </div>

            {/* Right — compliance checklist */}
            <div style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ background: '#141418', border: '1px solid #2A2A35', borderRadius: '12px', padding: '20px' }}>
                <div style={{ fontSize: '13px', color: '#8A8A9E', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '14px' }}>Compliance Checklist</div>
                {[
                  { label: 'FBR NTN Registered',       done: true  },
                  { label: 'Sales Tax Registration',    done: true  },
                  { label: 'Q2 GST Return Filed',       done: true  },
                  { label: 'Q3 GST Return Filed',       done: true  },
                  { label: 'Q4 GST Return Due (Dec 31)', done: false },
                  { label: 'Annual Income Tax Return',  done: false },
                  { label: 'Withholding Tax Statement', done: false },
                  { label: 'SECP Registration',         done: true  },
                ].map(c => (
                  <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 0', borderBottom: '1px solid #1F1F28' }}>
                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: c.done ? '#0F3D2A' : '#3D2D0A', border: `2px solid ${c.done ? '#1DB87A' : '#F5A623'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {c.done ? <span style={{ color: '#1DB87A', fontSize: '10px', fontWeight: 700 }}>✓</span> : <span style={{ color: '#F5A623', fontSize: '9px' }}>!</span>}
                    </div>
                    <span style={{ fontSize: '12px', color: c.done ? '#F0EFF6' : '#F5A623' }}>{c.label}</span>
                  </div>
                ))}
              </div>

              <div style={{ background: '#141418', border: '1px solid #2A2A35', borderRadius: '12px', padding: '20px' }}>
                <div style={{ fontSize: '13px', color: '#8A8A9E', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '14px' }}>Tax Summary</div>
                {[
                  { label: 'Income Tax Due',   value: fmt(taxSummary.estimatedTax), color: '#E2514A' },
                  { label: 'Sales Tax Due',    value: fmt(taxSummary.salesTaxOwed), color: '#F5A623' },
                  { label: 'Total Tax Burden', value: fmt(taxSummary.estimatedTax + taxSummary.salesTaxOwed), color: '#F0EFF6' },
                  { label: 'Effective Rate',   value: `${((taxSummary.estimatedTax / taxSummary.grossRevenue) * 100).toFixed(1)}%`, color: '#8A8A9E' },
                ].map(r => (
                  <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1F1F28', fontSize: '13px' }}>
                    <span style={{ color: '#8A8A9E' }}>{r.label}</span>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', color: r.color, fontWeight: 600, fontSize: '12px' }}>{r.value}</span>
                  </div>
                ))}
                <button style={{ width: '100%', marginTop: '14px', padding: '10px', background: '#7C6AF7', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>
                  Download Tax Report
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
