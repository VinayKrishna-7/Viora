import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Play, 
  Trash2, 
  Edit3, 
  Lock, 
  Globe, 
  EyeOff, 
  ListPlus,
  Clock,
  MoreVertical,
  Check,
  X
} from 'lucide-react';
import { 
  getPlaylistByIdApi, 
  updatePlaylistApi, 
  deletePlaylistApi,
  removeVideoFromPlaylistApi 
} from '../../services/playlistService';
import { formatViews, formatDateAgo, formatDuration } from '../../utils/formatters';

export const PlaylistDetailsPage = () => {
  const { playlistId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [playlist, setPlaylist] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit Mode
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editVisibility, setEditVisibility] = useState('public');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchPlaylist();
  }, [playlistId]);

  const fetchPlaylist = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await getPlaylistByIdApi(playlistId);
      setPlaylist(res.data);
      setEditName(res.data.name);
      setEditDesc(res.data.description || '');
      setEditVisibility(res.data.visibility || 'public');
    } catch (err) {
      setError(err.message || 'Playlist not found or is private');
    } finally {
      setIsLoading(false);
    }
  };

  const isOwner = user && playlist?.owner && (
    (typeof playlist.owner === 'object' ? playlist.owner._id : playlist.owner) === user._id
  );

  const handleRemoveVideo = async (e, videoId) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await removeVideoFromPlaylistApi(playlistId, videoId);
      setPlaylist((prev) => ({
        ...prev,
        videos: prev.videos.filter((v) => {
          const id = typeof v === 'object' ? v._id : v;
          return id !== videoId;
        }),
      }));
    } catch (err) {
      console.error('Failed to remove video from playlist:', err);
    }
  };

  const handleDeletePlaylist = async () => {
    if (!window.confirm('Are you sure you want to delete this playlist? This action cannot be undone.')) return;
    try {
      await deletePlaylistApi(playlistId);
      navigate('/playlists');
    } catch (err) {
      console.error('Failed to delete playlist:', err);
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editName.trim()) return;

    setIsSaving(true);
    try {
      const res = await updatePlaylistApi(playlistId, {
        name: editName.trim(),
        description: editDesc.trim(),
        visibility: editVisibility,
      });
      setPlaylist((prev) => ({
        ...prev,
        name: res.data.name,
        description: res.data.description,
        visibility: res.data.visibility,
      }));
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update playlist:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="h-96 bg-viora-card/60 rounded-3xl animate-pulse border border-white/5" />
          <div className="lg:col-span-2 space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 bg-viora-card/60 rounded-2xl animate-pulse border border-white/5" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !playlist) {
    return (
      <div className="max-w-xl mx-auto text-center py-20 bg-viora-card/40 rounded-3xl border border-white/5 shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mx-auto mb-4">
          <ListPlus className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-white mb-2">Playlist Unavailable</h1>
        <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6 leading-relaxed">
          {error || 'The playlist you are looking for does not exist or you do not have permission to view it.'}
        </p>
        <Link
          to="/playlists"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-indigo-500/20"
        >
          <span>Back to Playlists</span>
        </Link>
      </div>
    );
  }

  const validVideos = (playlist.videos || []).filter((v) => v !== null && typeof v === 'object');
  const firstVideoId = validVideos.length > 0 ? validVideos[0]._id : null;
  const coverImage =
    validVideos.length > 0 && validVideos[0].thumbnailUrl
      ? validVideos[0].thumbnailUrl
      : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600';

  return (
    <div className="max-w-7xl mx-auto pb-16">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Playlist Card Hero */}
        <div className="p-6 rounded-3xl bg-gradient-to-b from-indigo-950/40 via-viora-surface/80 to-viora-bg border border-indigo-500/20 shadow-2xl space-y-5 lg:sticky lg:top-20 backdrop-blur-xl">
          <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
            <img
              src={coverImage}
              alt={playlist.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {firstVideoId && (
              <Link
                to={`/watch/${firstVideoId}`}
                className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Play className="w-12 h-12 text-white fill-current" />
              </Link>
            )}
          </div>

          {!isEditing ? (
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white leading-tight">
                  {playlist.name}
                </h1>
                {isOwner && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setIsEditing(true)}
                      title="Edit playlist details"
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleDeletePlaylist}
                      title="Delete playlist"
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {playlist.description && (
                <p className="text-xs text-slate-400 whitespace-pre-line leading-relaxed">
                  {playlist.description}
                </p>
              )}

              <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400 border-t border-white/5">
                <span className="font-semibold text-slate-200">
                  {typeof playlist.owner === 'object' ? playlist.owner.username : 'You'}
                </span>
                <span className="text-slate-600">•</span>
                <span>{validVideos.length} {validVideos.length === 1 ? 'video' : 'videos'}</span>
                <span className="text-slate-600">•</span>
                <span className="capitalize">{playlist.visibility}</span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSaveEdit} className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-viora-card border border-white/10 rounded-xl focus:outline-none focus:border-indigo-500 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows="3"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-viora-card border border-white/10 rounded-xl focus:outline-none focus:border-indigo-500 text-white resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Privacy
                </label>
                <select
                  value={editVisibility}
                  onChange={(e) => setEditVisibility(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-viora-card border border-white/10 rounded-xl focus:outline-none focus:border-indigo-500 text-white"
                >
                  <option value="public" className="bg-viora-card text-white">Public</option>
                  <option value="unlisted" className="bg-viora-card text-white">Unlisted</option>
                  <option value="private" className="bg-viora-card text-white">Private</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 rounded-lg disabled:opacity-50 transition shadow-md shadow-indigo-500/20"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          )}

          {firstVideoId && !isEditing && (
            <div className="pt-2">
              <Link
                to={`/watch/${firstVideoId}`}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-indigo-500/25"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Play all</span>
              </Link>
            </div>
          )}
        </div>

        {/* Right Column: Video List */}
        <div className="lg:col-span-2 space-y-2">
          {validVideos.length === 0 ? (
            <div className="text-center py-16 bg-viora-card/40 rounded-3xl border border-white/5 shadow-xl">
              <ListPlus className="w-12 h-12 text-slate-600 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-white">
                This playlist has no videos yet
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Browse videos and click "Save" to add them to this playlist.
              </p>
            </div>
          ) : (
            validVideos.map((video, idx) => (
              <div
                key={video._id}
                className="group flex items-center gap-4 p-2.5 rounded-2xl bg-viora-card/40 hover:bg-viora-surface/90 transition-all duration-200 relative border border-white/5 hover:border-indigo-500/20"
              >
                {/* Index number */}
                <span className="text-xs font-semibold text-slate-500 w-5 text-right shrink-0">
                  {idx + 1}
                </span>

                {/* Thumbnail */}
                <Link
                  to={`/watch/${video._id}`}
                  className="relative w-36 sm:w-44 aspect-video bg-viora-card rounded-xl overflow-hidden flex-shrink-0 border border-white/5 group/thumb"
                >
                  <img
                    src={video.thumbnailUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600'}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300"
                  />
                  {video.duration > 0 && (
                    <span className="absolute bottom-1.5 right-1.5 bg-black/80 backdrop-blur-xs text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-md border border-white/10">
                      {formatDuration(video.duration)}
                    </span>
                  )}
                </Link>

                {/* Metadata */}
                <div className="flex-1 min-w-0 pr-2">
                  <Link
                    to={`/watch/${video._id}`}
                    className="text-xs sm:text-sm font-semibold text-white line-clamp-2 hover:text-indigo-400 transition-colors leading-snug"
                  >
                    {video.title}
                  </Link>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Link
                      to={`/channel/${video.owner?.username}`}
                      className="text-[11px] text-slate-400 hover:text-slate-200 truncate"
                    >
                      {video.owner?.username}
                    </Link>
                    <span className="text-slate-600">•</span>
                    <span className="text-[11px] text-slate-500">
                      {formatViews(video.views)}
                    </span>
                  </div>
                </div>

                {/* Remove video if owner */}
                {isOwner && (
                  <button
                    onClick={(e) => handleRemoveVideo(e, video._id)}
                    title="Remove from playlist"
                    className="p-2 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaylistDetailsPage;
