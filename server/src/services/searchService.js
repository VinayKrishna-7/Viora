const Video = require('../models/Video');
const User = require('../models/User');
const youtubeService = require('./youtubeService');

class SearchService {
  /**
   * Search videos across title, description, tags, and channel username (Local DB)
   */
  async searchVideos({
    q = '',
    category,
    sortBy = 'relevance',
    page = 1,
    limit = 15,
  }) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 15));
    const skip = (pageNum - 1) * limitNum;

    const query = { visibility: 'public' };

    // Filter by category if specified
    if (category && category !== 'All') {
      query.category = category;
    }

    const trimmedQ = (q || '').trim();

    if (trimmedQ) {
      // Find channels matching the search query to include their videos
      const matchingChannels = await User.find({
        username: { $regex: trimmedQ, $options: 'i' },
      }).select('_id');
      const channelIds = matchingChannels.map((c) => c._id);

      // Search across title, description, tags, and matching channels
      query.$or = [
        { title: { $regex: trimmedQ, $options: 'i' } },
        { description: { $regex: trimmedQ, $options: 'i' } },
        { tags: { $in: [new RegExp(trimmedQ, 'i')] } },
      ];

      if (channelIds.length > 0) {
        query.$or.push({ owner: { $in: channelIds } });
      }
    }

    // Sort order
    let sortOptions = { createdAt: -1 };
    if (sortBy === 'views' || sortBy === 'viewCount') {
      sortOptions = { views: -1, createdAt: -1 };
    } else if (sortBy === 'uploadDate' || sortBy === 'newest') {
      sortOptions = { createdAt: -1 };
    } else if (sortBy === 'oldest') {
      sortOptions = { createdAt: 1 };
    } else if (sortBy === 'relevance' && trimmedQ) {
      // Prioritize views and recency for relevance
      sortOptions = { views: -1, createdAt: -1 };
    }

    const [videos, total] = await Promise.all([
      Video.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .populate('owner', 'username avatar subscribersCount')
        .lean(),
      Video.countDocuments(query),
    ]);

    // Tag videos with source: 'local'
    const taggedVideos = videos.map((v) => ({ ...v, source: 'local' }));
    const totalPages = Math.ceil(total / limitNum);

    return {
      videos: taggedVideos,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
      query: trimmedQ,
    };
  }

  /**
   * Hybrid Search: Orchestrates concurrent query against Viora MongoDB and YouTube Data API v3
   */
  async hybridSearch({
    q = '',
    category,
    sortBy = 'relevance',
    page = 1,
    limit = 15,
    source = 'all',
    pageToken = '',
  }) {
    const trimmedQ = (q || '').trim();

    // If source is strictly local
    if (source === 'local') {
      const localResult = await this.searchVideos({
        q: trimmedQ,
        category,
        sortBy,
        page,
        limit,
      });

      return {
        local: localResult.videos,
        youtube: [],
        combined: localResult.videos,
        totalResults: localResult.pagination.total,
        pagination: localResult.pagination,
        sources: { local: true, youtube: false },
        warning: null,
        query: trimmedQ,
      };
    }

    // If source is strictly YouTube
    if (source === 'youtube') {
      const ytResult = await youtubeService.searchYouTube({
        query: trimmedQ,
        category,
        sortBy,
        limit,
        pageToken,
      });

      const pageNum = parseInt(page, 10) || 1;
      const limitNum = parseInt(limit, 10) || 15;

      return {
        local: [],
        youtube: ytResult.videos,
        combined: ytResult.videos,
        totalResults: ytResult.totalResults,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: ytResult.totalResults,
          nextPageToken: ytResult.nextPageToken,
          prevPageToken: ytResult.prevPageToken,
        },
        sources: { local: false, youtube: ytResult.available },
        warning: ytResult.warning || null,
        query: trimmedQ,
      };
    }

    // Source is 'all': Query MongoDB and YouTube in parallel
    const [localOutcome, ytOutcome] = await Promise.allSettled([
      this.searchVideos({
        q: trimmedQ,
        category,
        sortBy,
        page,
        limit,
      }),
      youtubeService.searchYouTube({
        query: trimmedQ,
        category,
        sortBy,
        limit,
        pageToken,
      }),
    ]);

    const localResult =
      localOutcome.status === 'fulfilled'
        ? localOutcome.value
        : { videos: [], pagination: { total: 0 } };

    const ytResult =
      ytOutcome.status === 'fulfilled'
        ? ytOutcome.value
        : {
            videos: [],
            totalResults: 0,
            available: false,
            warning: 'YouTube search request failed.',
          };

    const localVideos = localResult.videos || [];
    const ytVideos = ytResult.videos || [];

    // Combine results: native Viora originals first, followed by YouTube discovery
    const combined = [...localVideos, ...ytVideos];
    const totalCount = (localResult.pagination?.total || 0) + (ytResult.totalResults || 0);

    return {
      local: localVideos,
      youtube: ytVideos,
      combined,
      totalResults: totalCount,
      pagination: {
        page: localResult.pagination?.page || 1,
        limit: localResult.pagination?.limit || limit,
        totalLocal: localResult.pagination?.total || 0,
        totalYouTube: ytResult.totalResults || 0,
        hasNextPage: localResult.pagination?.hasNextPage || Boolean(ytResult.nextPageToken),
        nextPageToken: ytResult.nextPageToken || null,
      },
      sources: {
        local: localOutcome.status === 'fulfilled',
        youtube: ytResult.available,
      },
      warning: ytResult.warning || null,
      query: trimmedQ,
    };
  }
}

module.exports = new SearchService();

