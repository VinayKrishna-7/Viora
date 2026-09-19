const Playlist = require('../models/Playlist');
const Video = require('../models/Video');
const ApiError = require('../utils/ApiError');

class PlaylistService {
  /**
   * Create a new playlist
   */
  async createPlaylist(userId, { name, description, visibility = 'public', videoId }) {
    if (!name || !name.trim()) {
      throw new ApiError(400, 'Playlist name is required');
    }

    const videoArray = [];
    if (videoId) {
      const video = await Video.findById(videoId);
      if (video) {
        videoArray.push(video._id);
      }
    }

    const playlist = await Playlist.create({
      name: name.trim(),
      description: description ? description.trim() : '',
      owner: userId,
      visibility,
      videos: videoArray,
    });

    return playlist;
  }

  /**
   * Get all playlists owned by user
   */
  async getUserPlaylists(userId) {
    const playlists = await Playlist.find({ owner: userId })
      .sort({ updatedAt: -1 })
      .populate({
        path: 'videos',
        select: 'thumbnailUrl title duration',
        options: { limit: 1 }, // first video thumbnail as cover
      })
      .lean();

    return playlists.map((p) => ({
      ...p,
      videoCount: p.videos.length,
      coverThumbnail: p.videos[0]?.thumbnailUrl || null,
    }));
  }

  /**
   * Get playlist by ID with populated videos
   */
  async getPlaylistById(playlistId, currentUserId = null) {
    const playlist = await Playlist.findById(playlistId)
      .populate('owner', 'username avatar subscribersCount')
      .populate({
        path: 'videos',
        populate: {
          path: 'owner',
          select: 'username avatar',
        },
      });

    if (!playlist) {
      throw new ApiError(404, 'Playlist not found');
    }

    // Privacy check
    if (
      playlist.visibility === 'private' &&
      (!currentUserId || playlist.owner._id.toString() !== currentUserId.toString())
    ) {
      throw new ApiError(403, 'This playlist is private');
    }

    return playlist;
  }

  /**
   * Update playlist details
   */
  async updatePlaylist(playlistId, userId, { name, description, visibility }) {
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
      throw new ApiError(404, 'Playlist not found');
    }

    if (playlist.owner.toString() !== userId.toString()) {
      throw new ApiError(403, 'You are not authorized to edit this playlist');
    }

    if (name) playlist.name = name.trim();
    if (description !== undefined) playlist.description = description.trim();
    if (visibility) playlist.visibility = visibility;

    await playlist.save();
    return playlist;
  }

  /**
   * Delete playlist
   */
  async deletePlaylist(playlistId, userId) {
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
      throw new ApiError(404, 'Playlist not found');
    }

    if (playlist.owner.toString() !== userId.toString()) {
      throw new ApiError(403, 'You are not authorized to delete this playlist');
    }

    await Playlist.findByIdAndDelete(playlistId);
    return true;
  }

  /**
   * Add video to playlist
   */
  async addVideoToPlaylist(playlistId, videoId, userId) {
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
      throw new ApiError(404, 'Playlist not found');
    }

    if (playlist.owner.toString() !== userId.toString()) {
      throw new ApiError(403, 'You are not authorized to edit this playlist');
    }

    const video = await Video.findById(videoId);
    if (!video) {
      throw new ApiError(404, 'Video not found');
    }

    // Prevent duplicate additions
    const alreadyAdded = playlist.videos.some((v) => v.toString() === videoId.toString());
    if (!alreadyAdded) {
      playlist.videos.push(videoId);
      await playlist.save();
    }

    return playlist;
  }

  /**
   * Remove video from playlist
   */
  async removeVideoFromPlaylist(playlistId, videoId, userId) {
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
      throw new ApiError(404, 'Playlist not found');
    }

    if (playlist.owner.toString() !== userId.toString()) {
      throw new ApiError(403, 'You are not authorized to edit this playlist');
    }

    playlist.videos = playlist.videos.filter((v) => v.toString() !== videoId.toString());
    await playlist.save();

    return playlist;
  }
}

module.exports = new PlaylistService();
