const videoService = require('../services/videoService');
const recommendationService = require('../services/recommendationService');
const VideoLike = require('../models/VideoLike');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @route   POST /api/videos
 * @desc    Upload video & thumbnail, create record
 * @access  Private
 */
const createVideo = asyncHandler(async (req, res) => {
  const video = await videoService.createVideo(req.body, req.files, req.user._id);

  return res
    .status(201)
    .json(new ApiResponse(201, video, 'Video uploaded successfully'));
});

/**
 * @route   GET /api/videos
 * @desc    Get paginated videos with optional filters (category, search, sort)
 * @access  Public
 */
const getAllVideos = asyncHandler(async (req, res) => {
  const { page, limit, category, search, sortBy, ownerId } = req.query;
  const result = await videoService.getAllVideos({
    page,
    limit,
    category,
    search,
    sortBy,
    ownerId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, result, 'Videos retrieved successfully'));
});

/**
 * @route   GET /api/videos/:id
 * @desc    Get video by ID
 * @access  Public (Optional auth for private video check)
 */
const getVideoById = asyncHandler(async (req, res) => {
  const currentUserId = req.user?._id || null;
  const video = await videoService.getVideoById(req.params.id, currentUserId);

  return res
    .status(200)
    .json(new ApiResponse(200, video, 'Video retrieved successfully'));
});

/**
 * @route   PATCH /api/videos/:id/view
 * @desc    Increment video view count
 * @access  Public
 */
const incrementViews = asyncHandler(async (req, res) => {
  const views = await videoService.incrementViews(req.params.id);

  return res
    .status(200)
    .json(new ApiResponse(200, { views }, 'View count incremented'));
});

/**
 * @route   GET /api/videos/channel/:username
 * @desc    Get videos by channel username
 * @access  Public
 */
const getVideosByChannel = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const isOwner = req.user?.username === req.params.username;

  const result = await videoService.getVideosByChannel(
    req.params.username,
    { page, limit },
    isOwner
  );

  return res
    .status(200)
    .json(new ApiResponse(200, result, 'Channel videos retrieved successfully'));
});

/**
 * @route   PUT /api/videos/:id
 * @desc    Update video metadata or thumbnail
 * @access  Private
 */
const updateVideo = asyncHandler(async (req, res) => {
  const updatedVideo = await videoService.updateVideo(
    req.params.id,
    req.user._id,
    req.body,
    req.file
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, 'Video updated successfully'));
});

/**
 * @route   DELETE /api/videos/:id
 * @desc    Delete video and media assets
 * @access  Private
 */
const deleteVideo = asyncHandler(async (req, res) => {
  await videoService.deleteVideo(req.params.id, req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, null, 'Video deleted successfully'));
});

/**
 * @route   GET /api/videos/:id/recommendations
 * @desc    Get weighted recommended videos
 * @access  Public
 */
const getRecommendations = asyncHandler(async (req, res) => {
  const { limit } = req.query;
  const videos = await recommendationService.getRecommendations(req.params.id, {
    limit,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { videos }, 'Recommended videos retrieved'));
});

/**
 * @route   GET /api/videos/liked
 * @desc    Get videos liked by current user
 * @access  Private
 */
const getLikedVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const [likes, total] = await Promise.all([
    VideoLike.find({ user: req.user._id, type: 'like' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate({
        path: 'video',
        populate: {
          path: 'owner',
          select: 'username avatar',
        },
      })
      .lean(),
    VideoLike.countDocuments({ user: req.user._id, type: 'like' }),
  ]);

  const validVideos = likes
    .filter((l) => l.video !== null && l.video.visibility === 'public')
    .map((l) => l.video);

  const totalPages = Math.ceil(total / limitNum);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        videos: validVideos,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages,
          hasNextPage: pageNum < totalPages,
        },
      },
      'Liked videos retrieved successfully'
    )
  );
});

module.exports = {
  createVideo,
  getAllVideos,
  getVideoById,
  incrementViews,
  getVideosByChannel,
  updateVideo,
  deleteVideo,
  getRecommendations,
  getLikedVideos,
};
