import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Eye, 
  Users, 
  ThumbsUp, 
  Video, 
  TrendingUp, 
  Play, 
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import { getStudioAnalyticsApi } from '../../services/studioService';
import { formatViews, formatDateAgo, formatDuration } from '../../utils/formatters';

export const StudioDashboardPage = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await getStudioAnalyticsApi();
      setData(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load creator analytics');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-viora-card rounded w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-viora-card rounded-2xl border border-viora-border" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-72 bg-viora-card rounded-2xl lg:col-span-2 border border-viora-border" />
          <div className="h-72 bg-viora-card rounded-2xl border border-viora-border" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-16 text-rose-400">
        <p>{error || 'Unable to load channel dashboard'}</p>
      </div>
    );
  }

  const { summary, topVideos, latestVideo, trend } = data;
  const maxTrendViews = Math.max(...trend.map((t) => t.views), 1);

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Welcome Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100 font-display">
          Channel Dashboard
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Monitor your channel performance, content reach, and audience growth in real-time.
        </p>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Views */}
        <div className="p-5 bg-viora-card rounded-2xl border border-viora-border shadow-md flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 shadow-xs">
            <Eye className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400">Total Views</span>
            <h3 className="text-xl font-bold text-slate-100 mt-0.5 font-mono">
              {summary.totalViews.toLocaleString()}
            </h3>
          </div>
        </div>

        {/* Subscribers */}
        <div className="p-5 bg-viora-card rounded-2xl border border-viora-border shadow-md flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 shadow-xs">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400">Subscribers</span>
            <h3 className="text-xl font-bold text-slate-100 mt-0.5 font-mono">
              {summary.totalSubscribers.toLocaleString()}
            </h3>
          </div>
        </div>

        {/* Total Likes */}
        <div className="p-5 bg-viora-card rounded-2xl border border-viora-border shadow-md flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 shadow-xs">
            <ThumbsUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400">Total Likes</span>
            <h3 className="text-xl font-bold text-slate-100 mt-0.5 font-mono">
              {summary.totalLikes.toLocaleString()}
            </h3>
          </div>
        </div>

        {/* Videos Uploaded */}
        <div className="p-5 bg-viora-card rounded-2xl border border-viora-border shadow-md flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center shrink-0 shadow-xs">
            <Video className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400">Published Content</span>
            <h3 className="text-xl font-bold text-slate-100 mt-0.5 font-mono">
              {summary.totalVideos.toLocaleString()}
            </h3>
          </div>
        </div>
      </div>

      {/* 2 Column Section: Latest Video Performance & 7-Day Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Latest Video Card */}
        <div className="p-6 bg-viora-card rounded-3xl border border-viora-border shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-100">
              Latest Video Performance
            </h2>
            <Link
              to="/studio/content"
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
            >
              See all
            </Link>
          </div>

          {latestVideo ? (
            <div className="space-y-3">
              <Link
                to={`/watch/${latestVideo._id}`}
                className="relative aspect-video rounded-2xl overflow-hidden block bg-viora-surface border border-viora-border group"
              >
                <img
                  src={latestVideo.thumbnailUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600'}
                  alt={latestVideo.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/40">
                    <Play className="w-5 h-5 ml-0.5 fill-current" />
                  </div>
                </div>
              </Link>

              <div>
                <h3 className="text-sm font-semibold text-slate-100 line-clamp-1">
                  {latestVideo.title}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Published {formatDateAgo(latestVideo.createdAt)}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-viora-border text-center">
                <div className="p-2.5 bg-viora-surface rounded-xl border border-viora-border/50">
                  <span className="text-[10px] text-slate-400 block">Views</span>
                  <span className="text-xs font-bold text-slate-200 font-mono">
                    {latestVideo.views}
                  </span>
                </div>
                <div className="p-2.5 bg-viora-surface rounded-xl border border-viora-border/50">
                  <span className="text-[10px] text-slate-400 block">Likes</span>
                  <span className="text-xs font-bold text-slate-200 font-mono">
                    {latestVideo.likesCount}
                  </span>
                </div>
                <div className="p-2.5 bg-viora-surface rounded-xl border border-viora-border/50">
                  <span className="text-[10px] text-slate-400 block">Comments</span>
                  <span className="text-xs font-bold text-slate-200 font-mono">
                    {latestVideo.commentsCount}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-10">
              <Video className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-400">No videos published yet</p>
            </div>
          )}
        </div>

        {/* 7-Day Views Trend Graph */}
        <div className="lg:col-span-2 p-6 bg-viora-card rounded-3xl border border-viora-border shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-100">
                7-Day Views Velocity
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Audience engagement across the past week
              </p>
            </div>
            <Link
              to="/studio/analytics"
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 transition-colors"
            >
              <span>Detailed Analytics</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Bar Chart Visualization */}
          <div className="pt-6">
            <div className="h-44 flex items-end justify-between gap-3 px-2 border-b border-viora-border">
              {trend.map((item, idx) => {
                const heightPercent = Math.max(8, Math.round((item.views / maxTrendViews) * 100));

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                    <span className="text-[10px] font-bold text-indigo-300 opacity-0 group-hover:opacity-100 transition-opacity font-mono">
                      {item.views}
                    </span>
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full max-w-[48px] bg-gradient-to-t from-indigo-600 to-cyan-400 group-hover:from-indigo-500 group-hover:to-cyan-300 rounded-t-lg transition-all duration-300 shadow-sm group-hover:shadow-indigo-500/20"
                    />
                    <span className="text-[11px] font-medium text-slate-400 mt-1">
                      {item.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Top Videos Table */}
      <div className="p-6 bg-viora-card rounded-3xl border border-viora-border shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-100">
            Top Performing Content
          </h2>
          <Link
            to="/studio/content"
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
          >
            View all content
          </Link>
        </div>

        {topVideos.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">
            Upload public videos to see top performer metrics here.
          </p>
        ) : (
          <div className="space-y-2">
            {topVideos.map((video, idx) => (
              <div
                key={video._id}
                className="flex items-center justify-between p-3 rounded-2xl hover:bg-white/[0.04] transition border border-transparent hover:border-viora-border"
              >
                <div className="flex items-center gap-3.5 min-w-0 pr-4">
                  <span className="text-xs font-bold text-indigo-400 w-5 font-mono">0{idx + 1}</span>
                  <Link
                    to={`/watch/${video._id}`}
                    className="w-20 aspect-video rounded-xl overflow-hidden bg-viora-surface border border-viora-border shrink-0"
                  >
                    <img
                      src={video.thumbnailUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600'}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  </Link>
                  <Link
                    to={`/watch/${video._id}`}
                    className="text-xs font-semibold text-slate-200 truncate hover:text-indigo-400 transition-colors"
                  >
                    {video.title}
                  </Link>
                </div>

                <div className="flex items-center gap-6 text-xs text-slate-400 shrink-0 font-medium">
                  <span className="font-semibold text-slate-300">{formatViews(video.views)}</span>
                  <span>{video.likesCount} likes</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudioDashboardPage;
