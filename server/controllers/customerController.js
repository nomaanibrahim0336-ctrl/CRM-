const Customer = require('../models/Customer');

// GET /api/customers
const getCustomers = async (req, res, next) => {
  try {
    const {
      search,
      city,
      source,
      status,
      minSpent,
      maxSpent,
      page = 1,
      limit = 10,
      sort = '-createdAt',
    } = req.query;

    const filter = {};

    // Text search across name, email, phone
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    if (city) filter.city = { $regex: city, $options: 'i' };
    if (source) filter.source = source;
    if (status) filter.status = status;

    if (minSpent || maxSpent) {
      filter.totalSpent = {};
      if (minSpent) filter.totalSpent.$gte = Number(minSpent);
      if (maxSpent) filter.totalSpent.$lte = Number(maxSpent);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Customer.countDocuments(filter);

    const customers = await Customer.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: customers,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/customers/:id
const getCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }
    res.json({ success: true, data: customer });
  } catch (err) {
    next(err);
  }
};

// POST /api/customers
const createCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.create(req.body);
    res.status(201).json({ success: true, data: customer });
  } catch (err) {
    next(err);
  }
};

// PUT /api/customers/:id
const updateCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!customer) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }
    res.json({ success: true, data: customer });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/customers/:id
const deleteCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }
    res.json({ success: true, message: 'Customer deleted' });
  } catch (err) {
    next(err);
  }
};

// GET /api/customers/stats
const getCustomerStats = async (req, res, next) => {
  try {
    const [totals] = await Customer.aggregate([
      {
        $group: {
          _id: null,
          totalCustomers: { $sum: 1 },
          totalRevenue: { $sum: '$totalSpent' },
          avgOrderValue: { $avg: '$totalSpent' },
          activeCustomers: { $sum: { $cond: [{ $eq: ['$status', 'Active'] }, 1, 0] } },
        },
      },
    ]);

    const bySource = await Customer.aggregate([
      { $group: { _id: '$source', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const byCity = await Customer.aggregate([
      { $match: { city: { $ne: '' } } },
      { $group: { _id: '$city', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    res.json({
      success: true,
      data: {
        ...(totals || { totalCustomers: 0, totalRevenue: 0, avgOrderValue: 0, activeCustomers: 0 }),
        bySource,
        byCity,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer, getCustomerStats };
