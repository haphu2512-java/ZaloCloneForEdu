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

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new account
 *     parameters:
 *       - $ref: '#/components/parameters/ClientPlatform'
 *       - $ref: '#/components/parameters/AppVersion'
 *       - $ref: '#/components/parameters/DeviceId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterInput'
 *     responses:
 *       201:
 *         description: Register success
 *       409:
 *         description: Email or username already exists
 */
router.post('/register', authLimiter, validate({ body: registerSchema }), authController.register);
/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login with email or username
 *     parameters:
 *       - $ref: '#/components/parameters/ClientPlatform'
 *       - $ref: '#/components/parameters/AppVersion'
 *       - $ref: '#/components/parameters/DeviceId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Login success
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post('/login', authLimiter, validate({ body: loginSchema }), authController.login);
/**
 * @openapi
 * /auth/refresh-token:
 *   post:
 *     tags: [Auth]
 *     summary: Rotate refresh token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshInput'
 *     responses:
 *       200:
 *         description: Token rotated
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post('/refresh-token', validate({ body: refreshSchema }), authController.refreshToken);
/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout current session
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshInput'
 *     responses:
 *       200:
 *         description: Logout success
 */
router.post('/logout', validate({ body: refreshSchema }), authController.logout);
/**
 * @openapi
 * /auth/logout-all:
 *   post:
 *     tags: [Auth]
 *     summary: Logout all sessions of current user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All sessions revoked
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post('/logout-all', auth, authController.logoutAll);

module.exports = router;
