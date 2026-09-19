const playlistService = require('../services/playlistService');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @route   POST /api/playlists
 * @desc    Create a new playlist
 * @access  Private
 */
const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description, visibility, videoId } = req.body;
  const playlist = await playlistService.createPlaylist(req.user._id, {
    name,
    description,
    visibility,
    videoId,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, playlist, 'Playlist created successfully'));
});

/**
 * @route   GET /api/playlists
 * @desc    Get user's playlists
 * @access  Private
 */
const getUserPlaylists = asyncHandler(async (req, res) => {
  const playlists = await playlistService.getUserPlaylists(req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, { playlists }, 'Playlists retrieved successfully'));
});

/**
 * @route   GET /api/playlists/:id
 * @desc    Get playlist by ID with videos
 * @access  Public (Optional auth for private playlist check)
 */
const getPlaylistById = asyncHandler(async (req, res) => {
  const currentUserId = req.user?._id || null;
  const playlist = await playlistService.getPlaylistById(req.params.id, currentUserId);

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, 'Playlist retrieved successfully'));
});

/**
 * @route   PUT /api/playlists/:id
 * @desc    Update playlist
 * @access  Private
 */
const updatePlaylist = asyncHandler(async (req, res) => {
  const updatedPlaylist = await playlistService.updatePlaylist(
    req.params.id,
    req.user._id,
    req.body
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedPlaylist, 'Playlist updated successfully'));
});

/**
 * @route   DELETE /api/playlists/:id
 * @desc    Delete playlist
 * @access  Private
 */
const deletePlaylist = asyncHandler(async (req, res) => {
  await playlistService.deletePlaylist(req.params.id, req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, null, 'Playlist deleted successfully'));
});

/**
 * @route   POST /api/playlists/:id/videos/:videoId
 * @desc    Add video to playlist
 * @access  Private
 */
const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const playlist = await playlistService.addVideoToPlaylist(
    req.params.id,
    req.params.videoId,
    req.user._id
  );

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, 'Video added to playlist'));
});

/**
 * @route   DELETE /api/playlists/:id/videos/:videoId
 * @desc    Remove video from playlist
 * @access  Private
 */
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const playlist = await playlistService.removeVideoFromPlaylist(
    req.params.id,
    req.params.videoId,
    req.user._id
  );

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, 'Video removed from playlist'));
});

module.exports = {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  updatePlaylist,
  deletePlaylist,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
};
