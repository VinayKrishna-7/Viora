import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Play } from 'lucide-react';
import { formatViews, formatDuration, formatDateAgo } from '../../utils/formatters';

export const VideoCard = ({ video }) => {
  if (!video) return null;

  const {
    _id,
    title,
    thumbnailUrl,
    duration,
    views,
    createdAt,
    owner,
  } = video;

  return (
    <div className="group relative flex flex-col gap-3 cursor-pointer">
      {/* Thumbnail Container */}
      <Link
        to={`/watch/${_id}`}
        className="relative aspect-video w-full rounded-2xl overflow-hidden bg-viora-card border border-viora-border group-hover:border-indigo-500/30 transition-all duration-300 shadow-md shadow-black/40 group-hover:shadow-xl group-hover:shadow-indigo-500/10"
      >
        <img
          src={thumbnailUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800'}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Ambient Dark Gradient on bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Duration badge */}
        {duration > 0 && (
          <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-lg bg-black/80 backdrop-blur-md border border-white/10 text-[11px] font-semibold text-slate-200 tracking-wider font-mono">
            {formatDuration(duration)}
          </div>
        )}

        {/* Play Icon Reveal */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="w-11 h-11 rounded-full bg-indigo-600/90 backdrop-blur-md text-white flex items-center justify-center shadow-lg shadow-indigo-500/40 transform scale-90 group-hover:scale-100 transition-transform">
            <Play className="w-5 h-5 ml-0.5 fill-current" />
          </div>
        </div>
      </Link>

      {/* Details (Avatar, Title, Channel, Meta) */}
      <div className="flex gap-3 px-0.5">
        {/* Channel Avatar */}
        {owner && (
          <Link
            to={`/channel/${owner.username}`}
            className="shrink-0 focus:outline-none"
            title={owner.username}
          >
            <div className="relative">
              <img
                src={owner.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                alt={owner.username}
                className="w-9 h-9 rounded-full object-cover ring-1 ring-white/10 group-hover:ring-indigo-500/50 transition-all"
              />
            </div>
          </Link>
        )}

        {/* Video Information */}
        <div className="flex-1 min-w-0">
          <Link
            to={`/watch/${_id}`}
            className="text-sm font-medium text-slate-100 line-clamp-2 leading-snug group-hover:text-indigo-400 transition-colors"
            title={title}
          >
            {title}
          </Link>

          {owner && (
            <Link
              to={`/channel/${owner.username}`}
              className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors mt-1 truncate"
            >
              <span>{owner.username}</span>
              <CheckCircle2 className="w-3 h-3 text-indigo-400 shrink-0" />
            </Link>
          )}

          <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5 font-medium">
            <span>{formatViews(views)} views</span>
            <span>•</span>
            <span>{formatDateAgo(createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
