const mongoose = require('mongoose');

const VariantSchema = new mongoose.Schema({
  label: { type: String, required: true, trim: true },
  sku: { type: String, trim: true, default: '' },
  stock: { type: Number, default: 0, min: 0 },
  costPrice: { type: Number, default: 0, min: 0 },
  salePrice: { type: Number, default: 0, min: 0 },
}, { _id: true });

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Name cannot exceed 200 characters'],
  },
  sku: {
    type: String,
    required: [true, 'SKU is required'],
    unique: true,
    uppercase: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
  },
  costPrice: {
    type: Number,
    required: [true, 'Cost price is required'],
    min: [0, 'Cost price cannot be negative'],
  },
  salePrice: {
    type: Number,
    required: [true, 'Sale price is required'],
    min: [0, 'Sale price cannot be negative'],
  },
  stock: {
    type: Number,
    default: 0,
    min: [0, 'Stock cannot be negative'],
  },
  reserved: {
    type: Number,
    default: 0,
    min: 0,
  },
  reorderPoint: {
    type: Number,
    default: 10,
    min: 0,
  },
  supplier: {
    type: String,
    trim: true,
    default: '',
  },
  images: [{ type: String }],
  variants: [VariantSchema],
  status: {
    type: String,
    enum: ['Active', 'Draft', 'Archived'],
    default: 'Active',
  },
  shopifyId: { type: String, default: null, index: true },
  totalSold: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

// Virtual: available stock (stock - reserved)
ProductSchema.virtual('available').get(function () {
  return Math.max(0, this.stock - this.reserved);
});

// Virtual: profit margin %
ProductSchema.virtual('margin').get(function () {
  if (!this.salePrice) return 0;
  return (((this.salePrice - this.costPrice) / this.salePrice) * 100).toFixed(1);
});

// Virtual: stock status
ProductSchema.virtual('stockStatus').get(function () {
  if (this.stock === 0) return 'Out of Stock';
  if (this.stock <= this.reorderPoint) return 'Low Stock';
  return 'In Stock';
});

ProductSchema.set('toJSON', { virtuals: true });
ProductSchema.set('toObject', { virtuals: true });

ProductSchema.index({ name: 'text', sku: 'text', description: 'text' });
ProductSchema.index({ category: 1, status: 1, stock: 1 });

module.exports = mongoose.model('Product', ProductSchema);
