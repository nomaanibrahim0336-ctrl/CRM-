const express = require('express');
const router = express.Router();
const {
  getDashboard,
  getSalesAnalytics,
  getCustomerAnalytics,
  getProductAnalytics,
  getCourierAnalytics,
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/dashboard', getDashboard);
router.get('/sales', getSalesAnalytics);
router.get('/customers', getCustomerAnalytics);
router.get('/products', getProductAnalytics);
router.get('/courier', getCourierAnalytics);

module.exports = router;
