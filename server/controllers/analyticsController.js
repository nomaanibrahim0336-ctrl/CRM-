const Order = require('../models/Order');
const Customer = require('../models/Customer');
const Product = require('../models/Product');
const Conversation = require('../models/Conversation');
const Shipment = require('../models/Shipment');
const Expense = require('../models/Expense');

// ── helpers ───────────────────────────────────────────────

const dateRange = (from, to) => {
  const filter = {};
  if (from) filter.$gte = new Date(from);
  if (to) filter.$lte = new Date(new Date(to).setHours(23, 59, 59));
  return Object.keys(filter).length ? filter : null;
};

const periodGroup = (groupBy = 'day') => ({
  day: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, day: { $dayOfMonth: '$createdAt' } },
  week: { year: { $year: '$createdAt' }, week: { $week: '$createdAt' } },
  month: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
}[groupBy]);

// ── GET /api/analytics/dashboard ─────────────────────────
// Single call that powers the main dashboard KPIs + charts
const getDashboard = async (req, res, next) => {
  try {
    const { dateFrom, dateTo } = req.query;
    const dr = dateRange(dateFrom, dateTo);

    const orderMatch = { status: { $nin: ['Cancelled'] } };
    if (dr) orderMatch.createdAt = dr;

    // KPIs
    const [orderKpis] = await Order.aggregate([
      { $match: orderMatch },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' },
          totalOrders: { $sum: 1 },
          avgOrderValue: { $avg: '$total' },
          pendingOrders: { $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] } },
          deliveredOrders: { $sum: { $cond: [{ $eq: ['$status', 'Delivered'] }, 1, 0] } },
        },
      },
    ]);

    // COGS for gross profit
    const [cogsResult] = await Order.aggregate([
      { $match: { ...orderMatch, status: { $in: ['Delivered', 'Shipped'] } } },
      { $unwind: '$items' },
      { $group: { _id: null, cogs: { $sum: { $multiply: ['$items.costPrice', '$items.qty'] } } } },
    ]);

    // New customers in period
    const customerMatch = {};
    if (dr) customerMatch.createdAt = dr;
    const newCustomers = await Customer.countDocuments(customerMatch);
    const totalCustomers = await Customer.countDocuments({});

    // Expenses in period
    const expenseMatch = {};
    if (dr) expenseMatch.date = dr;
    const [expTotals] = await Expense.aggregate([
      { $match: expenseMatch },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    // Revenue trend (daily)
    const revenueTrend = await Order.aggregate([
      { $match: orderMatch },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, day: { $dayOfMonth: '$createdAt' } },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]);

    // Orders by source
    const ordersBySource = await Order.aggregate([
      { $match: orderMatch },
      { $group: { _id: '$source', count: { $sum: 1 }, revenue: { $sum: '$total' } } },
      { $sort: { count: -1 } },
    ]);

    // Top products by revenue
    const topProducts = await Order.aggregate([
      { $match: orderMatch },
      { $unwind: '$items' },
      {
        $group: {
          _id: { product: '$items.product', name: '$items.name' },
          unitsSold: { $sum: '$items.qty' },
          revenue: { $sum: { $multiply: ['$items.salePrice', '$items.qty'] } },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
    ]);

    // Conversation stats
    const convStats = await Conversation.aggregate([
      { $group: { _id: '$channel', count: { $sum: 1 }, unread: { $sum: '$unreadCount' } } },
      { $sort: { count: -1 } },
    ]);

    const revenue = orderKpis?.totalRevenue || 0;
    const cogs = cogsResult?.cogs || 0;
    const expenses = expTotals?.total || 0;
    const grossProfit = revenue - cogs;
    const netProfit = grossProfit - expenses;

    res.json({
      success: true,
      data: {
        kpis: {
          totalRevenue: revenue,
          totalOrders: orderKpis?.totalOrders || 0,
          avgOrderValue: Math.round(orderKpis?.avgOrderValue || 0),
          pendingOrders: orderKpis?.pendingOrders || 0,
          deliveredOrders: orderKpis?.deliveredOrders || 0,
          newCustomers,
          totalCustomers,
          grossProfit,
          netProfit,
          expenses,
        },
        revenueTrend,
        ordersBySource,
        topProducts,
        convStats,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/analytics/sales ──────────────────────────────
const getSalesAnalytics = async (req, res, next) => {
  try {
    const { dateFrom, dateTo, groupBy = 'day' } = req.query;
    const dr = dateRange(dateFrom, dateTo);

    const match = { status: { $nin: ['Cancelled'] } };
    if (dr) match.createdAt = dr;

    const byPeriod = await Order.aggregate([
      { $match: match },
      { $group: { _id: periodGroup(groupBy), revenue: { $sum: '$total' }, orders: { $sum: 1 }, avgOrder: { $avg: '$total' } } },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 } },
    ]);

    const byStatus = await Order.aggregate([
      { $match: dr ? { createdAt: dr } : {} },
      { $group: { _id: '$status', count: { $sum: 1 }, revenue: { $sum: '$total' } } },
    ]);

    const byPayment = await Order.aggregate([
      { $match: match },
      { $group: { _id: '$paymentMethod', count: { $sum: 1 }, revenue: { $sum: '$total' } } },
      { $sort: { revenue: -1 } },
    ]);

    const bySource = await Order.aggregate([
      { $match: match },
      { $group: { _id: '$source', count: { $sum: 1 }, revenue: { $sum: '$total' } } },
      { $sort: { revenue: -1 } },
    ]);

    res.json({ success: true, data: { byPeriod, byStatus, byPayment, bySource } });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/analytics/customers ─────────────────────────
const getCustomerAnalytics = async (req, res, next) => {
  try {
    const { dateFrom, dateTo, groupBy = 'month' } = req.query;
    const dr = dateRange(dateFrom, dateTo);

    const match = dr ? { createdAt: dr } : {};

    // New customers over time
    const newOverTime = await Customer.aggregate([
      { $match: match },
      {
        $group: {
          _id: groupBy === 'month'
            ? { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }
            : { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, day: { $dayOfMonth: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]);

    const bySource = await Customer.aggregate([
      { $group: { _id: '$source', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const byCity = await Customer.aggregate([
      { $match: { city: { $ne: '' } } },
      { $group: { _id: '$city', count: { $sum: 1 }, totalSpent: { $sum: '$totalSpent' } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Top customers by spend
    const topCustomers = await Customer.find()
      .sort('-totalSpent')
      .limit(10)
      .select('name phone city totalOrders totalSpent source');

    // Repeat vs new
    const repeatVsNew = await Customer.aggregate([
      {
        $group: {
          _id: null,
          repeat: { $sum: { $cond: [{ $gt: ['$totalOrders', 1] }, 1, 0] } },
          newCustomers: { $sum: { $cond: [{ $eq: ['$totalOrders', 1] }, 1, 0] } },
          zeroOrders: { $sum: { $cond: [{ $eq: ['$totalOrders', 0] }, 1, 0] } },
        },
      },
    ]);

    res.json({ success: true, data: { newOverTime, bySource, byCity, topCustomers, repeatVsNew: repeatVsNew[0] || {} } });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/analytics/products ──────────────────────────
const getProductAnalytics = async (req, res, next) => {
  try {
    const { dateFrom, dateTo, limit = 10 } = req.query;
    const dr = dateRange(dateFrom, dateTo);

    const match = { status: { $in: ['Delivered', 'Shipped', 'Processing'] } };
    if (dr) match.createdAt = dr;

    const topByRevenue = await Order.aggregate([
      { $match: match },
      { $unwind: '$items' },
      {
        $group: {
          _id: { product: '$items.product', name: '$items.name', sku: '$items.sku' },
          unitsSold: { $sum: '$items.qty' },
          revenue: { $sum: { $multiply: ['$items.salePrice', '$items.qty'] } },
          profit: { $sum: { $multiply: [{ $subtract: ['$items.salePrice', '$items.costPrice'] }, '$items.qty'] } },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: Number(limit) },
    ]);

    const byCategory = await Order.aggregate([
      { $match: match },
      { $unwind: '$items' },
      {
        $lookup: { from: 'products', localField: 'items.product', foreignField: '_id', as: 'productDoc' },
      },
      { $unwind: { path: '$productDoc', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$productDoc.category',
          unitsSold: { $sum: '$items.qty' },
          revenue: { $sum: { $multiply: ['$items.salePrice', '$items.qty'] } },
        },
      },
      { $sort: { revenue: -1 } },
    ]);

    // Low stock alert count
    const lowStockCount = await Product.countDocuments({
      $expr: { $and: [{ $gt: ['$stock', 0] }, { $lte: ['$stock', '$reorderPoint'] }] },
    });
    const outOfStockCount = await Product.countDocuments({ stock: 0 });

    res.json({ success: true, data: { topByRevenue, byCategory, lowStockCount, outOfStockCount } });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/analytics/courier ────────────────────────────
const getCourierAnalytics = async (req, res, next) => {
  try {
    const { dateFrom, dateTo } = req.query;
    const dr = dateRange(dateFrom, dateTo);
    const match = dr ? { createdAt: dr } : {};

    const byCourier = await Shipment.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$courier',
          total: { $sum: 1 },
          delivered: { $sum: { $cond: [{ $eq: ['$status', 'Delivered'] }, 1, 0] } },
          failed: { $sum: { $cond: [{ $eq: ['$status', 'Failed'] }, 1, 0] } },
          returned: { $sum: { $cond: [{ $eq: ['$status', 'Returned'] }, 1, 0] } },
          avgCod: { $avg: '$codAmount' },
        },
      },
      {
        $addFields: {
          successRate: { $cond: [{ $gt: ['$total', 0] }, { $multiply: [{ $divide: ['$delivered', '$total'] }, 100] }, 0] },
        },
      },
      { $sort: { total: -1 } },
    ]);

    const deliveryTrend = await Shipment.aggregate([
      { $match: { ...match, status: 'Delivered' } },
      {
        $group: {
          _id: { year: { $year: '$deliveredAt' }, month: { $month: '$deliveredAt' }, day: { $dayOfMonth: '$deliveredAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]);

    res.json({ success: true, data: { byCourier, deliveryTrend } });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboard, getSalesAnalytics, getCustomerAnalytics, getProductAnalytics, getCourierAnalytics };
