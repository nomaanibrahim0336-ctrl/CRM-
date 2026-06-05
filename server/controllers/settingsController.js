const Setting = require('../models/Setting');
const ApiKey = require('../models/ApiKey');
const Webhook = require('../models/Webhook');
const crypto = require('crypto');

// ── SETTINGS ──────────────────────────────────────────────

// GET /api/settings?group=
const getSettings = async (req, res, next) => {
  try {
    const { group } = req.query;
    const filter = group ? { group } : {};

    const settings = await Setting.find(filter).select('-isSecret');

    // Mask secret values
    const masked = settings.map(s => ({
      ...s.toObject(),
      value: s.isSecret && s.value ? '••••••••' : s.value,
    }));

    res.json({ success: true, data: masked });
  } catch (err) {
    next(err);
  }
};

// PUT /api/settings — upsert multiple settings at once
// Body: { settings: [{ key, value, group, isSecret }] }
const updateSettings = async (req, res, next) => {
  try {
    const { settings } = req.body;

    if (!Array.isArray(settings) || settings.length === 0) {
      return res.status(400).json({ success: false, error: 'settings array is required' });
    }

    const ops = settings.map(s => ({
      updateOne: {
        filter: { key: s.key },
        update: { $set: { value: s.value, group: s.group || 'general', isSecret: s.isSecret || false, updatedBy: req.user._id } },
        upsert: true,
      },
    }));

    await Setting.bulkWrite(ops);
    res.json({ success: true, message: `${settings.length} setting(s) saved` });
  } catch (err) {
    next(err);
  }
};

// GET /api/settings/:key
const getSetting = async (req, res, next) => {
  try {
    const setting = await Setting.findOne({ key: req.params.key });
    if (!setting) return res.status(404).json({ success: false, error: 'Setting not found' });

    const value = setting.isSecret && setting.value ? '••••••••' : setting.value;
    res.json({ success: true, data: { ...setting.toObject(), value } });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/settings/:key
const deleteSetting = async (req, res, next) => {
  try {
    await Setting.findOneAndDelete({ key: req.params.key });
    res.json({ success: true, message: 'Setting deleted' });
  } catch (err) {
    next(err);
  }
};

// ── API KEYS ──────────────────────────────────────────────

// GET /api/settings/api-keys
const getApiKeys = async (req, res, next) => {
  try {
    const keys = await ApiKey.find({ createdBy: req.user._id }).sort('-createdAt');
    res.json({ success: true, data: keys });
  } catch (err) {
    next(err);
  }
};

// POST /api/settings/api-keys
const createApiKey = async (req, res, next) => {
  try {
    const { name, scopes, expiresAt } = req.body;

    if (!name) return res.status(400).json({ success: false, error: 'Name is required' });

    const { apiKey, rawKey } = await ApiKey.generateKey(name, scopes, req.user._id, expiresAt);

    res.status(201).json({
      success: true,
      message: 'Copy this key now — it will not be shown again',
      data: { ...apiKey.toObject(), rawKey },
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/settings/api-keys/:id/toggle
const toggleApiKey = async (req, res, next) => {
  try {
    const key = await ApiKey.findById(req.params.id);
    if (!key) return res.status(404).json({ success: false, error: 'API key not found' });

    key.isActive = !key.isActive;
    await key.save();

    res.json({ success: true, data: { isActive: key.isActive } });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/settings/api-keys/:id
const deleteApiKey = async (req, res, next) => {
  try {
    await ApiKey.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'API key deleted' });
  } catch (err) {
    next(err);
  }
};

// ── WEBHOOKS ──────────────────────────────────────────────

// GET /api/settings/webhooks
const getWebhooks = async (req, res, next) => {
  try {
    const webhooks = await Webhook.find({ createdBy: req.user._id }).sort('-createdAt');
    res.json({ success: true, data: webhooks });
  } catch (err) {
    next(err);
  }
};

// POST /api/settings/webhooks
const createWebhook = async (req, res, next) => {
  try {
    const { name, url, events } = req.body;

    if (!name || !url) return res.status(400).json({ success: false, error: 'Name and URL are required' });

    const secret = crypto.randomBytes(20).toString('hex');

    const webhook = await Webhook.create({
      name, url, events,
      secret,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Save this signing secret — it will not be shown again',
      data: { ...webhook.toObject(), secret },
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/settings/webhooks/:id
const updateWebhook = async (req, res, next) => {
  try {
    const { name, url, events, isActive } = req.body;
    const webhook = await Webhook.findByIdAndUpdate(
      req.params.id,
      { name, url, events, isActive },
      { new: true, runValidators: true }
    );
    if (!webhook) return res.status(404).json({ success: false, error: 'Webhook not found' });
    res.json({ success: true, data: webhook });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/settings/webhooks/:id
const deleteWebhook = async (req, res, next) => {
  try {
    await Webhook.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Webhook deleted' });
  } catch (err) {
    next(err);
  }
};

// POST /api/settings/webhooks/:id/test
const testWebhook = async (req, res, next) => {
  try {
    const webhook = await Webhook.findById(req.params.id).select('+secret');
    if (!webhook) return res.status(404).json({ success: false, error: 'Webhook not found' });

    const payload = JSON.stringify({ event: 'webhook.test', timestamp: new Date().toISOString(), data: { message: 'Test ping from CRM' } });
    const signature = crypto.createHmac('sha256', webhook.secret || '').update(payload).digest('hex');

    // Fire and forget — real delivery would use a queue
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CRM-Signature': `sha256=${signature}` },
        body: payload,
        signal: controller.signal,
      });
      clearTimeout(timeout);

      webhook.lastTriggeredAt = new Date();
      if (!response.ok) webhook.failureCount += 1;
      else webhook.failureCount = 0;
      await webhook.save();

      res.json({ success: true, statusCode: response.status, ok: response.ok });
    } catch (fetchErr) {
      clearTimeout(timeout);
      webhook.failureCount += 1;
      await webhook.save();
      res.json({ success: false, error: fetchErr.message });
    }
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSettings, updateSettings, getSetting, deleteSetting,
  getApiKeys, createApiKey, toggleApiKey, deleteApiKey,
  getWebhooks, createWebhook, updateWebhook, deleteWebhook, testWebhook,
};
