const mongoose = require('mongoose');

const WebhookSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Webhook name is required'],
    trim: true,
  },
  url: {
    type: String,
    required: [true, 'Webhook URL is required'],
    trim: true,
  },
  events: {
    type: [String],
    enum: ['order.created', 'order.status_changed', 'order.delivered', 'customer.created', 'payment.received', 'shipment.updated', 'conversation.new_message'],
    default: ['order.created'],
  },
  secret: {
    type: String,
    select: false,
  },
  isActive: { type: Boolean, default: true },
  lastTriggeredAt: { type: Date, default: null },
  failureCount: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Webhook', WebhookSchema);
