import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getVideosApi } from '../../services/videoService';
import { checkHealth } from '../../services/healthService';
import VideoGrid from '../../components/video/VideoGrid';
import UploadModal from '../../components/video/UploadModal';
import ContinueWatchingSection from '../../components/video/ContinueWatchingSection';
import TrendingYouTubeShelf from '../../components/video/TrendingYouTubeShelf';
import Button from '../../components/ui/Button';
import { 
  Activity, 
  Server, 
  Database, 
  Sparkles,
  ArrowUpDown,
  XCircle,
  Upload,
  Play,
  Flame,
  Radio,
  Music2
} from 'lucide-react';

const categories = [
  'All', 'Music', 'Gaming', 'Programming', 'Education', 
  'News', 'Sports', 'Entertainment', 'Technology', 
  'Travel', 'Comedy', 'Movies', 'Science'
];

export const HomePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentCategory = searchParams.get('category') || 'All';

  const [videos, setVideos] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoadingVideos, setIsLoadingVideos] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Backend Health state
  const [healthStatus, setHealthStatus] = useState(null);
  const [healthLoading, setHealthLoading] = useState(true);
  const [healthError, setHealthError] = useState(null);

  const { isAuthenticated } = useSelector((state) => state.auth);

  // Fetch Videos
  const fetchVideos = useCallback(async (pageNum = 1, append = false) => {
    try {
      setIsLoadingVideos(true);
      const res = await getVideosApi({
        category: currentCategory !== 'All' ? currentCategory : undefined,
        sortBy,
        page: pageNum,
        limit: 12,
      });

      if (append) {
        setVideos((prev) => [...prev, ...res.data.videos]);
      } else {
        setVideos(res.data.videos);
      }
      setPagination(res.data.pagination);
    } catch (err) {
      console.error('Error fetching videos:', err);
      if (!append) setVideos([]);
    } finally {
      setIsLoadingVideos(false);
    }
  }, [currentCategory, sortBy]);

  // Handle category change
  const handleSelectCategory = (cat) => {
    setPage(1);
    if (cat === 'All') {
      searchParams.delete('category');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ category: cat });
    }
  };

  // Re-fetch when category or sort changes
  useEffect(() => {
    setPage(1);
    fetchVideos(1, false);
  }, [fetchVideos]);

  // Check Backend Health
  useEffect(() => {
    checkHealth()
      .then((res) => {
        setHealthStatus(res.data);
        setHealthError(null);
      })
      .catch((err) => setHealthError(err.message || 'Offline'))
      .finally(() => setHealthLoading(false));
  }, []);

  const handleLoadMore = () => {
    if (pagination?.hasNextPage) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchVideos(nextPage, true);
    }
  };

  const handleVideoUploaded = (newVideo) => {
    setVideos((prev) => [newVideo, ...prev]);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Category Chips Rail */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
        {categories.map((cat) => {
          const isSelected = currentCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => handleSelectCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 border ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-500/25 ring-2 ring-indigo-500/20'
                  : 'bg-viora-card/80 text-slate-300 border-viora-border hover:border-white/20 hover:bg-viora-card hover:text-white'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Cinematic Hero Billboard */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950/60 via-viora-card to-viora-surface border border-viora-border p-6 sm:p-10 text-white shadow-2xl">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-0 right-1/4 -mt-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 -mb-20 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Next-Gen Streaming Platform</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.15] font-display">
            Watch. Stream. <br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-cyan-400 bg-clip-text text-transparent">
              Discover Without Limits.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed max-w-xl">
            Stream high-fidelity original media alongside unlimited global YouTube & music discovery in one unified cinematic experience.
          </p>

          <div className="flex items-center gap-3 pt-2 flex-wrap">
            {isAuthenticated ? (
              <Button
                onClick={() => setIsUploadModalOpen(true)}
                variant="primary"
                className="flex items-center gap-2 shadow-lg shadow-indigo-500/25"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Content</span>
              </Button>
            ) : (
              <Button
                to="/login"
                variant="primary"
                className="flex items-center gap-2 shadow-lg shadow-indigo-500/25"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Get Started Free</span>
              </Button>
            )}

            <Button
              to="/search?category=Music&q=songs"
              variant="outline"
              className="flex items-center gap-2 border-white/15 hover:border-indigo-500/40"
            >
              <Music2 className="w-4 h-4 text-cyan-400" />
              <span>Explore Music</span>
            </Button>
          </div>
        </div>

        {/* Minimal Health Pill in Bottom-Right */}
        <div className="mt-6 pt-4 border-t border-white/10 sm:border-t-0 sm:pt-0 sm:absolute sm:bottom-6 sm:right-6 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-xs">
          <div className={`w-2 h-2 rounded-full ${healthStatus?.status === 'ok' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          <span className="text-slate-300 text-[11px] font-medium">
            Core Engine: {healthLoading ? 'Checking...' : (healthStatus?.status === 'ok' ? 'Online & Synced' : 'Standby')}
          </span>
        </div>
      </div>

      {/* Continue Watching Section */}
      <ContinueWatchingSection />

      {/* Trending Global & Music Shelf */}
      <TrendingYouTubeShelf
        query={currentCategory === 'Music' ? 'songs' : 'trending'}
        title={currentCategory === 'Music' ? 'Trending Tracks & Hi-Fi Music' : 'Trending on YouTube & Global Music'}
      />

      {/* Video Feed Section Header */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight">
            {currentCategory === 'All' ? 'Recommended Releases' : `${currentCategory} Selection`}
          </h2>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-viora-card border border-viora-border text-xs font-semibold text-slate-300">
          <ArrowUpDown className="w-3.5 h-3.5 text-indigo-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sort videos by"
            className="bg-transparent border-none text-xs font-medium text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="newest" className="bg-viora-surface text-slate-200">Newest First</option>
            <option value="popular" className="bg-viora-surface text-slate-200">Most Viewed</option>
            <option value="oldest" className="bg-viora-surface text-slate-200">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Video Grid */}
      <VideoGrid
        videos={videos}
        isLoading={isLoadingVideos && videos.length === 0}
        emptyMessage={`No videos found in "${currentCategory}"`}
        onUploadClick={() => setIsUploadModalOpen(true)}
      />

      {/* Pagination / Load More */}
      {pagination?.hasNextPage && (
        <div className="flex justify-center pt-8">
          <Button
            onClick={handleLoadMore}
            disabled={isLoadingVideos}
            variant="secondary"
            className="px-8 py-3 rounded-xl shadow-lg border border-viora-border hover:border-indigo-500/30"
          >
            {isLoadingVideos ? 'Loading More...' : 'Load More Releases'}
          </Button>
        </div>
      )}

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={handleVideoUploaded}
      />
    </div>
  );
};

export default HomePage;
