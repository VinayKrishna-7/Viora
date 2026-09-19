const User = require('../models/User');
const Video = require('../models/Video');
const Comment = require('../models/Comment');
const VideoLike = require('../models/VideoLike');
const Subscription = require('../models/Subscription');
const Playlist = require('../models/Playlist');
const WatchHistory = require('../models/WatchHistory');
const WatchLater = require('../models/WatchLater');
const Notification = require('../models/Notification');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @route   GET /api/users/me
 * @desc    Get current user profile with role and stats
 * @access  Private
 */
const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  return res.status(200).json(new ApiResponse(200, user, 'Current user profile retrieved'));
});

/**
 * @route   GET /api/users/:username
 * @desc    Get public channel profile and stats
 * @access  Public
 */
const getChannelProfile = asyncHandler(async (req, res) => {
  const username = req.params.username.toLowerCase().trim();

  const user = await User.findOne({ username, isSuspended: false }).select(
    'username email avatar banner description role subscribersCount subscribedToCount createdAt'
  );

  if (!user) {
    throw new ApiError(404, 'Channel not found');
  }

  // Count total public videos
  const videoCount = await Video.countDocuments({
    owner: user._id,
    visibility: 'public',
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        channel: user,
        videoCount,
      },
      'Channel profile retrieved'
    )
  );
});

/**
 * @route   DELETE /api/users/me
 * @desc    Delete user account and cascade delete user data
 * @access  Private
 */
const deleteMyAccount = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  await Promise.all([
    User.findByIdAndDelete(userId),
    Video.deleteMany({ owner: userId }),
    Comment.deleteMany({ user: userId }),
    VideoLike.deleteMany({ user: userId }),
    Subscription.deleteMany({ $or: [{ subscriber: userId }, { channel: userId }] }),
    Playlist.deleteMany({ owner: userId }),
    WatchHistory.deleteMany({ user: userId }),
    WatchLater.deleteMany({ user: userId }),
    Notification.deleteMany({ $or: [{ recipient: userId }, { sender: userId }] }),
  ]);

  // Clear authentication cookie
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });

  return res.status(200).json(new ApiResponse(200, null, 'Account deleted successfully'));
});

module.exports = {
  getCurrentUser,
  getChannelProfile,
  deleteMyAccount,
};
