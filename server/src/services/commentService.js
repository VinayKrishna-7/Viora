const Comment = require('../models/Comment');
const Video = require('../models/Video');
const ApiError = require('../utils/ApiError');
const notificationService = require('./notificationService');

class CommentService {
  /**
   * Add a top-level comment or a reply to an existing comment
   */
  async addComment({ videoId, userId, text, parentCommentId = null }) {
    if (!text || !text.trim()) {
      throw new ApiError(400, 'Comment text cannot be empty');
    }

    const video = await Video.findById(videoId);
    if (!video) {
      throw new ApiError(404, 'Video not found');
    }

    let parentComment = null;
    if (parentCommentId) {
      parentComment = await Comment.findById(parentCommentId);
      if (!parentComment) {
        throw new ApiError(404, 'Parent comment not found');
      }
    }

    const comment = await Comment.create({
      video: videoId,
      user: userId,
      text: text.trim(),
      parentComment: parentCommentId || null,
    });

    // Send notification
    if (parentComment) {
      notificationService.createNotification({
        recipient: parentComment.user,
        sender: userId,
        type: 'reply',
        video: videoId,
        comment: comment._id,
        text: 'replied to your comment',
      }).catch(() => {});
    } else if (video.owner) {
      notificationService.createNotification({
        recipient: video.owner,
        sender: userId,
        type: 'comment',
        video: videoId,
        comment: comment._id,
        text: 'commented on your video',
      }).catch(() => {});
    }

    return await comment.populate('user', 'username avatar');
  }

  /**
   * Get top-level comments for a video with reply counts
   */
  async getVideoComments(videoId, { page = 1, limit = 20 }) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [comments, total] = await Promise.all([
      Comment.find({ video: videoId, parentComment: null })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('user', 'username avatar')
        .lean(),
      Comment.countDocuments({ video: videoId, parentComment: null }),
    ]);

    // Attach replies count to each root comment
    const commentIds = comments.map((c) => c._id);
    const replyCounts = await Comment.aggregate([
      { $match: { parentComment: { $in: commentIds } } },
      { $group: { _id: '$parentComment', count: { $sum: 1 } } },
    ]);

    const countMap = {};
    replyCounts.forEach((r) => {
      countMap[r._id.toString()] = r.count;
    });

    const enrichedComments = comments.map((c) => ({
      ...c,
      repliesCount: countMap[c._id.toString()] || 0,
    }));

    const totalPages = Math.ceil(total / limitNum);

    return {
      comments: enrichedComments,
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
   * Get nested replies for a specific parent comment
   */
  async getCommentReplies(parentCommentId, { page = 1, limit = 10 }) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const [replies, total] = await Promise.all([
      Comment.find({ parentComment: parentCommentId })
        .sort({ createdAt: 1 }) // Chronological order for conversation replies
        .skip(skip)
        .limit(limitNum)
        .populate('user', 'username avatar')
        .lean(),
      Comment.countDocuments({ parentComment: parentCommentId }),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    return {
      replies,
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
   * Update comment text (only author can update)
   */
  async updateComment(commentId, userId, newText) {
    if (!newText || !newText.trim()) {
      throw new ApiError(400, 'Comment text cannot be empty');
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new ApiError(404, 'Comment not found');
    }

    if (comment.user.toString() !== userId.toString()) {
      throw new ApiError(403, 'You can only edit your own comments');
    }

    comment.text = newText.trim();
    await comment.save();

    return await comment.populate('user', 'username avatar');
  }

  /**
   * Delete comment and its replies (only author can delete)
   */
  async deleteComment(commentId, userId) {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new ApiError(404, 'Comment not found');
    }

    if (comment.user.toString() !== userId.toString()) {
      throw new ApiError(403, 'You can only delete your own comments');
    }

    // Delete comment and any replies
    await Promise.all([
      Comment.findByIdAndDelete(commentId),
      Comment.deleteMany({ parentComment: commentId }),
    ]);

    return true;
  }
}

module.exports = new CommentService();
