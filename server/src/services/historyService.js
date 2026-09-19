const WatchHistory = require('../models/WatchHistory');
const Video = require('../models/Video');
const ApiError = require('../utils/ApiError');

class HistoryService {
  /**
   * Add video to watch history or update watchedAt timestamp if already watched
   */
  async addToHistory(userId, videoId) {
    const video = await Video.findById(videoId);
    if (!video) {
      throw new ApiError(404, 'Video not found');
    }

    const history = await WatchHistory.findOneAndUpdate(
      { user: userId, video: videoId },
      { watchedAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return history;
  }

  /**
   * Get user's watch history paginated
   */
  async getHistory(userId, { page = 1, limit = 20 }) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [historyItems, total] = await Promise.all([
      WatchHistory.find({ user: userId })
        .sort({ watchedAt: -1 })
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
      WatchHistory.countDocuments({ user: userId }),
    ]);

    // Filter out records where video was deleted
    const validItems = historyItems.filter((item) => item.video !== null);

    const totalPages = Math.ceil(total / limitNum);

    return {
      history: validItems,
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
   * Remove single video from history
   */
  async removeFromHistory(userId, videoId) {
    await WatchHistory.findOneAndDelete({ user: userId, video: videoId });
    return true;
  }

  /**
   * Clear all history for user
   */
  async clearHistory(userId) {
    await WatchHistory.deleteMany({ user: userId });
    return true;
  }
}

module.exports = new HistoryService();
