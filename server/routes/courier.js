const express = require('express');
const router = express.Router();
const {
  getShipments,
  getShipment,
  bookShipment,
  updateShipmentStatus,
  updateCodStatus,
  getCourierStats,
} = require('../controllers/courierController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/stats', getCourierStats);
router.route('/shipments').get(getShipments).post(authorize('admin', 'manager'), bookShipment);
router.route('/shipments/:id').get(getShipment);
router.put('/shipments/:id/status', updateShipmentStatus);
router.put('/shipments/:id/cod', authorize('admin', 'manager'), updateCodStatus);

module.exports = router;
