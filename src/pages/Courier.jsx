import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { printShippingLabel } from '../utils/printDoc';
import {
  Truck, Package, MapPin, Clock, CheckCircle, XCircle, AlertTriangle,
  RotateCcw, Plus, Search, Download, RefreshCw, ChevronDown, Eye,
  TrendingUp, TrendingDown, BarChart2, Filter, Phone, User,
  ArrowRight, Navigation, Box, Send, Printer, Star,
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';

// ── Mock Data ──────────────────────────────────────────────

const COURIERS = {
  TCS:      { color: '#E2514A', bg: '#3D1414', short: 'TCS' },
  Leopards: { color: '#F5A623', bg: '#3D2D0A', short: 'LEO' },
  BlueEx:   { color: '#3A8AE8', bg: '#0D2A4A', short: 'BEX' },
  PostEx:   { color: '#7C6AF7', bg: '#2A2550', short: 'PEX' },
  Trax:     { color: '#1DB87A', bg: '#0F3D2A', short: 'TRX' },
  'M&P':    { color: '#F5A623', bg: '#3D2D0A', short: 'M&P' },
};

const STATUS_CFG = {
  Delivered:        { color: '#1DB87A', bg: '#0F3D2A', icon: CheckCircle },
  'In Transit':     { color: '#3A8AE8', bg: '#0D2A4A', icon: Truck },
  'Out for Delivery': { color: '#7C6AF7', bg: '#2A2550', icon: Navigation },
  'Pickup Pending': { color: '#F5A623', bg: '#3D2D0A', icon: Clock },
  Returned:         { color: '#E2514A', bg: '#3D1414', icon: RotateCcw },
  Cancelled:        { color: '#55556A', bg: '#1C1C22', icon: XCircle },
  Booked:           { color: '#8A8A9E', bg: '#1C1C22', icon: Package },
  Failed:           { color: '#E2514A', bg: '#3D1414', icon: AlertTriangle },
};

const shipments_mock = [
  { id: 'SHP-10291', orderId: '#ORD-7841', customer: 'Aisha Malik', phone: '+92 300 1234567', city: 'Karachi', courier: 'TCS',      trackingId: 'TCS-88291', status: 'Delivered',          weight: '1.2 kg', cod: 12500, bookedOn: '2024-12-02', deliveredOn: '2024-12-04', attempts: 1, product: 'Nike Air Max 270' },
  { id: 'SHP-10290', orderId: '#ORD-7840', customer: 'Bilal Ahmed',  phone: '+92 321 9876543', city: 'Lahore',  courier: 'Leopards', trackingId: 'LEP-44512', status: 'In Transit',         weight: '0.6 kg', cod: 8900,  bookedOn: '2024-12-02', deliveredOn: null,           attempts: 0, product: 'Samsung Galaxy Buds' },
  { id: 'SHP-10289', orderId: '#ORD-7839', customer: 'Sara Khan',    phone: '+92 333 5556677', city: 'Islamabad', courier: 'BlueEx', trackingId: 'BEX-22987', status: 'Pickup Pending',     weight: '2.1 kg', cod: 19800, bookedOn: '2024-12-03', deliveredOn: null,           attempts: 0, product: 'Zara Dress + H&M Blazer' },
  { id: 'SHP-10288', orderId: '#ORD-7837', customer: 'Fatima Zahra', phone: '+92 312 3334445', city: 'Karachi', courier: 'TCS',      trackingId: 'TCS-88190', status: 'Out for Delivery',   weight: '3.4 kg', cod: 6700,  bookedOn: '2024-12-01', deliveredOn: null,           attempts: 1, product: 'Yoga Mat Premium' },
  { id: 'SHP-10287', orderId: '#ORD-7836', customer: 'Hassan Raza',  phone: '+92 300 9998887', city: 'Rawalpindi', courier: 'Leopards', trackingId: 'LEP-44490', status: 'Delivered',      weight: '0.9 kg', cod: 7500,  bookedOn: '2024-11-30', deliveredOn: '2024-12-02', attempts: 1, product: 'Polo Shirt x3' },
  { id: 'SHP-10286', orderId: '#ORD-7832', customer: 'Kamran Sheikh', phone: '+92 312 8889990', city: 'Peshawar', courier: 'TCS',    trackingId: 'TCS-88100', status: 'In Transit',        weight: '4.8 kg', cod: 16700, bookedOn: '2024-11-29', deliveredOn: null,           attempts: 0, product: 'Cricket Bat + Gloves + Pads' },
  { id: 'SHP-10285', orderId: '#ORD-7831', customer: 'Nadia Ali',    phone: '+92 301 1112223', city: 'Lahore',  courier: 'PostEx',   trackingId: 'PEX-55200', status: 'Returned',          weight: '1.1 kg', cod: 5200,  bookedOn: '2024-11-28', deliveredOn: null,           attempts: 3, product: 'Face Cream Set' },
  { id: 'SHP-10284', orderId: '#ORD-7830', customer: 'Raheel Abbas', phone: '+92 333 9990001', city: 'Multan', courier: 'Trax',      trackingId: 'TRX-77801', status: 'Delivered',         weight: '0.5 kg', cod: 3400,  bookedOn: '2024-11-27', deliveredOn: '2024-11-29', attempts: 1, product: 'Adidas Socks 3-Pack' },
  { id: 'SHP-10283', orderId: '#ORD-7829', customer: 'Sana Mirza',   phone: '+92 321 4445556', city: 'Karachi', courier: 'BlueEx',  trackingId: 'BEX-22800', status: 'Failed',            weight: '1.8 kg', cod: 9100,  bookedOn: '2024-11-27', deliveredOn: null,           attempts: 2, product: 'Laptop Bag + Mouse Pad' },
  { id: 'SHP-10282', orderId: '#ORD-7828', customer: 'Asad Butt',    phone: '+92 345 2223334', city: 'Faisalabad', courier: 'M&P', trackingId: 'MNP-33412', status: 'Delivered',          weight: '2.0 kg', cod: 11300, bookedOn: '2024-11-26', deliveredOn: '2024-11-28', attempts: 1, product: 'H&M Blazer Classic' },
  { id: 'SHP-10281', orderId: '#ORD-7827', customer: 'Lubna Qureshi', phone: '+92 300 7778889', city: 'Quetta', courier: 'TCS',     trackingId: 'TCS-87990', status: 'In Transit',        weight: '1.5 kg', cod: 7800,  bookedOn: '2024-11-26', deliveredOn: null,           attempts: 0, product: 'iPhone 15 Case + Charger' },
  { id: 'SHP-10280', orderId: '#ORD-7826', customer: 'Imran Javed',  phone: '+92 312 5556667', city: 'Lahore',  courier: 'PostEx',  trackingId: 'PEX-55190', status: 'Booked',            weight: '0.8 kg', cod: 4600,  bookedOn: '2024-12-04', deliveredOn: null,           attempts: 0, product: 'Moisturizer SPF 50' },
];

const deliveryTrend = [
  { date: 'Nov 26', delivered: 12, returned: 2, failed: 1 },
  { date: 'Nov 27', delivered: 15, returned: 1, failed: 0 },
  { date: 'Nov 28', delivered: 18, returned: 3, failed: 2 },
  { date: 'Nov 29', delivered: 14, returned: 2, failed: 1 },
  { date: 'Nov 30', delivered: 21, returned: 1, failed: 0 },
  { date: 'Dec 1',  delivered: 19, returned: 4, failed: 2 },
  { date: 'Dec 2',  delivered: 24, returned: 2, failed: 1 },
  { date: 'Dec 3',  delivered: 22, returned: 3, failed: 3 },
  { date: 'Dec 4',  delivered: 28, returned: 1, failed: 0 },
];

const courierPerf = [
  { name: 'TCS',      deliveries: 142, rate: 94, avgDays: 2.1, returns: 8,  revenue: 284000 },
  { name: 'Leopards', deliveries: 98,  rate: 91, avgDays: 2.4, returns: 9,  revenue: 196000 },
  { name: 'BlueEx',   deliveries: 67,  rate: 88, avgDays: 2.8, returns: 8,  revenue: 134000 },
  { name: 'PostEx',   deliveries: 54,  rate: 86, avgDays: 3.0, returns: 8,  revenue: 108000 },
  { name: 'Trax',     deliveries: 41,  rate: 90, avgDays: 2.5, returns: 4,  revenue: 82000  },
  { name: 'M&P',      deliveries: 29,  rate: 83, avgDays: 3.2, returns: 5,  revenue: 58000  },
];

const cityData = [
  { city: 'Karachi',    shipments: 312, deliveryRate: 92 },
  { city: 'Lahore',     shipments: 248, deliveryRate: 94 },
  { city: 'Islamabad',  shipments: 134, deliveryRate: 96 },
  { city: 'Faisalabad', shipments: 89,  deliveryRate: 89 },
  { city: 'Rawalpindi', shipments: 76,  deliveryRate: 91 },
  { city: 'Multan',     shipments: 54,  deliveryRate: 88 },
  { city: 'Peshawar',   shipments: 43,  deliveryRate: 85 },
  { city: 'Quetta',     shipments: 28,  deliveryRate: 82 },
];

const codSummary = [
  { label: 'Total COD Pending',   amount: 384200, color: '#F5A623', bg: '#3D2D0A' },
  { label: 'Collected Today',     amount: 98400,  color: '#1DB87A', bg: '#0F3D2A' },
  { label: 'Remitted This Week',  amount: 241800, color: '#7C6AF7', bg: '#2A2550' },
  { label: 'Returns Pending',     amount: 28700,  color: '#E2514A', bg: '#3D1414' },
];

const statusPie = [
  { name: 'Delivered',        value: 431, color: '#1DB87A' },
  { name: 'In Transit',       value: 87,  color: '#3A8AE8' },
  { name: 'Out for Delivery', value: 34,  color: '#7C6AF7' },
  { name: 'Pickup Pending',   value: 29,  color: '#F5A623' },
  { name: 'Returned',         value: 41,  color: '#E2514A' },
  { name: 'Failed',           value: 18,  color: '#55556A' },
];

// ── Sub-Components ─────────────────────────────────────────

function KPICard({ label, value, sub, trend, trendUp, color }) {
  return (
    <div style={{ background: '#141418', border: '1px solid #2A2A35', borderRadius: '12px', padding: '20px', flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: '11px', color: '#8A8A9E', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>{label}</div>
      <div style={{ fontSize: '26px', fontWeight: 700, color: color || '#F0EFF6', marginBottom: '6px' }}>{value}</div>
      {sub && <div style={{ fontSize: '12px', color: '#55556A' }}>{sub}</div>}
      {trend !== undefined && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
          {trendUp ? <TrendingUp size={12} color="#1DB87A" /> : <TrendingDown size={12} color="#E2514A" />}
          <span style={{ fontSize: '12px', color: trendUp ? '#1DB87A' : '#E2514A', fontWeight: 500 }}>{trend}</span>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || { color: '#8A8A9E', bg: '#1C1C22' };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 600, background: cfg.bg, color: cfg.color }}>
      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: cfg.color, display: 'inline-block' }} />
      {status}
    </span>
  );
}

function CourierBadge({ courier }) {
  const cfg = COURIERS[courier] || { color: '#8A8A9E', bg: '#1C1C22', short: courier };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}33` }}>{cfg.short}</span>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '8px', padding: '10px 14px', fontSize: '12px' }}>
      <div style={{ color: '#8A8A9E', marginBottom: '6px' }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, display: 'flex', gap: '8px', marginBottom: '2px' }}>
          <span>{p.name}:</span><span style={{ fontWeight: 600 }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

// ── Tabs ──────────────────────────────────────────────────

const TABS = ['Overview', 'Shipments', 'COD Management', 'Returns', 'Performance', 'Create Booking'];

// ── Tracking Timeline ─────────────────────────────────────

const TRACKING_STEPS = {
  Booked:             ['Booked'],
  'Pickup Pending':   ['Booked', 'Pickup Pending'],
  'In Transit':       ['Booked', 'Picked Up', 'In Transit'],
  'Out for Delivery': ['Booked', 'Picked Up', 'In Transit', 'Out for Delivery'],
  Delivered:          ['Booked', 'Picked Up', 'In Transit', 'Out for Delivery', 'Delivered'],
  Returned:           ['Booked', 'Picked Up', 'In Transit', 'Return Initiated', 'Returned'],
  Failed:             ['Booked', 'Picked Up', 'In Transit', 'Delivery Attempted', 'Failed'],
};

function TrackingTimeline({ status }) {
  const steps = TRACKING_STEPS[status] || ['Booked'];
  const allSteps = ['Booked', 'Picked Up', 'In Transit', 'Out for Delivery', 'Delivered'];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0', marginTop: '8px' }}>
      {allSteps.map((step, i) => {
        const done = steps.includes(step);
        const active = steps[steps.length - 1] === step;
        return (
          <React.Fragment key={step}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <div style={{
                width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: active ? '#7C6AF7' : done ? '#1DB87A' : '#1C1C22',
                border: `2px solid ${active ? '#7C6AF7' : done ? '#1DB87A' : '#2A2A35'}`,
                fontSize: '9px', color: '#fff', fontWeight: 700,
              }}>{done ? '✓' : i + 1}</div>
              <span style={{ fontSize: '9px', color: done ? '#F0EFF6' : '#55556A', whiteSpace: 'nowrap', maxWidth: '58px', textAlign: 'center', lineHeight: 1.2 }}>{step}</span>
            </div>
            {i < allSteps.length - 1 && (
              <div style={{ flex: 1, height: '2px', background: done && steps.includes(allSteps[i + 1]) ? '#1DB87A' : '#2A2A35', minWidth: '20px', marginBottom: '18px' }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────

export default function Courier() {
  const [activeTab, setActiveTab] = useState('Overview');
  const [statusFilter, setStatusFilter] = useState('All');
  const [courierFilter, setCourierFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [bookingForm, setBookingForm] = useState({ customer: '', phone: '', city: '', address: '', weight: '', cod: '', courier: 'TCS', product: '', notes: '' });
  const [booking, setBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [shipments, setShipments] = useState(shipments_mock);

  useEffect(() => {
    api.get('/api/courier?limit=200').then(data => {
      if (data.success && data.data?.length > 0) {
        const mapped = data.data.map(s => ({
          id: s.shipmentId || s._id,
          orderId: s.orderId || '—',
          customer: s.customerName || s.customer?.name || '—',
          phone: s.customerPhone || '—',
          city: s.city || '—',
          courier: s.courierName || s.courier || 'TCS',
          trackingId: s.trackingNumber || s.trackingId || '—',
          status: s.status || 'Booked',
          weight: s.weight ? `${s.weight} kg` : '—',
          cod: s.codAmount || 0,
          bookedOn: s.createdAt ? new Date(s.createdAt).toLocaleDateString() : '—',
          deliveredOn: s.deliveredAt ? new Date(s.deliveredAt).toLocaleDateString() : null,
          attempts: s.deliveryAttempts || 0,
          product: s.items?.[0]?.name || '—',
        }));
        setShipments(mapped);
      }
    }).catch(() => {});
  }, []);

  const handleBookShipment = async () => {
    if (!bookingForm.customer || !bookingForm.phone || !bookingForm.city || !bookingForm.cod) {
      setBookingError('Please fill in customer name, phone, city, and COD amount.');
      return;
    }
    setBooking(true);
    setBookingError('');
    setBookingSuccess('');
    try {
      const payload = {
        customerName: bookingForm.customer,
        customerPhone: bookingForm.phone,
        city: bookingForm.city,
        address: bookingForm.address,
        courierName: bookingForm.courier,
        codAmount: parseFloat(bookingForm.cod) || 0,
        weight: parseFloat(bookingForm.weight) || 0,
        notes: bookingForm.notes,
        items: bookingForm.product ? [{ name: bookingForm.product, qty: 1, salePrice: parseFloat(bookingForm.cod) || 0 }] : [],
      };
      const res = await api.post('/api/courier/shipments', payload);
      if (res.success) {
        const s = res.data;
        const newShipment = {
          id: s.shipmentId || s._id,
          orderId: s.orderId || '—',
          customer: s.customerName || bookingForm.customer,
          phone: s.customerPhone || bookingForm.phone,
          city: s.city || bookingForm.city,
          courier: s.courierName || bookingForm.courier,
          trackingId: s.trackingNumber || s.trackingId || '—',
          status: s.status || 'Booked',
          weight: s.weight ? `${s.weight} kg` : `${bookingForm.weight} kg`,
          cod: s.codAmount || parseFloat(bookingForm.cod) || 0,
          bookedOn: new Date().toLocaleDateString(),
          deliveredOn: null,
          attempts: 0,
          product: bookingForm.product || '—',
        };
        setShipments(prev => [newShipment, ...prev]);
        setBookingSuccess(`Shipment booked! ID: ${newShipment.id} | Tracking: ${newShipment.trackingId}`);
        setBookingForm({ customer: '', phone: '', city: '', address: '', weight: '', cod: '', courier: 'TCS', product: '', notes: '' });
      } else {
        setBookingError(res.error || 'Booking failed — please try again.');
      }
    } catch (err) {
      setBookingError('Booking failed: ' + err.message);
    } finally {
      setBooking(false);
    }
  };

  const filteredShipments = shipments.filter(s => {
    if (statusFilter !== 'All' && s.status !== statusFilter) return false;
    if (courierFilter !== 'All' && s.courier !== courierFilter) return false;
    if (search && !s.customer.toLowerCase().includes(search.toLowerCase()) && !s.trackingId.toLowerCase().includes(search.toLowerCase()) && !s.orderId.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const returns = shipments.filter(s => s.status === 'Returned' || s.status === 'Failed');
  const totalShipments = shipments.length;
  const delivered = shipments.filter(s => s.status === 'Delivered').length;
  const inTransit = shipments.filter(s => s.status === 'In Transit').length;
  const pickupPending = shipments.filter(s => s.status === 'Pickup Pending').length;
  const totalReturns = returns.length;

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: '#0D0D0F' }}>
      <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>

        {/* Page Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', background: '#2A2550', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Truck size={18} color="#7C6AF7" />
              </div>
              <div>
                <h1 style={{ color: '#F0EFF6', fontSize: '22px', fontWeight: 700, margin: 0 }}>Courier Dashboard</h1>
                <p style={{ color: '#55556A', fontSize: '12px', margin: 0 }}>Manage shipments, COD, returns, and courier performance</p>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setActiveTab('Create Booking')} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', background: '#7C6AF7', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
              <Plus size={14} /> New Booking
            </button>
            <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '8px', color: '#8A8A9E', fontSize: '13px', cursor: 'pointer' }}>
              <Download size={14} /> Export
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '2px', borderBottom: '1px solid #2A2A35', marginBottom: '24px' }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setActiveTab(t)} style={{
              padding: '10px 18px', background: 'none', border: 'none', borderBottom: activeTab === t ? '2px solid #7C6AF7' : '2px solid transparent',
              color: activeTab === t ? '#7C6AF7' : '#8A8A9E', fontSize: '13px', fontWeight: activeTab === t ? 600 : 400,
              cursor: 'pointer', marginBottom: '-1px', transition: 'all 0.15s',
            }}>{t}</button>
          ))}
        </div>

        {/* ── TAB: OVERVIEW ── */}
        {activeTab === 'Overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* KPI Row */}
            <div style={{ display: 'flex', gap: '16px' }}>
              <KPICard label="Total Shipments" value={String(totalShipments)} sub="All time" />
              <KPICard label="Delivered" value={String(delivered)} sub={totalShipments ? `${Math.round(delivered/totalShipments*100)}% delivery rate` : '—'} color="#1DB87A" />
              <KPICard label="In Transit" value={String(inTransit)} sub="Active shipments" color="#3A8AE8" />
              <KPICard label="Pending Pickup" value={String(pickupPending)} color="#F5A623" />
              <KPICard label="Returns" value={String(totalReturns)} sub={totalShipments ? `${Math.round(totalReturns/totalShipments*100)}% return rate` : '—'} color="#E2514A" />
              <KPICard label="COD Pending" value={`PKR ${shipments.filter(s=>s.status!=='Delivered').reduce((a,s)=>a+s.cod,0).toLocaleString()}`} color="#7C6AF7" />
            </div>

            {/* Charts Row */}
            <div style={{ display: 'flex', gap: '16px' }}>
              {/* Delivery trend */}
              <div style={{ flex: 2, background: '#141418', border: '1px solid #2A2A35', borderRadius: '12px', padding: '20px' }}>
                <div style={{ fontSize: '13px', color: '#8A8A9E', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' }}>Delivery Trend — Last 9 Days</div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={deliveryTrend} barGap={2}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2A2A35" vertical={false} />
                    <XAxis dataKey="date" tick={{ fill: '#55556A', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#55556A', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '11px', color: '#8A8A9E' }} />
                    <Bar dataKey="delivered" name="Delivered" fill="#1DB87A" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="returned"  name="Returned"  fill="#E2514A" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="failed"    name="Failed"    fill="#55556A" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Status pie */}
              <div style={{ flex: 1, background: '#141418', border: '1px solid #2A2A35', borderRadius: '12px', padding: '20px' }}>
                <div style={{ fontSize: '13px', color: '#8A8A9E', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' }}>Shipment Status</div>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={statusPie} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={2}>
                      {statusPie.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '8px' }}>
                  {statusPie.map(s => (
                    <div key={s.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: s.color, display: 'inline-block' }} />
                        <span style={{ color: '#8A8A9E' }}>{s.name}</span>
                      </div>
                      <span style={{ color: '#F0EFF6', fontWeight: 600 }}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Courier Performance Table */}
            <div style={{ background: '#141418', border: '1px solid #2A2A35', borderRadius: '12px', padding: '20px' }}>
              <div style={{ fontSize: '13px', color: '#8A8A9E', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' }}>Courier Performance Snapshot</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #2A2A35' }}>
                    {['Courier', 'Deliveries', 'Delivery Rate', 'Avg Days', 'Returns', 'COD Revenue'].map(h => (
                      <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: '11px', color: '#55556A', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {courierPerf.map(c => (
                    <tr key={c.name} style={{ borderBottom: '1px solid #1F1F28' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#1C1C22'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '12px 12px' }}><CourierBadge courier={c.name} /></td>
                      <td style={{ padding: '12px 12px', color: '#F0EFF6', fontWeight: 600 }}>{c.deliveries}</td>
                      <td style={{ padding: '12px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '80px', height: '6px', background: '#1C1C22', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${c.rate}%`, height: '100%', background: c.rate >= 90 ? '#1DB87A' : c.rate >= 85 ? '#F5A623' : '#E2514A', borderRadius: '3px' }} />
                          </div>
                          <span style={{ color: c.rate >= 90 ? '#1DB87A' : c.rate >= 85 ? '#F5A623' : '#E2514A', fontWeight: 600, fontSize: '12px' }}>{c.rate}%</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 12px', color: '#F0EFF6' }}>{c.avgDays}d</td>
                      <td style={{ padding: '12px 12px', color: '#E2514A', fontWeight: 500 }}>{c.returns}</td>
                      <td style={{ padding: '12px 12px', color: '#7C6AF7', fontWeight: 600, fontFamily: 'JetBrains Mono, monospace', fontSize: '12px' }}>PKR {c.revenue.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* City delivery table */}
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1, background: '#141418', border: '1px solid #2A2A35', borderRadius: '12px', padding: '20px' }}>
                <div style={{ fontSize: '13px', color: '#8A8A9E', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' }}>Delivery by City</div>
                {cityData.map(c => (
                  <div key={c.city} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1F1F28' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                      <MapPin size={12} color="#55556A" />
                      <span style={{ color: '#F0EFF6', fontSize: '13px', width: '90px' }}>{c.city}</span>
                      <div style={{ flex: 1, height: '5px', background: '#1C1C22', borderRadius: '3px', overflow: 'hidden', maxWidth: '140px' }}>
                        <div style={{ width: `${(c.shipments / 312) * 100}%`, height: '100%', background: '#7C6AF7', borderRadius: '3px' }} />
                      </div>
                      <span style={{ color: '#8A8A9E', fontSize: '12px', width: '40px' }}>{c.shipments}</span>
                    </div>
                    <span style={{ color: c.deliveryRate >= 92 ? '#1DB87A' : c.deliveryRate >= 88 ? '#F5A623' : '#E2514A', fontSize: '12px', fontWeight: 600 }}>{c.deliveryRate}%</span>
                  </div>
                ))}
              </div>

              {/* COD summary */}
              <div style={{ flex: 1, background: '#141418', border: '1px solid #2A2A35', borderRadius: '12px', padding: '20px' }}>
                <div style={{ fontSize: '13px', color: '#8A8A9E', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' }}>COD Summary</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {codSummary.map(c => (
                    <div key={c.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: c.bg, borderRadius: '10px', border: `1px solid ${c.color}22` }}>
                      <span style={{ fontSize: '13px', color: '#8A8A9E' }}>{c.label}</span>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '15px', fontWeight: 700, color: c.color }}>PKR {c.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <button style={{ width: '100%', marginTop: '14px', padding: '10px', background: '#7C6AF7', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>
                  Request COD Remittance
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: SHIPMENTS ── */}
        {activeTab === 'Shipments' && (
          <div>
            {/* Filters */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                <Search size={13} color="#55556A" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by customer, tracking ID, order ID..."
                  style={{ width: '100%', background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '8px', padding: '9px 10px 9px 30px', color: '#F0EFF6', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              {/* Status filter */}
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                style={{ background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '8px', padding: '9px 12px', color: '#F0EFF6', fontSize: '13px', outline: 'none', cursor: 'pointer' }}>
                <option value="All">All Statuses</option>
                {Object.keys(STATUS_CFG).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {/* Courier filter */}
              <select value={courierFilter} onChange={e => setCourierFilter(e.target.value)}
                style={{ background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '8px', padding: '9px 12px', color: '#F0EFF6', fontSize: '13px', outline: 'none', cursor: 'pointer' }}>
                <option value="All">All Couriers</option>
                {Object.keys(COURIERS).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 14px', background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '8px', color: '#8A8A9E', fontSize: '13px', cursor: 'pointer' }}>
                <RefreshCw size={13} /> Refresh
              </button>
              <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 14px', background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '8px', color: '#8A8A9E', fontSize: '13px', cursor: 'pointer' }}>
                <Download size={13} /> Export CSV
              </button>
            </div>

            {/* Status quick-filter pills */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
              {['All', ...Object.keys(STATUS_CFG)].map(s => {
                const cfg = STATUS_CFG[s] || {};
                const count = s === 'All' ? shipments.length : shipments.filter(sh => sh.status === s).length;
                return (
                  <button key={s} onClick={() => setStatusFilter(s)} style={{
                    padding: '4px 12px', borderRadius: '999px', fontSize: '11px', fontWeight: 600, cursor: 'pointer',
                    background: statusFilter === s ? (cfg.bg || '#2A2550') : 'transparent',
                    color: statusFilter === s ? (cfg.color || '#7C6AF7') : '#55556A',
                    border: `1px solid ${statusFilter === s ? (cfg.color || '#7C6AF7') + '44' : '#2A2A35'}`,
                    transition: 'all 0.1s',
                  }}>{s} {count > 0 && <span style={{ opacity: 0.7 }}>({count})</span>}</button>
                );
              })}
            </div>

            {/* Table */}
            <div style={{ background: '#141418', border: '1px solid #2A2A35', borderRadius: '12px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#1C1C22', borderBottom: '1px solid #2A2A35' }}>
                    {['Tracking ID', 'Order', 'Customer', 'City', 'Courier', 'COD Amount', 'Status', 'Booked', 'Attempts', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: '11px', color: '#55556A', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredShipments.map(s => (
                    <tr key={s.id} style={{ borderBottom: '1px solid #1F1F28', cursor: 'pointer', transition: 'background 0.1s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#1A1A20'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      onClick={() => { setSelected(s); setShowDetail(true); }}>
                      <td style={{ padding: '13px 14px', fontFamily: 'JetBrains Mono, monospace', color: '#7C6AF7', fontSize: '12px', fontWeight: 600 }}>{s.trackingId}</td>
                      <td style={{ padding: '13px 14px', fontFamily: 'JetBrains Mono, monospace', color: '#8A8A9E', fontSize: '11px' }}>{s.orderId}</td>
                      <td style={{ padding: '13px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#2A2550', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: '#7C6AF7', flexShrink: 0 }}>{s.customer.split(' ').map(n => n[0]).join('')}</div>
                          <div>
                            <div style={{ color: '#F0EFF6', fontWeight: 500 }}>{s.customer}</div>
                            <div style={{ color: '#55556A', fontSize: '11px' }}>{s.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '13px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#8A8A9E', fontSize: '12px' }}>
                          <MapPin size={11} /> {s.city}
                        </div>
                      </td>
                      <td style={{ padding: '13px 14px' }}><CourierBadge courier={s.courier} /></td>
                      <td style={{ padding: '13px 14px', fontFamily: 'JetBrains Mono, monospace', color: '#1DB87A', fontWeight: 600, fontSize: '12px' }}>PKR {s.cod.toLocaleString()}</td>
                      <td style={{ padding: '13px 14px' }}><StatusBadge status={s.status} /></td>
                      <td style={{ padding: '13px 14px', color: '#55556A', fontSize: '12px' }}>{s.bookedOn}</td>
                      <td style={{ padding: '13px 14px', textAlign: 'center' }}>
                        <span style={{ color: s.attempts >= 2 ? '#E2514A' : '#8A8A9E', fontWeight: 600, fontSize: '13px' }}>{s.attempts}</span>
                      </td>
                      <td style={{ padding: '13px 14px' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={e => { e.stopPropagation(); setSelected(s); setShowDetail(true); }} style={{ padding: '4px 8px', background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '6px', color: '#8A8A9E', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
                            <Eye size={11} /> Track
                          </button>
                          <button onClick={e => e.stopPropagation()} style={{ padding: '4px 8px', background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '6px', color: '#8A8A9E', cursor: 'pointer', fontSize: '11px' }}>
                            <Printer size={11} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredShipments.length === 0 && (
                <div style={{ padding: '40px', textAlign: 'center', color: '#55556A' }}>No shipments match your filters</div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB: COD MANAGEMENT ── */}
        {activeTab === 'COD Management' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* COD KPI row */}
            <div style={{ display: 'flex', gap: '16px' }}>
              {codSummary.map(c => (
                <div key={c.label} style={{ flex: 1, background: '#141418', border: `1px solid ${c.color}22`, borderRadius: '12px', padding: '20px' }}>
                  <div style={{ fontSize: '11px', color: '#8A8A9E', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>{c.label}</div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '24px', fontWeight: 700, color: c.color }}>PKR {c.amount.toLocaleString()}</div>
                </div>
              ))}
            </div>

            {/* COD Shipments table */}
            <div style={{ background: '#141418', border: '1px solid #2A2A35', borderRadius: '12px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ fontSize: '13px', color: '#8A8A9E', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>COD Shipments</div>
                <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: '#7C6AF7', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                  <Send size={12} /> Request Remittance
                </button>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #2A2A35' }}>
                    {['', 'Tracking ID', 'Customer', 'Courier', 'COD Amount', 'Status', 'Expected Date'].map(h => (
                      <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: '11px', color: '#55556A', fontWeight: 600, textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {shipments.map(s => (
                    <tr key={s.id} style={{ borderBottom: '1px solid #1F1F28' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#1C1C22'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '10px 12px' }}><input type="checkbox" style={{ accentColor: '#7C6AF7', cursor: 'pointer' }} /></td>
                      <td style={{ padding: '10px 12px', fontFamily: 'JetBrains Mono, monospace', color: '#7C6AF7', fontSize: '11px' }}>{s.trackingId}</td>
                      <td style={{ padding: '10px 12px', color: '#F0EFF6' }}>{s.customer}</td>
                      <td style={{ padding: '10px 12px' }}><CourierBadge courier={s.courier} /></td>
                      <td style={{ padding: '10px 12px', fontFamily: 'JetBrains Mono, monospace', color: '#1DB87A', fontWeight: 700, fontSize: '13px' }}>PKR {s.cod.toLocaleString()}</td>
                      <td style={{ padding: '10px 12px' }}><StatusBadge status={s.status} /></td>
                      <td style={{ padding: '10px 12px', color: '#55556A', fontSize: '12px' }}>{s.deliveredOn || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB: RETURNS ── */}
        {activeTab === 'Returns' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', gap: '16px' }}>
              <KPICard label="Total Returns" value="41" sub="Last 30 days" color="#E2514A" />
              <KPICard label="Return Rate" value="4.8%" sub="Industry avg: 6%" color="#F5A623" trend="↓ 0.2% this week" trendUp />
              <KPICard label="Return Value" value="PKR 1.2L" sub="Pending restock" color="#E2514A" />
              <KPICard label="Re-shipped" value="18" sub="From returns" color="#1DB87A" />
            </div>

            {/* Returns table */}
            <div style={{ background: '#141418', border: '1px solid #2A2A35', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #2A2A35', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#F0EFF6', fontWeight: 600, fontSize: '14px' }}>Returns & Failed Deliveries</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button style={{ padding: '7px 12px', background: '#3D1414', border: '1px solid #E2514A33', borderRadius: '7px', color: '#E2514A', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>Mark as Restocked</button>
                  <button style={{ padding: '7px 12px', background: '#2A2550', border: '1px solid #7C6AF733', borderRadius: '7px', color: '#7C6AF7', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>Re-attempt Delivery</button>
                </div>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#1C1C22' }}>
                    {['', 'Tracking ID', 'Customer', 'Product', 'Courier', 'Attempts', 'COD', 'Reason', 'Action'].map(h => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '11px', color: '#55556A', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {returns.map(s => (
                    <tr key={s.id} style={{ borderBottom: '1px solid #1F1F28' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#1A1A20'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '12px 14px' }}><input type="checkbox" style={{ accentColor: '#7C6AF7' }} /></td>
                      <td style={{ padding: '12px 14px', fontFamily: 'JetBrains Mono, monospace', color: '#E2514A', fontSize: '11px' }}>{s.trackingId}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ color: '#F0EFF6' }}>{s.customer}</div>
                        <div style={{ color: '#55556A', fontSize: '11px' }}>{s.city}</div>
                      </td>
                      <td style={{ padding: '12px 14px', color: '#8A8A9E', fontSize: '12px' }}>{s.product}</td>
                      <td style={{ padding: '12px 14px' }}><CourierBadge courier={s.courier} /></td>
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <span style={{ background: '#3D1414', color: '#E2514A', padding: '2px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: 700 }}>{s.attempts}x</span>
                      </td>
                      <td style={{ padding: '12px 14px', fontFamily: 'JetBrains Mono, monospace', color: '#1DB87A', fontWeight: 600, fontSize: '12px' }}>PKR {s.cod.toLocaleString()}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ background: s.status === 'Returned' ? '#3D1414' : '#3D2D0A', color: s.status === 'Returned' ? '#E2514A' : '#F5A623', padding: '2px 8px', borderRadius: '6px', fontSize: '11px' }}>
                          {s.status === 'Returned' ? 'Customer Refused' : 'Address Issue'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <select style={{ background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '6px', padding: '4px 8px', color: '#F0EFF6', fontSize: '11px', cursor: 'pointer', outline: 'none' }}>
                          <option>Select Action</option>
                          <option>Re-attempt</option>
                          <option>Mark Restocked</option>
                          <option>Issue Refund</option>
                          <option>Write Off</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB: PERFORMANCE ── */}
        {activeTab === 'Performance' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Per-courier KPI cards */}
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              {courierPerf.map(c => {
                const cfg = COURIERS[c.name] || {};
                return (
                  <div key={c.name} style={{ flex: '1 1 200px', background: '#141418', border: `1px solid ${cfg.color}22`, borderRadius: '12px', padding: '18px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <CourierBadge courier={c.name} />
                      <span style={{ fontSize: '11px', color: c.rate >= 90 ? '#1DB87A' : '#F5A623', fontWeight: 700, background: c.rate >= 90 ? '#0F3D2A' : '#3D2D0A', padding: '2px 8px', borderRadius: '999px' }}>{c.rate}%</span>
                    </div>
                    <div style={{ fontSize: '22px', fontWeight: 700, color: '#F0EFF6', marginBottom: '4px' }}>{c.deliveries}</div>
                    <div style={{ fontSize: '11px', color: '#55556A', marginBottom: '10px' }}>deliveries</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                      <span style={{ color: '#8A8A9E' }}>Avg: <span style={{ color: '#F0EFF6', fontWeight: 600 }}>{c.avgDays}d</span></span>
                      <span style={{ color: '#8A8A9E' }}>Returns: <span style={{ color: '#E2514A', fontWeight: 600 }}>{c.returns}</span></span>
                    </div>
                    <div style={{ marginTop: '10px', fontFamily: 'JetBrains Mono, monospace', color: cfg.color, fontSize: '12px', fontWeight: 700 }}>
                      PKR {c.revenue.toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Performance bar chart */}
            <div style={{ background: '#141418', border: '1px solid #2A2A35', borderRadius: '12px', padding: '20px' }}>
              <div style={{ fontSize: '13px', color: '#8A8A9E', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' }}>Delivery Rate by Courier</div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={courierPerf} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2A35" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: '#55556A', fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
                  <YAxis type="category" dataKey="name" tick={{ fill: '#F0EFF6', fontSize: 12 }} axisLine={false} tickLine={false} width={70} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="rate" name="Delivery Rate %" radius={[0, 4, 4, 0]}>
                    {courierPerf.map((c, i) => <Cell key={i} fill={COURIERS[c.name]?.color || '#7C6AF7'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Detailed metrics grid */}
            <div style={{ background: '#141418', border: '1px solid #2A2A35', borderRadius: '12px', padding: '20px' }}>
              <div style={{ fontSize: '13px', color: '#8A8A9E', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' }}>Detailed Metrics</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #2A2A35' }}>
                    {['Courier', 'Total Dispatched', '1st Attempt Success', 'Avg Delivery Days', 'Return Rate', 'SLA Breach', 'Rating'].map(h => (
                      <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: '11px', color: '#55556A', fontWeight: 600, textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'TCS',      dispatched: 151, firstAttempt: 88, avgDays: 2.1, returnRate: 5.3, slaBreach: 3,  rating: 4.4 },
                    { name: 'Leopards', dispatched: 108, firstAttempt: 84, avgDays: 2.4, returnRate: 8.3, slaBreach: 6,  rating: 4.1 },
                    { name: 'BlueEx',   dispatched: 76,  firstAttempt: 81, avgDays: 2.8, returnRate: 10.5, slaBreach: 8, rating: 3.9 },
                    { name: 'PostEx',   dispatched: 63,  firstAttempt: 79, avgDays: 3.0, returnRate: 14.3, slaBreach: 10,rating: 3.7 },
                    { name: 'Trax',     dispatched: 46,  firstAttempt: 85, avgDays: 2.5, returnRate: 8.7, slaBreach: 5,  rating: 4.0 },
                    { name: 'M&P',      dispatched: 35,  firstAttempt: 77, avgDays: 3.2, returnRate: 17.1, slaBreach: 12,rating: 3.5 },
                  ].map(r => (
                    <tr key={r.name} style={{ borderBottom: '1px solid #1F1F28' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#1C1C22'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '12px 12px' }}><CourierBadge courier={r.name} /></td>
                      <td style={{ padding: '12px 12px', color: '#F0EFF6', fontWeight: 600 }}>{r.dispatched}</td>
                      <td style={{ padding: '12px 12px', color: r.firstAttempt >= 85 ? '#1DB87A' : '#F5A623', fontWeight: 600 }}>{r.firstAttempt}%</td>
                      <td style={{ padding: '12px 12px', color: '#F0EFF6' }}>{r.avgDays}d</td>
                      <td style={{ padding: '12px 12px', color: r.returnRate > 10 ? '#E2514A' : '#F5A623', fontWeight: 600 }}>{r.returnRate}%</td>
                      <td style={{ padding: '12px 12px', color: r.slaBreach > 8 ? '#E2514A' : '#8A8A9E' }}>{r.slaBreach}</td>
                      <td style={{ padding: '12px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} size={11} fill={s <= Math.round(r.rating) ? '#F5A623' : 'transparent'} color={s <= Math.round(r.rating) ? '#F5A623' : '#2A2A35'} />
                          ))}
                          <span style={{ fontSize: '12px', color: '#8A8A9E', marginLeft: '4px' }}>{r.rating}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB: CREATE BOOKING ── */}
        {activeTab === 'Create Booking' && (
          <div style={{ maxWidth: '720px' }}>
            <div style={{ background: '#141418', border: '1px solid #2A2A35', borderRadius: '12px', padding: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                <div style={{ width: '32px', height: '32px', background: '#2A2550', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Package size={16} color="#7C6AF7" />
                </div>
                <div>
                  <div style={{ color: '#F0EFF6', fontWeight: 600, fontSize: '15px' }}>New Shipment Booking</div>
                  <div style={{ color: '#55556A', fontSize: '12px' }}>Create a courier booking for a new order</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {/* Row 1 */}
                <div style={{ display: 'flex', gap: '14px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '12px', color: '#8A8A9E', fontWeight: 500, marginBottom: '6px' }}>Customer Name *</label>
                    <div style={{ position: 'relative' }}>
                      <User size={13} color="#55556A" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input value={bookingForm.customer} onChange={e => setBookingForm(f => ({...f, customer: e.target.value}))} placeholder="Full name"
                        style={{ width: '100%', background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '8px', padding: '10px 10px 10px 30px', color: '#F0EFF6', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '12px', color: '#8A8A9E', fontWeight: 500, marginBottom: '6px' }}>Phone Number *</label>
                    <div style={{ position: 'relative' }}>
                      <Phone size={13} color="#55556A" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input value={bookingForm.phone} onChange={e => setBookingForm(f => ({...f, phone: e.target.value}))} placeholder="+92 3XX XXXXXXX"
                        style={{ width: '100%', background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '8px', padding: '10px 10px 10px 30px', color: '#F0EFF6', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                  </div>
                </div>

                {/* Row 2 */}
                <div style={{ display: 'flex', gap: '14px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '12px', color: '#8A8A9E', fontWeight: 500, marginBottom: '6px' }}>City *</label>
                    <select value={bookingForm.city} onChange={e => setBookingForm(f => ({...f, city: e.target.value}))}
                      style={{ width: '100%', background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '8px', padding: '10px 12px', color: bookingForm.city ? '#F0EFF6' : '#55556A', fontSize: '13px', outline: 'none', cursor: 'pointer' }}>
                      <option value="">Select city</option>
                      {['Karachi','Lahore','Islamabad','Faisalabad','Rawalpindi','Multan','Peshawar','Quetta','Sialkot','Gujranwala'].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '12px', color: '#8A8A9E', fontWeight: 500, marginBottom: '6px' }}>Courier *</label>
                    <select value={bookingForm.courier} onChange={e => setBookingForm(f => ({...f, courier: e.target.value}))}
                      style={{ width: '100%', background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '8px', padding: '10px 12px', color: '#F0EFF6', fontSize: '13px', outline: 'none', cursor: 'pointer' }}>
                      {Object.keys(COURIERS).map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#8A8A9E', fontWeight: 500, marginBottom: '6px' }}>Delivery Address *</label>
                  <div style={{ position: 'relative' }}>
                    <MapPin size={13} color="#55556A" style={{ position: 'absolute', left: '10px', top: '12px' }} />
                    <textarea value={bookingForm.address} onChange={e => setBookingForm(f => ({...f, address: e.target.value}))} placeholder="Full delivery address including house/flat number, street, area..."
                      rows={2} style={{ width: '100%', background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '8px', padding: '10px 10px 10px 30px', color: '#F0EFF6', fontSize: '13px', outline: 'none', resize: 'vertical', fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box' }} />
                  </div>
                </div>

                {/* Row 3 */}
                <div style={{ display: 'flex', gap: '14px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '12px', color: '#8A8A9E', fontWeight: 500, marginBottom: '6px' }}>Product Description *</label>
                    <input value={bookingForm.product} onChange={e => setBookingForm(f => ({...f, product: e.target.value}))} placeholder="e.g. Nike Air Max 270 x1"
                      style={{ width: '100%', background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '8px', padding: '10px 12px', color: '#F0EFF6', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ flex: '0 0 130px' }}>
                    <label style={{ display: 'block', fontSize: '12px', color: '#8A8A9E', fontWeight: 500, marginBottom: '6px' }}>Weight (kg)</label>
                    <input value={bookingForm.weight} onChange={e => setBookingForm(f => ({...f, weight: e.target.value}))} placeholder="e.g. 1.2"
                      type="number" step="0.1" min="0.1"
                      style={{ width: '100%', background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '8px', padding: '10px 12px', color: '#F0EFF6', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ flex: '0 0 150px' }}>
                    <label style={{ display: 'block', fontSize: '12px', color: '#8A8A9E', fontWeight: 500, marginBottom: '6px' }}>COD Amount (PKR)</label>
                    <input value={bookingForm.cod} onChange={e => setBookingForm(f => ({...f, cod: e.target.value}))} placeholder="e.g. 12500"
                      type="number"
                      style={{ width: '100%', background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '8px', padding: '10px 12px', color: '#F0EFF6', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#8A8A9E', fontWeight: 500, marginBottom: '6px' }}>Special Instructions (optional)</label>
                  <textarea value={bookingForm.notes} onChange={e => setBookingForm(f => ({...f, notes: e.target.value}))} placeholder="Fragile, call before delivery, etc."
                    rows={2} style={{ width: '100%', background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '8px', padding: '10px 12px', color: '#F0EFF6', fontSize: '13px', outline: 'none', resize: 'vertical', fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box' }} />
                </div>

                {/* Courier info box */}
                {bookingForm.courier && (
                  <div style={{ background: COURIERS[bookingForm.courier]?.bg || '#1C1C22', border: `1px solid ${COURIERS[bookingForm.courier]?.color || '#2A2A35'}33`, borderRadius: '10px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <CourierBadge courier={bookingForm.courier} />
                    <div style={{ flex: 1, fontSize: '12px', color: '#8A8A9E' }}>
                      Est. delivery: <span style={{ color: '#F0EFF6', fontWeight: 600 }}>{courierPerf.find(c => c.name === bookingForm.courier)?.avgDays || '?'} days</span>
                      <span style={{ marginLeft: '20px' }}>Rate: <span style={{ color: COURIERS[bookingForm.courier]?.color, fontWeight: 600 }}>{courierPerf.find(c => c.name === bookingForm.courier)?.rate || '?'}%</span></span>
                    </div>
                  </div>
                )}

                {/* Feedback messages */}
                {bookingError && (
                  <div style={{ padding: '10px 14px', background: '#3D1414', border: '1px solid #E2514A33', borderRadius: '8px', color: '#E2514A', fontSize: '13px' }}>
                    {bookingError}
                  </div>
                )}
                {bookingSuccess && (
                  <div style={{ padding: '10px 14px', background: '#0F3D2A', border: '1px solid #1DB87A33', borderRadius: '8px', color: '#1DB87A', fontSize: '13px' }}>
                    ✓ {bookingSuccess}
                  </div>
                )}

                {/* Submit */}
                <div style={{ display: 'flex', gap: '10px', paddingTop: '6px' }}>
                  <button onClick={handleBookShipment} disabled={booking}
                    style={{ flex: 1, padding: '12px', background: booking ? '#55556A' : '#7C6AF7', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: booking ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <Package size={15} /> {booking ? 'Booking...' : 'Book Shipment'}
                  </button>
                  <button onClick={() => printShippingLabel({ trackingId: bookingSuccess ? bookingSuccess.split(':').pop()?.trim() : '', courier: bookingForm.courier, customer: bookingForm.customer, phone: bookingForm.phone, address: bookingForm.address, city: bookingForm.city, weight: bookingForm.weight, codAmount: bookingForm.cod, product: bookingForm.product })}
                    style={{ padding: '12px 20px', background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '8px', color: '#8A8A9E', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Printer size={14} /> Print Label
                  </button>
                  <button onClick={() => { setBookingForm({ customer: '', phone: '', city: '', address: '', weight: '', cod: '', courier: 'TCS', product: '', notes: '' }); setBookingError(''); setBookingSuccess(''); }}
                    style={{ padding: '12px 16px', background: 'transparent', border: '1px solid #2A2A35', borderRadius: '8px', color: '#55556A', fontSize: '14px', cursor: 'pointer' }}>
                    Clear
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Shipment Detail Side Panel ── */}
      {showDetail && selected && (
        <>
          <div onClick={() => setShowDetail(false)} style={{ position: 'fixed', inset: 0, background: '#00000066', zIndex: 40 }} />
          <div style={{ position: 'fixed', right: 0, top: 0, height: '100vh', width: '460px', background: '#141418', borderLeft: '1px solid #2A2A35', zIndex: 50, overflowY: 'auto', padding: '24px' }}>
            {/* Panel header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '16px', fontWeight: 700, color: '#7C6AF7', marginBottom: '4px' }}>{selected.trackingId}</div>
                <StatusBadge status={selected.status} />
              </div>
              <button onClick={() => setShowDetail(false)} style={{ background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '6px', width: '30px', height: '30px', color: '#8A8A9E', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
            </div>

            {/* Tracking Timeline */}
            <div style={{ background: '#1C1C22', borderRadius: '10px', padding: '16px', marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', color: '#55556A', fontWeight: 600, textTransform: 'uppercase', marginBottom: '12px' }}>Tracking Timeline</div>
              <TrackingTimeline status={selected.status} />
            </div>

            {/* Customer info */}
            <div style={{ background: '#1C1C22', borderRadius: '10px', padding: '16px', marginBottom: '12px' }}>
              <div style={{ fontSize: '11px', color: '#55556A', fontWeight: 600, textTransform: 'uppercase', marginBottom: '12px' }}>Customer</div>
              {[
                { icon: User,    label: selected.customer },
                { icon: Phone,   label: selected.phone },
                { icon: MapPin,  label: `${selected.city}` },
                { icon: Package, label: selected.product },
              ].map(({ icon: Icon, label }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <Icon size={13} color="#55556A" />
                  <span style={{ color: '#F0EFF6', fontSize: '13px' }}>{label}</span>
                </div>
              ))}
            </div>

            {/* Shipment details */}
            <div style={{ background: '#1C1C22', borderRadius: '10px', padding: '16px', marginBottom: '12px' }}>
              <div style={{ fontSize: '11px', color: '#55556A', fontWeight: 600, textTransform: 'uppercase', marginBottom: '12px' }}>Shipment Details</div>
              {[
                ['Order ID', selected.orderId],
                ['Courier', selected.courier],
                ['Weight', selected.weight],
                ['COD Amount', `PKR ${selected.cod.toLocaleString()}`],
                ['Booked On', selected.bookedOn],
                ['Delivery Attempts', `${selected.attempts}`],
                ['Delivered On', selected.deliveredOn || '—'],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                  <span style={{ color: '#8A8A9E' }}>{k}</span>
                  <span style={{ color: k === 'COD Amount' ? '#1DB87A' : '#F0EFF6', fontWeight: 500, fontFamily: k === 'Order ID' || k === 'COD Amount' ? 'JetBrains Mono, monospace' : 'inherit', fontSize: k === 'Order ID' ? '12px' : '13px' }}>{v}</span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button style={{ width: '100%', padding: '10px', background: '#7C6AF7', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 600, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <RefreshCw size={13} /> Refresh Tracking
              </button>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => printShippingLabel(selected)} style={{ flex: 1, padding: '9px', background: '#1C1C22', border: '1px solid #2A2A35', borderRadius: '8px', color: '#8A8A9E', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <Printer size={12} /> Print Label
                </button>
                <button style={{ flex: 1, padding: '9px', background: '#3D1414', border: '1px solid #E2514A33', borderRadius: '8px', color: '#E2514A', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <XCircle size={12} /> Cancel
                </button>
                {selected.status === 'Failed' || selected.status === 'Returned' ? (
                  <button style={{ flex: 1, padding: '9px', background: '#2A2550', border: '1px solid #7C6AF733', borderRadius: '8px', color: '#7C6AF7', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <RotateCcw size={12} /> Re-attempt
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
