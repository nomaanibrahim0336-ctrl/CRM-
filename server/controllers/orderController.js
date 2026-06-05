const Order = require('../models/Order');
const Customer = require('../models/Customer');
const Product = require('../models/Product');

// GET /api/orders
const getOrders = async (req, res, next) => {
  try {
    const {
      search,
      status,
      source,
      paymentMethod,
      paymentStatus,
      dateFrom,
      dateTo,
      page = 1,
      limit = 10,
      sort = '-createdAt',
    } = req.query;

    const filter = {};

    if (search) {
      filter.$or = [
        { orderId: { $regex: search, $options: 'i' } },
        { 'customerSnapshot.name': { $regex: search, $options: 'i' } },
        { 'customerSnapshot.phone': { $regex: search, $options: 'i' } },
        { 'courier.trackingNumber': { $regex: search, $options: 'i' } },
      ];
    }

    if (status) filter.status = status;
    if (source) filter.source = source;
    if (paymentMethod) filter.paymentMethod = paymentMethod;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(new Date(dateTo).setHours(23, 59, 59));
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Order.countDocuments(filter);

    const orders = await Order.find(filter)
      .populate('customer', 'name phone city')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: orders,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/orders/:id
const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name phone city address email')
      .populate('items.product', 'name sku images');

    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

// POST /api/orders
const createOrder = async (req, res, next) => {
  try {
    const { customerId, items, paymentMethod, source, shippingFee = 0, discount = 0, notes } = req.body;

    // Validate customer
    const customer = await Customer.findById(customerId);
    if (!customer) return res.status(404).json({ success: false, error: 'Customer not found' });

    // Validate and enrich items from DB
    const enrichedItems = [];
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) return res.status(404).json({ success: false, error: `Product ${item.productId} not found` });
      if (product.stock < item.qty) {
        return res.status(400).json({ success: false, error: `Insufficient stock for ${product.name} (available: ${product.stock})` });
      }
      enrichedItems.push({
        product: product._id,
        name: product.name,
        sku: product.sku,
        variant: item.variant || '',
        qty: item.qty,
        costPrice: product.costPrice,
        salePrice: item.salePrice || product.salePrice,
      });
    }

    const order = await Order.create({
      customer: customer._id,
      customerSnapshot: {
        name: customer.name,
        phone: customer.phone,
        city: customer.city,
        address: customer.address,
      },
      items: enrichedItems,
      paymentMethod,
      source,
      shippingFee,
      discount,
      notes,
    });

    // Deduct stock and update customer stats
    for (const item of enrichedItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.qty, totalSold: item.qty },
      });
    }
    await Customer.findByIdAndUpdate(customer._id, {
      $inc: { totalOrders: 1, totalSpent: order.total },
    });

    res.status(201).json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

// PUT /api/orders/:id/status
const updateStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;

    const validTransitions = {
      Pending: ['Confirmed', 'Cancelled'],
      Confirmed: ['Processing', 'Cancelled'],
      Processing: ['Shipped', 'Cancelled'],
      Shipped: ['Delivered', 'Returned'],
      Delivered: ['Returned'],
      Cancelled: [],
      Returned: [],
    };

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

    if (!validTransitions[order.status].includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Cannot transition from '${order.status}' to '${status}'`,
      });
    }

    order.status = status;
    if (note) order.statusHistory[order.statusHistory.length - 1].note = note;

    // Auto-update payment status on delivery
    if (status === 'Delivered' && order.paymentMethod === 'COD') {
      order.paymentStatus = 'Paid';
    }

    // Restore stock on cancellation or return
    if (status === 'Cancelled' || status === 'Returned') {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.qty, totalSold: -item.qty } });
      }
      if (status === 'Returned') {
        await Customer.findByIdAndUpdate(order.customer, { $inc: { totalSpent: -order.total } });
      }
    }

    await order.save();
    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

// PUT /api/orders/:id/tracking
const updateTracking = async (req, res, next) => {
  try {
    const { name, trackingNumber, trackingUrl } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { courier: { name, trackingNumber, trackingUrl } },
      { new: true }
    );
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/orders/:id (only Pending orders)
const deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
    if (order.status !== 'Pending') {
      return res.status(400).json({ success: false, error: 'Only Pending orders can be deleted' });
    }
    await order.deleteOne();
    res.json({ success: true, message: 'Order deleted' });
  } catch (err) {
    next(err);
  }
};

// GET /api/orders/stats
const getOrderStats = async (req, res, next) => {
  try {
    const [totals] = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$total' },
          avgOrderValue: { $avg: '$total' },
          pendingOrders: { $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] } },
          deliveredOrders: { $sum: { $cond: [{ $eq: ['$status', 'Delivered'] }, 1, 0] } },
          cancelledOrders: { $sum: { $cond: [{ $eq: ['$status', 'Cancelled'] }, 1, 0] } },
          codPending: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$paymentMethod', 'COD'] }, { $eq: ['$paymentStatus', 'Pending'] }] },
                '$total',
                0,
              ],
            },
          },
        },
      },
    ]);

    const bySource = await Order.aggregate([
      { $group: { _id: '$source', count: { $sum: 1 }, revenue: { $sum: '$total' } } },
      { $sort: { revenue: -1 } },
    ]);

    const byStatus = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      data: {
        ...(totals || {}),
        bySource,
        byStatus,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getOrders, getOrder, createOrder, updateStatus, updateTracking, deleteOrder, getOrderStats };
