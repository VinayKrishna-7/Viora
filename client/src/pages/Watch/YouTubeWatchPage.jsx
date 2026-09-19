import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Youtube, 
  ExternalLink, 
  Share2, 
  ThumbsUp, 
  ThumbsDown,
  Music2, 
  ArrowLeft, 
  Calendar, 
  Eye, 
  AlertCircle,
  Sparkles
} from 'lucide-react';
import YouTubeEmbedPlayer from '../../components/video/YouTubeEmbedPlayer';
import ShareModal from '../../components/video/ShareModal';
import Button from '../../components/ui/Button';
import { 
  getYouTubeVideoDetailsApi, 
  getRelatedYouTubeVideosApi 
} from '../../services/youtubeService';
import { formatViews, formatDateAgo, formatDuration } from '../../utils/formatters';

export const YouTubeWatchPage = () => {
  const { videoId } = useParams();
  const cleanId = (videoId || '').replace(/^yt_/, '');

  const [video, setVideo] = useState(null);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!cleanId) return;

    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const detailsRes = await getYouTubeVideoDetailsApi(cleanId);
        if (detailsRes?.data) {
          setVideo(detailsRes.data);
          setLikesCount(detailsRes.data.likesCount || 0);
        }

        // Fetch related videos in background
        getRelatedYouTubeVideosApi(cleanId)
          .then((res) => {
            if (res?.data) {
              setRelatedVideos(res.data);
            }
          })
          .catch((err) => console.warn('Related YouTube videos warning:', err));
      } catch (err) {
        console.error('Failed to load YouTube video details:', err);
        // Even if metadata API fails, we still allow iframe playback
        setVideo({
          _id: `yt_${cleanId}`,
          id: cleanId,
          videoId: cleanId,
          source: 'youtube',
          title: `YouTube Video (${cleanId})`,
          description: 'Official playback via YouTube Embedded Player.',
          views: 0,
          likesCount: 0,
          createdAt: new Date().toISOString(),
          owner: {
            username: 'YouTube Creator',
          },
          externalUrl: `https://www.youtube.com/watch?v=${cleanId}`,
        });
        setLikesCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [cleanId]);

  const handleToggleLike = () => {
    if (isLiked) {
      setIsLiked(false);
      setLikesCount((prev) => Math.max(0, prev - 1));
    } else {
      setIsLiked(true);
      setLikesCount((prev) => prev + 1);
      if (isDisliked) setIsDisliked(false);
    }
  };

  const handleToggleDislike = () => {
    if (isDisliked) {
      setIsDisliked(false);
    } else {
      setIsDisliked(true);
      if (isLiked) {
        setIsLiked(false);
        setLikesCount((prev) => Math.max(0, prev - 1));
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 pb-16">
      {/* Back button */}
      <div className="mb-4">
        <Link
          to="/search"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-xl bg-viora-card border border-viora-border hover:border-indigo-500/30"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Search</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Column (2/3): Player & Details */}
        <div className="lg:col-span-2 space-y-4">
          {/* Responsive YouTube Embed Player */}
          <div className="rounded-2xl overflow-hidden border border-viora-border shadow-2xl bg-black">
            <YouTubeEmbedPlayer
              videoId={cleanId}
              title={video?.title || 'YouTube Video'}
            />
          </div>

          {/* Video Title */}
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 leading-tight tracking-tight">
            {video?.title || 'YouTube Video'}
          </h1>

          {/* Channel Info & Actions Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-viora-border">
            {/* Channel info */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-sm">
                <Youtube className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm text-slate-100">
                  {video?.owner?.username || video?.owner?.channelTitle || 'YouTube Creator'}
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                  <span className="text-rose-400">YouTube Partner</span>
                  {video?.category === 'Music' && (
                    <span className="flex items-center gap-1 text-cyan-400">
                      • <Music2 className="w-3 h-3 inline" /> Music Stream
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Like / Dislike Pill */}
              <div className="flex items-center rounded-xl bg-viora-card border border-viora-border overflow-hidden text-xs font-semibold">
                <button
                  onClick={handleToggleLike}
                  className={`flex items-center gap-1.5 px-3.5 py-2 hover:bg-white/5 transition-colors border-r border-viora-border ${
                    isLiked
                      ? 'text-indigo-400 font-bold bg-indigo-500/10'
                      : 'text-slate-300'
                  }`}
                  title="Like"
                >
                  <ThumbsUp className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
                  <span>{formatViews(likesCount)}</span>
                </button>
                <button
                  onClick={handleToggleDislike}
                  className={`px-3.5 py-2 hover:bg-white/5 transition-colors ${
                    isDisliked
                      ? 'text-indigo-400 bg-indigo-500/10'
                      : 'text-slate-300'
                  }`}
                  title="Dislike"
                >
                  <ThumbsDown className={`w-3.5 h-3.5 ${isDisliked ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Share button */}
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-viora-card hover:bg-white/5 text-slate-300 hover:text-white border border-viora-border text-xs font-semibold transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>

              {/* External YouTube link button */}
              <a
                href={video?.externalUrl || `https://www.youtube.com/watch?v=${cleanId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-all shadow-sm"
              >
                <Youtube className="w-4 h-4" />
                <span>Watch on YouTube</span>
                <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
              </a>
            </div>
          </div>

          {/* Description & Metadata Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-viora-card border border-viora-border space-y-3">
            <div className="flex items-center gap-3 text-xs font-semibold text-slate-300 flex-wrap">
              {video?.views > 0 && (
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-indigo-400" />
                  {formatViews(video.views)} views
                </span>
              )}
              {video?.createdAt && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {formatDateAgo(video.createdAt)}
                </span>
              )}
              {video?.likesCount > 0 && (
                <span className="flex items-center gap-1 text-slate-400">
                  <ThumbsUp className="w-3.5 h-3.5 text-indigo-400" />
                  {formatViews(video.likesCount)} likes
                </span>
              )}
            </div>

            {/* Description content */}
            {video?.description ? (
              <div>
                <p className={`text-xs sm:text-sm text-slate-300 whitespace-pre-line leading-relaxed ${
                  isDescExpanded ? '' : 'line-clamp-3'
                }`}>
                  {video.description}
                </p>
                {video.description.length > 180 && (
                  <button
                    onClick={() => setIsDescExpanded(!isDescExpanded)}
                    className="mt-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300 block transition-colors"
                  >
                    {isDescExpanded ? 'Show less' : 'Show more'}
                  </button>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400">
                Official YouTube stream playback.
              </p>
            )}

            {/* Tags */}
            {video?.tags && video.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {video.tags.slice(0, 10).map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-medium text-indigo-400"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1/3): Related YouTube Videos */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <h3 className="font-bold text-base text-slate-100">
              Related Global Releases
            </h3>
          </div>

          <div className="space-y-3">
            {relatedVideos.length === 0 ? (
              <div className="p-6 rounded-2xl bg-viora-card border border-viora-border text-center">
                <p className="text-xs text-slate-400">
                  Search more videos to discover additional content.
                </p>
                <Link
                  to="/search?category=Music"
                  className="mt-3 inline-block text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                >
                  Explore Music & Songs →
                </Link>
              </div>
            ) : (
              relatedVideos.map((item) => (
                <Link
                  key={item._id || item.id}
                  to={`/watch/youtube/${item.id || item.videoId}`}
                  className="flex gap-3 group cursor-pointer p-2 rounded-xl bg-viora-card/40 hover:bg-viora-card border border-viora-border hover:border-indigo-500/30 transition-all duration-200"
                >
                  {/* Thumbnail */}
                  <div className="relative w-36 sm:w-40 aspect-video rounded-lg overflow-hidden bg-viora-surface shrink-0 border border-viora-border/60">
                    <img
                      src={item.thumbnailUrl}
                      alt={item.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {item.duration > 0 && (
                      <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-semibold text-slate-200 font-mono">
                        {formatDuration(item.duration)}
                      </div>
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="text-xs font-semibold text-slate-100 line-clamp-2 leading-snug group-hover:text-indigo-400 transition-colors">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {item.owner?.username || item.channelTitle}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {formatViews(item.views)} • {formatDateAgo(item.createdAt)}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        videoId={cleanId}
        videoTitle={video?.title || 'YouTube Video'}
      />
    </div>
  );
};

export default YouTubeWatchPage;
