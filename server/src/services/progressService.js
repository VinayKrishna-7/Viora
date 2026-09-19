const WatchProgress = require('../models/WatchProgress');
const Video = require('../models/Video');

class ProgressService {
  /**
   * Save or update video playback progress
   */
  async saveProgress(userId, videoId, { progressSeconds = 0, duration = 0 }) {
    const isCompleted = duration > 0 && progressSeconds >= duration * 0.92;

    const progress = await WatchProgress.findOneAndUpdate(
      { user: userId, video: videoId },
      {
        progressSeconds: Math.round(progressSeconds),
        duration: Math.round(duration),
        completed: isCompleted,
      },
      { upsert: true, new: true }
    );

    return progress;
  }

  /**
   * Get progress for a specific video
   */
  async getProgress(userId, videoId) {
    if (!userId) return null;
    return await WatchProgress.findOne({ user: userId, video: videoId }).lean();
  }

  /**
   * Get user's active continue-watching queue
   */
  async getContinueWatching(userId, { limit = 10 } = {}) {
    if (!userId) return [];

    const items = await WatchProgress.find({
      user: userId,
      completed: false,
      progressSeconds: { $gt: 5 }, // Only include if watched for more than 5s
    })
      .sort({ updatedAt: -1 })
      .limit(limit)
      .populate({
        path: 'video',
        populate: {
          path: 'owner',
          select: 'username avatar',
        },
      })
      .lean();

    // Return only valid public/unlisted videos
    return items
      .filter((item) => item.video !== null && item.video.visibility !== 'private')
      .map((item) => ({
        ...item.video,
        progressSeconds: item.progressSeconds,
        lastDuration: item.duration || item.video.duration,
        progressPercentage:
          item.duration > 0
            ? Math.min(100, Math.round((item.progressSeconds / item.duration) * 100))
            : 0,
      }));
  }
}

module.exports = new ProgressService();
