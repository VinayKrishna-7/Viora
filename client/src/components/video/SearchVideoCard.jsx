import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Play } from 'lucide-react';
import { formatViews, formatDuration, formatDateAgo } from '../../utils/formatters';

export const SearchVideoCard = ({ video }) => {
  if (!video) return null;

  const {
    _id,
    title,
    description,
    thumbnailUrl,
    duration,
    views,
    createdAt,
    category,
    owner,
  } = video;

  return (
    <div className="group relative flex flex-col sm:flex-row gap-4 p-3 rounded-2xl bg-viora-card/40 hover:bg-viora-card/90 border border-viora-border hover:border-indigo-500/30 transition-all duration-200 cursor-pointer shadow-xs hover:shadow-lg hover:shadow-black/40">
      {/* Thumbnail */}
      <Link
        to={`/watch/${_id}`}
        className="relative aspect-video w-full sm:w-72 md:w-80 rounded-xl overflow-hidden bg-viora-surface shrink-0 border border-viora-border/60"
      >
        <img
          src={thumbnailUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800'}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {duration > 0 && (
          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-lg bg-black/80 backdrop-blur-md border border-white/10 text-[11px] font-semibold text-slate-200 font-mono">
            {formatDuration(duration)}
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="w-10 h-10 rounded-full bg-indigo-600/90 backdrop-blur-md text-white flex items-center justify-center shadow-lg shadow-indigo-500/40">
            <Play className="w-4 h-4 ml-0.5 fill-current" />
          </div>
        </div>
      </Link>

      {/* Content Details */}
      <div className="flex-1 min-w-0 space-y-2 py-1 flex flex-col justify-between">
        <div className="space-y-1.5">
          <Link
            to={`/watch/${_id}`}
            className="block text-base sm:text-lg font-semibold text-slate-100 line-clamp-2 leading-snug group-hover:text-indigo-400 transition-colors"
          >
            {title}
          </Link>

          <div className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
            <span>{formatViews(views)} views</span>
            <span>•</span>
            <span>{formatDateAgo(createdAt)}</span>
            {category && (
              <>
                <span>•</span>
                <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-medium text-slate-300">
                  {category}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="space-y-2 pt-1">
          {/* Channel Info */}
          {owner && (
            <Link
              to={`/channel/${owner.username}`}
              className="inline-flex items-center gap-2 text-xs text-slate-300 hover:text-white font-medium transition-colors"
            >
              <img
                src={owner.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                alt={owner.username}
                className="w-5 h-5 rounded-full object-cover ring-1 ring-white/10"
              />
              <span>{owner.username}</span>
              <CheckCircle2 className="w-3 h-3 text-indigo-400 shrink-0" />
            </Link>
          )}

          {/* Description Snippet */}
          {description && (
            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed hidden sm:block">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchVideoCard;
