const express = require('express');
const router = express.Router();
const {
  getConversations,
  getConversation,
  createConversation,
  sendMessage,
  updateStatus,
  assignConversation,
  toggleAi,
  getStats,
} = require('../controllers/conversationController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/stats', getStats);
router.route('/').get(getConversations).post(createConversation);
router.route('/:id').get(getConversation);
router.post('/:id/messages', sendMessage);
router.put('/:id/status', updateStatus);
router.put('/:id/assign', assignConversation);
router.put('/:id/ai-toggle', toggleAi);

module.exports = router;
