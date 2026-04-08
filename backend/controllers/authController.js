const bcrypt = require('bcryptjs');

const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const { successResponse } = require('../utils/apiResponse');
const { issueTokenPair, rotateRefreshToken, revokeAllSessions, revokeRefreshToken } = require('../services/authService');

const toAuthPayload = (user, tokens) => ({
  user: user.toJSON(),
  accessToken: tokens.accessToken,
  refreshToken: tokens.refreshToken,
});

const register = asyncHandler(async (req, res) => {
  const { username, email, password, phone } = req.body;
  const duplicated = await User.findOne({
    $or: [{ email: email.toLowerCase() }, { username }],
  });

  if (duplicated) {
    throw new ApiError(409, 'USER_EXISTS', 'Email or username already exists');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    username,
    email: email.toLowerCase(),
    passwordHash,
    phone: phone || null,
  });

  const tokens = await issueTokenPair(user);

  return successResponse(res, toAuthPayload(user, tokens), 'Register success', 201);
});

const login = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;
  const where = email ? { email: email.toLowerCase() } : { username };
  const user = await User.findOne(where);
  if (!user || user.deletedAt) {
    throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid credentials');
  }

  const validPassword = await bcrypt.compare(password, user.passwordHash);
  if (!validPassword) {
    throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid credentials');
  }

  const tokens = await issueTokenPair(user);

  return successResponse(res, toAuthPayload(user, tokens), 'Login success');
});

const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;
  const tokens = await rotateRefreshToken(token);
  const user = await User.findById(tokens.userId);
  if (!user) {
    throw new ApiError(401, 'UNAUTHORIZED', 'User not found');
  }
  return successResponse(res, toAuthPayload(user, tokens), 'Token refreshed');
});

const logout = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;
  await revokeRefreshToken(token);
  return successResponse(res, {}, 'Logout success');
});

const logoutAll = asyncHandler(async (req, res) => {
  await revokeAllSessions(req.user._id);
  return successResponse(res, {}, 'Logged out from all devices');
});

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  logoutAll,
};
