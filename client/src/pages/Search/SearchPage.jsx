import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, 
  ArrowUpDown, 
  Youtube, 
  Video as VideoIcon, 
  Sparkles,
  AlertTriangle,
  Layers,
  Compass
} from 'lucide-react';
import { searchVideosApi } from '../../services/searchService';
import SearchResultCard from '../../components/video/SearchResultCard';
import Button from '../../components/ui/Button';

const categories = [
  'All', 'Music', 'Gaming', 'Programming', 'Education', 
  'News', 'Sports', 'Entertainment', 'Technology', 
  'Travel', 'Comedy', 'Movies', 'Science'
];

export const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const currentCategory = searchParams.get('category') || 'All';
  const currentSource = searchParams.get('source') || 'all';

  const [localVideos, setLocalVideos] = useState([]);
  const [youtubeVideos, setYoutubeVideos] = useState([]);
  const [combinedVideos, setCombinedVideos] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [warningMessage, setWarningMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState('relevance');
  const [page, setPage] = useState(1);

  const fetchSearchResults = useCallback(
    async (pageNum = 1, append = false) => {
      try {
        setIsLoading(true);
        const res = await searchVideosApi({
          q: query,
          category: currentCategory !== 'All' ? currentCategory : undefined,
          sortBy,
          source: currentSource,
          page: pageNum,
          limit: 15,
        });

        const data = res.data || {};
        const newLocal = data.local || [];
        const newYt = data.youtube || [];
        const newCombined = data.combined || [];

        setWarningMessage(data.warning || null);
        setPagination(data.pagination || null);

        if (append) {
          setLocalVideos((prev) => [...prev, ...newLocal]);
          setYoutubeVideos((prev) => [...prev, ...newYt]);
          setCombinedVideos((prev) => [...prev, ...newCombined]);
        } else {
          setLocalVideos(newLocal);
          setYoutubeVideos(newYt);
          setCombinedVideos(newCombined);
        }
      } catch (err) {
        console.error('Search error:', err);
        if (!append) {
          setLocalVideos([]);
          setYoutubeVideos([]);
          setCombinedVideos([]);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [query, currentCategory, currentSource, sortBy]
  );

  useEffect(() => {
    setPage(1);
    fetchSearchResults(1, false);
  }, [fetchSearchResults]);

  const handleSelectCategory = (cat) => {
    setPage(1);
    const newParams = new URLSearchParams(searchParams);
    if (cat === 'All') {
      newParams.delete('category');
    } else {
      newParams.set('category', cat);
    }
    setSearchParams(newParams);
  };

  const handleSelectSource = (src) => {
    setPage(1);
    const newParams = new URLSearchParams(searchParams);
    if (src === 'all') {
      newParams.delete('source');
    } else {
      newParams.set('source', src);
    }
    setSearchParams(newParams);
  };

  const handleLoadMore = () => {
    if (pagination?.hasNextPage) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchSearchResults(nextPage, true);
    }
  };

  const totalResultsCount = localVideos.length + youtubeVideos.length;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16 px-2 sm:px-4">
      {/* Source Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-viora-border pb-4 flex-wrap">
        <button
          onClick={() => handleSelectSource('all')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
            currentSource === 'all'
              ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-500/25'
              : 'bg-viora-card/80 text-slate-400 border-viora-border hover:text-slate-100 hover:bg-viora-card'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>All Sources</span>
        </button>

        <button
          onClick={() => handleSelectSource('local')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
            currentSource === 'local'
              ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-500/25'
              : 'bg-viora-card/80 text-slate-400 border-viora-border hover:text-slate-100 hover:bg-viora-card'
          }`}
        >
          <VideoIcon className="w-3.5 h-3.5" />
          <span>Viora Originals</span>
          {localVideos.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-indigo-500/30 text-indigo-200 border border-indigo-500/40">
              {localVideos.length}
            </span>
          )}
        </button>

        <button
          onClick={() => handleSelectSource('youtube')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
            currentSource === 'youtube'
              ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-500/25'
              : 'bg-viora-card/80 text-slate-400 border-viora-border hover:text-slate-100 hover:bg-viora-card'
          }`}
        >
          <Youtube className="w-3.5 h-3.5 text-rose-400" />
          <span>YouTube & Music</span>
          {youtubeVideos.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-rose-500/20 text-rose-200 border border-rose-500/30">
              {youtubeVideos.length}
            </span>
          )}
        </button>
      </div>

      {/* Category Filter Rail */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
        {categories.map((cat) => {
          const isSelected = currentCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => handleSelectCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
                isSelected
                  ? 'bg-indigo-600/90 text-white border-indigo-500 shadow-sm'
                  : 'bg-viora-card/60 text-slate-400 border-viora-border hover:text-white hover:bg-viora-card'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Warning Notice */}
      {warningMessage && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
          <p className="flex-1 leading-relaxed">{warningMessage}</p>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-viora-border pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Search className="w-4 h-4" />
          </div>
          <h1 className="text-base sm:text-lg font-bold text-slate-100">
            {query ? (
              <>Results for <span className="text-indigo-400 font-semibold">"{query}"</span></>
            ) : (
              'Discover Videos & Music'
            )}
          </h1>
          {totalResultsCount > 0 && (
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400 font-medium">
              {totalResultsCount} found
            </span>
          )}
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-viora-card border border-viora-border text-xs font-medium text-slate-300">
          <ArrowUpDown className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-slate-400">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sort search results by"
            className="bg-transparent border-none text-xs font-semibold text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="relevance" className="bg-viora-surface text-slate-200">Relevance</option>
            <option value="uploadDate" className="bg-viora-surface text-slate-200">Upload Date</option>
            <option value="viewCount" className="bg-viora-surface text-slate-200">View Count</option>
          </select>
        </div>
      </div>

      {/* Loading Skeletons */}
      {isLoading && totalResultsCount === 0 && (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col sm:flex-row gap-4 p-3 rounded-2xl bg-viora-card/40 border border-viora-border animate-pulse">
              <div className="aspect-video w-full sm:w-72 md:w-80 rounded-xl bg-viora-surface shrink-0" />
              <div className="flex-1 space-y-3 py-1">
                <div className="h-4 bg-viora-surface rounded w-4/5" />
                <div className="h-3 bg-viora-surface rounded w-1/3" />
                <div className="h-3 bg-viora-surface rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && totalResultsCount === 0 && (
        <div className="text-center py-20 px-4 rounded-3xl bg-viora-card/30 border border-viora-border space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto text-indigo-400">
            <Search className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-slate-100">
            No results found for "{query}"
          </h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            Try different keywords or explore trending categories below:
          </p>
          <div className="flex items-center justify-center gap-2 pt-2 flex-wrap">
            {['songs', 'Arijit Singh', 'Taylor Swift', 'MERN tutorial', 'Gaming', 'Lo-Fi'].map((term) => (
              <button
                key={term}
                onClick={() => setSearchParams({ q: term })}
                className="px-3 py-1.5 rounded-xl bg-viora-card border border-viora-border hover:border-indigo-500/40 text-xs text-slate-300 hover:text-white transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results Rendering */}
      {!isLoading && totalResultsCount > 0 && (
        <div className="space-y-8">
          {/* Section 1: Viora Originals */}
          {(currentSource === 'all' || currentSource === 'local') && localVideos.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  <span>Viora Originals ({localVideos.length})</span>
                </h2>
              </div>
              <div className="space-y-3">
                {localVideos.map((video) => (
                  <SearchResultCard key={video._id} video={video} />
                ))}
              </div>
            </div>
          )}

          {/* Friendly notice if Viora has 0 local videos, but YouTube has videos */}
          {currentSource === 'all' && localVideos.length === 0 && youtubeVideos.length > 0 && query && (
            <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-200 flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>
                No local Viora library entries found. Presenting <strong>{youtubeVideos.length} matching releases from YouTube & Global Music Discovery</strong> below:
              </span>
            </div>
          )}

          {/* Section 2: YouTube & Music Discovery */}
          {(currentSource === 'all' || currentSource === 'youtube') && youtubeVideos.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Youtube className="w-4 h-4 text-rose-400" />
                  <span>YouTube & Music Discovery ({youtubeVideos.length})</span>
                </h2>
              </div>
              <div className="space-y-3">
                {youtubeVideos.map((video) => (
                  <SearchResultCard key={video._id || video.id} video={video} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pagination Load More */}
      {pagination?.hasNextPage && (
        <div className="text-center pt-8">
          <Button
            onClick={handleLoadMore}
            disabled={isLoading}
            variant="secondary"
            className="px-8 py-3 rounded-xl border border-viora-border hover:border-indigo-500/30"
          >
            {isLoading ? 'Loading More Results...' : 'Load More Results'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
