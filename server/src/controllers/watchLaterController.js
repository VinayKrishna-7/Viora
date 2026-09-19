const watchLaterService = require('../services/watchLaterService');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @route   POST /api/watch-later/:videoId
 * @desc    Toggle video in Watch Later
 * @access  Private
 */
const toggleWatchLater = asyncHandler(async (req, res) => {
  const result = await watchLaterService.toggleWatchLater(req.user._id, req.params.videoId);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        result,
        result.inWatchLater ? 'Added to Watch Later' : 'Removed from Watch Later'
      )
    );
});

/**
 * @route   GET /api/watch-later
 * @desc    Get user's Watch Later videos
 * @access  Private
 */
const getWatchLater = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await watchLaterService.getWatchLater(req.user._id, { page, limit });

  return res
    .status(200)
    .json(new ApiResponse(200, result, 'Watch Later videos retrieved successfully'));
});

/**
 * @route   GET /api/watch-later/:videoId/status
 * @desc    Check if video is in user's Watch Later
 * @access  Public (Optional auth)
 */
const getWatchLaterStatus = asyncHandler(async (req, res) => {
  const userId = req.user?._id || null;
  const result = await watchLaterService.getWatchLaterStatus(userId, req.params.videoId);

  return res
    .status(200)
    .json(new ApiResponse(200, result, 'Watch Later status retrieved'));
});

module.exports = {
  toggleWatchLater,
  getWatchLater,
  getWatchLaterStatus,
};
