const express = require('express');

const authController = require('../controllers/authController');
const auth = require('../middlewares/auth');
const { createRateLimiter } = require('../middlewares/rateLimiter');
const validate = require('../middlewares/validate');
const {
  loginSchema,
  refreshSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  verifyEmailSchema,
} = require('../validators/authSchemas');

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

// New auth flows
router.post('/verify-email', authLimiter, validate({ body: verifyEmailSchema }), authController.verifyEmail);
router.post('/forgot-password', authLimiter, validate({ body: forgotPasswordSchema }), authController.forgotPassword);
router.post('/reset-password', authLimiter, validate({ body: resetPasswordSchema }), authController.resetPassword);

// Changing password requires authentication
router.post('/change-password', auth, authLimiter, validate({ body: changePasswordSchema }), authController.changePassword);

module.exports = router;
