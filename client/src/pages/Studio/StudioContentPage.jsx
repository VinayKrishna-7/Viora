import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  Lock, 
  Globe, 
  EyeOff, 
  ChevronLeft, 
  ChevronRight,
  Video
} from 'lucide-react';
import { getStudioContentApi } from '../../services/studioService';
import { deleteVideoApi } from '../../services/videoService';
import EditVideoModal from '../../components/video/EditVideoModal';
import { formatViews, formatDateAgo, formatDuration } from '../../utils/formatters';

export const StudioContentPage = () => {
  const [videos, setVideos] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit Video Modal state
  const [editingVideo, setEditingVideo] = useState(null);

  useEffect(() => {
    fetchContent(1);
  }, [activeTab]);

  const fetchContent = async (page = 1) => {
    try {
      setIsLoading(true);
      setError(null);

      const params = {
        page,
        limit: 15,
        search: searchQuery || undefined,
        visibility: activeTab !== 'all' ? activeTab : undefined,
      };

      const res = await getStudioContentApi(params);
      setVideos(res.data?.videos || []);
      setPagination(res.data?.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      setError(err.message || 'Failed to load content');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchContent(1);
  };

  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm('Are you sure you want to permanently delete this video? This cannot be undone.')) {
      return;
    }

    try {
      await deleteVideoApi(videoId);
      setVideos((prev) => prev.filter((v) => v._id !== videoId));
    } catch (err) {
      console.error('Failed to delete video:', err);
    }
  };

  const handleVideoUpdated = (updated) => {
    setVideos((prev) =>
      prev.map((v) => (v._id === updated._id ? { ...v, ...updated } : v))
    );
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100 font-display">
          Channel Content
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage your uploaded videos, edit metadata, and modify privacy settings.
        </p>
      </div>

      {/* Tabs & Search Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-viora-border pb-4">
        {/* Tabs */}
        <div className="flex items-center gap-2">
          {['all', 'public', 'unlisted', 'private'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all border ${
                activeTab === tab
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-500/25'
                  : 'bg-viora-card text-slate-400 border-viora-border hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search your library..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-viora-card border border-viora-border rounded-xl focus:outline-none focus:border-indigo-500 text-slate-100 placeholder-slate-500 transition-colors"
          />
        </form>
      </div>

      {/* Content Table */}
      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-16 bg-viora-card rounded-2xl border border-viora-border" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-16 text-rose-400">
          <p>{error}</p>
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-20 bg-viora-card rounded-3xl border border-viora-border">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-3 text-indigo-400">
            <Video className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-slate-100">
            No content found
          </h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
            {searchQuery
              ? 'No videos matched your search query.'
              : 'You haven’t uploaded any videos matching this filter yet.'}
          </p>
        </div>
      ) : (
        <div className="bg-viora-card rounded-3xl border border-viora-border overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-viora-surface text-slate-400 border-b border-viora-border uppercase tracking-wider font-semibold text-[10px]">
                <tr>
                  <th className="py-3.5 px-6">Video</th>
                  <th className="py-3.5 px-4">Visibility</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Views</th>
                  <th className="py-3.5 px-4">Comments</th>
                  <th className="py-3.5 px-4">Likes</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-viora-border/60">
                {videos.map((video) => (
                  <tr
                    key={video._id}
                    className="hover:bg-white/[0.02] transition group"
                  >
                    {/* Video Title & Thumbnail */}
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3.5 max-w-sm">
                        <div className="relative w-28 aspect-video rounded-xl overflow-hidden bg-viora-surface border border-viora-border shrink-0">
                          <img
                            src={video.thumbnailUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600'}
                            alt={video.title}
                            className="w-full h-full object-cover"
                          />
                          {video.duration > 0 && (
                            <span className="absolute bottom-1 right-1 bg-black/80 backdrop-blur-xs text-slate-200 text-[9px] font-semibold px-1 py-0.2 rounded font-mono">
                              {formatDuration(video.duration)}
                            </span>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-slate-100 line-clamp-1 text-xs">
                            {video.title}
                          </h4>
                          <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                            {video.description || 'No description provided'}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Visibility */}
                    <td className="py-3.5 px-4">
                      {video.visibility === 'public' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          <Globe className="w-3 h-3 text-emerald-400" />
                          <span>Public</span>
                        </span>
                      ) : video.visibility === 'unlisted' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30">
                          <EyeOff className="w-3 h-3 text-amber-400" />
                          <span>Unlisted</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-500/15 text-slate-300 border border-slate-500/30">
                          <Lock className="w-3 h-3" />
                          <span>Private</span>
                        </span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-slate-400">
                      {formatDateAgo(video.createdAt)}
                    </td>

                    {/* Views */}
                    <td className="py-3.5 px-4 font-semibold text-slate-200 font-mono">
                      {formatViews(video.views)}
                    </td>

                    {/* Comments */}
                    <td className="py-3.5 px-4 text-slate-400 font-mono">
                      {video.commentsCount || 0}
                    </td>

                    {/* Likes */}
                    <td className="py-3.5 px-4 text-slate-400 font-mono">
                      {video.likesCount || 0}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setEditingVideo(video)}
                          title="Edit video metadata"
                          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <Link
                          to={`/watch/${video._id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Watch on Viora"
                          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDeleteVideo(video._id)}
                          title="Delete video"
                          className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {pagination.totalPages > 1 && (
            <div className="p-4 border-t border-viora-border flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} total videos)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchContent(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="p-1.5 rounded-lg border border-viora-border text-slate-400 hover:text-white disabled:opacity-30 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => fetchContent(pagination.page + 1)}
                  disabled={!pagination.hasNextPage}
                  className="p-1.5 rounded-lg border border-viora-border text-slate-400 hover:text-white disabled:opacity-30 transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      <EditVideoModal
        isOpen={Boolean(editingVideo)}
        onClose={() => setEditingVideo(null)}
        video={editingVideo}
        onUpdated={handleVideoUpdated}
      />
    </div>
  );
};

export default StudioContentPage;
