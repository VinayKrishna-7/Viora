const Video = require('../models/Video');
const VideoLike = require('../models/VideoLike');
const ApiError = require('../utils/ApiError');

class InteractionService {
  /**
   * Toggle like or dislike on a video
   * @param {string} videoId
   * @param {string} userId
   * @param {'like'|'dislike'} type
   */
  async toggleInteraction(videoId, userId, type) {
    if (!['like', 'dislike'].includes(type)) {
      throw new ApiError(400, 'Interaction type must be "like" or "dislike"');
    }

    const video = await Video.findById(videoId);
    if (!video) {
      throw new ApiError(404, 'Video not found');
    }

    const existingInteraction = await VideoLike.findOne({
      video: videoId,
      user: userId,
    });

    let userInteraction = null;

    if (existingInteraction) {
      if (existingInteraction.type === type) {
        // Toggle OFF: Remove existing interaction
        await VideoLike.findByIdAndDelete(existingInteraction._id);
        if (type === 'like') {
          video.likesCount = Math.max(0, video.likesCount - 1);
        } else {
          video.dislikesCount = Math.max(0, video.dislikesCount - 1);
        }
        userInteraction = null;
      } else {
        // Switch interaction: e.g. from dislike to like
        existingInteraction.type = type;
        await existingInteraction.save();

        if (type === 'like') {
          video.likesCount += 1;
          video.dislikesCount = Math.max(0, video.dislikesCount - 1);
        } else {
          video.dislikesCount += 1;
          video.likesCount = Math.max(0, video.likesCount - 1);
        }
        userInteraction = type;
      }
    } else {
      // Create new interaction
      await VideoLike.create({
        video: videoId,
        user: userId,
        type,
      });

      if (type === 'like') {
        video.likesCount += 1;
      } else {
        video.dislikesCount += 1;
      }
      userInteraction = type;
    }

    await video.save();

    return {
      userInteraction,
      likesCount: video.likesCount,
      dislikesCount: video.dislikesCount,
    };
  }

  /**
   * Get interaction status for current user and video
   */
  async getInteractionStatus(videoId, userId = null) {
    const video = await Video.findById(videoId).select('likesCount dislikesCount');
    if (!video) {
      throw new ApiError(404, 'Video not found');
    }

    let userInteraction = null;
    if (userId) {
      const interaction = await VideoLike.findOne({
        video: videoId,
        user: userId,
      });
      if (interaction) {
        userInteraction = interaction.type;
      }
    }

    return {
      userInteraction,
      likesCount: video.likesCount,
      dislikesCount: video.dislikesCount,
    };
  }
}

module.exports = new InteractionService();
