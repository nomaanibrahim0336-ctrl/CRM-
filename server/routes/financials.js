const express = require('express');
const router = express.Router();
const {
  getExpenses, createExpense, updateExpense, deleteExpense,
  getPnL, getRevenue, getExpenseSummary, getCashflow, getProductProfitability,
} = require('../controllers/financialController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// P&L and reports
router.get('/pnl', getPnL);
router.get('/revenue', getRevenue);
router.get('/cashflow', getCashflow);
router.get('/product-profitability', getProductProfitability);
router.get('/expenses/summary', getExpenseSummary);

// Expense CRUD
router.route('/expenses')
  .get(getExpenses)
  .post(authorize('admin', 'manager'), createExpense);

router.route('/expenses/:id')
  .put(authorize('admin', 'manager'), updateExpense)
  .delete(authorize('admin'), deleteExpense);

module.exports = router;
