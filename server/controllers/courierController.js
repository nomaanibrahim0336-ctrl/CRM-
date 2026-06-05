const Shipment = require('../models/Shipment');
const Order = require('../models/Order');
const Customer = require('../models/Customer');

// GET /api/courier/shipments
const getShipments = async (req, res, next) => {
  try {
    const {
      search,
      courier,
      status,
      codStatus,
      city,
      dateFrom,
      dateTo,
      page = 1,
      limit = 10,
      sort = '-createdAt',
    } = req.query;

    const filter = {};

    if (search) {
      filter.$or = [
        { shipmentId: { $regex: search, $options: 'i' } },
        { trackingNumber: { $regex: search, $options: 'i' } },
        { 'customerSnapshot.name': { $regex: search, $options: 'i' } },
        { 'customerSnapshot.phone': { $regex: search, $options: 'i' } },
      ];
    }

    if (courier) filter.courier = courier;
    if (status) filter.status = status;
    if (codStatus) filter.codStatus = codStatus;
    if (city) filter.destinationCity = { $regex: city, $options: 'i' };

    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(new Date(dateTo).setHours(23, 59, 59));
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Shipment.countDocuments(filter);

    const shipments = await Shipment.find(filter)
      .populate('order', 'orderId total')
      .populate('customer', 'name phone')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: shipments,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/courier/shipments/:id
const getShipment = async (req, res, next) => {
  try {
    const shipment = await Shipment.findById(req.params.id)
      .populate('order', 'orderId total items paymentMethod')
      .populate('customer', 'name phone city address email');

    if (!shipment) return res.status(404).json({ success: false, error: 'Shipment not found' });
    res.json({ success: true, data: shipment });
  } catch (err) {
    next(err);
  }
};

// POST /api/courier/shipments — book a shipment
const bookShipment = async (req, res, next) => {
  try {
    const {
      orderId,
      courier,
      trackingNumber,
      weight,
      pieces,
      codAmount,
      shippingFee,
      originCity,
      estimatedDelivery,
      notes,
    } = req.body;

    const order = await Order.findById(orderId).populate('customer');
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

    const customer = order.customer;

    const shipment = await Shipment.create({
      order: order._id,
      customer: customer._id,
      customerSnapshot: {
        name: order.customerSnapshot.name,
        phone: order.customerSnapshot.phone,
        city: order.customerSnapshot.city,
        address: order.customerSnapshot.address,
      },
      courier,
      trackingNumber: trackingNumber || '',
      weight: weight || 0.5,
      pieces: pieces || 1,
      codAmount: codAmount ?? order.total,
      shippingFee: shippingFee || 0,
      originCity: originCity || '',
      destinationCity: order.customerSnapshot.city || '',
      estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : null,
      notes: notes || '',
    });

    // Update order tracking info
    await Order.findByIdAndUpdate(order._id, {
      'courier.name': courier,
      'courier.trackingNumber': trackingNumber || '',
      status: 'Shipped',
    });

    res.status(201).json({ success: true, data: shipment });
  } catch (err) {
    next(err);
  }
};

// PUT /api/courier/shipments/:id/status
const updateShipmentStatus = async (req, res, next) => {
  try {
    const { status, location, note } = req.body;

    const validTransitions = {
      Booked: ['Picked Up', 'Cancelled'],
      'Picked Up': ['In Transit', 'Cancelled'],
      'In Transit': ['Out for Delivery', 'Failed', 'Returned'],
      'Out for Delivery': ['Delivered', 'Failed'],
      Failed: ['Out for Delivery', 'Returned'],
      Delivered: [],
      Returned: [],
      Cancelled: [],
    };

    const shipment = await Shipment.findById(req.params.id);
    if (!shipment) return res.status(404).json({ success: false, error: 'Shipment not found' });

    if (!validTransitions[shipment.status].includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Cannot transition from '${shipment.status}' to '${status}'`,
      });
    }

    shipment.status = status;
    // Manually add location/note to the last pushed tracking event after pre-save runs
    await shipment.save();

    if (location || note) {
      const last = shipment.trackingHistory[shipment.trackingHistory.length - 1];
      if (last) {
        last.location = location || '';
        last.note = note || '';
        await shipment.save();
      }
    }

    // Sync order status on delivery/return
    if (status === 'Delivered') {
      await Order.findByIdAndUpdate(shipment.order, { status: 'Delivered', paymentStatus: shipment.codAmount > 0 ? 'Paid' : undefined });
    } else if (status === 'Returned') {
      await Order.findByIdAndUpdate(shipment.order, { status: 'Returned' });
    }

    res.json({ success: true, data: shipment });
  } catch (err) {
    next(err);
  }
};

// PUT /api/courier/shipments/:id/cod
const updateCodStatus = async (req, res, next) => {
  try {
    const { codStatus } = req.body;
    const shipment = await Shipment.findByIdAndUpdate(
      req.params.id,
      { codStatus },
      { new: true, runValidators: true }
    );
    if (!shipment) return res.status(404).json({ success: false, error: 'Shipment not found' });
    res.json({ success: true, data: shipment });
  } catch (err) {
    next(err);
  }
};

// GET /api/courier/stats
const getCourierStats = async (req, res, next) => {
  try {
    const [totals] = await Shipment.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          delivered: { $sum: { $cond: [{ $eq: ['$status', 'Delivered'] }, 1, 0] } },
          inTransit: { $sum: { $cond: [{ $in: ['$status', ['In Transit', 'Out for Delivery', 'Picked Up']] }, 1, 0] } },
          failed: { $sum: { $cond: [{ $eq: ['$status', 'Failed'] }, 1, 0] } },
          returned: { $sum: { $cond: [{ $eq: ['$status', 'Returned'] }, 1, 0] } },
          totalCodPending: { $sum: { $cond: [{ $eq: ['$codStatus', 'Pending'] }, '$codAmount', 0] } },
          totalCodCollected: { $sum: { $cond: [{ $eq: ['$codStatus', 'Collected'] }, '$codAmount', 0] } },
          totalCodRemitted: { $sum: { $cond: [{ $eq: ['$codStatus', 'Remitted'] }, '$codAmount', 0] } },
        },
      },
    ]);

    const byCourier = await Shipment.aggregate([
      {
        $group: {
          _id: '$courier',
          total: { $sum: 1 },
          delivered: { $sum: { $cond: [{ $eq: ['$status', 'Delivered'] }, 1, 0] } },
          failed: { $sum: { $cond: [{ $eq: ['$status', 'Failed'] }, 1, 0] } },
          returned: { $sum: { $cond: [{ $eq: ['$status', 'Returned'] }, 1, 0] } },
          totalCod: { $sum: '$codAmount' },
        },
      },
      {
        $addFields: {
          successRate: {
            $cond: [
              { $gt: ['$total', 0] },
              { $multiply: [{ $divide: ['$delivered', '$total'] }, 100] },
              0,
            ],
          },
        },
      },
      { $sort: { total: -1 } },
    ]);

    const byCity = await Shipment.aggregate([
      { $match: { destinationCity: { $ne: '' } } },
      { $group: { _id: '$destinationCity', count: { $sum: 1 }, delivered: { $sum: { $cond: [{ $eq: ['$status', 'Delivered'] }, 1, 0] } } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    res.json({
      success: true,
      data: {
        ...(totals || { total: 0, delivered: 0, inTransit: 0, failed: 0, returned: 0, totalCodPending: 0, totalCodCollected: 0, totalCodRemitted: 0 }),
        byCourier,
        byCity,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getShipments, getShipment, bookShipment, updateShipmentStatus, updateCodStatus, getCourierStats };
