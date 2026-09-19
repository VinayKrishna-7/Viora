const Video = require('../models/Video');

class RecommendationService {
  /**
   * Get weighted recommended videos for a given video
   * Factors:
   * 1. Same category
   * 2. Matching tags
   * 3. Same channel / owner
   * 4. Overall popularity (views) & recent uploads
   * 5. Exclude currently watched video
   */
  async getRecommendations(currentVideoId, { limit = 12 } = {}) {
    const limitNumber = Math.min(30, Math.max(1, parseInt(limit, 10) || 12));

    const currentVideo = await Video.findById(currentVideoId);
    if (!currentVideo) {
      // If video not found, return most popular public videos
      return await Video.find({ visibility: 'public' })
        .sort({ views: -1, createdAt: -1 })
        .limit(limitNumber)
        .populate('owner', 'username avatar subscribersCount')
        .lean();
    }

    const { category, tags = [], owner } = currentVideo;

    // Build matching criteria excluding current video
    const orConditions = [];

    if (category && category !== 'All') {
      orConditions.push({ category });
    }

    if (tags && tags.length > 0) {
      orConditions.push({ tags: { $in: tags } });
    }

    if (owner) {
      orConditions.push({ owner });
    }

    let recommended = [];

    if (orConditions.length > 0) {
      recommended = await Video.find({
        _id: { $ne: currentVideoId },
        visibility: 'public',
        $or: orConditions,
      })
        .sort({ views: -1, createdAt: -1 })
        .limit(limitNumber)
        .populate('owner', 'username avatar subscribersCount')
        .lean();
    }

    // If we haven't reached the limit with matched category/tags, fill with popular recent videos
    if (recommended.length < limitNumber) {
      const existingIds = [currentVideoId, ...recommended.map((v) => v._id)];
      const remainingCount = limitNumber - recommended.length;

      const fallbackVideos = await Video.find({
        _id: { $nin: existingIds },
        visibility: 'public',
      })
        .sort({ views: -1, createdAt: -1 })
        .limit(remainingCount)
        .populate('owner', 'username avatar subscribersCount')
        .lean();

      recommended = [...recommended, ...fallbackVideos];
    }

    return recommended;
  }
}

module.exports = new RecommendationService();
