import React, { useState, useEffect } from 'react';
import { X, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import { updateVideoApi } from '../../services/videoService';
import Button from '../ui/Button';

const CATEGORIES = [
  'All',
  'Gaming',
  'Music',
  'Tech',
  'Education',
  'Entertainment',
  'News',
  'Sports',
  'Comedy',
];

export const EditVideoModal = ({ isOpen, onClose, video, onUpdated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Entertainment');
  const [tags, setTags] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (video) {
      setTitle(video.title || '');
      setDescription(video.description || '');
      setCategory(video.category || 'Entertainment');
      setTags(video.tags ? video.tags.join(', ') : '');
      setVisibility(video.visibility || 'public');
      setThumbnailPreview(video.thumbnailUrl || '');
      setThumbnailFile(null);
      setError('');
    }
  }, [video, isOpen]);

  if (!isOpen || !video) return null;

  const handleThumbnailChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('category', category);
      formData.append('visibility', visibility);

      if (tags.trim()) {
        const tagArray = tags
          .split(',')
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean);
        tagArray.forEach((t) => formData.append('tags[]', t));
      }

      if (thumbnailFile) {
        formData.append('thumbnail', thumbnailFile);
      }

      const res = await updateVideoApi(video._id, formData);
      if (onUpdated) {
        onUpdated(res.data);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update video');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fadeIn">
      <div 
        className="w-full max-w-2xl bg-viora-surface rounded-3xl border border-viora-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-viora-border">
          <h2 className="text-base font-bold text-slate-100">
            Edit Release Metadata
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3 text-xs font-semibold text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-xl">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-viora-card border border-viora-border rounded-xl focus:outline-none focus:border-indigo-500 text-slate-100"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Description
            </label>
            <textarea
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-viora-card border border-viora-border rounded-xl focus:outline-none focus:border-indigo-500 text-slate-100 resize-none"
            />
          </div>

          {/* Thumbnail Change */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Artwork
            </label>
            <div className="flex items-center gap-4">
              <div className="w-36 aspect-video bg-viora-card rounded-xl overflow-hidden border border-viora-border shrink-0">
                {thumbnailPreview ? (
                  <img
                    src={thumbnailPreview}
                    alt="Thumbnail preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-500">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                )}
              </div>
              <div>
                <label className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-viora-card hover:bg-white/5 text-slate-200 border border-viora-border rounded-xl cursor-pointer transition">
                  <Upload className="w-4 h-4 text-indigo-400" />
                  <span>Update Artwork</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className="hidden"
                  />
                </label>
                <p className="text-[11px] text-slate-400 mt-1">
                  Recommended: 1280x720 (16:9) JPG or PNG
                </p>
              </div>
            </div>
          </div>

          {/* Category & Visibility Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-viora-card border border-viora-border rounded-xl focus:outline-none focus:border-indigo-500 text-slate-200"
              >
                {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                  <option key={c} value={c} className="bg-viora-surface text-slate-200">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Visibility
              </label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-viora-card border border-viora-border rounded-xl focus:outline-none focus:border-indigo-500 text-slate-200"
              >
                <option value="public" className="bg-viora-surface text-slate-200">Public</option>
                <option value="unlisted" className="bg-viora-surface text-slate-200">Unlisted</option>
                <option value="private" className="bg-viora-surface text-slate-200">Private</option>
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Tags (comma separated)
            </label>
            <input
              type="text"
              placeholder="coding, react, mern"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-viora-card border border-viora-border rounded-xl focus:outline-none focus:border-indigo-500 text-slate-100"
            />
          </div>

          {/* Footer buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-viora-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-xl transition"
            >
              Cancel
            </button>
            <Button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              variant="primary"
              className="flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isSubmitting ? 'Saving Changes...' : 'Save Changes'}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditVideoModal;
