const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const { successResponse } = require('../utils/apiResponse');

const listConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({
    participants: req.user._id,
  })
    .populate('participants', 'username email avatarUrl isOnline lastSeen')
    .sort({ lastMessageAt: -1, updatedAt: -1 })
    .limit(100);

  const conversationIds = conversations.map((conversation) => conversation._id);
  const latestMessages = await Message.find({ conversationId: { $in: conversationIds } })
    .sort({ createdAt: -1 })
    .limit(conversationIds.length || 1)
    .populate('senderId', 'username');

  const latestByConversation = new Map();
  for (const message of latestMessages) {
    if (!latestByConversation.has(message.conversationId.toString())) {
      latestByConversation.set(message.conversationId.toString(), message);
    }
  }

  const data = conversations.map((conversation) => ({
    ...conversation.toObject(),
    latestMessage: latestByConversation.get(conversation._id.toString()) || null,
  }));

  return successResponse(res, { conversations: data }, 'Conversations fetched');
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
