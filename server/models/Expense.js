const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Shipping', 'Marketing', 'Salaries', 'Platform Fees', 'Packaging', 'Utilities', 'Office', 'Other'],
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative'],
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now,
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Bank Transfer', 'JazzCash', 'EasyPaisa', 'Card', 'Other'],
    default: 'Bank Transfer',
  },
  reference: { type: String, trim: true, default: '' },
  notes: { type: String, trim: true, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

ExpenseSchema.index({ date: -1, category: 1 });

module.exports = mongoose.model('Expense', ExpenseSchema);
