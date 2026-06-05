const Order = require('../models/Order');
const Expense = require('../models/Expense');
const Shipment = require('../models/Shipment');

// ── EXPENSES CRUD ─────────────────────────────────────────

// GET /api/financials/expenses
const getExpenses = async (req, res, next) => {
  try {
    const { category, dateFrom, dateTo, page = 1, limit = 20, sort = '-date' } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) filter.date.$gte = new Date(dateFrom);
      if (dateTo) filter.date.$lte = new Date(new Date(dateTo).setHours(23, 59, 59));
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Expense.countDocuments(filter);
    const expenses = await Expense.find(filter).sort(sort).skip(skip).limit(Number(limit));

    res.json({ success: true, total, page: Number(page), pages: Math.ceil(total / Number(limit)), data: expenses });
  } catch (err) {
    next(err);
  }
};

// POST /api/financials/expenses
const createExpense = async (req, res, next) => {
  try {
    const expense = await Expense.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, data: expense });
  } catch (err) {
    next(err);
  }
};

// PUT /api/financials/expenses/:id
const updateExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!expense) return res.status(404).json({ success: false, error: 'Expense not found' });
    res.json({ success: true, data: expense });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/financials/expenses/:id
const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) return res.status(404).json({ success: false, error: 'Expense not found' });
    res.json({ success: true, message: 'Expense deleted' });
  } catch (err) {
    next(err);
  }
};

// ── P&L STATEMENT ─────────────────────────────────────────

// GET /api/financials/pnl?dateFrom=&dateTo=&groupBy=month|week|day
const getPnL = async (req, res, next) => {
  try {
    const { dateFrom, dateTo, groupBy = 'month' } = req.query;

    const dateFilter = {};
    if (dateFrom) dateFilter.$gte = new Date(dateFrom);
    if (dateTo) dateFilter.$lte = new Date(new Date(dateTo).setHours(23, 59, 59));

    const orderMatch = { status: { $in: ['Delivered', 'Shipped', 'Processing', 'Confirmed'] } };
    if (Object.keys(dateFilter).length) orderMatch.createdAt = dateFilter;

    const groupFormat = {
      month: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
      week: { year: { $year: '$createdAt' }, week: { $week: '$createdAt' } },
      day: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, day: { $dayOfMonth: '$createdAt' } },
    };

    // Revenue + COGS from orders
    const revenueData = await Order.aggregate([
      { $match: orderMatch },
      { $unwind: '$items' },
      {
        $group: {
          _id: groupFormat[groupBy],
          revenue: { $sum: { $multiply: ['$items.salePrice', '$items.qty'] } },
          cogs: { $sum: { $multiply: ['$items.costPrice', '$items.qty'] } },
          orders: { $addToSet: '$_id' },
          shippingFees: { $sum: '$shippingFee' },
        },
      },
      { $addFields: { orderCount: { $size: '$orders' } } },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]);

    // Expenses by period
    const expenseMatch = {};
    if (Object.keys(dateFilter).length) expenseMatch.date = dateFilter;

    const expenseData = await Expense.aggregate([
      { $match: expenseMatch },
      {
        $group: {
          _id: groupFormat[groupBy],
          totalExpenses: { $sum: '$amount' },
        },
      },
    ]);

    // Merge revenue + expenses
    const expenseMap = {};
    expenseData.forEach(e => {
      const key = JSON.stringify(e._id);
      expenseMap[key] = e.totalExpenses;
    });

    const pnl = revenueData.map(r => {
      const key = JSON.stringify(r._id);
      const expenses = expenseMap[key] || 0;
      const grossProfit = r.revenue - r.cogs;
      const operatingProfit = grossProfit - expenses;
      const tax = operatingProfit > 0 ? operatingProfit * 0.2 : 0;
      const netProfit = operatingProfit - tax;

      return {
        period: r._id,
        revenue: r.revenue,
        cogs: r.cogs,
        grossProfit,
        grossMargin: r.revenue > 0 ? ((grossProfit / r.revenue) * 100).toFixed(1) : 0,
        expenses,
        operatingProfit,
        tax: Math.round(tax),
        netProfit: Math.round(netProfit),
        netMargin: r.revenue > 0 ? ((netProfit / r.revenue) * 100).toFixed(1) : 0,
        orderCount: r.orderCount,
        shippingFees: r.shippingFees,
      };
    });

    // Totals row
    const totals = pnl.reduce((acc, row) => ({
      revenue: acc.revenue + row.revenue,
      cogs: acc.cogs + row.cogs,
      grossProfit: acc.grossProfit + row.grossProfit,
      expenses: acc.expenses + row.expenses,
      operatingProfit: acc.operatingProfit + row.operatingProfit,
      tax: acc.tax + row.tax,
      netProfit: acc.netProfit + row.netProfit,
      orderCount: acc.orderCount + row.orderCount,
    }), { revenue: 0, cogs: 0, grossProfit: 0, expenses: 0, operatingProfit: 0, tax: 0, netProfit: 0, orderCount: 0 });

    res.json({ success: true, data: { rows: pnl, totals } });
  } catch (err) {
    next(err);
  }
};

// GET /api/financials/revenue?dateFrom=&dateTo=&groupBy=
const getRevenue = async (req, res, next) => {
  try {
    const { dateFrom, dateTo, groupBy = 'month' } = req.query;

    const match = { status: { $in: ['Delivered', 'Shipped', 'Processing', 'Confirmed'] } };
    if (dateFrom || dateTo) {
      match.createdAt = {};
      if (dateFrom) match.createdAt.$gte = new Date(dateFrom);
      if (dateTo) match.createdAt.$lte = new Date(new Date(dateTo).setHours(23, 59, 59));
    }

    const groupFormat = {
      month: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
      week: { year: { $year: '$createdAt' }, week: { $week: '$createdAt' } },
      day: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, day: { $dayOfMonth: '$createdAt' } },
    };

    const byPeriod = await Order.aggregate([
      { $match: match },
      { $group: { _id: groupFormat[groupBy], revenue: { $sum: '$total' }, orders: { $sum: 1 }, avgOrder: { $avg: '$total' } } },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]);

    const bySource = await Order.aggregate([
      { $match: match },
      { $group: { _id: '$source', revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
      { $sort: { revenue: -1 } },
    ]);

    const byPayment = await Order.aggregate([
      { $match: match },
      { $group: { _id: '$paymentMethod', revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
      { $sort: { revenue: -1 } },
    ]);

    res.json({ success: true, data: { byPeriod, bySource, byPayment } });
  } catch (err) {
    next(err);
  }
};

// GET /api/financials/expenses/summary
const getExpenseSummary = async (req, res, next) => {
  try {
    const { dateFrom, dateTo } = req.query;

    const match = {};
    if (dateFrom || dateTo) {
      match.date = {};
      if (dateFrom) match.date.$gte = new Date(dateFrom);
      if (dateTo) match.date.$lte = new Date(new Date(dateTo).setHours(23, 59, 59));
    }

    const byCategory = await Expense.aggregate([
      { $match: match },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]);

    const [totals] = await Expense.aggregate([
      { $match: match },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);

    res.json({ success: true, data: { byCategory, totals: totals || { total: 0, count: 0 } } });
  } catch (err) {
    next(err);
  }
};

// GET /api/financials/cashflow?dateFrom=&dateTo=
const getCashflow = async (req, res, next) => {
  try {
    const { dateFrom, dateTo } = req.query;

    const dateFilter = {};
    if (dateFrom) dateFilter.$gte = new Date(dateFrom);
    if (dateTo) dateFilter.$lte = new Date(new Date(dateTo).setHours(23, 59, 59));

    const inMatch = { status: 'Delivered', paymentStatus: 'Paid' };
    if (Object.keys(dateFilter).length) inMatch.createdAt = dateFilter;

    const outMatch = {};
    if (Object.keys(dateFilter).length) outMatch.date = dateFilter;

    const inflows = await Order.aggregate([
      { $match: inMatch },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, week: { $week: '$createdAt' } }, inflow: { $sum: '$total' } } },
      { $sort: { '_id.year': 1, '_id.week': 1 } },
    ]);

    const outflows = await Expense.aggregate([
      { $match: outMatch },
      { $group: { _id: { year: { $year: '$date' }, month: { $month: '$date' }, week: { $week: '$date' } }, outflow: { $sum: '$amount' } } },
      { $sort: { '_id.year': 1, '_id.week': 1 } },
    ]);

    // Merge by week key
    const map = {};
    inflows.forEach(i => {
      const k = `${i._id.year}-W${i._id.week}`;
      map[k] = { ...i._id, label: k, inflow: i.inflow, outflow: 0 };
    });
    outflows.forEach(o => {
      const k = `${o._id.year}-W${o._id.week}`;
      if (!map[k]) map[k] = { ...o._id, label: k, inflow: 0, outflow: 0 };
      map[k].outflow = o.outflow;
    });

    let runningBalance = 0;
    const rows = Object.values(map).map(r => {
      runningBalance += r.inflow - r.outflow;
      return { ...r, net: r.inflow - r.outflow, runningBalance };
    });

    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};

// GET /api/financials/product-profitability
const getProductProfitability = async (req, res, next) => {
  try {
    const { dateFrom, dateTo, limit = 20 } = req.query;

    const match = { status: { $in: ['Delivered', 'Shipped'] } };
    if (dateFrom || dateTo) {
      match.createdAt = {};
      if (dateFrom) match.createdAt.$gte = new Date(dateFrom);
      if (dateTo) match.createdAt.$lte = new Date(new Date(dateTo).setHours(23, 59, 59));
    }

    const data = await Order.aggregate([
      { $match: match },
      { $unwind: '$items' },
      {
        $group: {
          _id: { product: '$items.product', name: '$items.name', sku: '$items.sku' },
          unitsSold: { $sum: '$items.qty' },
          revenue: { $sum: { $multiply: ['$items.salePrice', '$items.qty'] } },
          cogs: { $sum: { $multiply: ['$items.costPrice', '$items.qty'] } },
        },
      },
      {
        $addFields: {
          grossProfit: { $subtract: ['$revenue', '$cogs'] },
          margin: {
            $cond: [
              { $gt: ['$revenue', 0] },
              { $multiply: [{ $divide: [{ $subtract: ['$revenue', '$cogs'] }, '$revenue'] }, 100] },
              0,
            ],
          },
        },
      },
      { $sort: { grossProfit: -1 } },
      { $limit: Number(limit) },
    ]);

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getExpenses, createExpense, updateExpense, deleteExpense,
  getPnL, getRevenue, getExpenseSummary, getCashflow, getProductProfitability,
};
