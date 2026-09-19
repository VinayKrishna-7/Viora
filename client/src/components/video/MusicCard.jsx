import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Music2, Sparkles, Radio } from 'lucide-react';
import { formatViews, formatDuration } from '../../utils/formatters';

export const MusicCard = ({ item }) => {
  if (!item) return null;

  const isYouTube = item.source === 'youtube' || item.videoId || (item._id && item._id.toString().startsWith('yt_'));
  const cleanId = item.videoId || item.id || (item._id ? item._id.toString().replace(/^yt_/, '') : '');
  const watchUrl = isYouTube ? `/watch/youtube/${cleanId}` : `/watch/${cleanId}`;

  const title = item.title || 'Untitled Track';
  const artist = item.owner?.username || item.channelTitle || 'Unknown Artist';
  const thumbnail = item.thumbnailUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600';

  return (
    <div className="group relative flex flex-col p-3 rounded-2xl bg-viora-card/80 hover:bg-viora-card border border-viora-border hover:border-indigo-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5 cursor-pointer">
      {/* Square Art Container */}
      <Link to={watchUrl} className="relative aspect-square w-full rounded-xl overflow-hidden bg-viora-surface">
        <img
          src={thumbnail}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
        />

        {/* Ambient Dark Gradient Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

        {/* Hi-Fi Sound Badge */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-semibold text-indigo-300">
          <Music2 className="w-3 h-3 text-indigo-400" />
          <span>Hi-Fi</span>
        </div>

        {/* Duration badge */}
        {item.duration > 0 && (
          <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-medium text-slate-300 font-mono">
            {formatDuration(item.duration)}
          </div>
        )}

        {/* Floating Play Action on Hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/40 hover:scale-110 active:scale-95 transition-transform">
            <Play className="w-5 h-5 ml-0.5 fill-current" />
          </div>
        </div>

        {/* Live Audio Equalizer Bars (visual indicator) */}
        <div className="absolute bottom-2.5 right-2.5 flex items-end gap-0.5 h-3 px-1.5 py-0.5 rounded bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="w-0.5 bg-indigo-400 h-2 animate-pulse" />
          <span className="w-0.5 bg-indigo-300 h-3 animate-pulse" style={{ animationDelay: '150ms' }} />
          <span className="w-0.5 bg-cyan-400 h-1.5 animate-pulse" style={{ animationDelay: '300ms' }} />
        </div>
      </Link>

      {/* Track Meta */}
      <div className="mt-3 space-y-1">
        <Link
          to={watchUrl}
          className="text-sm font-semibold text-slate-100 line-clamp-1 group-hover:text-indigo-400 transition-colors leading-tight"
          title={title}
        >
          {title}
        </Link>
        <p className="text-xs text-slate-400 truncate hover:text-slate-300 transition-colors">
          {artist}
        </p>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-0.5">
          <span>{formatViews(item.views || 0)} plays</span>
        </div>
      </div>
    </div>
  );
};

export default MusicCard;
