import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock, 
  ThumbsUp, 
  MessageSquare,
  Play
} from 'lucide-react';
import { getStudioAnalyticsApi } from '../../services/studioService';
import { formatViews, formatDateAgo } from '../../utils/formatters';

export const StudioAnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeMetric, setActiveMetric] = useState('views');

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
      setError(err.message || 'Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-viora-card/60 rounded-xl w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-viora-card/60 rounded-2xl border border-white/5" />
          ))}
        </div>
        <div className="h-72 bg-viora-card/60 rounded-3xl border border-white/5" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-16 text-rose-400 bg-viora-card/40 rounded-3xl border border-white/5">
        <p>{error || 'Analytics not available'}</p>
      </div>
    );
  }

  const { summary, trend, topVideos } = data;
  const maxTrend = Math.max(...trend.map((t) => t.views), 1);
  const estimatedWatchHours = Math.round((summary.totalViews * 4.2) / 60); // approx 4.2 mins average watch
  const engagementRate = summary.totalViews > 0 
    ? (((summary.totalLikes + summary.totalComments) / summary.totalViews) * 100).toFixed(1)
    : 0;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">
          Channel Analytics
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Your channel has garnered <span className="text-white font-semibold">{summary.totalViews.toLocaleString()} views</span> across {summary.totalVideos} videos.
        </p>
      </div>

      {/* Interactive Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Views */}
        <div
          onClick={() => setActiveMetric('views')}
          className={`p-5 rounded-2xl border cursor-pointer transition-all duration-300 ${
            activeMetric === 'views'
              ? 'bg-indigo-500/10 border-indigo-500 shadow-xl shadow-indigo-500/10 ring-1 ring-indigo-500/30'
              : 'bg-viora-card/50 border-white/5 hover:border-white/10 hover:bg-viora-surface/80'
          }`}
        >
          <span className="text-xs font-semibold text-slate-400">Total Views</span>
          <h3 className="text-2xl font-bold text-white mt-1">
            {summary.totalViews.toLocaleString()}
          </h3>
          <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 mt-1.5">
            <TrendingUp className="w-3 h-3" />
            <span>+14% vs last period</span>
          </span>
        </div>

        {/* Watch Time */}
        <div
          onClick={() => setActiveMetric('watchTime')}
          className={`p-5 rounded-2xl border cursor-pointer transition-all duration-300 ${
            activeMetric === 'watchTime'
              ? 'bg-cyan-500/10 border-cyan-500 shadow-xl shadow-cyan-500/10 ring-1 ring-cyan-500/30'
              : 'bg-viora-card/50 border-white/5 hover:border-white/10 hover:bg-viora-surface/80'
          }`}
        >
          <span className="text-xs font-semibold text-slate-400">
            Watch Time (hours)
          </span>
          <h3 className="text-2xl font-bold text-white mt-1">
            {estimatedWatchHours.toLocaleString()}
          </h3>
          <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 mt-1.5">
            <TrendingUp className="w-3 h-3" />
            <span>+8% vs last period</span>
          </span>
        </div>

        {/* Subscribers */}
        <div
          onClick={() => setActiveMetric('subscribers')}
          className={`p-5 rounded-2xl border cursor-pointer transition-all duration-300 ${
            activeMetric === 'subscribers'
              ? 'bg-violet-500/10 border-violet-500 shadow-xl shadow-violet-500/10 ring-1 ring-violet-500/30'
              : 'bg-viora-card/50 border-white/5 hover:border-white/10 hover:bg-viora-surface/80'
          }`}
        >
          <span className="text-xs font-semibold text-slate-400">Subscribers</span>
          <h3 className="text-2xl font-bold text-white mt-1">
            {summary.totalSubscribers.toLocaleString()}
          </h3>
          <span className="text-[11px] text-slate-400 font-semibold mt-1.5 block">
            Channel audience
          </span>
        </div>

        {/* Engagement Rate */}
        <div
          onClick={() => setActiveMetric('engagement')}
          className={`p-5 rounded-2xl border cursor-pointer transition-all duration-300 ${
            activeMetric === 'engagement'
              ? 'bg-emerald-500/10 border-emerald-500 shadow-xl shadow-emerald-500/10 ring-1 ring-emerald-500/30'
              : 'bg-viora-card/50 border-white/5 hover:border-white/10 hover:bg-viora-surface/80'
          }`}
        >
          <span className="text-xs font-semibold text-slate-400">
            Engagement Rate
          </span>
          <h3 className="text-2xl font-bold text-white mt-1">
            {engagementRate}%
          </h3>
          <span className="text-[11px] text-slate-400 font-semibold mt-1.5 block">
            Likes & comments / views
          </span>
        </div>
      </div>

      {/* Interactive Trend Chart Card */}
      <div className="p-6 bg-viora-card/50 rounded-3xl border border-white/5 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-white">
              Views Overview (Last 7 Days)
            </h2>
            <p className="text-xs text-slate-400">
              Daily audience viewing patterns
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-white/5 text-slate-300 border border-white/5 rounded-full self-start sm:self-auto">
            Past 7 days
          </span>
        </div>

        {/* SVG Curve & Bars Chart */}
        <div className="relative pt-4">
          <div className="h-52 flex items-end justify-between gap-4 px-4 border-b border-white/5 pb-2">
            {trend.map((point, idx) => {
              const barHeight = Math.max(12, Math.round((point.views / maxTrend) * 100));

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold py-1 px-2.5 bg-black/90 text-white border border-white/10 rounded-lg mb-1 shadow-lg pointer-events-none">
                    {point.views} views
                  </div>
                  <div
                    style={{ height: `${barHeight}%` }}
                    className="w-full max-w-[56px] rounded-t-xl bg-gradient-to-t from-indigo-600 via-indigo-500 to-cyan-400 hover:brightness-125 shadow-lg shadow-indigo-500/20 transition-all duration-300"
                  />
                  <span className="text-xs font-medium text-slate-400">
                    {point.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Videos Breakdown */}
      <div className="p-6 bg-viora-card/50 rounded-3xl border border-white/5 shadow-xl space-y-4">
        <h2 className="text-base font-bold text-white">
          Your Top Videos in this Period
        </h2>

        {topVideos.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">
            No public video view data recorded yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.02] text-slate-400 uppercase tracking-wider font-bold text-[10px] border-b border-white/5">
                <tr>
                  <th className="py-3.5 px-4">Content</th>
                  <th className="py-3.5 px-4">Views</th>
                  <th className="py-3.5 px-4">Likes</th>
                  <th className="py-3.5 px-4">Comments</th>
                  <th className="py-3.5 px-4">Engagement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {topVideos.map((video) => {
                  const videoEngagement = video.views > 0
                    ? (((video.likesCount + video.commentsCount) / video.views) * 100).toFixed(1)
                    : 0;

                  return (
                    <tr key={video._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={video.thumbnailUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600'}
                            alt={video.title}
                            className="w-16 aspect-video rounded-lg object-cover border border-white/5"
                          />
                          <Link
                            to={`/watch/${video._id}`}
                            className="font-semibold text-white hover:text-indigo-400 transition-colors line-clamp-1 max-w-xs"
                          >
                            {video.title}
                          </Link>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-200">
                        {formatViews(video.views)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {video.likesCount}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {video.commentsCount}
                      </td>
                      <td className="py-3.5 px-4 text-emerald-400 font-semibold">
                        {videoEngagement}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudioAnalyticsPage;
