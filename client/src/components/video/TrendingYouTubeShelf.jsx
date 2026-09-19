import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Compass } from 'lucide-react';
import { searchVideosApi } from '../../services/searchService';
import MusicCard from './MusicCard';
import VideoCardSkeleton from '../ui/Skeleton';

export const TrendingYouTubeShelf = ({ query = 'songs', title = 'Global Trends & Music Discovery', isMusic = false }) => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    searchVideosApi({ q: query, source: 'youtube', limit: 8 })
      .then((res) => {
        if (isMounted && res.data?.youtube) {
          setItems(res.data.youtube);
        }
      })
      .catch((err) => {
        console.warn('Failed to load YouTube shelf:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [query]);

  if (!isLoading && items.length === 0) return null;

  return (
    <section className="space-y-4 py-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight">
              {title}
            </h2>
          </div>
        </div>

        <Link
          to={`/search?q=${encodeURIComponent(query)}&source=youtube`}
          className="group flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
        >
          <span>Explore All</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <VideoCardSkeleton key={i} />
            ))
          : items.slice(0, 4).map((item) => {
              const cleanId = item.id || (item._id ? item._id.toString().replace(/^yt_/, '') : '');
              return (
                <MusicCard
                  key={cleanId}
                  item={{
                    ...item,
                    videoId: cleanId,
                    source: 'youtube',
                  }}
                />
              );
            })}
      </div>
    </section>
  );
};

export default TrendingYouTubeShelf;
