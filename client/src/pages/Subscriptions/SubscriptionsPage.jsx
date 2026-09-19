import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Tv, Sparkles, AlertCircle } from 'lucide-react';
import { getSubscribedFeedApi, getSubscribedChannelsApi } from '../../services/subscriptionService';
import VideoGrid from '../../components/video/VideoGrid';

export const SubscriptionsPage = () => {
  const [videos, setVideos] = useState([]);
  const [channels, setChannels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        setIsLoading(true);
        const [feedRes, channelsRes] = await Promise.all([
          getSubscribedFeedApi({ limit: 24 }),
          getSubscribedChannelsApi(),
        ]);
        setVideos(feedRes.data.videos || []);
        setChannels(channelsRes.data.channels || []);
      } catch (err) {
        console.error('Error fetching subscription feed:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeed();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Tv className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Subscriptions Feed
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Latest uploads from creators you follow
            </p>
          </div>
        </div>

        {channels.length > 0 && (
          <span className="text-xs font-semibold px-3 py-1 bg-white/5 rounded-full text-slate-400 border border-white/5">
            {channels.length} {channels.length === 1 ? 'creator' : 'creators'}
          </span>
        )}
      </div>

      {/* Subscribed Channels Avatars Bar */}
      {channels.length > 0 && (
        <div className="bg-viora-card/40 border border-white/5 rounded-3xl p-4 shadow-xl">
          <div className="flex items-center gap-5 overflow-x-auto pb-1 scrollbar-none">
            {channels.map((ch) => (
              <Link
                key={ch._id}
                to={`/channel/${ch.username}`}
                className="flex flex-col items-center gap-2 shrink-0 group focus:outline-none"
              >
                <div className="p-0.5 rounded-full ring-2 ring-white/10 group-hover:ring-indigo-500 group-hover:shadow-[0_0_15px_rgba(99,102,241,0.35)] transition-all duration-300">
                  <img
                    src={ch.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                    alt={ch.username}
                    className="w-13 h-13 sm:w-14 sm:h-14 rounded-full object-cover"
                  />
                </div>
                <span className="text-[11px] font-medium text-slate-300 group-hover:text-indigo-400 max-w-[76px] truncate text-center transition-colors">
                  {ch.username}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Feed Video Grid */}
      <VideoGrid
        videos={videos}
        isLoading={isLoading}
        emptyMessage={
          channels.length === 0
            ? "You haven't subscribed to any creators yet"
            : 'No recent uploads from your subscriptions'
        }
      />
    </div>
  );
};

export default SubscriptionsPage;
