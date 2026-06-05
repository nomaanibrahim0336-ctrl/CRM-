const express = require('express');
const router = express.Router();
const {
  getSettings, updateSettings, getSetting, deleteSetting,
  getApiKeys, createApiKey, toggleApiKey, deleteApiKey,
  getWebhooks, createWebhook, updateWebhook, deleteWebhook, testWebhook,
} = require('../controllers/settingsController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// General settings
router.route('/')
  .get(getSettings)
  .put(authorize('admin'), updateSettings);

router.route('/:key')
  .get(getSetting)
  .delete(authorize('admin'), deleteSetting);

// API Keys
router.route('/api-keys')
  .get(getApiKeys)
  .post(authorize('admin'), createApiKey);

router.put('/api-keys/:id/toggle', authorize('admin'), toggleApiKey);
router.delete('/api-keys/:id', authorize('admin'), deleteApiKey);

// Webhooks
router.route('/webhooks')
  .get(getWebhooks)
  .post(authorize('admin'), createWebhook);

router.route('/webhooks/:id')
  .put(authorize('admin'), updateWebhook)
  .delete(authorize('admin'), deleteWebhook);

router.post('/webhooks/:id/test', authorize('admin'), testWebhook);

module.exports = router;
