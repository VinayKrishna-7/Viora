import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  ThumbsUp, 
  ThumbsDown, 
  Share2, 
  Bookmark, 
  AlertCircle,
  Flag,
  ListVideo,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import VideoPlayer from '../../components/video/VideoPlayer';
import CommentSection from '../../components/comments/CommentSection';
import SubscribeButton from '../../components/channel/SubscribeButton';
import SavePlaylistModal from '../../components/video/SavePlaylistModal';
import ShareModal from '../../components/video/ShareModal';
import ReportModal from '../../components/common/ReportModal';
import Button from '../../components/ui/Button';
import { 
  getVideoByIdApi, 
  incrementViewsApi, 
  getRecommendationsApi 
} from '../../services/videoService';
import { toggleVideoLikeApi, getVideoInteractionStatusApi } from '../../services/interactionService';
import { addToHistoryApi } from '../../services/historyService';
import { getProgressApi } from '../../services/progressService';
import { formatViews, formatDateAgo, formatDuration } from '../../utils/formatters';

export const WatchPage = () => {
  const { videoId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [video, setVideo] = useState(null);
  const [recommendedVideos, setRecommendedVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialTime, setInitialTime] = useState(0);

  // Like / Dislike State
  const [interaction, setInteraction] = useState({
    userInteraction: null,
    likesCount: 0,
    dislikesCount: 0,
  });
  const [isLiking, setIsLiking] = useState(false);

  // Modals State
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Description & Chapters Expansion
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  // Guard to ensure view count increments only ONCE per video view session
  const viewedVideosRef = useRef(new Set());

  useEffect(() => {
    if (!videoId) return;

    const fetchVideoDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch video details
        const videoRes = await getVideoByIdApi(videoId);
        const currentVid = videoRes.data;
        setVideo(currentVid);

        setInteraction({
          userInteraction: null,
          likesCount: currentVid.likesCount || 0,
          dislikesCount: currentVid.dislikesCount || 0,
        });

        // Determine starting time from query param ?t=... or saved watch progress
        const queryTime = parseInt(searchParams.get('t'), 10);
        if (!isNaN(queryTime) && queryTime > 0) {
          setInitialTime(queryTime);
        } else if (isAuthenticated) {
          try {
            const progRes = await getProgressApi(videoId);
            if (progRes.data && progRes.data.currentPosition > 5 && !progRes.data.completed) {
              setInitialTime(progRes.data.currentPosition);
            }
          } catch {
            // Ignore progress fetch error
          }
        }

        // Increment views safely once per watch session
        if (!viewedVideosRef.current.has(videoId)) {
          viewedVideosRef.current.add(videoId);
          incrementViewsApi(videoId).catch((err) =>
            console.error('Error incrementing view count:', err)
          );
        }

        // Record watch history if user is authenticated
        if (isAuthenticated) {
          addToHistoryApi(videoId).catch(() => {});
        }

        // Fetch user like/dislike status
        getVideoInteractionStatusApi(videoId)
          .then((res) => {
            setInteraction({
              userInteraction: res.data.userInteraction,
              likesCount: res.data.likesCount,
              dislikesCount: res.data.dislikesCount,
            });
          })
          .catch(() => {});

        // Fetch weighted recommendations (excluding current video)
        getRecommendationsApi(videoId, { limit: 12 })
          .then((recRes) => {
            setRecommendedVideos(recRes.data.videos || []);
          })
          .catch(() => {});
      } catch (err) {
        setError(err.message || 'Video not found or is private');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideoDetails();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [videoId, searchParams, isAuthenticated]);

  // Like / Dislike Handler
  const handleInteraction = async (type) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/watch/${videoId}` } } });
      return;
    }

    if (isLiking) return;
    setIsLiking(true);

    try {
      const res = await toggleVideoLikeApi(videoId, type);
      setInteraction({
        userInteraction: res.data.userInteraction,
        likesCount: res.data.likesCount,
        dislikesCount: res.data.dislikesCount,
      });
    } catch (err) {
      alert(err.message || 'Failed to update interaction');
    } finally {
      setIsLiking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-4 animate-pulse">
        <div className="aspect-video w-full rounded-2xl bg-viora-card border border-viora-border" />
        <div className="h-6 bg-viora-card rounded w-2/3" />
        <div className="h-10 bg-viora-card rounded w-1/3" />
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-viora-card border border-viora-border rounded-3xl text-center space-y-4 shadow-2xl">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-100">Video Unavailable</h2>
        <p className="text-sm text-slate-400">{error || 'Video not found or is private'}</p>
        <Button to="/" variant="primary">
          Back to Discover Feed
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-16">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Video Player, Metadata, Comments */}
        <div className="lg:col-span-2 space-y-4">
          {/* Custom HTML5 Video Player */}
          <div className="rounded-2xl overflow-hidden border border-viora-border shadow-2xl bg-black">
            <VideoPlayer
              videoId={video._id}
              videoUrl={video.videoUrl}
              poster={video.thumbnailUrl}
              chapters={video.chapters || []}
              subtitles={video.subtitles || []}
              initialTime={initialTime}
            />
          </div>

          {/* Video Title */}
          <h1 className="text-lg sm:text-2xl font-bold text-slate-100 leading-snug tracking-tight">
            {video.title}
          </h1>

          {/* Channel Bar & Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-viora-border pb-4">
            {/* Channel Info */}
            <div className="flex items-center gap-3">
              <Link to={`/channel/${video.owner?.username}`}>
                <img
                  src={video.owner?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                  alt={video.owner?.username}
                  className="w-11 h-11 rounded-full object-cover ring-1 ring-white/10 hover:ring-indigo-500/50 transition-all"
                />
              </Link>
              <div>
                <Link
                  to={`/channel/${video.owner?.username}`}
                  className="font-bold text-sm text-slate-100 hover:text-indigo-400 flex items-center gap-1 leading-tight transition-colors"
                >
                  <span>{video.owner?.username}</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                </Link>
                <span className="text-xs text-slate-400">
                  {formatViews(video.owner?.subscribersCount || 0).replace('views', 'subscribers')}
                </span>
              </div>

              {/* Subscribe Button */}
              <div className="ml-2">
                <SubscribeButton channelId={video.owner?._id} />
              </div>
            </div>

            {/* Actions: Likes/Dislikes, Share, Save, Report */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Like / Dislike Pill */}
              <div className="flex items-center bg-viora-card rounded-xl border border-viora-border overflow-hidden text-xs font-semibold">
                <button
                  onClick={() => handleInteraction('like')}
                  disabled={isLiking}
                  className={`flex items-center gap-1.5 px-3.5 py-2 hover:bg-white/5 transition-colors border-r border-viora-border ${
                    interaction.userInteraction === 'like'
                      ? 'text-indigo-400 font-bold bg-indigo-500/10'
                      : 'text-slate-300'
                  }`}
                >
                  <ThumbsUp
                    className={`w-4 h-4 ${
                      interaction.userInteraction === 'like' ? 'fill-current' : ''
                    }`}
                  />
                  <span>{interaction.likesCount}</span>
                </button>

                <button
                  onClick={() => handleInteraction('dislike')}
                  disabled={isLiking}
                  className={`px-3.5 py-2 hover:bg-white/5 transition-colors ${
                    interaction.userInteraction === 'dislike'
                      ? 'text-indigo-400 bg-indigo-500/10'
                      : 'text-slate-300'
                  }`}
                  aria-label="Dislike video"
                >
                  <ThumbsDown
                    className={`w-4 h-4 ${
                      interaction.userInteraction === 'dislike' ? 'fill-current' : ''
                    }`}
                  />
                </button>
              </div>

              {/* Share Button */}
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-viora-card hover:bg-white/5 text-slate-300 hover:text-white border border-viora-border rounded-xl text-xs font-semibold transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>

              {/* Save */}
              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    navigate('/login', { state: { from: { pathname: `/watch/${videoId}` } } });
                    return;
                  }
                  setIsSaveModalOpen(true);
                }}
                title="Save video to playlist"
                className="flex items-center gap-1.5 px-3.5 py-2 bg-viora-card hover:bg-white/5 text-slate-300 hover:text-white border border-viora-border rounded-xl text-xs font-semibold transition-colors"
              >
                <Bookmark className="w-4 h-4" />
                <span>Save</span>
              </button>

              {/* Report */}
              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    navigate('/login', { state: { from: { pathname: `/watch/${videoId}` } } });
                    return;
                  }
                  setIsReportModalOpen(true);
                }}
                title="Report video"
                className="flex items-center gap-1.5 px-3 py-2 bg-viora-card hover:bg-white/5 text-slate-400 hover:text-rose-400 border border-viora-border rounded-xl text-xs font-semibold transition-colors"
              >
                <Flag className="w-4 h-4 text-slate-400" />
                <span className="hidden sm:inline">Report</span>
              </button>
            </div>
          </div>

          {/* Description Box */}
          <div className="p-4 sm:p-5 bg-viora-card rounded-2xl border border-viora-border text-xs sm:text-sm text-slate-300 space-y-3">
            <div className="flex items-center gap-3 font-semibold text-slate-200 flex-wrap">
              <span>{formatViews(video.views)} views</span>
              <span>•</span>
              <span>{formatDateAgo(video.createdAt)}</span>
              {video.category && (
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs">
                  #{video.category}
                </span>
              )}
            </div>

            <p className={`whitespace-pre-line leading-relaxed text-slate-300 ${!isDescExpanded ? 'line-clamp-3' : ''}`}>
              {video.description || 'No description provided for this video.'}
            </p>

            {/* Video Chapters List */}
            {video.chapters && video.chapters.length > 0 && (
              <div className="pt-3 border-t border-viora-border">
                <div className="flex items-center gap-2 font-semibold text-slate-200 mb-2.5">
                  <ListVideo className="w-4 h-4 text-indigo-400" />
                  <span>Timeline Chapters</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {video.chapters.map((ch, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-viora-surface border border-viora-border text-xs"
                    >
                      <span className="font-medium text-slate-200 truncate">{ch.title}</span>
                      <span className="font-mono text-indigo-400 shrink-0 font-semibold ml-2">
                        {formatDuration(ch.startSeconds)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {video.tags && video.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {video.tags.map((tag, idx) => (
                  <span key={idx} className="text-indigo-400 font-medium text-xs">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {video.description && video.description.length > 150 && (
              <button
                onClick={() => setIsDescExpanded(!isDescExpanded)}
                className="font-semibold text-slate-200 hover:text-indigo-400 pt-1 block transition-colors"
              >
                {isDescExpanded ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>

          {/* Comments Section */}
          <CommentSection videoId={videoId} />
        </div>

        {/* Right 1 Column: Recommended Videos */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <h3 className="font-bold text-base text-slate-100">
              Related Releases
            </h3>
          </div>

          <div className="space-y-3">
            {recommendedVideos.length === 0 ? (
              <p className="text-xs text-slate-400 py-4">No recommended videos yet.</p>
            ) : (
              recommendedVideos.map((rec) => (
                <Link
                  key={rec._id}
                  to={`/watch/${rec._id}`}
                  className="flex gap-3 group cursor-pointer p-2 rounded-xl bg-viora-card/40 hover:bg-viora-card border border-viora-border hover:border-indigo-500/30 transition-all duration-200"
                >
                  {/* Thumbnail */}
                  <div className="relative w-36 sm:w-40 aspect-video rounded-lg overflow-hidden bg-viora-surface shrink-0 border border-viora-border/60">
                    <img
                      src={rec.thumbnailUrl}
                      alt={rec.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {rec.duration > 0 && (
                      <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-xs text-[10px] font-semibold text-slate-200 font-mono">
                        {formatDuration(rec.duration)}
                      </div>
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="text-xs font-semibold text-slate-100 line-clamp-2 leading-snug group-hover:text-indigo-400 transition-colors">
                      {rec.title}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {rec.owner?.username}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {formatViews(rec.views)} • {formatDateAgo(rec.createdAt)}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Save to Playlist Modal */}
      <SavePlaylistModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        videoId={videoId}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        videoId={videoId}
        videoTitle={video.title}
      />

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        targetType="video"
        targetId={videoId}
        targetTitle={video.title}
      />
    </div>
  );
};

export default WatchPage;
