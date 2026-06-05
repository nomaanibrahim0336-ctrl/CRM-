const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  body: { type: String, required: true },
  sender: {
    type: String,
    enum: ['customer', 'agent'],
    required: true,
  },
  agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  mediaUrl: { type: String, default: '' },
  mediaType: {
    type: String,
    enum: ['text', 'image', 'video', 'audio', 'document', 'sticker'],
    default: 'text',
  },
  isRead: { type: Boolean, default: false },
  sentAt: { type: Date, default: Date.now },
}, { _id: true });

const ConversationSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: [true, 'Customer is required'],
  },
  customerSnapshot: {
    name: String,
    phone: String,
    avatar: String,
  },
  channel: {
    type: String,
    enum: ['WhatsApp', 'Instagram', 'Telegram', 'Messenger', 'TikTok', 'Email', 'Twitter', 'LiveChat'],
    required: [true, 'Channel is required'],
  },
  channelUserId: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['Open', 'Pending', 'Resolved', 'Spam'],
    default: 'Open',
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  tags: [{ type: String, trim: true }],
  messages: [MessageSchema],
  lastMessage: {
    body: { type: String, default: '' },
    sentAt: { type: Date, default: Date.now },
    sender: { type: String, default: 'customer' },
  },
  unreadCount: { type: Number, default: 0 },
  isAiEnabled: { type: Boolean, default: false },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
  notes: { type: String, default: '' },
}, { timestamps: true });

// Update lastMessage + unreadCount on messages change
ConversationSchema.pre('save', function (next) {
  if (this.messages && this.messages.length > 0) {
    const last = this.messages[this.messages.length - 1];
    this.lastMessage = { body: last.body, sentAt: last.sentAt, sender: last.sender };
    this.unreadCount = this.messages.filter(m => !m.isRead && m.sender === 'customer').length;
  }
  next();
});

ConversationSchema.index({ customer: 1, channel: 1 });
ConversationSchema.index({ status: 1, channel: 1, updatedAt: -1 });
ConversationSchema.index({ assignedTo: 1, status: 1 });

module.exports = mongoose.model('Conversation', ConversationSchema);
