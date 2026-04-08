const express = require('express');

const authController = require('../controllers/authController');
const auth = require('../middlewares/auth');
const { createRateLimiter } = require('../middlewares/rateLimiter');
const validate = require('../middlewares/validate');
const { loginSchema, refreshSchema, registerSchema } = require('../validators/authSchemas');

const router = express.Router();

const authLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 10,
  code: 'AUTH_RATE_LIMITED',
  message: 'Too many auth requests. Please try again in a minute.',
});

router.post('/register', authLimiter, validate({ body: registerSchema }), authController.register);
router.post('/login', authLimiter, validate({ body: loginSchema }), authController.login);
router.post('/refresh-token', validate({ body: refreshSchema }), authController.refreshToken);
router.post('/logout', validate({ body: refreshSchema }), authController.logout);
router.post('/logout-all', auth, authController.logoutAll);

module.exports = router;
