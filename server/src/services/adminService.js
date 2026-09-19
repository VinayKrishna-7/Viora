const User = require('../models/User');
const Video = require('../models/Video');
const Comment = require('../models/Comment');
const Subscription = require('../models/Subscription');
const Report = require('../models/Report');
const videoService = require('./videoService');
const ApiError = require('../utils/ApiError');

class AdminService {
  /**
   * Get platform overview KPIs
   */
  async getPlatformStats() {
    const [
      totalUsers,
      totalCreators,
      totalVideos,
      viewsAggregation,
      totalComments,
      totalSubscriptions,
      pendingReports,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: { $in: ['creator', 'admin'] } }),
      Video.countDocuments(),
      Video.aggregate([{ $group: { _id: null, totalViews: { $sum: '$views' } } }]),
      Comment.countDocuments(),
      Subscription.countDocuments(),
      Report.countDocuments({ status: 'pending' }),
    ]);

    const totalViews = viewsAggregation[0]?.totalViews || 0;

    return {
      totalUsers,
      totalCreators,
      totalVideos,
      totalViews,
      totalComments,
      totalSubscriptions,
      pendingReports,
    };
  }

  /**
   * List platform users with search and filter
   */
  async listUsers({ search, role, page = 1, limit = 20 } = {}) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const query = {};
    if (role && ['user', 'creator', 'admin'].includes(role)) {
      query.role = role;
    }
    if (search && search.trim()) {
      query.$or = [
        { username: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .select('username email avatar role isSuspended subscribersCount createdAt')
        .lean(),
      User.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    return {
      users,
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
   * Change user role
   */
  async changeUserRole(userId, newRole) {
    if (!['user', 'creator', 'admin'].includes(newRole)) {
      throw new ApiError(400, 'Invalid role specification');
    }

    const user = await User.findByIdAndUpdate(userId, { role: newRole }, { new: true }).select(
      'username email role isSuspended'
    );
    if (!user) throw new ApiError(404, 'User not found');
    return user;
  }

  /**
   * Toggle user suspension
   */
  async toggleUserSuspension(userId) {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, 'User not found');

    user.isSuspended = !user.isSuspended;
    await user.save();

    return {
      _id: user._id,
      username: user.username,
      isSuspended: user.isSuspended,
    };
  }

  /**
   * List all platform videos for moderation
   */
  async listAllVideos({ search, visibility, page = 1, limit = 20 } = {}) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const query = {};
    if (visibility && ['public', 'unlisted', 'private'].includes(visibility)) {
      query.visibility = visibility;
    }
    if (search && search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const [videos, total] = await Promise.all([
      Video.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('owner', 'username email avatar')
        .lean(),
      Video.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    return {
      videos,
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
   * Force update video visibility
   */
  async setVideoVisibility(videoId, visibility) {
    if (!['public', 'unlisted', 'private'].includes(visibility)) {
      throw new ApiError(400, 'Invalid visibility setting');
    }

    const video = await Video.findByIdAndUpdate(videoId, { visibility }, { new: true });
    if (!video) throw new ApiError(404, 'Video not found');
    return video;
  }

  /**
   * Delete video as administrator
   */
  async deleteVideoAsAdmin(videoId) {
    return await videoService.deleteVideo(videoId, null, true);
  }
}

module.exports = new AdminService();
