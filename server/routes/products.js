const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  adjustStock,
  getProductStats,
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/stats', getProductStats);
router.route('/').get(getProducts).post(authorize('admin', 'manager'), createProduct);
router.route('/:id')
  .get(getProduct)
  .put(authorize('admin', 'manager'), updateProduct)
  .delete(authorize('admin'), deleteProduct);
router.put('/:id/adjust-stock', authorize('admin', 'manager'), adjustStock);

module.exports = router;
