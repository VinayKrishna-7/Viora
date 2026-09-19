const historyService = require('../services/historyService');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @route   GET /api/history
 * @desc    Get user's watch history
 * @access  Private
 */
const getHistory = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await historyService.getHistory(req.user._id, { page, limit });

  return res
    .status(200)
    .json(new ApiResponse(200, result, 'Watch history retrieved successfully'));
});

/**
 * @route   POST /api/history/:videoId
 * @desc    Add or update video in watch history
 * @access  Private
 */
const addToHistory = asyncHandler(async (req, res) => {
  const history = await historyService.addToHistory(req.user._id, req.params.videoId);

  return res
    .status(200)
    .json(new ApiResponse(200, history, 'Added to watch history'));
});

/**
 * @route   DELETE /api/history/:videoId
 * @desc    Remove video from history
 * @access  Private
 */
const removeFromHistory = asyncHandler(async (req, res) => {
  await historyService.removeFromHistory(req.user._id, req.params.videoId);

  return res
    .status(200)
    .json(new ApiResponse(200, null, 'Video removed from watch history'));
});

/**
 * @route   DELETE /api/history
 * @desc    Clear entire watch history
 * @access  Private
 */
const clearHistory = asyncHandler(async (req, res) => {
  await historyService.clearHistory(req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, null, 'Watch history cleared successfully'));
});

module.exports = {
  getHistory,
  addToHistory,
  removeFromHistory,
  clearHistory,
};
