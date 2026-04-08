const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const { successResponse } = require('../utils/apiResponse');

const listConversations = asyncHandler(async (req, res) => {
  const page = Number(req.query.page);
  const limit = Number(req.query.limit);
  const skip = (page - 1) * limit;

  const baseFilter = {
    participants: req.user._id,
  };

  const [conversations, total] = await Promise.all([
    Conversation.find(baseFilter)
      .populate('participants', 'username email avatarUrl isOnline lastSeen')
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .skip(skip)
      .limit(limit),
    Conversation.countDocuments(baseFilter),
  ]);

  if (conversations.length === 0) {
    return successResponse(
      res,
      {
        items: [],
        pagination: {
          page,
          limit,
          total,
          totalPages: 0,
        },
      },
      'Conversations fetched',
    );
  }

  const conversationIds = conversations.map((conversation) => conversation._id);
  const groupedLatest = await Message.aggregate([
    { $match: { conversationId: { $in: conversationIds } } },
    { $sort: { conversationId: 1, createdAt: -1, _id: -1 } },
    { $group: { _id: '$conversationId', latestMessage: { $first: '$$ROOT' } } },
  ]);

  const latestMessages = groupedLatest.map((item) => item.latestMessage);
  await Message.populate(latestMessages, {
    path: 'senderId',
    select: 'username',
  });

  const latestByConversation = new Map();
  for (const message of latestMessages) {
    latestByConversation.set(message.conversationId.toString(), message);
  }

  const items = conversations.map((conversation) => ({
    ...conversation.toObject(),
    latestMessage: latestByConversation.get(conversation._id.toString()) || null,
  }));

  return successResponse(
    res,
    {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
    'Conversations fetched',
  );
});

const createConversation = asyncHandler(async (req, res) => {
  const { type, name, participantIds } = req.body;
  const uniqueParticipants = [...new Set([...participantIds, req.user._id.toString()])];

  if (type === 'direct' && uniqueParticipants.length !== 2) {
    throw new ApiError(400, 'INVALID_PARTICIPANTS', 'Direct conversation must contain exactly 2 participants');
  }

  if (type === 'direct') {
    const existing = await Conversation.findOne({
      type: 'direct',
      participants: { $all: uniqueParticipants, $size: 2 },
    });

    if (existing) {
      return successResponse(res, existing, 'Conversation already exists');
    }
  }

  const conversation = await Conversation.create({
    type,
    name: type === 'group' ? name || 'Group chat' : null,
    participants: uniqueParticipants,
    createdBy: req.user._id,
    lastMessageAt: new Date(),
  });

  return successResponse(res, conversation, 'Conversation created', 201);
});

module.exports = {
  listConversations,
  createConversation,
};
