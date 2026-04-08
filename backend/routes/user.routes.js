const express = require('express');

const userController = require('../controllers/userController');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { blockUserBodySchema, updateUserSchema, userIdParamSchema } = require('../validators/userSchemas');

const router = express.Router();

router.get('/:id', auth, validate({ params: userIdParamSchema }), userController.getUserById);
router.put('/:id', auth, validate({ params: userIdParamSchema, body: updateUserSchema }), userController.updateUserById);
router.delete('/:id', auth, validate({ params: userIdParamSchema }), userController.deleteUserById);
router.post(
  '/block/:id',
  auth,
  validate({ params: userIdParamSchema, body: blockUserBodySchema }),
  userController.blockOrUnblockUser,
);

module.exports = router;
