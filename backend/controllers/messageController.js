const mongoose = require('mongoose');

const Message = require('../models/Message');
const { createMessage, ensureConversationMember } = require('../services/messageService');
const { decodeCursor, encodeCursor } = require('../utils/cursor');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const { successResponse } = require('../utils/apiResponse');
const socketService = require('../services/socketService');

const sendMessage = asyncHandler(async (req, res) => {
  const { conversationId, content, mediaIds, replyTo, forwardFrom } = req.body;
  if (!content && (!mediaIds || mediaIds.length === 0)) {
    throw new ApiError(400, 'INVALID_PAYLOAD', 'Message content or media is required');
  }

  const message = await createMessage({
    conversationId,
    senderId: req.user._id,
    content,
    mediaIds,
    replyTo,
    forwardFrom,
  });

  socketService.emitToConversation(conversationId, 'new_message', message);

  return successResponse(res, message, 'Message sent', 201);
});

const listMessagesByConversation = asyncHandler(async (req, res) => {
  const conversationId = req.params.id;
  const { limit, cursor } = req.query;

  await ensureConversationMember(conversationId, req.user._id);

  const query = { conversationId };
  if (cursor) {
    const parsedCursor = decodeCursor(cursor);
    if (!parsedCursor) {
      throw new ApiError(400, 'INVALID_CURSOR', 'Cursor is invalid');
    }

    query.$or = [
      { createdAt: { $lt: parsedCursor.createdAt } },
      {
        createdAt: parsedCursor.createdAt,
        _id: { $lt: new mongoose.Types.ObjectId(parsedCursor.id) },
      },
    ];
  }

  const messages = await Message.find(query)
    .sort({ createdAt: -1, _id: -1 })
    .limit(limit + 1)
    .populate('senderId', 'username avatarUrl')
    .populate('replyTo');

  let nextCursor = null;
  let finalItems = messages;

  if (messages.length > limit) {
    const nextItem = messages[limit - 1];
    nextCursor = encodeCursor({
      createdAt: nextItem.createdAt,
      id: nextItem._id.toString(),
    });
    finalItems = messages.slice(0, limit);
  }

  return successResponse(
    res,
    {
      items: finalItems,
      nextCursor,
      limit,
    },
    'Messages fetched',
  );
});

const markMessageRead = asyncHandler(async (req, res) => {
  const message = await Message.findById(req.params.id);
  if (!message) {
    throw new ApiError(404, 'MESSAGE_NOT_FOUND', 'Message not found');
  }

  await ensureConversationMember(message.conversationId, req.user._id);
  await Message.findByIdAndUpdate(message._id, {
    $addToSet: { seenBy: req.user._id, deliveredTo: req.user._id },
  });

  socketService.emitToConversation(message.conversationId.toString(), 'message_seen', {
    messageId: message._id,
    userId: req.user._id,
  });

  return successResponse(res, {}, 'Message marked as read');
});

const deleteMessage = asyncHandler(async (req, res) => {
  const message = await Message.findById(req.params.id);
  if (!message) {
    throw new ApiError(404, 'MESSAGE_NOT_FOUND', 'Message not found');
  }

  if (!message.senderId.equals(req.user._id)) {
    throw new ApiError(403, 'FORBIDDEN', 'Only sender can delete this message');
  }

  await Message.findByIdAndDelete(message._id);
  return successResponse(res, {}, 'Message deleted');
});

module.exports = {
  sendMessage,
  listMessagesByConversation,
  markMessageRead,
  deleteMessage,
};
