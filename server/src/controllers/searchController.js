const searchService = require('../services/searchService');
const youtubeService = require('../services/youtubeService');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @route   GET /api/search
 * @desc    Hybrid search across local Viora videos and YouTube Data API v3
 * @access  Public
 */
const searchVideos = asyncHandler(async (req, res) => {
  const { q, category, sortBy, page, limit, source, pageToken } = req.query;

  const result = await searchService.hybridSearch({
    q,
    category,
    sortBy,
    page,
    limit,
    source: source || 'all',
    pageToken,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, result, 'Search results retrieved'));
});

/**
 * @route   GET /api/search/youtube/:videoId
 * @desc    Get details for a specific YouTube video
 * @access  Public
 */
const getYouTubeVideoDetails = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const video = await youtubeService.getVideoDetails(videoId);

  if (!video) {
    throw new ApiError(404, 'YouTube video not found');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, 'YouTube video details retrieved'));
});

/**
 * @route   GET /api/search/youtube/:videoId/related
 * @desc    Get related YouTube videos
 * @access  Public
 */
const getRelatedYouTubeVideos = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const limit = parseInt(req.query.limit, 10) || 10;

  const related = await youtubeService.getRelatedVideos(videoId, limit);

  return res
    .status(200)
    .json(new ApiResponse(200, related, 'Related YouTube videos retrieved'));
});

module.exports = {
  searchVideos,
  getYouTubeVideoDetails,
  getRelatedYouTubeVideos,
};

