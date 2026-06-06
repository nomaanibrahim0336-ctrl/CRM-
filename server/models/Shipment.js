const mongoose = require('mongoose');

const TrackingEventSchema = new mongoose.Schema({
  status: { type: String, required: true },
  location: { type: String, default: '' },
  note: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now },
}, { _id: false });

const ShipmentSchema = new mongoose.Schema({
  shipmentId: { type: String, unique: true },

  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: [true, 'Order is required'],
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  customerSnapshot: {
    name: String,
    phone: String,
    city: String,
    address: String,
  },

  courier: {
    type: String,
    enum: ['TCS', 'Leopards', 'BlueEx', 'PostEx', 'Trax', 'M&P'],
    required: [true, 'Courier is required'],
  },
  trackingNumber: { type: String, default: '' },
  trackingUrl: { type: String, default: '' },

  status: {
    type: String,
    enum: ['Booked', 'Picked Up', 'In Transit', 'Out for Delivery', 'Delivered', 'Failed', 'Returned', 'Cancelled'],
    default: 'Booked',
  },
  trackingHistory: [TrackingEventSchema],

  weight: { type: Number, default: 0.5 },
  pieces: { type: Number, default: 1 },

  codAmount: { type: Number, default: 0 },
  codStatus: {
    type: String,
    enum: ['Pending', 'Collected', 'Remitted', 'N/A'],
    default: 'N/A',
  },
  shippingFee: { type: Number, default: 0 },

  originCity: { type: String, default: '' },
  destinationCity: { type: String, default: '' },

  bookedAt: { type: Date, default: Date.now },
  estimatedDelivery: { type: Date },
  deliveredAt: { type: Date },

  returnReason: { type: String, default: '' },
  notes: { type: String, default: '' },
}, { timestamps: true });

// Auto-generate shipmentId
ShipmentSchema.pre('save', async function () {
  if (!this.shipmentId) {
    const count = await mongoose.model('Shipment').countDocuments();
    this.shipmentId = `SHP-${String(count + 1).padStart(4, '0')}`;
  }

  // Push tracking event when status changes
  if (this.isModified('status')) {
    this.trackingHistory.push({ status: this.status, timestamp: new Date() });
    if (this.status === 'Delivered') this.deliveredAt = new Date();
  }

  // Auto-set COD status
  if (this.codAmount > 0 && this.codStatus === 'N/A') {
    this.codStatus = 'Pending';
  }

});

ShipmentSchema.index({ order: 1 });
ShipmentSchema.index({ courier: 1, status: 1, createdAt: -1 });
ShipmentSchema.index({ codStatus: 1 });

module.exports = mongoose.model('Shipment', ShipmentSchema);
