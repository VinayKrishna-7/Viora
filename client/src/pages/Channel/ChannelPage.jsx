import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Settings, 
  Calendar, 
  Eye, 
  Film, 
  Users, 
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { getChannelProfileApi } from '../../services/userService';
import { getChannelVideosApi } from '../../services/videoService';
import VideoGrid from '../../components/video/VideoGrid';
import SubscribeButton from '../../components/channel/SubscribeButton';
import Button from '../../components/ui/Button';
import { formatViews, formatDateAgo } from '../../utils/formatters';

export const ChannelPage = () => {
  const { username } = useParams();
  const { user: currentUser } = useSelector((state) => state.auth);

  const [channelData, setChannelData] = useState(null);
  const [videos, setVideos] = useState([]);
  const [activeTab, setActiveTab] = useState('videos');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const isOwner = currentUser?.username === username?.toLowerCase();

  useEffect(() => {
    if (!username) return;

    const fetchChannel = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [profileRes, videosRes] = await Promise.all([
          getChannelProfileApi(username),
          getChannelVideosApi(username, { limit: 30 }),
        ]);

        setChannelData(profileRes.data);
        setVideos(videosRes.data.videos || []);
      } catch (err) {
        setError(err.message || 'Channel not found');
      } finally {
        setIsLoading(false);
      }
    };

    fetchChannel();
  }, [username]);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 animate-pulse">
        <div className="h-44 sm:h-56 rounded-3xl bg-viora-card border border-viora-border" />
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-viora-card border border-viora-border" />
          <div className="space-y-2 flex-1">
            <div className="h-5 bg-viora-card rounded w-1/4" />
            <div className="h-3 bg-viora-card rounded w-1/6" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !channelData?.channel) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-viora-card border border-viora-border rounded-3xl text-center space-y-4 shadow-2xl">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-100">Channel Not Found</h2>
        <p className="text-xs text-slate-400">@{username} does not exist on Viora.</p>
        <Button to="/" variant="primary">
          Back to Discover Feed
        </Button>
      </div>
    );
  }

  const { channel, videoCount } = channelData;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Channel Banner */}
      <div className="relative h-44 sm:h-64 rounded-3xl overflow-hidden bg-gradient-to-r from-indigo-950/40 via-viora-card to-viora-surface border border-viora-border shadow-xl">
        <img
          src={channel.banner || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200'}
          alt={`${channel.username} banner`}
          className="w-full h-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-viora-bg via-transparent to-transparent" />
      </div>

      {/* Channel Header Information */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-2">
        <div className="flex items-center gap-4 sm:gap-6">
          <img
            src={channel.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
            alt={channel.username}
            className="w-20 h-20 sm:w-28 sm:h-28 rounded-full object-cover ring-4 ring-viora-bg shadow-2xl -mt-10 sm:-mt-14 relative z-10"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
                {channel.username}
              </h1>
              <CheckCircle2 className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              @{channel.username} • {formatViews(channel.subscribersCount || 0).replace('views', 'subscribers')} • {videoCount} {videoCount === 1 ? 'release' : 'releases'}
            </p>
            {channel.description && (
              <p className="text-xs text-slate-300 mt-1 line-clamp-2 max-w-xl">
                {channel.description}
              </p>
            )}
          </div>
        </div>

        {/* Action Button: Subscribe or Customize */}
        <div>
          {isOwner ? (
            <Link
              to="/settings"
              className="flex items-center gap-2 px-4 py-2 bg-viora-card hover:bg-white/5 border border-viora-border text-slate-200 text-xs font-semibold rounded-xl transition-all shadow-sm"
            >
              <Settings className="w-4 h-4 text-indigo-400" />
              <span>Channel Settings</span>
            </Link>
          ) : (
            <SubscribeButton
              channelId={channel._id}
              onStatusChange={(status) => {
                setChannelData((prev) => ({
                  ...prev,
                  channel: {
                    ...prev.channel,
                    subscribersCount: status.subscribersCount,
                  },
                }));
              }}
            />
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-viora-border flex gap-8 px-2">
        <button
          onClick={() => setActiveTab('videos')}
          className={`pb-3 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'videos'
              ? 'border-indigo-500 text-indigo-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Releases ({videos.length})
        </button>

        <button
          onClick={() => setActiveTab('about')}
          className={`pb-3 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'about'
              ? 'border-indigo-500 text-indigo-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          About
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'videos' && (
        <VideoGrid
          videos={videos}
          emptyMessage={`@${channel.username} has not uploaded any public videos yet.`}
        />
      )}

      {activeTab === 'about' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div className="md:col-span-2 space-y-4 p-6 rounded-3xl bg-viora-card border border-viora-border shadow-md">
            <h3 className="text-base font-bold text-slate-100">About the Channel</h3>
            <p className="text-xs sm:text-sm text-slate-300 whitespace-pre-line leading-relaxed">
              {channel.description || 'This channel has not added a description yet.'}
            </p>
          </div>

          <div className="space-y-4 p-6 rounded-3xl bg-viora-card border border-viora-border shadow-md text-xs text-slate-300">
            <h3 className="text-sm font-bold text-slate-100 mb-3">Statistics</h3>
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-viora-surface border border-viora-border/50">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <span>Joined {formatDateAgo(channel.createdAt)}</span>
            </div>
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-viora-surface border border-viora-border/50">
              <Film className="w-4 h-4 text-cyan-400" />
              <span>{videoCount} uploads</span>
            </div>
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-viora-surface border border-viora-border/50">
              <Users className="w-4 h-4 text-emerald-400" />
              <span>{formatViews(channel.subscribersCount || 0).replace('views', 'subscribers')}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChannelPage;
