import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ThumbsUp, Play, Trash2, Shuffle, AlertCircle } from 'lucide-react';
import { getLikedVideosApi } from '../../services/videoService';
import { toggleVideoLikeApi } from '../../services/interactionService';
import { formatViews, formatDateAgo, formatDuration } from '../../utils/formatters';

export const LikedVideosPage = () => {
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLikedVideos();
  }, []);

  const fetchLikedVideos = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await getLikedVideosApi({ limit: 50 });
      setVideos(res.data?.videos || []);
    } catch (err) {
      setError(err.message || 'Failed to load liked videos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnlike = async (e, videoId) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await toggleVideoLikeApi(videoId, 'like'); // toggles off like
      setVideos((prev) => prev.filter((v) => v._id !== videoId));
    } catch (err) {
      console.error('Failed to unlike video:', err);
    }
  };

  const firstVideoId = videos.length > 0 ? videos[0]._id : null;

  return (
    <div className="max-w-7xl mx-auto pb-16">
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="h-80 bg-viora-card/60 rounded-3xl animate-pulse border border-white/5" />
          <div className="lg:col-span-2 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-viora-card/60 rounded-2xl animate-pulse border border-white/5" />
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-16 text-rose-400">
          <p>{error}</p>
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-20 bg-viora-card/40 rounded-3xl border border-white/5 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto mb-4">
            <ThumbsUp className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">
            No liked videos yet
          </h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1.5 mb-6 leading-relaxed">
            Videos you like will show up here. Show appreciation to creators across Viora by liking their work!
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Discover Videos</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column: Playlist Card Hero */}
          <div className="p-6 rounded-3xl bg-gradient-to-b from-indigo-950/40 via-viora-surface/80 to-viora-bg border border-indigo-500/20 shadow-2xl space-y-5 lg:sticky lg:top-20 backdrop-blur-xl">
            <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
              <img
                src={videos[0]?.thumbnailUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600'}
                alt="Liked Videos cover"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Play className="w-12 h-12 text-white fill-current" />
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Auto-Curated
              </span>
              <h1 className="text-2xl font-black text-white tracking-tight">
                Liked Videos
              </h1>
              <p className="text-xs text-slate-400">
                {videos.length} {videos.length === 1 ? 'video' : 'videos'} • Updated in real-time
              </p>
            </div>

            {firstVideoId && (
              <div className="pt-2">
                <Link
                  to={`/watch/${firstVideoId}`}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-indigo-500/25"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Play all</span>
                </Link>
              </div>
            )}
          </div>

          {/* Right Column: Videos List */}
          <div className="lg:col-span-2 space-y-2">
            {videos.map((video, idx) => (
              <div
                key={video._id}
                className="group flex items-center gap-4 p-2.5 rounded-2xl bg-viora-card/40 hover:bg-viora-surface/90 transition-all duration-200 relative border border-white/5 hover:border-indigo-500/20"
              >
                {/* Index number */}
                <span className="text-xs font-semibold text-slate-500 w-5 text-right shrink-0">
                  {idx + 1}
                </span>

                {/* Thumbnail */}
                <Link
                  to={`/watch/${video._id}`}
                  className="relative w-36 sm:w-44 aspect-video bg-viora-card rounded-xl overflow-hidden flex-shrink-0 border border-white/5 group/thumb"
                >
                  <img
                    src={video.thumbnailUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600'}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300"
                  />
                  {video.duration > 0 && (
                    <span className="absolute bottom-1.5 right-1.5 bg-black/80 backdrop-blur-xs text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-md border border-white/10">
                      {formatDuration(video.duration)}
                    </span>
                  )}
                </Link>

                {/* Metadata */}
                <div className="flex-1 min-w-0 pr-2">
                  <Link
                    to={`/watch/${video._id}`}
                    className="text-xs sm:text-sm font-semibold text-white line-clamp-2 hover:text-indigo-400 transition-colors leading-snug"
                  >
                    {video.title}
                  </Link>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Link
                      to={`/channel/${video.owner?.username}`}
                      className="text-[11px] text-slate-400 hover:text-slate-200 truncate"
                    >
                      {video.owner?.username}
                    </Link>
                    <span className="text-slate-600">•</span>
                    <span className="text-[11px] text-slate-500">
                      {formatViews(video.views)}
                    </span>
                  </div>
                </div>

                {/* Remove / Unlike */}
                <button
                  onClick={(e) => handleUnlike(e, video._id)}
                  title="Remove from Liked Videos"
                  className="p-2 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LikedVideosPage;
