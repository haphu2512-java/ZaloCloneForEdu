const express = require('express');

const friendController = require('../controllers/friendController');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { friendIdParamSchema, requestFriendSchema, requestIdParamSchema } = require('../validators/friendSchemas');

const router = express.Router();

router.post('/request', auth, validate({ body: requestFriendSchema }), friendController.sendFriendRequest);
router.put(
  '/request/:id/accept',
  auth,
  validate({ params: requestIdParamSchema }),
  friendController.acceptFriendRequest,
);
router.put(
  '/request/:id/reject',
  auth,
  validate({ params: requestIdParamSchema }),
  friendController.rejectFriendRequest,
);
router.delete('/:friendId', auth, validate({ params: friendIdParamSchema }), friendController.removeFriend);
router.get('/list', auth, friendController.getFriendList);

module.exports = router;
