const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const { successResponse } = require('../utils/apiResponse');

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-passwordHash -tokenVersion');
  if (!user || user.deletedAt) {
    throw new ApiError(404, 'USER_NOT_FOUND', 'User not found');
  }
  return successResponse(res, user, 'User fetched');
});

const updateUserById = asyncHandler(async (req, res) => {
  if (req.user._id.toString() !== req.params.id) {
    throw new ApiError(403, 'FORBIDDEN', 'You can only update your own profile');
  }

  const updates = req.body;
  const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-passwordHash -tokenVersion');
  if (!user || user.deletedAt) {
    throw new ApiError(404, 'USER_NOT_FOUND', 'User not found');
  }

  return successResponse(res, user, 'User updated');
});

const deleteUserById = asyncHandler(async (req, res) => {
  if (req.user._id.toString() !== req.params.id) {
    throw new ApiError(403, 'FORBIDDEN', 'You can only delete your own account');
  }

  const user = await User.findById(req.params.id);
  if (!user || user.deletedAt) {
    throw new ApiError(404, 'USER_NOT_FOUND', 'User not found');
  }

  user.deletedAt = new Date();
  user.isOnline = false;
  await user.save();

  return successResponse(res, {}, 'User soft deleted');
});

const blockOrUnblockUser = asyncHandler(async (req, res) => {
  const targetId = req.params.id;
  if (req.user._id.toString() === targetId) {
    throw new ApiError(400, 'INVALID_ACTION', 'Cannot block yourself');
  }

  const target = await User.findById(targetId);
  if (!target || target.deletedAt) {
    throw new ApiError(404, 'USER_NOT_FOUND', 'Target user not found');
  }

  const action = req.body.action || 'block';
  const currentUser = await User.findById(req.user._id);
  const hasBlocked = currentUser.blockedUsers.some((item) => item.equals(targetId));

  if (action === 'block' && !hasBlocked) {
    currentUser.blockedUsers.push(targetId);
  } else if (action === 'unblock' && hasBlocked) {
    currentUser.blockedUsers = currentUser.blockedUsers.filter((item) => !item.equals(targetId));
  }

  await currentUser.save();

  return successResponse(
    res,
    { blockedUsers: currentUser.blockedUsers, action },
    `User ${action === 'block' ? 'blocked' : 'unblocked'} successfully`,
  );
});

module.exports = {
  getUserById,
  updateUserById,
  deleteUserById,
  blockOrUnblockUser,
};
