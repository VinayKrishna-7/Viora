import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ListPlus, Plus, Lock, Globe, Trash2, Play, EyeOff } from 'lucide-react';
import { 
  getUserPlaylistsApi, 
  createPlaylistApi, 
  deletePlaylistApi 
} from '../../services/playlistService';

export const PlaylistsPage = () => {
  const [playlists, setPlaylists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal for new playlist
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await getUserPlaylistsApi();
      setPlaylists(res.data?.playlists || []);
    } catch (err) {
      setError(err.message || 'Failed to load playlists');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (e, playlistId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this playlist?')) return;

    try {
      await deletePlaylistApi(playlistId);
      setPlaylists((prev) => prev.filter((p) => p._id !== playlistId));
    } catch (err) {
      console.error('Failed to delete playlist:', err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setModalError('');
    try {
      const res = await createPlaylistApi({
        name: name.trim(),
        description: description.trim(),
        visibility,
      });
      setPlaylists((prev) => [res.data, ...prev]);
      setName('');
      setDescription('');
      setVisibility('public');
      setShowModal(false);
    } catch (err) {
      setModalError(err.message || 'Failed to create playlist');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-6 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <ListPlus className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Playlists
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Create, organize, and curate your video collections
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-indigo-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>New Playlist</span>
        </button>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-3 animate-pulse bg-viora-card/40 p-3 rounded-2xl border border-white/5">
              <div className="aspect-video bg-viora-card rounded-xl" />
              <div className="h-4 bg-viora-card rounded w-3/4" />
              <div className="h-3 bg-viora-card rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-16 text-rose-400">
          <p>{error}</p>
        </div>
      ) : playlists.length === 0 ? (
        <div className="text-center py-20 bg-viora-card/40 rounded-3xl border border-white/5 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto mb-4">
            <ListPlus className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">
            No playlists created yet
          </h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1.5 mb-6 leading-relaxed">
            Organize videos into custom playlists to group series, thematic queues, or favorite tracks.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-indigo-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Create Playlist</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {playlists.map((playlist) => {
            const firstVideo = playlist.videos && playlist.videos.length > 0 ? playlist.videos[0] : null;
            const coverImage =
              typeof firstVideo === 'object' && firstVideo?.thumbnailUrl
                ? firstVideo.thumbnailUrl
                : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600';

            return (
              <div
                key={playlist._id}
                className="group flex flex-col bg-viora-card/50 hover:bg-viora-surface/90 rounded-2xl border border-white/5 hover:border-indigo-500/20 overflow-hidden transition-all duration-300 shadow-md"
              >
                {/* Cover Thumbnail */}
                <Link
                  to={`/playlist/${playlist._id}`}
                  className="relative aspect-video bg-viora-card overflow-hidden block border-b border-white/5"
                >
                  <img
                    src={coverImage}
                    alt={playlist.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Playlist Overlay Sidebar */}
                  <div className="absolute inset-y-0 right-0 w-2/5 bg-black/70 backdrop-blur-xs flex flex-col items-center justify-center text-white space-y-1 border-l border-white/10">
                    <ListPlus className="w-5 h-5 text-indigo-400" />
                    <span className="text-xs font-bold">
                      {playlist.videos?.length || 0}
                    </span>
                    <span className="text-[9px] tracking-wider uppercase font-semibold text-slate-400">
                      Videos
                    </span>
                  </div>
                </Link>

                {/* Details */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        to={`/playlist/${playlist._id}`}
                        className="text-sm font-semibold text-white line-clamp-1 hover:text-indigo-400 transition-colors"
                      >
                        {playlist.name}
                      </Link>
                      <button
                        onClick={(e) => handleDelete(e, playlist._id)}
                        title="Delete playlist"
                        className="p-1 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {playlist.description && (
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                        {playlist.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/5 text-[11px] text-slate-400 font-medium">
                    {playlist.visibility === 'private' ? (
                      <div className="flex items-center gap-1 text-slate-400">
                        <Lock className="w-3 h-3" />
                        <span>Private</span>
                      </div>
                    ) : playlist.visibility === 'unlisted' ? (
                      <div className="flex items-center gap-1 text-amber-400">
                        <EyeOff className="w-3 h-3" />
                        <span>Unlisted</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-emerald-400">
                        <Globe className="w-3 h-3" />
                        <span>Public</span>
                      </div>
                    )}
                    <span className="text-slate-600">•</span>
                    <Link
                      to={`/playlist/${playlist._id}`}
                      className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
                    >
                      View playlist
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Playlist Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md bg-viora-surface rounded-3xl border border-white/10 shadow-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">
              Create New Playlist
            </h2>

            {modalError && (
              <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Playlist Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chill Beats & Synthesizers"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-viora-card border border-white/10 rounded-xl focus:outline-none focus:border-indigo-500 text-white placeholder-slate-500"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Description (Optional)
                </label>
                <textarea
                  placeholder="What kind of tracks or videos belong in this collection?"
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-viora-card border border-white/10 rounded-xl focus:outline-none focus:border-indigo-500 text-white placeholder-slate-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Privacy Setting
                </label>
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-viora-card border border-white/10 rounded-xl focus:outline-none focus:border-indigo-500 text-white"
                >
                  <option value="public" className="bg-viora-card text-white">Public (Searchable and viewable by all)</option>
                  <option value="unlisted" className="bg-viora-card text-white">Unlisted (Anyone with direct link)</option>
                  <option value="private" className="bg-viora-card text-white">Private (Only you can view)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !name.trim()}
                  className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 rounded-xl disabled:opacity-50 transition shadow-lg shadow-indigo-500/20"
                >
                  {isSubmitting ? 'Creating...' : 'Create Playlist'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaylistsPage;
