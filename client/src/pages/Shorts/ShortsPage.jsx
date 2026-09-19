import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare, 
  Share2, 
  Play, 
  Volume2, 
  VolumeX, 
  Check, 
  ChevronUp, 
  ChevronDown,
  X,
  Send,
  Loader2
} from 'lucide-react';
import { getVideosApi } from '../../services/videoService';
import { toggleVideoLikeApi, getVideoInteractionStatusApi } from '../../services/interactionService';
import { getVideoCommentsApi, addCommentApi } from '../../services/commentService';
import SubscribeButton from '../../components/channel/SubscribeButton';
import Button from '../../components/ui/Button';
import { formatViews, formatDateAgo } from '../../utils/formatters';

export const ShortsPage = () => {
  const [shorts, setShorts] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active Short State
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [copied, setCopied] = useState(false);

  // Interaction State for active short
  const [interaction, setInteraction] = useState({
    userInteraction: null,
    likesCount: 0,
    dislikesCount: 0,
  });

  // Comments Drawer State
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const containerRef = useRef(null);
  const videoRefs = useRef([]);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    fetchShorts();
  }, []);

  const fetchShorts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await getVideosApi({ limit: 20 });
      const list = res.data?.videos || [];
      setShorts(list);

      if (list.length > 0) {
        loadInteraction(list[0]._id, list[0]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load shorts feed');
    } finally {
      setIsLoading(false);
    }
  };

  const loadInteraction = async (videoId, defaultVid) => {
    try {
      const res = await getVideoInteractionStatusApi(videoId);
      setInteraction({
        userInteraction: res.data.userInteraction,
        likesCount: res.data.likesCount,
        dislikesCount: res.data.dislikesCount,
      });
    } catch {
      setInteraction({
        userInteraction: null,
        likesCount: defaultVid?.likesCount || 0,
        dislikesCount: defaultVid?.dislikesCount || 0,
      });
    }
  };

  // Switch active video on scroll / keyboard navigation
  const scrollToShort = (index) => {
    if (index < 0 || index >= shorts.length) return;
    setActiveIndex(index);
    const target = videoRefs.current[index];
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    loadInteraction(shorts[index]._id, shorts[index]);
    setIsPlaying(true);
    setShowComments(false);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showComments) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        scrollToShort(activeIndex + 1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        scrollToShort(activeIndex - 1);
      } else if (e.key === ' ') {
        e.preventDefault();
        togglePlay();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, shorts.length, showComments, isPlaying]);

  const togglePlay = () => {
    const activeVideo = document.getElementById(`short-video-${activeIndex}`);
    if (activeVideo) {
      if (activeVideo.paused) {
        activeVideo.play().catch(() => {});
        setIsPlaying(true);
      } else {
        activeVideo.pause();
        setIsPlaying(false);
      }
    }
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    shorts.forEach((_, idx) => {
      const vid = document.getElementById(`short-video-${idx}`);
      if (vid) vid.muted = nextMuted;
    });
  };

  const handleLike = async (type) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    const currentVideo = shorts[activeIndex];
    if (!currentVideo) return;

    try {
      const res = await toggleVideoLikeApi(currentVideo._id, type);
      setInteraction({
        userInteraction: res.data.userInteraction,
        likesCount: res.data.likesCount,
        dislikesCount: res.data.dislikesCount,
      });
    } catch (err) {
      console.error('Failed to toggle like:', err);
    }
  };

  const handleShare = () => {
    const currentVideo = shorts[activeIndex];
    if (!currentVideo) return;
    const url = `${window.location.origin}/watch/${currentVideo._id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openComments = async () => {
    const currentVideo = shorts[activeIndex];
    if (!currentVideo) return;

    setShowComments(true);
    setIsLoadingComments(true);
    try {
      const res = await getVideoCommentsApi(currentVideo._id);
      setComments(res.data?.comments || []);
    } catch (err) {
      console.error('Failed to load comments:', err);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!commentText.trim()) return;

    setIsSubmittingComment(true);
    const currentVideo = shorts[activeIndex];
    try {
      const res = await addCommentApi(currentVideo._id, { text: commentText.trim() });
      setComments((prev) => [res.data, ...prev]);
      setCommentText('');
    } catch (err) {
      console.error('Failed to add comment:', err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-7rem)]">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (error || shorts.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-sm font-semibold text-slate-400">
          {error || 'No shorts available right now'}
        </p>
      </div>
    );
  }

  const currentShort = shorts[activeIndex];

  return (
    <div className="flex justify-center items-center h-[calc(100vh-5rem)] max-h-[860px] relative">
      {/* Central Reel Card */}
      <div className="flex items-center gap-4 sm:gap-6 h-full py-2">
        {/* Vertical Video Viewport */}
        <div 
          className="relative aspect-[9/16] h-full max-h-[780px] bg-black rounded-3xl overflow-hidden shadow-2xl border border-viora-border flex items-center justify-center group select-none cursor-pointer"
          onClick={togglePlay}
        >
          {/* HTML5 Video */}
          <video
            id={`short-video-${activeIndex}`}
            src={currentShort.videoUrl}
            poster={currentShort.thumbnailUrl}
            autoPlay
            loop
            playsInline
            muted={isMuted}
            className="w-full h-full object-cover"
          />

          {/* Play/Pause indicator icon on pause */}
          {!isPlaying && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white border border-white/10">
                <Play className="w-8 h-8 fill-current ml-1" />
              </div>
            </div>
          )}

          {/* Sound Mute/Unmute Overlay in Top Right */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleMute();
            }}
            className="absolute top-4 right-4 p-2.5 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/70 transition z-10 border border-white/10"
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>

          {/* Bottom Overlay: Channel Info & Caption */}
          <div 
            className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/95 via-black/50 to-transparent text-white space-y-3 pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Creator Bar */}
            <div className="flex items-center justify-between gap-3">
              <Link
                to={`/channel/${currentShort.owner?.username}`}
                className="flex items-center gap-2.5"
              >
                <img
                  src={currentShort.owner?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                  alt={currentShort.owner?.username}
                  className="w-9 h-9 rounded-full object-cover ring-1 ring-white/20"
                />
                <span className="text-xs font-bold text-white hover:underline truncate max-w-[130px]">
                  @{currentShort.owner?.username}
                </span>
              </Link>

              <SubscribeButton channelId={currentShort.owner?._id} />
            </div>

            {/* Video Title & Tags */}
            <div>
              <p className="text-xs sm:text-sm font-semibold line-clamp-2 leading-snug text-slate-100">
                {currentShort.title}
              </p>
              {currentShort.tags && currentShort.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {currentShort.tags.slice(0, 3).map((tag, i) => (
                    <span key={i} className="text-[11px] font-medium text-indigo-400">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Floating Actions (Like, Dislike, Comment, Share) */}
        <div className="flex flex-col items-center justify-end gap-5 pb-6">
          {/* Like */}
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={() => handleLike('like')}
              className={`p-3.5 rounded-full backdrop-blur-md transition-all shadow-md border ${
                interaction.userInteraction === 'like'
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-indigo-500/30 scale-105'
                  : 'bg-viora-card/90 text-slate-300 border-viora-border hover:text-white hover:bg-viora-card'
              }`}
            >
              <ThumbsUp className={`w-5 h-5 ${interaction.userInteraction === 'like' ? 'fill-current' : ''}`} />
            </button>
            <span className="text-[11px] font-bold text-slate-300 font-mono">
              {interaction.likesCount}
            </span>
          </div>

          {/* Dislike */}
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={() => handleLike('dislike')}
              className={`p-3.5 rounded-full backdrop-blur-md transition-all shadow-md border ${
                interaction.userInteraction === 'dislike'
                  ? 'bg-indigo-600 text-white border-indigo-500'
                  : 'bg-viora-card/90 text-slate-300 border-viora-border hover:text-white hover:bg-viora-card'
              }`}
            >
              <ThumbsDown className={`w-5 h-5 ${interaction.userInteraction === 'dislike' ? 'fill-current' : ''}`} />
            </button>
            <span className="text-[11px] font-bold text-slate-400">
              Dislike
            </span>
          </div>

          {/* Comments */}
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={openComments}
              className="p-3.5 rounded-full bg-viora-card/90 text-slate-300 border border-viora-border hover:text-white hover:bg-viora-card backdrop-blur-md transition-all shadow-md"
            >
              <MessageSquare className="w-5 h-5" />
            </button>
            <span className="text-[11px] font-bold text-slate-300 font-mono">
              {currentShort.commentsCount || 0}
            </span>
          </div>

          {/* Share */}
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={handleShare}
              className="p-3.5 rounded-full bg-viora-card/90 text-slate-300 border border-viora-border hover:text-white hover:bg-viora-card backdrop-blur-md transition-all shadow-md"
            >
              {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Share2 className="w-5 h-5" />}
            </button>
            <span className="text-[11px] font-bold text-slate-400">
              {copied ? 'Copied' : 'Share'}
            </span>
          </div>

          {/* Up & Down Arrows */}
          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={() => scrollToShort(activeIndex - 1)}
              disabled={activeIndex <= 0}
              className="p-2.5 rounded-full bg-viora-card/90 border border-viora-border text-slate-400 hover:text-white disabled:opacity-30 transition"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollToShort(activeIndex + 1)}
              disabled={activeIndex >= shorts.length - 1}
              className="p-2.5 rounded-full bg-viora-card/90 border border-viora-border text-slate-400 hover:text-white disabled:opacity-30 transition"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Slide-Over Comments Drawer */}
      {showComments && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
          <div 
            className="w-full max-w-md bg-viora-surface rounded-3xl border border-viora-border shadow-2xl h-[560px] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-viora-border">
              <h3 className="text-sm font-bold text-slate-100">
                Discussions ({comments.length})
              </h3>
              <button
                onClick={() => setShowComments(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {isLoadingComments ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No comments yet. Start the conversation!
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment._id} className="flex items-start gap-3 text-xs p-2.5 rounded-xl bg-viora-card border border-viora-border/50">
                    <img
                      src={comment.user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                      alt={comment.user?.username}
                      className="w-7 h-7 rounded-full object-cover shrink-0 ring-1 ring-white/10"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-200">
                          @{comment.user?.username}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {formatDateAgo(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-slate-300 mt-1 whitespace-pre-line leading-relaxed">
                        {comment.text}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add Comment Input */}
            <form onSubmit={handleAddComment} className="p-3.5 border-t border-viora-border flex items-center gap-2 bg-viora-surface">
              <input
                type="text"
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 px-3.5 py-2 text-xs bg-viora-card border border-viora-border rounded-xl focus:outline-none focus:border-indigo-500 text-slate-100 placeholder-slate-500"
              />
              <Button
                type="submit"
                disabled={isSubmittingComment || !commentText.trim()}
                variant="primary"
                size="sm"
                className="p-2"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShortsPage;
