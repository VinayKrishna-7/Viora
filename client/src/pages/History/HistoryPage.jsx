import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  History as HistoryIcon, 
  Trash2, 
  Clock, 
  X, 
  Play, 
  AlertCircle 
} from 'lucide-react';
import { 
  getWatchHistoryApi, 
  removeFromHistoryApi, 
  clearWatchHistoryApi 
} from '../../services/historyService';
import { formatViews, formatDateAgo, formatDuration } from '../../utils/formatters';
import Button from '../../components/ui/Button';

export const HistoryPage = () => {
  const [historyItems, setHistoryItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await getWatchHistoryApi({ limit: 50 });
      setHistoryItems(res.data?.history || []);
    } catch (err) {
      setError(err.message || 'Failed to load watch history');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveItem = async (e, videoId) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await removeFromHistoryApi(videoId);
      setHistoryItems((prev) => prev.filter((item) => item.video?._id !== videoId));
    } catch (err) {
      console.error('Failed to remove history item:', err);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear your entire watch history?')) return;

    try {
      setIsClearing(true);
      await clearWatchHistoryApi();
      setHistoryItems([]);
    } catch (err) {
      alert(err.message || 'Failed to clear watch history');
    } finally {
      setIsClearing(false);
    }
  };

  // Group history by Today, Yesterday, Older
  const groupHistory = (items) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const groups = {
      Today: [],
      Yesterday: [],
      Earlier: [],
    };

    items.forEach((item) => {
      const watchedDate = new Date(item.watchedAt || item.createdAt);
      if (watchedDate >= today) {
        groups.Today.push(item);
      } else if (watchedDate >= yesterday) {
        groups.Yesterday.push(item);
      } else {
        groups.Earlier.push(item);
      }
    });

    return groups;
  };

  const grouped = groupHistory(historyItems);

  return (
    <div className="max-w-6xl mx-auto pb-16 space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-viora-border pb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-sm">
            <HistoryIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-100 font-display">
              Watch History
            </h1>
            <p className="text-xs text-slate-400">
              Releases and streams you've recently experienced
            </p>
          </div>
        </div>

        {historyItems.length > 0 && (
          <button
            onClick={handleClearHistory}
            disabled={isClearing}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/10 rounded-xl border border-rose-500/30 transition disabled:opacity-50 self-start sm:self-auto"
          >
            <Trash2 className="w-4 h-4 text-rose-400" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-4 p-3 rounded-2xl bg-viora-card/40 border border-viora-border animate-pulse">
              <div className="w-44 sm:w-60 h-28 bg-viora-surface rounded-xl shrink-0" />
              <div className="flex-1 space-y-2 py-2">
                <div className="h-4 bg-viora-surface rounded w-3/4" />
                <div className="h-3 bg-viora-surface rounded w-1/3" />
                <div className="h-3 bg-viora-surface rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-16 text-rose-400">
          <p>{error}</p>
        </div>
      ) : historyItems.length === 0 ? (
        <div className="text-center py-20 bg-viora-card rounded-3xl border border-viora-border p-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4 text-indigo-400">
            <HistoryIcon className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-slate-100">
            No watch history yet
          </h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-6 leading-relaxed">
            Releases that you play will automatically appear here so you can pick back up anytime.
          </p>
          <Button
            to="/"
            variant="primary"
            className="inline-flex items-center gap-2"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Explore Discovery Feed</span>
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([label, items]) => {
            if (items.length === 0) return null;

            return (
              <div key={label} className="space-y-3">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">
                  {label}
                </h2>

                <div className="space-y-3">
                  {items.map((item) => {
                    const video = item.video;
                    if (!video) return null;

                    return (
                      <div
                        key={item._id}
                        className="group flex flex-col sm:flex-row gap-4 p-3 rounded-2xl bg-viora-card/40 hover:bg-viora-card border border-viora-border hover:border-indigo-500/30 transition-all duration-200"
                      >
                        {/* Thumbnail */}
                        <Link
                          to={`/watch/${video._id}`}
                          className="relative w-full sm:w-60 aspect-video rounded-xl overflow-hidden bg-viora-surface shrink-0 border border-viora-border/60"
                        >
                          <img
                            src={video.thumbnailUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600'}
                            alt={video.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {video.duration > 0 && (
                            <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-xs text-[10px] font-semibold text-slate-200 font-mono">
                              {formatDuration(video.duration)}
                            </div>
                          )}
                        </Link>

                        {/* Details */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <Link
                                to={`/watch/${video._id}`}
                                className="text-sm font-semibold text-slate-100 line-clamp-2 hover:text-indigo-400 transition-colors leading-snug"
                              >
                                {video.title}
                              </Link>
                              <button
                                onClick={(e) => handleRemoveItem(e, video._id)}
                                title="Remove from watch history"
                                className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition shrink-0"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="flex items-center gap-2 mt-1.5">
                              <Link
                                to={`/channel/${video.owner?.username}`}
                                className="text-xs text-slate-400 hover:text-white transition-colors"
                              >
                                @{video.owner?.username}
                              </Link>
                              <span className="text-slate-600">•</span>
                              <span className="text-xs text-slate-500 font-medium">
                                {formatViews(video.views)} views
                              </span>
                            </div>

                            {video.description && (
                              <p className="text-xs text-slate-400 line-clamp-2 mt-2 hidden sm:block">
                                {video.description}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-2">
                            <Clock className="w-3 h-3 text-indigo-400" />
                            <span>Watched {formatDateAgo(item.watchedAt || item.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
