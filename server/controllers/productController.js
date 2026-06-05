const Product = require('../models/Product');

// GET /api/products
const getProducts = async (req, res, next) => {
  try {
    const {
      search,
      category,
      status,
      stockStatus,
      minPrice,
      maxPrice,
      page = 1,
      limit = 10,
      sort = '-createdAt',
    } = req.query;

    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) filter.category = { $regex: category, $options: 'i' };
    if (status) filter.status = status;

    if (stockStatus === 'Out of Stock') filter.stock = 0;
    else if (stockStatus === 'Low Stock') filter.$expr = { $and: [{ $gt: ['$stock', 0] }, { $lte: ['$stock', '$reorderPoint'] }] };
    else if (stockStatus === 'In Stock') filter.$expr = { $gt: ['$stock', '$reorderPoint'] };

    if (minPrice || maxPrice) {
      filter.salePrice = {};
      if (minPrice) filter.salePrice.$gte = Number(minPrice);
      if (maxPrice) filter.salePrice.$lte = Number(maxPrice);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter).sort(sort).skip(skip).limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: products,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/products/:id
const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, error: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

// POST /api/products
const createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

// PUT /api/products/:id
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ success: false, error: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/products/:id
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, error: 'Product not found' });
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    next(err);
  }
};

// PUT /api/products/:id/adjust-stock
const adjustStock = async (req, res, next) => {
  try {
    const { type, qty, note } = req.body;

    if (!qty || qty === 0) {
      return res.status(400).json({ success: false, error: 'Quantity is required and cannot be zero' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, error: 'Product not found' });

    const validTypes = ['Restock', 'Sale', 'Return', 'Damage Write-off', 'Manual Adjustment'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ success: false, error: `Invalid adjustment type. Must be one of: ${validTypes.join(', ')}` });
    }

    const delta = ['Sale', 'Damage Write-off'].includes(type) ? -Math.abs(qty) : Math.abs(qty);
    const newStock = product.stock + delta;

    if (newStock < 0) {
      return res.status(400).json({ success: false, error: 'Adjustment would result in negative stock' });
    }

    product.stock = newStock;
    await product.save();

    res.json({
      success: true,
      data: product,
      adjustment: { type, qty: delta, note, balanceAfter: newStock },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/products/stats
const getProductStats = async (req, res, next) => {
  try {
    const [totals] = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalStockValue: { $sum: { $multiply: ['$stock', '$costPrice'] } },
          totalRetailValue: { $sum: { $multiply: ['$stock', '$salePrice'] } },
          outOfStock: { $sum: { $cond: [{ $eq: ['$stock', 0] }, 1, 0] } },
          lowStock: { $sum: { $cond: [{ $and: [{ $gt: ['$stock', 0] }, { $lte: ['$stock', '$reorderPoint'] }] }, 1, 0] } },
        },
      },
    ]);

    const byCategory = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 }, stockValue: { $sum: { $multiply: ['$stock', '$costPrice'] } } } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      success: true,
      data: {
        ...(totals || { totalProducts: 0, totalStockValue: 0, totalRetailValue: 0, outOfStock: 0, lowStock: 0 }),
        byCategory,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct, adjustStock, getProductStats };
