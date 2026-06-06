const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  sku: { type: String, required: true },
  variant: { type: String, default: '' },
  qty: { type: Number, required: true, min: 1 },
  costPrice: { type: Number, required: true },
  salePrice: { type: Number, required: true },
}, { _id: true });

const StatusHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  note: { type: String, default: '' },
  changedAt: { type: Date, default: Date.now },
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  shopifyId: { type: String, default: null, index: true },
  orderId: {
    type: String,
    unique: true,
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: [true, 'Customer is required'],
  },
  customerSnapshot: {
    name: String,
    phone: String,
    city: String,
    address: String,
  },
  items: {
    type: [OrderItemSchema],
    validate: [arr => arr.length > 0, 'Order must have at least one item'],
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'],
    default: 'Pending',
  },
  statusHistory: [StatusHistorySchema],
  paymentMethod: {
    type: String,
    enum: ['COD', 'Bank Transfer', 'JazzCash', 'EasyPaisa', 'Card', 'Other'],
    default: 'COD',
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Refunded', 'Failed'],
    default: 'Pending',
  },
  source: {
    type: String,
    enum: ['Instagram', 'WhatsApp', 'Facebook', 'TikTok', 'Website', 'Walk-in', 'Other'],
    default: 'Other',
  },
  subtotal: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  shippingFee: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  courier: {
    name: { type: String, default: '' },
    trackingNumber: { type: String, default: '' },
    trackingUrl: { type: String, default: '' },
  },
  notes: { type: String, default: '' },
}, { timestamps: true });

// Auto-generate orderId before saving
OrderSchema.pre('save', async function () {
  if (!this.orderId) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderId = `ORD-${String(count + 1).padStart(4, '0')}`;
  }

  if (this.isModified('status')) {
    this.statusHistory.push({ status: this.status });
  }

  this.subtotal = this.items.reduce((sum, i) => sum + i.salePrice * i.qty, 0);
  this.total = this.subtotal - this.discount + this.shippingFee;
});

// Virtual: profit on the order
OrderSchema.virtual('profit').get(function () {
  const revenue = this.items.reduce((s, i) => s + i.salePrice * i.qty, 0);
  const cost = this.items.reduce((s, i) => s + i.costPrice * i.qty, 0);
  return revenue - cost - this.shippingFee;
});

OrderSchema.set('toJSON', { virtuals: true });
OrderSchema.set('toObject', { virtuals: true });

OrderSchema.index({ customer: 1, status: 1, createdAt: -1 });
OrderSchema.index({ source: 1, paymentMethod: 1, paymentStatus: 1 });

module.exports = mongoose.model('Order', OrderSchema);
