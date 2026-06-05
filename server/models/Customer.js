const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters'],
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    default: '',
  },
  phone: {
    type: String,
    trim: true,
    default: '',
  },
  city: {
    type: String,
    trim: true,
    default: '',
  },
  address: {
    type: String,
    trim: true,
    default: '',
  },
  source: {
    type: String,
    enum: ['Instagram', 'WhatsApp', 'Facebook', 'TikTok', 'Website', 'Referral', 'Walk-in', 'Other'],
    default: 'Other',
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Blocked'],
    default: 'Active',
  },
  totalOrders: {
    type: Number,
    default: 0,
  },
  totalSpent: {
    type: Number,
    default: 0,
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters'],
    default: '',
  },
  tags: [{ type: String, trim: true }],
  shopifyId: { type: String, default: null, index: true },
  avatar: {
    type: String,
    default: '',
  },
}, { timestamps: true });

// Index for search performance
CustomerSchema.index({ name: 'text', email: 'text', phone: 'text' });
CustomerSchema.index({ city: 1, source: 1, status: 1 });

module.exports = mongoose.model('Customer', CustomerSchema);
