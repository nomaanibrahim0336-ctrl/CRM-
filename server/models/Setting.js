const mongoose = require('mongoose');

const SettingSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  group: {
    type: String,
    enum: ['store', 'notifications', 'integrations', 'courier', 'security', 'general'],
    default: 'general',
  },
  isSecret: {
    type: Boolean,
    default: false,
  },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

SettingSchema.index({ group: 1 });

module.exports = mongoose.model('Setting', SettingSchema);
