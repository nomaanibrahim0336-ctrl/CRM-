const Conversation = require('../models/Conversation');
const Customer = require('../models/Customer');

// GET /api/conversations
const getConversations = async (req, res, next) => {
  try {
    const {
      search,
      channel,
      status,
      assignedTo,
      page = 1,
      limit = 20,
      sort = '-updatedAt',
    } = req.query;

    const filter = {};

    if (search) {
      filter.$or = [
        { 'customerSnapshot.name': { $regex: search, $options: 'i' } },
        { 'customerSnapshot.phone': { $regex: search, $options: 'i' } },
        { 'lastMessage.body': { $regex: search, $options: 'i' } },
      ];
    }

    if (channel) filter.channel = channel;
    if (status) filter.status = status;
    if (assignedTo === 'me') filter.assignedTo = req.user._id;
    else if (assignedTo) filter.assignedTo = assignedTo;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Conversation.countDocuments(filter);

    const conversations = await Conversation.find(filter)
      .select('-messages')
      .populate('customer', 'name phone')
      .populate('assignedTo', 'name avatar')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: conversations,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/conversations/:id  (with full messages)
const getConversation = async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.id)
      .populate('customer', 'name phone city email')
      .populate('assignedTo', 'name avatar')
      .populate('messages.agentId', 'name avatar');

    if (!conversation) {
      return res.status(404).json({ success: false, error: 'Conversation not found' });
    }

    // Mark all customer messages as read
    conversation.messages.forEach(m => {
      if (m.sender === 'customer') m.isRead = true;
    });
    await conversation.save();

    res.json({ success: true, data: conversation });
  } catch (err) {
    next(err);
  }
};

// POST /api/conversations
const createConversation = async (req, res, next) => {
  try {
    const { customerId, channel, channelUserId, initialMessage } = req.body;

    const customer = await Customer.findById(customerId);
    if (!customer) return res.status(404).json({ success: false, error: 'Customer not found' });

    // Prevent duplicate open conversation on same channel
    const existing = await Conversation.findOne({ customer: customerId, channel, status: 'Open' });
    if (existing) {
      return res.status(400).json({ success: false, error: 'An open conversation already exists for this customer on this channel', data: existing });
    }

    const messages = initialMessage
      ? [{ body: initialMessage, sender: 'customer', sentAt: new Date() }]
      : [];

    const conversation = await Conversation.create({
      customer: customer._id,
      customerSnapshot: { name: customer.name, phone: customer.phone, avatar: customer.avatar },
      channel,
      channelUserId: channelUserId || '',
      messages,
    });

    res.status(201).json({ success: true, data: conversation });
  } catch (err) {
    next(err);
  }
};

// POST /api/conversations/:id/messages
const sendMessage = async (req, res, next) => {
  try {
    const { body, sender = 'agent', mediaUrl, mediaType } = req.body;

    if (!body && !mediaUrl) {
      return res.status(400).json({ success: false, error: 'Message body or media is required' });
    }

    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) return res.status(404).json({ success: false, error: 'Conversation not found' });

    if (conversation.status === 'Resolved' || conversation.status === 'Spam') {
      return res.status(400).json({ success: false, error: `Cannot send messages to a ${conversation.status} conversation` });
    }

    const message = {
      body: body || '',
      sender,
      agentId: sender === 'agent' ? req.user._id : null,
      mediaUrl: mediaUrl || '',
      mediaType: mediaType || 'text',
      sentAt: new Date(),
    };

    conversation.messages.push(message);
    if (conversation.status === 'Pending' && sender === 'agent') {
      conversation.status = 'Open';
    }

    await conversation.save();

    const sentMessage = conversation.messages[conversation.messages.length - 1];
    res.status(201).json({ success: true, data: sentMessage });
  } catch (err) {
    next(err);
  }
};

// PUT /api/conversations/:id/status
const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const conversation = await Conversation.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!conversation) return res.status(404).json({ success: false, error: 'Conversation not found' });
    res.json({ success: true, data: conversation });
  } catch (err) {
    next(err);
  }
};

// PUT /api/conversations/:id/assign
const assignConversation = async (req, res, next) => {
  try {
    const { agentId } = req.body;
    const conversation = await Conversation.findByIdAndUpdate(
      req.params.id,
      { assignedTo: agentId || null },
      { new: true }
    ).populate('assignedTo', 'name avatar');

    if (!conversation) return res.status(404).json({ success: false, error: 'Conversation not found' });
    res.json({ success: true, data: conversation });
  } catch (err) {
    next(err);
  }
};

// PUT /api/conversations/:id/ai-toggle
const toggleAi = async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) return res.status(404).json({ success: false, error: 'Conversation not found' });

    conversation.isAiEnabled = !conversation.isAiEnabled;
    await conversation.save();

    res.json({ success: true, data: { isAiEnabled: conversation.isAiEnabled } });
  } catch (err) {
    next(err);
  }
};

// GET /api/conversations/stats
const getStats = async (req, res, next) => {
  try {
    const [totals] = await Conversation.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          open: { $sum: { $cond: [{ $eq: ['$status', 'Open'] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] } },
          resolved: { $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] } },
          totalUnread: { $sum: '$unreadCount' },
        },
      },
    ]);

    const byChannel = await Conversation.aggregate([
      { $group: { _id: '$channel', count: { $sum: 1 }, unread: { $sum: '$unreadCount' } } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      success: true,
      data: {
        ...(totals || { total: 0, open: 0, pending: 0, resolved: 0, totalUnread: 0 }),
        byChannel,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getConversations,
  getConversation,
  createConversation,
  sendMessage,
  updateStatus,
  assignConversation,
  toggleAi,
  getStats,
};
