const express = require('express');
const router = express.Router();
const {
  connectShopify,
  disconnectShopify,
  getStatus,
  syncProducts,
  syncCustomers,
  syncOrders,
  syncAll,
  getSyncStatus,
  handleOrderWebhook,
} = require('../controllers/shopifyController');
const { protect, authorize } = require('../middleware/auth');

// Public webhook endpoint (called by Shopify — no JWT)
router.post('/webhooks/orders/create', handleOrderWebhook);

// All other routes require auth
router.use(protect);

router.get('/status', getStatus);
router.post('/connect', authorize('admin'), connectShopify);
router.delete('/connect', authorize('admin'), disconnectShopify);
router.get('/sync/status', getSyncStatus);
router.post('/sync/products', authorize('admin', 'manager'), syncProducts);
router.post('/sync/customers', authorize('admin', 'manager'), syncCustomers);
router.post('/sync/orders', authorize('admin', 'manager'), syncOrders);
router.post('/sync/all', authorize('admin', 'manager'), syncAll);

module.exports = router;
