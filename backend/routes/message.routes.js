const express = require('express');

const messageController = require('../controllers/messageController');
const auth = require('../middlewares/auth');
const { createRateLimiter } = require('../middlewares/rateLimiter');
const validate = require('../middlewares/validate');
const {
  conversationParamSchema,
  messageIdParamSchema,
  messagePaginationQuerySchema,
  sendMessageSchema,
} = require('../validators/messageSchemas');

const router = express.Router();

const messageLimiter = createRateLimiter({
  windowMs: 15 * 1000,
  max: 25,
  code: 'MESSAGE_RATE_LIMITED',
  message: 'You are sending messages too fast. Please slow down.',
});

router.post('/send', auth, messageLimiter, validate({ body: sendMessageSchema }), messageController.sendMessage);
router.get(
  '/conversation/:id',
  auth,
  validate({ params: conversationParamSchema, query: messagePaginationQuerySchema }),
  messageController.listMessagesByConversation,
);
router.put('/:id/read', auth, validate({ params: messageIdParamSchema }), messageController.markMessageRead);
router.delete('/:id', auth, validate({ params: messageIdParamSchema }), messageController.deleteMessage);

module.exports = router;
