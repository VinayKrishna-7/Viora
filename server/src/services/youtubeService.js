/**
 * YouTube Service
 * Provides live, unrestricted YouTube search, metadata extraction, and streaming embeds.
 * Features:
 * - Live real-time search across ALL of YouTube (powered by yt-search engine).
 * - Optional official Google YouTube Data API v3 support when YOUTUBE_API_KEY is configured.
 * - In-memory TTL cache to deliver sub-10ms response times on repeat queries.
 * - ISO 8601 and seconds duration parsers.
 * - Fallback curated catalog for offline safety.
 */

const ytSearch = require('yt-search');

class SimpleTtlCache {
  constructor(defaultTtlSeconds = 900) {
    this.cache = new Map();
    this.defaultTtlMs = defaultTtlSeconds * 1000;
  }

  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.value;
  }

  set(key, value, ttlSeconds) {
    const ttlMs = (ttlSeconds ? ttlSeconds : 900) * 1000;
    if (this.cache.size > 1000) {
      const now = Date.now();
      for (const [k, v] of this.cache.entries()) {
        if (now > v.expiresAt) this.cache.delete(k);
      }
    }
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
  }

  clear() {
    this.cache.clear();
  }
}

const FALLBACK_YOUTUBE_CATALOG = [
  {
    id: 'k4yXQkG2s1E',
    title: 'Kesariya - Brahmāstra | Ranbir Kapoor, Alia Bhatt | Pritam, Arijit Singh, Amitabh B',
    description: 'Listen to Kesariya song from Brahmastra featuring Ranbir Kapoor & Alia Bhatt sung by Arijit Singh.',
    thumbnailUrl: 'https://i.ytimg.com/vi/k4yXQkG2s1E/hqdefault.jpg',
    duration: 268,
    views: 615000000,
    likesCount: 5200000,
    channelTitle: 'Sony Music India',
    channelId: 'UC56gTxNs4f9xZ7Pa2i5xNzg',
    publishedAt: '2022-07-17T07:30:08Z',
    category: 'Music',
    keywords: ['arijit singh', 'arijit', 'kesariya', 'songs', 'latest songs', 'music', 'bollywood'],
  },
  {
    id: 'JFcgOboQZ08',
    title: 'Tum Hi Ho | Aashiqui 2 | Arijit Singh | Mithoon | Aditya Roy Kapur, Shraddha Kapoor',
    description: 'Presenting the iconic romantic anthem Tum Hi Ho sung by Arijit Singh from Aashiqui 2.',
    thumbnailUrl: 'https://i.ytimg.com/vi/JFcgOboQZ08/hqdefault.jpg',
    duration: 262,
    views: 890000000,
    likesCount: 7100000,
    channelTitle: 'T-Series',
    channelId: 'UCq-Fj5jknLsUf-MWSy4_brA',
    publishedAt: '2013-04-03T10:30:00Z',
    category: 'Music',
    keywords: ['arijit singh', 'tum hi ho', 'songs', 'music', 'aashiqui', 'hindi songs'],
  },
  {
    id: 'e-ORhEE9VVg',
    title: 'Taylor Swift - Blank Space',
    description: 'Music video by Taylor Swift performing Blank Space.',
    thumbnailUrl: 'https://i.ytimg.com/vi/e-ORhEE9VVg/hqdefault.jpg',
    duration: 272,
    views: 3450000000,
    likesCount: 16000000,
    channelTitle: 'Taylor Swift',
    channelId: 'UCqECaJ8Gagnn7YCbPEzWH6g',
    publishedAt: '2014-11-10T15:00:00Z',
    category: 'Music',
    keywords: ['taylor swift', 'blank space', 'pop', 'songs', 'music'],
  },
  {
    id: '7CqJlxBYj-M',
    title: 'MERN Stack Crash Course Tutorial | Full Stack React, Node, Express, MongoDB',
    description: 'Learn the MERN stack from scratch in this comprehensive full stack course.',
    thumbnailUrl: 'https://i.ytimg.com/vi/7CqJlxBYj-M/hqdefault.jpg',
    duration: 9840,
    views: 1450000,
    likesCount: 45000,
    channelTitle: 'freeCodeCamp.org',
    channelId: 'UC8butISFwT-Wl7EV0hUK0BQ',
    publishedAt: '2023-04-10T14:00:00Z',
    category: 'Education',
    keywords: ['mern tutorial', 'mern', 'mern stack', 'programming', 'react', 'node', 'mongodb'],
  }
];

class YouTubeService {
  constructor() {
    const ttl = parseInt(process.env.YOUTUBE_CACHE_TTL, 10) || 900;
    this.cache = new SimpleTtlCache(ttl);
    this.baseUrl = 'https://www.googleapis.com/youtube/v3';
    this.defaultHeaders = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
    };
  }

  get apiKey() {
    return process.env.YOUTUBE_API_KEY ? process.env.YOUTUBE_API_KEY.trim() : '';
  }

  _parseDurationString(str) {
    if (!str) return 0;
    const parts = str.split(':').map(Number);
    if (parts.some(isNaN)) return 0;
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 1) return parts[0];
    return 0;
  }

  _parseViewCount(str) {
    if (!str) return 0;
    const cleaned = String(str).replace(/views?/i, '').trim();
    if (cleaned.endsWith('B')) return Math.round(parseFloat(cleaned) * 1e9);
    if (cleaned.endsWith('M')) return Math.round(parseFloat(cleaned) * 1e6);
    if (cleaned.endsWith('K')) return Math.round(parseFloat(cleaned) * 1e3);
    return parseInt(cleaned.replace(/,/g, ''), 10) || 0;
  }

  parseDuration(durationStr) {
    if (!durationStr) return 0;
    const match = durationStr.match(/P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?/);
    if (!match) return 0;

    const days = parseInt(match[1] || '0', 10);
    const hours = parseInt(match[2] || '0', 10);
    const minutes = parseInt(match[3] || '0', 10);
    const seconds = parseInt(match[4] || '0', 10);

    return days * 86400 + hours * 3600 + minutes * 60 + seconds;
  }

  isAvailable() {
    return true; // Live search is always available!
  }

  /**
   * Tier 1: Native YouTube Engine (Scrapes official public search endpoint)
   * High performance, unthrottled, zero API key quota restrictions.
   */
  async _nativeYouTubeSearch(query, category, limit = 15) {
    try {
      let q = query;
      if (category === 'Music' && !query.toLowerCase().includes('song') && !query.toLowerCase().includes('music')) {
        q = `${query} songs`;
      }

      const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
      const res = await fetch(url, { headers: this.defaultHeaders });
      if (!res.ok) throw new Error(`YouTube responded with HTTP ${res.status}`);

      const html = await res.text();
      const match = html.match(/ytInitialData\s*=\s*({.+?});<\/script>/);
      if (!match) return [];

      const data = JSON.parse(match[1]);
      const contents = data.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents || [];

      const videos = [];
      for (const section of contents) {
        const items = section.itemSectionRenderer?.contents || [];
        for (const item of items) {
          if (item.videoRenderer) {
            const vr = item.videoRenderer;
            const videoId = vr.videoId;
            if (!videoId) continue;

            const title =
              vr.title?.runs?.map((r) => r.text).join('') ||
              vr.title?.simpleText ||
              'YouTube Video';

            const description =
              vr.detailedMetadataSnippets?.[0]?.snippetText?.runs?.map((r) => r.text).join('') ||
              vr.descriptionSnippet?.runs?.map((r) => r.text).join('') ||
              '';

            const channelTitle =
              vr.ownerText?.runs?.map((r) => r.text).join('') ||
              vr.shortBylineText?.runs?.map((r) => r.text).join('') ||
              'YouTube Creator';

            const channelId =
              vr.ownerText?.runs?.[0]?.navigationEndpoint?.browseEndpoint?.browseId ||
              vr.shortBylineText?.runs?.[0]?.navigationEndpoint?.browseEndpoint?.browseId ||
              '';

            const rawViews =
              vr.viewCountText?.simpleText ||
              vr.viewCountText?.runs?.map((r) => r.text).join('') ||
              '0';

            const rawDuration =
              vr.lengthText?.simpleText ||
              vr.lengthText?.runs?.map((r) => r.text).join('') ||
              '0:00';

            const publishedAgo =
              vr.publishedTimeText?.simpleText ||
              vr.publishedTimeText?.runs?.map((r) => r.text).join('') ||
              'Recently';

            const thumbnail =
              vr.thumbnail?.thumbnails?.slice(-1)[0]?.url ||
              `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

            const durationSec = this._parseDurationString(rawDuration);

            videos.push({
              _id: `yt_${videoId}`,
              id: videoId,
              videoId: videoId,
              source: 'youtube',
              title,
              description,
              thumbnailUrl: thumbnail,
              duration: durationSec,
              views: this._parseViewCount(rawViews),
              likesCount: 0,
              createdAt: publishedAgo,
              publishedAt: publishedAgo,
              category: category || (durationSec && durationSec < 360 ? 'Music' : 'YouTube'),
              owner: {
                _id: channelId || channelTitle,
                username: channelTitle,
                channelTitle,
                channelId,
                avatar: null,
              },
              embedUrl: `https://www.youtube.com/embed/${videoId}`,
              watchUrl: `/watch/youtube/${videoId}`,
              externalUrl: `https://www.youtube.com/watch?v=${videoId}`,
            });

            if (videos.length >= limit) break;
          }
        }
        if (videos.length >= limit) break;
      }

      return videos;
    } catch (err) {
      console.warn(`[YouTube Native Search Warning] ${err.message}`);
      return [];
    }
  }

  /**
   * Tier 2: yt-search package engine
   */
  async _ytSearchFallback(query, category, limit = 15) {
    try {
      const res = await ytSearch(query);
      const rawVideos = res?.videos || [];

      return rawVideos.slice(0, limit).map((v) => ({
        _id: `yt_${v.videoId}`,
        id: v.videoId,
        videoId: v.videoId,
        source: 'youtube',
        title: String(v.title || 'YouTube Video'),
        description: v.description || '',
        thumbnailUrl: v.thumbnail || v.image || `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`,
        duration: v.seconds || 0,
        views: v.views || 0,
        likesCount: 0,
        createdAt: v.ago ? v.ago : new Date().toISOString(),
        publishedAt: v.ago ? v.ago : new Date().toISOString(),
        category: category || (v.seconds && v.seconds < 360 ? 'Music' : 'YouTube'),
        owner: {
          _id: v.author?.url ? v.author.url.split('/').pop() : v.author?.name,
          username: v.author?.name || 'YouTube Creator',
          channelTitle: v.author?.name || 'YouTube Creator',
          channelId: v.author?.url || '',
          avatar: null,
        },
        embedUrl: `https://www.youtube.com/embed/${v.videoId}`,
        watchUrl: `/watch/youtube/${v.videoId}`,
        externalUrl: v.url || `https://www.youtube.com/watch?v=${v.videoId}`,
      }));
    } catch (err) {
      console.warn(`[YouTube yt-search Warning] ${err.message}`);
      return [];
    }
  }

  /**
   * Tier 3: Official Google YouTube Data API v3
   */
  async _searchViaOfficialApi({ query, category, sortBy, limit = 15, pageToken = '' }) {
    let order = 'relevance';
    if (sortBy === 'views' || sortBy === 'viewCount') order = 'viewCount';
    if (sortBy === 'uploadDate' || sortBy === 'newest') order = 'date';

    let q = query;
    if (category === 'Music' && !query.toLowerCase().includes('song') && !query.toLowerCase().includes('music')) {
      q = `${query} songs`;
    }

    const params = new URLSearchParams({
      part: 'snippet',
      maxResults: String(Math.min(limit, 50)),
      q,
      type: 'video',
      order,
      key: this.apiKey,
    });

    if (pageToken) params.append('pageToken', pageToken);

    const searchUrl = `${this.baseUrl}/search?${params.toString()}`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();

    if (searchData.error) {
      throw new Error(searchData.error.message || 'YouTube API error');
    }

    const items = searchData.items || [];
    const videoIds = items.map((item) => item.id?.videoId).filter(Boolean);

    let durationsMap = {};
    let viewsMap = {};

    if (videoIds.length > 0) {
      try {
        const vidParams = new URLSearchParams({
          part: 'contentDetails,statistics',
          id: videoIds.join(','),
          key: this.apiKey,
        });
        const vidRes = await fetch(`${this.baseUrl}/videos?${vidParams.toString()}`);
        const vidData = await vidRes.json();
        if (vidData.items) {
          vidData.items.forEach((item) => {
            durationsMap[item.id] = this.parseDuration(item.contentDetails?.duration);
            viewsMap[item.id] = parseInt(item.statistics?.viewCount || '0', 10);
          });
        }
      } catch (err) {
        console.warn(`[YouTube Details Enrichment Warning] ${err.message}`);
      }
    }

    const videos = items.map((item) => {
      const vidId = item.id?.videoId;
      const snippet = item.snippet || {};
      return {
        _id: `yt_${vidId}`,
        id: vidId,
        videoId: vidId,
        source: 'youtube',
        title: snippet.title || 'Untitled',
        description: snippet.description || '',
        thumbnailUrl:
          snippet.thumbnails?.high?.url ||
          snippet.thumbnails?.medium?.url ||
          `https://i.ytimg.com/vi/${vidId}/hqdefault.jpg`,
        duration: durationsMap[vidId] || 0,
        views: viewsMap[vidId] || 0,
        likesCount: 0,
        createdAt: snippet.publishedAt || new Date().toISOString(),
        publishedAt: snippet.publishedAt || new Date().toISOString(),
        category: category || 'Music',
        owner: {
          _id: snippet.channelId,
          username: snippet.channelTitle || 'YouTube Creator',
          channelTitle: snippet.channelTitle || 'YouTube Creator',
          channelId: snippet.channelId,
          avatar: null,
        },
        embedUrl: `https://www.youtube.com/embed/${vidId}`,
        watchUrl: `/watch/youtube/${vidId}`,
        externalUrl: `https://www.youtube.com/watch?v=${vidId}`,
      };
    });

    return {
      videos,
      totalResults: searchData.pageInfo?.totalResults || videos.length,
      nextPageToken: searchData.nextPageToken || null,
      prevPageToken: searchData.prevPageToken || null,
      available: true,
      sourceType: 'official_api',
    };
  }

  /**
   * Search YouTube for videos and music (Multi-Tier Architecture)
   */
  async searchYouTube({
    query = '',
    category,
    sortBy = 'relevance',
    limit = 15,
    pageToken = '',
  }) {
    const trimmedQ = (query || '').trim();

    if (!trimmedQ) {
      return this.searchYouTube({ query: 'trending songs', category: 'Music', limit });
    }

    const cacheKey = `yt_search:${trimmedQ}:${category || 'all'}:${sortBy}:${limit}:${pageToken}`;
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // 1. Primary Engine: Native YouTube live query
    const nativeVideos = await this._nativeYouTubeSearch(trimmedQ, category, limit);
    if (nativeVideos.length > 0) {
      const result = {
        videos: nativeVideos,
        totalResults: nativeVideos.length,
        nextPageToken: null,
        prevPageToken: null,
        available: true,
        sourceType: 'native_youtube',
      };
      this.cache.set(cacheKey, result);
      return result;
    }

    // 2. Secondary Engine: yt-search package
    const ytSearchVideos = await this._ytSearchFallback(trimmedQ, category, limit);
    if (ytSearchVideos.length > 0) {
      const result = {
        videos: ytSearchVideos,
        totalResults: ytSearchVideos.length,
        nextPageToken: null,
        prevPageToken: null,
        available: true,
        sourceType: 'yt_search',
      };
      this.cache.set(cacheKey, result);
      return result;
    }

    // 3. Tertiary Engine: Official Google API (if API Key provided)
    if (this.apiKey) {
      try {
        const res = await this._searchViaOfficialApi({ query: trimmedQ, category, sortBy, limit, pageToken });
        if (res && res.videos && res.videos.length > 0) {
          this.cache.set(cacheKey, res);
          return res;
        }
      } catch (err) {
        console.warn(`[YouTube Official API Warning] ${err.message}`);
      }
    }

    // 4. Safe Fallback: Curated catalog
    const fallbackVideos = this._matchFallback(trimmedQ, category, limit);
    const result = {
      videos: fallbackVideos,
      totalResults: fallbackVideos.length,
      nextPageToken: null,
      prevPageToken: null,
      available: fallbackVideos.length > 0,
      sourceType: 'catalog_fallback',
    };
    this.cache.set(cacheKey, result);
    return result;
  }

  _matchFallback(query, category, limit = 15) {
    const qLower = (query || '').toLowerCase().trim();
    const catLower = (category || '').toLowerCase().trim();

    let matched = FALLBACK_YOUTUBE_CATALOG.filter((item) => {
      if (catLower && catLower !== 'all' && item.category.toLowerCase() === catLower) return true;
      if (!qLower) return true;
      if (item.title.toLowerCase().includes(qLower)) return true;
      if (item.channelTitle.toLowerCase().includes(qLower)) return true;
      if (item.keywords.some((kw) => kw.includes(qLower) || qLower.includes(kw))) return true;
      return false;
    });

    if (matched.length === 0) matched = FALLBACK_YOUTUBE_CATALOG;
    return matched.slice(0, limit).map((item) => ({
      _id: `yt_${item.id}`,
      id: item.id,
      videoId: item.id,
      source: 'youtube',
      title: item.title,
      description: item.description,
      thumbnailUrl: item.thumbnailUrl,
      duration: item.duration,
      views: item.views,
      likesCount: item.likesCount,
      createdAt: item.publishedAt,
      publishedAt: item.publishedAt,
      category: item.category,
      owner: {
        _id: item.channelId,
        username: item.channelTitle,
        channelTitle: item.channelTitle,
        channelId: item.channelId,
        avatar: null,
      },
      embedUrl: `https://www.youtube.com/embed/${item.id}`,
      watchUrl: `/watch/youtube/${item.id}`,
      externalUrl: `https://www.youtube.com/watch?v=${item.id}`,
    }));
  }

  /**
   * Native YouTube Video Details Extractor
   */
  async _nativeYouTubeDetails(videoId) {
    try {
      const url = `https://www.youtube.com/watch?v=${videoId}`;
      const res = await fetch(url, { headers: this.defaultHeaders });
      if (!res.ok) return null;

      const html = await res.text();
      const match = html.match(/ytInitialPlayerResponse\s*=\s*({.+?});(?:var|<\/script>)/);
      if (!match) return null;

      const data = JSON.parse(match[1]);
      const details = data.videoDetails;
      if (!details || !details.title) return null;

      const duration = parseInt(details.lengthSeconds || '0', 10);
      const views = parseInt(details.viewCount || '0', 10);

      return {
        _id: `yt_${videoId}`,
        id: videoId,
        videoId: videoId,
        source: 'youtube',
        title: details.title,
        description: details.shortDescription || '',
        thumbnailUrl:
          details.thumbnail?.thumbnails?.slice(-1)[0]?.url ||
          `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        duration,
        views,
        likesCount: 0,
        createdAt: new Date().toISOString(),
        publishedAt: new Date().toISOString(),
        category: 'YouTube',
        owner: {
          _id: details.channelId || details.author,
          username: details.author || 'YouTube Creator',
          channelTitle: details.author || 'YouTube Creator',
          channelId: details.channelId || '',
          avatar: null,
        },
        embedUrl: `https://www.youtube.com/embed/${videoId}`,
        watchUrl: `/watch/youtube/${videoId}`,
        externalUrl: `https://www.youtube.com/watch?v=${videoId}`,
        tags: details.keywords || [],
      };
    } catch (err) {
      console.warn(`[YouTube Native Details Warning] ${err.message}`);
      return null;
    }
  }

  /**
   * Fetch single YouTube video details by ID
   */
  async getVideoDetails(videoId) {
    if (!videoId) return null;
    const cleanId = videoId.replace(/^yt_/, '');

    const cacheKey = `yt_detail:${cleanId}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    // 1. Try Native YouTube Video Details
    const nativeDetail = await this._nativeYouTubeDetails(cleanId);
    if (nativeDetail) {
      this.cache.set(cacheKey, nativeDetail);
      return nativeDetail;
    }

    // 2. Try yt-search
    try {
      const v = await ytSearch({ videoId: cleanId });
      if (v && v.title) {
        const video = {
          _id: `yt_${cleanId}`,
          id: cleanId,
          videoId: cleanId,
          source: 'youtube',
          title: String(v.title),
          description: v.description || '',
          thumbnailUrl: v.thumbnail || v.image || `https://i.ytimg.com/vi/${cleanId}/hqdefault.jpg`,
          duration: v.seconds || 0,
          views: v.views || 0,
          likesCount: 0,
          createdAt: v.uploadDate || v.ago || new Date().toISOString(),
          publishedAt: v.uploadDate || v.ago || new Date().toISOString(),
          category: 'YouTube',
          owner: {
            _id: v.author?.url ? v.author.url.split('/').pop() : v.author?.name,
            username: v.author?.name || 'YouTube Creator',
            channelTitle: v.author?.name || 'YouTube Creator',
            channelId: v.author?.url || '',
            avatar: null,
          },
          embedUrl: `https://www.youtube.com/embed/${cleanId}`,
          watchUrl: `/watch/youtube/${cleanId}`,
          externalUrl: v.url || `https://www.youtube.com/watch?v=${cleanId}`,
          tags: [],
        };
        this.cache.set(cacheKey, video);
        return video;
      }
    } catch (err) {
      console.warn(`[YouTube yt-search Details Warning] ${err.message}`);
    }

    // 3. Check curated catalog
    const catalogItem = FALLBACK_YOUTUBE_CATALOG.find((item) => item.id === cleanId);
    if (catalogItem) {
      const video = {
        _id: `yt_${cleanId}`,
        id: cleanId,
        videoId: cleanId,
        source: 'youtube',
        title: catalogItem.title,
        description: catalogItem.description,
        thumbnailUrl: catalogItem.thumbnailUrl,
        duration: catalogItem.duration,
        views: catalogItem.views,
        likesCount: catalogItem.likesCount,
        createdAt: catalogItem.publishedAt,
        publishedAt: catalogItem.publishedAt,
        category: catalogItem.category,
        owner: {
          _id: catalogItem.channelId,
          username: catalogItem.channelTitle,
          channelTitle: catalogItem.channelTitle,
          channelId: catalogItem.channelId,
          avatar: null,
        },
        embedUrl: `https://www.youtube.com/embed/${cleanId}`,
        watchUrl: `/watch/youtube/${cleanId}`,
        externalUrl: `https://www.youtube.com/watch?v=${cleanId}`,
        tags: catalogItem.keywords || [],
      };
      this.cache.set(cacheKey, video);
      return video;
    }

    // 4. Generic Fallback
    return {
      _id: `yt_${cleanId}`,
      id: cleanId,
      videoId: cleanId,
      source: 'youtube',
      title: `YouTube Video (${cleanId})`,
      description: 'Official playback via YouTube Embedded Player.',
      thumbnailUrl: `https://i.ytimg.com/vi/${cleanId}/hqdefault.jpg`,
      duration: 0,
      views: 0,
      likesCount: 0,
      createdAt: new Date().toISOString(),
      owner: {
        _id: '',
        username: 'YouTube Creator',
        channelTitle: 'YouTube Creator',
        channelId: '',
        avatar: null,
      },
      embedUrl: `https://www.youtube.com/embed/${cleanId}`,
      watchUrl: `/watch/youtube/${cleanId}`,
      externalUrl: `https://www.youtube.com/watch?v=${cleanId}`,
      tags: [],
    };
  }

  /**
   * Fetch related YouTube videos
   */
  async getRelatedVideos(videoId, limit = 10) {
    if (!videoId) return [];
    const cleanId = videoId.replace(/^yt_/, '');

    const cacheKey = `yt_related:${cleanId}:${limit}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const currentVideo = await this.getVideoDetails(cleanId);
    const searchKeywords = currentVideo?.title || currentVideo?.owner?.username || 'trending music';

    const searchRes = await this.searchYouTube({
      query: searchKeywords,
      limit: limit + 4,
    });

    const related = (searchRes.videos || []).filter((v) => v.id !== cleanId).slice(0, limit);
    this.cache.set(cacheKey, related);
    return related;
  }
}

module.exports = new YouTubeService();

