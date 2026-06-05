const mongoose = require('mongoose');
const crypto = require('crypto');

const ApiKeySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'API key name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters'],
  },
  keyHash: {
    type: String,
    required: true,
    select: false,
  },
  keyPrefix: {
    type: String,
    required: true,
  },
  scopes: {
    type: [String],
    enum: ['read:orders', 'write:orders', 'read:customers', 'write:customers', 'read:products', 'write:products', 'read:analytics', 'webhooks'],
    default: ['read:orders', 'read:customers', 'read:products', 'read:analytics'],
  },
  isActive: { type: Boolean, default: true },
  lastUsedAt: { type: Date, default: null },
  expiresAt: { type: Date, default: null },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Generate a new API key — returns the raw key (shown once)
ApiKeySchema.statics.generateKey = async function (name, scopes, createdBy, expiresAt) {
  const rawKey = `crm_${crypto.randomBytes(24).toString('hex')}`;
  const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
  const keyPrefix = rawKey.slice(0, 12);

  const apiKey = await this.create({ name, keyHash, keyPrefix, scopes, createdBy, expiresAt: expiresAt || null });
  return { apiKey, rawKey };
};

// Verify an incoming raw key
ApiKeySchema.statics.verifyKey = async function (rawKey) {
  const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
  const apiKey = await this.findOne({ keyHash, isActive: true }).select('+keyHash');
  if (!apiKey) return null;
  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) return null;
  apiKey.lastUsedAt = new Date();
  await apiKey.save();
  return apiKey;
};

module.exports = mongoose.model('ApiKey', ApiKeySchema);
