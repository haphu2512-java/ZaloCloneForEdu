const express = require('express');

const conversationController = require('../controllers/conversationController');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { createConversationSchema } = require('../validators/conversationSchemas');

const router = express.Router();

router.get('/', auth, conversationController.listConversations);
router.post('/', auth, validate({ body: createConversationSchema }), conversationController.createConversation);

module.exports = router;
