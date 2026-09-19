const WatchLater = require('../models/WatchLater');
const Video = require('../models/Video');
const ApiError = require('../utils/ApiError');

class WatchLaterService {
  /**
   * Toggle video in Watch Later list
   */
  async toggleWatchLater(userId, videoId) {
    const video = await Video.findById(videoId);
    if (!video) {
      throw new ApiError(404, 'Video not found');
    }

    const existing = await WatchLater.findOne({ user: userId, video: videoId });

    if (existing) {
      await WatchLater.findByIdAndDelete(existing._id);
      return { inWatchLater: false };
    } else {
      await WatchLater.create({ user: userId, video: videoId });
      return { inWatchLater: true };
    }
  }

  /**
   * Get user's Watch Later videos paginated
   */
  async getWatchLater(userId, { page = 1, limit = 20 }) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      WatchLater.find({ user: userId })
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
      WatchLater.countDocuments({ user: userId }),
    ]);

    const validVideos = items
      .filter((item) => item.video !== null)
      .map((item) => ({
        ...item.video,
        savedAt: item.createdAt,
      }));

    const totalPages = Math.ceil(total / limitNum);

    return {
      videos: validVideos,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasNextPage: pageNum < totalPages,
      },
    };
  }

  /**
   * Check if video is in user's Watch Later
   */
  async getWatchLaterStatus(userId, videoId) {
    if (!userId) return { inWatchLater: false };
    const existing = await WatchLater.findOne({ user: userId, video: videoId });
    return { inWatchLater: !!existing };
  }
}

module.exports = new WatchLaterService();
