import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Play, X, Clock, PlayCircle } from 'lucide-react';
import { getContinueWatchingApi, deleteProgressApi } from '../../services/progressService';
import { formatDuration } from '../../utils/formatters';

export const ContinueWatchingSection = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setItems([]);
      return;
    }

    const fetchContinueWatching = async () => {
      try {
        setLoading(true);
        const res = await getContinueWatchingApi({ limit: 8 });
        setItems(res.data?.items || []);
      } catch (err) {
        console.error('Error loading continue watching:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchContinueWatching();
  }, [isAuthenticated]);

  const handleDismiss = async (e, videoId) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await deleteProgressApi(videoId);
      setItems((prev) => prev.filter((item) => item.video?._id !== videoId));
    } catch (err) {
      console.error('Failed to remove progress:', err);
    }
  };

  if (!isAuthenticated || loading || items.length === 0) {
    return null;
  }

  return (
    <section className="mb-8">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
          <Clock className="w-4 h-4" />
        </div>
        <h2 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight">
          Continue Watching
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((item) => {
          const video = item.video;
          if (!video) return null;

          const progressPercent = item.duration > 0
            ? Math.min(100, Math.max(0, (item.currentPosition / item.duration) * 100))
            : 0;

          const resumeSeconds = Math.floor(item.currentPosition);

          return (
            <div
              key={item._id}
              className="group relative bg-viora-card rounded-2xl overflow-hidden border border-viora-border hover:border-indigo-500/30 shadow-md hover:shadow-xl hover:shadow-black/40 transition-all duration-200"
            >
              <Link
                to={`/watch/${video._id}?t=${resumeSeconds}`}
                className="block"
              >
                {/* Thumbnail Container */}
                <div className="relative aspect-video w-full bg-viora-surface overflow-hidden">
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Play overlay button on hover */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-11 h-11 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/40 transform scale-90 group-hover:scale-100 transition-transform">
                      <Play className="w-5 h-5 ml-0.5 fill-current" />
                    </div>
                  </div>

                  {/* Duration badge */}
                  <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-lg bg-black/80 backdrop-blur-md border border-white/10 text-[10px] font-semibold text-slate-200 font-mono">
                    {formatDuration(item.currentPosition)} / {formatDuration(item.duration)}
                  </div>

                  {/* Progress bar at bottom of thumbnail */}
                  <div className="absolute bottom-0 inset-x-0 h-1 bg-white/20">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-r-full"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Info */}
                <div className="p-3.5 space-y-1">
                  <h3 className="text-xs font-semibold text-slate-100 line-clamp-2 leading-snug group-hover:text-indigo-400 transition-colors">
                    {video.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 truncate">
                    {video.owner?.username}
                  </p>
                  <p className="text-[10px] text-indigo-400 font-medium">
                    {Math.round(progressPercent)}% completed
                  </p>
                </div>
              </Link>

              {/* Dismiss Button */}
              <button
                onClick={(e) => handleDismiss(e, video._id)}
                title="Remove from Continue Watching"
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 hover:bg-black text-slate-300 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity border border-white/10"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ContinueWatchingSection;
