const express = require('express');
const router = express.Router();
const {
  getOrders,
  getOrder,
  createOrder,
  updateStatus,
  updateTracking,
  deleteOrder,
  getOrderStats,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/stats', getOrderStats);
router.route('/').get(getOrders).post(createOrder);
router.route('/:id').get(getOrder).delete(authorize('admin', 'manager'), deleteOrder);
router.put('/:id/status', updateStatus);
router.put('/:id/tracking', updateTracking);

module.exports = router;
