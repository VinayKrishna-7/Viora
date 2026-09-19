import React, { useEffect, useState } from 'react';
import { X, Clock, Plus, Lock, Globe, Check, Loader2 } from 'lucide-react';
import { 
  getUserPlaylistsApi, 
  createPlaylistApi, 
  addVideoToPlaylistApi, 
  removeVideoFromPlaylistApi 
} from '../../services/playlistService';
import { 
  getWatchLaterStatusApi, 
  toggleWatchLaterApi 
} from '../../services/watchLaterService';
import Button from '../ui/Button';

export const SavePlaylistModal = ({ isOpen, onClose, videoId }) => {
  const [playlists, setPlaylists] = useState([]);
  const [inWatchLater, setInWatchLater] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingWatchLater, setIsUpdatingWatchLater] = useState(false);
  const [updatingPlaylistId, setUpdatingPlaylistId] = useState(null);

  // New Playlist form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPlaylistTitle, setNewPlaylistTitle] = useState('');
  const [newPlaylistVisibility, setNewPlaylistVisibility] = useState('public');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  useEffect(() => {
    if (!isOpen || !videoId) return;

    let isMounted = true;
    setIsLoading(true);

    const loadData = async () => {
      try {
        const [plRes, wlRes] = await Promise.all([
          getUserPlaylistsApi(),
          getWatchLaterStatusApi(videoId),
        ]);

        if (isMounted) {
          setPlaylists(plRes.data?.playlists || []);
          setInWatchLater(Boolean(wlRes.data?.inWatchLater));
        }
      } catch (err) {
        console.error('Error fetching playlists/watch later:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [isOpen, videoId]);

  if (!isOpen) return null;

  const handleToggleWatchLater = async () => {
    if (isUpdatingWatchLater) return;
    setIsUpdatingWatchLater(true);
    try {
      const res = await toggleWatchLaterApi(videoId);
      setInWatchLater(res.data?.inWatchLater);
    } catch (err) {
      console.error('Failed to toggle Watch Later', err);
    } finally {
      setIsUpdatingWatchLater(false);
    }
  };

  const handleTogglePlaylist = async (playlist) => {
    const isPresent = playlist.videos?.some((v) => {
      const id = typeof v === 'object' ? v._id : v;
      return id?.toString() === videoId?.toString();
    });

    setUpdatingPlaylistId(playlist._id);
    try {
      if (isPresent) {
        await removeVideoFromPlaylistApi(playlist._id, videoId);
        setPlaylists((prev) =>
          prev.map((pl) =>
            pl._id === playlist._id
              ? {
                  ...pl,
                  videos: (pl.videos || []).filter((v) => {
                    const id = typeof v === 'object' ? v._id : v;
                    return id?.toString() !== videoId?.toString();
                  }),
                }
              : pl
          )
        );
      } else {
        await addVideoToPlaylistApi(playlist._id, videoId);
        setPlaylists((prev) =>
          prev.map((pl) =>
            pl._id === playlist._id
              ? { ...pl, videos: [...(pl.videos || []), videoId] }
              : pl
          )
        );
      }
    } catch (err) {
      console.error('Failed to toggle video in playlist:', err);
    } finally {
      setUpdatingPlaylistId(null);
    }
  };

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    if (!newPlaylistTitle.trim()) return;

    setIsCreating(true);
    setCreateError('');

    try {
      const res = await createPlaylistApi({
        name: newPlaylistTitle.trim(),
        visibility: newPlaylistVisibility,
        videoId,
      });

      const newPl = res.data;
      setPlaylists((prev) => [newPl, ...prev]);
      setNewPlaylistTitle('');
      setShowCreateForm(false);
    } catch (err) {
      setCreateError(err.message || 'Failed to create playlist');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fadeIn">
      <div 
        className="w-full max-w-sm bg-viora-surface rounded-3xl border border-viora-border shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-viora-border">
          <h2 className="text-base font-bold text-slate-100">Save to Collection</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 max-h-80 overflow-y-auto space-y-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
            </div>
          ) : (
            <>
              {/* Watch Later Option */}
              <label className="flex items-center justify-between p-3 rounded-2xl hover:bg-white/[0.04] cursor-pointer transition border border-transparent hover:border-viora-border">
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  <span className="text-sm font-medium text-slate-200">Watch Later</span>
                </div>
                <input
                  type="checkbox"
                  checked={inWatchLater}
                  onChange={handleToggleWatchLater}
                  disabled={isUpdatingWatchLater}
                  className="w-4 h-4 rounded accent-indigo-500 cursor-pointer"
                />
              </label>

              {/* User Playlists */}
              {playlists.map((pl) => {
                const isSelected = pl.videos?.some((v) => {
                  const id = typeof v === 'object' ? v._id : v;
                  return id?.toString() === videoId?.toString();
                });

                return (
                  <label
                    key={pl._id}
                    className="flex items-center justify-between p-3 rounded-2xl hover:bg-white/[0.04] cursor-pointer transition border border-transparent hover:border-viora-border"
                  >
                    <div className="flex items-center gap-3">
                      {pl.visibility === 'private' ? (
                        <Lock className="w-4 h-4 text-slate-400" />
                      ) : (
                        <Globe className="w-4 h-4 text-slate-400" />
                      )}
                      <span className="text-sm font-medium text-slate-200 truncate max-w-[180px]">
                        {pl.name}
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={Boolean(isSelected)}
                      onChange={() => handleTogglePlaylist(pl)}
                      disabled={updatingPlaylistId === pl._id}
                      className="w-4 h-4 rounded accent-indigo-500 cursor-pointer"
                    />
                  </label>
                );
              })}
            </>
          )}

          {/* New Playlist Form / Toggle */}
          {!showCreateForm ? (
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-2.5 w-full p-3 text-sm font-semibold text-indigo-400 hover:text-indigo-300 hover:bg-white/[0.04] rounded-2xl transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Playlist</span>
            </button>
          ) : (
            <form onSubmit={handleCreatePlaylist} className="pt-3 border-t border-viora-border space-y-3">
              {createError && (
                <p className="text-xs text-rose-400 bg-rose-500/10 p-2 rounded-xl border border-rose-500/20">
                  {createError}
                </p>
              )}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Playlist Title
                </label>
                <input
                  type="text"
                  placeholder="Enter collection name..."
                  value={newPlaylistTitle}
                  onChange={(e) => setNewPlaylistTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-viora-card border border-viora-border rounded-xl focus:outline-none focus:border-indigo-500 text-slate-100 placeholder-slate-500"
                  autoFocus
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Privacy
                </label>
                <select
                  value={newPlaylistVisibility}
                  onChange={(e) => setNewPlaylistVisibility(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-viora-card border border-viora-border rounded-xl focus:outline-none focus:border-indigo-500 text-slate-200"
                >
                  <option value="public" className="bg-viora-surface text-slate-200">Public</option>
                  <option value="unlisted" className="bg-viora-surface text-slate-200">Unlisted</option>
                  <option value="private" className="bg-viora-surface text-slate-200">Private</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-400 hover:text-white rounded-xl transition"
                >
                  Cancel
                </button>
                <Button
                  type="submit"
                  disabled={isCreating || !newPlaylistTitle.trim()}
                  variant="primary"
                  size="sm"
                >
                  {isCreating ? 'Creating...' : 'Create'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SavePlaylistModal;
