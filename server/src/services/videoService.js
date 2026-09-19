const Video = require('../models/Video');
const User = require('../models/User');
const mediaService = require('./media/MediaService');
const ApiError = require('../utils/ApiError');

class VideoService {
  /**
   * Upload video and thumbnail, create database record
   */
  async createVideo(body, files, ownerId) {
    const { title, description, category, visibility, tags, isShort, chapters, subtitles } = body;

    const videoFile = files.video[0];
    const thumbnailFile = files.thumbnail[0];

    // Upload via MediaService abstraction (Cloudinary or local storage)
    const videoUpload = await mediaService.uploadVideo(videoFile);
    const thumbnailUpload = await mediaService.uploadImage(thumbnailFile);

    // Parse tags array
    let parsedTags = [];
    if (tags) {
      if (Array.isArray(tags)) {
        parsedTags = tags.map((t) => t.trim().toLowerCase());
      } else if (typeof tags === 'string') {
        parsedTags = tags
          .split(',')
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean);
      }
    }

    // Parse chapters if provided
    let parsedChapters = [];
    if (chapters) {
      try {
        parsedChapters = typeof chapters === 'string' ? JSON.parse(chapters) : chapters;
      } catch (e) {
        parsedChapters = [];
      }
    }

    // Parse subtitles if provided
    let parsedSubtitles = [];
    if (subtitles) {
      try {
        parsedSubtitles = typeof subtitles === 'string' ? JSON.parse(subtitles) : subtitles;
      } catch (e) {
        parsedSubtitles = [];
      }
    }

    const video = await Video.create({
      title: title.trim(),
      description: description ? description.trim() : '',
      videoUrl: videoUpload.url,
      publicId: videoUpload.publicId,
      videoPublicId: videoUpload.publicId,
      thumbnailUrl: thumbnailUpload.url,
      thumbnailPublicId: thumbnailUpload.publicId,
      owner: ownerId,
      category: category || 'All',
      duration: videoUpload.duration || 0,
      visibility: visibility || 'public',
      tags: parsedTags,
      isShort: Boolean(isShort === 'true' || isShort === true),
      chapters: parsedChapters,
      subtitles: parsedSubtitles,
      processingStatus: 'ready',
    });

    return await video.populate('owner', 'username avatar subscribersCount');
  }

  /**
   * Get paginated videos with filtering and sorting
   */
  async getAllVideos({
    page = 1,
    limit = 12,
    category,
    search,
    sortBy = 'newest',
    ownerId,
    visibility,
  }) {
    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const limitNumber = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
    const skip = (pageNumber - 1) * limitNumber;

    const query = {};

    // Visibility filter: Default to public unless specifically requested
    if (visibility) {
      query.visibility = visibility;
    } else if (!ownerId) {
      query.visibility = 'public';
    }

    if (ownerId) {
      query.owner = ownerId;
    }

    // Category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // Search query filter
    if (search && search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { tags: { $in: [new RegExp(search.trim(), 'i')] } },
      ];
    }

    // Sorting options
    let sortOptions = { createdAt: -1 };
    if (sortBy === 'popular' || sortBy === 'views') {
      sortOptions = { views: -1, createdAt: -1 };
    } else if (sortBy === 'oldest') {
      sortOptions = { createdAt: 1 };
    }

    const [videos, total] = await Promise.all([
      Video.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNumber)
        .populate('owner', 'username avatar subscribersCount')
        .lean(),
      Video.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limitNumber);

    return {
      videos,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages,
        hasNextPage: pageNumber < totalPages,
        hasPrevPage: pageNumber > 1,
      },
    };
  }

  /**
   * Get single video by ID and verify visibility authorization
   */
  async getVideoById(videoId, currentUserId = null) {
    const video = await Video.findById(videoId).populate(
      'owner',
      'username avatar banner subscribersCount description'
    );

    if (!video) {
      throw new ApiError(404, 'Video not found');
    }

    // If private, only owner can view
    if (
      video.visibility === 'private' &&
      (!currentUserId || video.owner._id.toString() !== currentUserId.toString())
    ) {
      throw new ApiError(403, 'This video is private');
    }

    return video;
  }

  /**
   * Increment views safely
   */
  async incrementViews(videoId) {
    const video = await Video.findByIdAndUpdate(
      videoId,
      { $inc: { views: 1 } },
      { new: true }
    ).select('views');

    if (!video) {
      throw new ApiError(404, 'Video not found');
    }

    return video.views;
  }

  /**
   * Get videos by channel username
   */
  async getVideosByChannel(username, { page = 1, limit = 12 }, isOwner = false) {
    const channelUser = await User.findOne({ username: username.toLowerCase().trim() });
    if (!channelUser) {
      throw new ApiError(404, 'Channel not found');
    }

    const query = { owner: channelUser._id };
    if (!isOwner) {
      query.visibility = 'public';
    }

    return await this.getAllVideos({
      page,
      limit,
      ownerId: channelUser._id,
      visibility: !isOwner ? 'public' : undefined,
    });
  }

  /**
   * Update video details and optionally replace thumbnail
   */
  async updateVideo(videoId, userId, updates, newThumbnailFile) {
    const video = await Video.findById(videoId);
    if (!video) {
      throw new ApiError(404, 'Video not found');
    }

    // Ownership check
    if (video.owner.toString() !== userId.toString()) {
      throw new ApiError(403, 'You are not authorized to edit this video');
    }

    const { title, description, category, visibility, tags } = updates;

    if (title) video.title = title.trim();
    if (description !== undefined) video.description = description.trim();
    if (category) video.category = category;
    if (visibility) video.visibility = visibility;

    if (tags) {
      if (Array.isArray(tags)) {
        video.tags = tags.map((t) => t.trim().toLowerCase());
      } else if (typeof tags === 'string') {
        video.tags = tags
          .split(',')
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean);
      }
    }

    // If new thumbnail is uploaded, upload new and delete old
    if (newThumbnailFile) {
      const thumbnailUpload = await mediaService.uploadImage(newThumbnailFile);

      if (video.thumbnailPublicId) {
        await mediaService.deleteMedia(video.thumbnailPublicId, 'image');
      }

      video.thumbnailUrl = thumbnailUpload.url;
      video.thumbnailPublicId = thumbnailUpload.publicId;
    }

    await video.save();
    return await video.populate('owner', 'username avatar subscribersCount');
  }

  /**
   * Delete video and its media assets
   */
  async deleteVideo(videoId, userId, isAdmin = false) {
    const video = await Video.findById(videoId);
    if (!video) {
      throw new ApiError(404, 'Video not found');
    }

    // Authorization check (owner or admin)
    if (!isAdmin && video.owner.toString() !== userId.toString()) {
      throw new ApiError(403, 'You are not authorized to delete this video');
    }

    // Delete assets
    const vId = video.videoPublicId || video.publicId;
    if (vId) {
      await mediaService.deleteMedia(vId, 'video');
    }
    if (video.thumbnailPublicId) {
      await mediaService.deleteMedia(video.thumbnailPublicId, 'image');
    }

    await Video.findByIdAndDelete(videoId);
    return true;
  }
}

module.exports = new VideoService();
