const progressService = require('../services/progressService');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @route   POST /api/progress/:videoId
 * @desc    Save video watch progress
 * @access  Private
 */
const saveProgress = asyncHandler(async (req, res) => {
  const { progressSeconds, duration } = req.body;
  const progress = await progressService.saveProgress(req.user._id, req.params.videoId, {
    progressSeconds,
    duration,
  });

  return res.status(200).json(new ApiResponse(200, progress, 'Progress saved'));
});

/**
 * @route   GET /api/progress/:videoId
 * @desc    Get video watch progress
 * @access  Public (Optional auth)
 */
const getProgress = asyncHandler(async (req, res) => {
  const userId = req.user?._id || null;
  const progress = await progressService.getProgress(userId, req.params.videoId);

  return res.status(200).json(new ApiResponse(200, progress, 'Progress retrieved'));
});

/**
 * @route   GET /api/progress/continue-watching
 * @desc    Get continue watching queue for authenticated user
 * @access  Private
 */
const getContinueWatching = asyncHandler(async (req, res) => {
  const { limit } = req.query;
  const items = await progressService.getContinueWatching(req.user._id, {
    limit: parseInt(limit, 10) || 10,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { videos: items }, 'Continue watching feed retrieved'));
});

module.exports = {
  saveProgress,
  getProgress,
  getContinueWatching,
};
