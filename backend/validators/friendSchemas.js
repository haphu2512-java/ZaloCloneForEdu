const { z } = require('zod');

const requestFriendSchema = z.object({
  toUserId: z.string().trim().min(24).max(24),
});

const requestIdParamSchema = z.object({
  id: z.string().trim().min(24).max(24),
});

const friendIdParamSchema = z.object({
  friendId: z.string().trim().min(24).max(24),
});

module.exports = {
  requestFriendSchema,
  requestIdParamSchema,
  friendIdParamSchema,
};
