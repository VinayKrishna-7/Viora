const studioService = require('../services/studioService');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @route   GET /api/studio/analytics
 * @desc    Get creator analytics & performance metrics
 * @access  Private
 */
const getStudioAnalytics = asyncHandler(async (req, res) => {
  const result = await studioService.getOverviewAnalytics(req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, result, 'Creator analytics retrieved successfully'));
});

/**
 * @route   GET /api/studio/content
 * @desc    Get creator's uploaded videos with filters and pagination
 * @access  Private
 */
const getStudioContent = asyncHandler(async (req, res) => {
  const { page, limit, search, visibility, sortBy, order } = req.query;

  const result = await studioService.getStudioContent(req.user._id, {
    page,
    limit,
    search,
    visibility,
    sortBy,
    order,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, result, 'Creator content retrieved successfully'));
});

/**
 * @route   GET /api/studio/comments
 * @desc    Get comments on creator's channel videos
 * @access  Private
 */
const getStudioComments = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;

  const result = await studioService.getStudioComments(req.user._id, {
    page,
    limit,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, result, 'Creator comments retrieved successfully'));
});

module.exports = {
  getStudioAnalytics,
  getStudioContent,
  getStudioComments,
};
