import React from 'react';
import { Link } from 'react-router-dom';
import { Youtube, ExternalLink, Music2, CheckCircle2, Play } from 'lucide-react';
import { formatViews, formatDuration, formatDateAgo } from '../../utils/formatters';

export const SearchResultCard = ({ video }) => {
  if (!video) return null;

  const isYouTube = video.source === 'youtube';
  const cleanId = isYouTube
    ? (video.videoId || video.id || (video._id ? video._id.replace(/^yt_/, '') : ''))
    : video._id;

  const watchUrl = isYouTube ? `/watch/youtube/${cleanId}` : `/watch/${cleanId}`;
  const isMusic = video.category === 'Music';

  const {
    title,
    description,
    thumbnailUrl,
    duration,
    views,
    createdAt,
    category,
    owner,
    externalUrl,
  } = video;

  return (
    <div className="group relative flex flex-col sm:flex-row gap-4 p-3 rounded-2xl bg-viora-card/40 hover:bg-viora-card/90 border border-viora-border hover:border-indigo-500/30 transition-all duration-200 shadow-xs hover:shadow-lg hover:shadow-black/40">
      {/* Thumbnail */}
      <Link
        to={watchUrl}
        className="relative aspect-video w-full sm:w-72 md:w-80 rounded-xl overflow-hidden bg-viora-surface shrink-0 border border-viora-border/60"
      >
        <img
          src={thumbnailUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800'}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Duration badge */}
        {duration > 0 && (
          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-lg bg-black/80 backdrop-blur-md border border-white/10 text-[11px] font-semibold text-slate-200 font-mono">
            {formatDuration(duration)}
          </div>
        )}

        {/* Source Badge on thumbnail */}
        {isYouTube ? (
          <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-rose-500/30 text-rose-300 text-[10px] font-semibold">
            <Youtube className="w-3 h-3 text-rose-400" />
            <span>YouTube</span>
          </div>
        ) : (
          <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-indigo-500/30 text-indigo-300 text-[10px] font-semibold">
            <span>Viora Original</span>
          </div>
        )}

        {/* Play Icon Reveal */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="w-10 h-10 rounded-full bg-indigo-600/90 backdrop-blur-md text-white flex items-center justify-center shadow-lg shadow-indigo-500/40">
            <Play className="w-4 h-4 ml-0.5 fill-current" />
          </div>
        </div>
      </Link>

      {/* Content Details */}
      <div className="flex-1 min-w-0 space-y-2 py-1 flex flex-col justify-between">
        <div className="space-y-1.5">
          {/* Tags */}
          <div className="flex items-center gap-2 flex-wrap">
            {isYouTube ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20 text-[11px] font-semibold">
                <Youtube className="w-3 h-3 text-rose-400" />
                Global Discovery
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[11px] font-semibold">
                Original Network
              </span>
            )}

            {category && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-medium text-slate-300">
                {isMusic && <Music2 className="w-3 h-3 text-cyan-400" />}
                {category}
              </span>
            )}
          </div>

          {/* Title */}
          <Link
            to={watchUrl}
            className="block text-base sm:text-lg font-semibold text-slate-100 line-clamp-2 leading-snug group-hover:text-indigo-400 transition-colors"
          >
            {title}
          </Link>

          {/* Views and Publication date */}
          <div className="text-xs text-slate-400 flex items-center gap-1.5 flex-wrap font-medium">
            <span>{formatViews(views)} views</span>
            <span>•</span>
            <span>{formatDateAgo(createdAt)}</span>
          </div>
        </div>

        <div className="space-y-2 pt-1">
          {/* Channel Info */}
          <div className="flex items-center justify-between gap-2">
            {owner && (
              isYouTube ? (
                <span className="flex items-center gap-2 text-xs text-slate-300 font-medium">
                  <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center justify-center text-[10px] font-bold">
                    {owner.username ? owner.username.charAt(0).toUpperCase() : 'Y'}
                  </span>
                  <span>{owner.username || owner.channelTitle}</span>
                </span>
              ) : (
                <Link
                  to={`/channel/${owner.username}`}
                  className="flex items-center gap-2 text-xs text-slate-300 hover:text-white font-medium transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <img
                    src={owner.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                    alt={owner.username}
                    className="w-5 h-5 rounded-full object-cover ring-1 ring-white/10"
                  />
                  <span>{owner.username}</span>
                  <CheckCircle2 className="w-3 h-3 text-indigo-400 shrink-0" />
                </Link>
              )
            )}

            {isYouTube && externalUrl && (
              <a
                href={externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-slate-400 hover:text-indigo-300 flex items-center gap-1 transition-colors px-2 py-0.5 rounded-md hover:bg-white/5"
                title="Open directly on YouTube"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="w-3 h-3" />
                <span className="hidden sm:inline">YouTube Link</span>
              </a>
            )}
          </div>

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

export default SearchResultCard;
