import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  Upload, 
  FileVideo, 
  Image as ImageIcon, 
  AlertCircle, 
  CheckCircle2 
} from 'lucide-react';
import { uploadVideoApi } from '../../services/videoService';
import Button from '../ui/Button';

const CATEGORIES = [
  'All',
  'Music',
  'Gaming',
  'Programming',
  'Education',
  'News',
  'Sports',
  'Entertainment',
  'Technology',
  'Travel',
  'Comedy',
  'Movies',
  'Science',
];

export const UploadModal = ({ isOpen, onClose, onUploadSuccess }) => {
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const videoInputRef = useRef(null);
  const thumbInputRef = useRef(null);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      category: 'Technology',
      visibility: 'public',
      tags: '',
      isShort: false,
    },
  });

  if (!isOpen) return null;

  const handleVideoSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setUploadError('');
    }
  };

  const handleThumbnailSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
      setUploadError('');
    }
  };

  const onSubmit = async (data) => {
    if (!videoFile) {
      setUploadError('Please select a video file to upload.');
      return;
    }
    if (!thumbnailFile) {
      setUploadError('Please select a thumbnail image.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('video', videoFile);
      formData.append('thumbnail', thumbnailFile);
      formData.append('title', data.title);
      formData.append('description', data.description || '');
      formData.append('category', data.category);
      formData.append('visibility', data.visibility);
      formData.append('tags', data.tags || '');
      formData.append('isShort', data.isShort);

      const response = await uploadVideoApi(formData, (progress) => {
        setUploadProgress(progress);
      });

      const newVideo = response.data;
      reset();
      setVideoFile(null);
      setThumbnailFile(null);
      setThumbnailPreview(null);
      onClose();

      if (onUploadSuccess) {
        onUploadSuccess(newVideo);
      } else {
        navigate(`/watch/${newVideo._id}`);
      }
    } catch (err) {
      setUploadError(err.message || 'Video upload failed. Please check file format and try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-viora-surface border border-viora-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-viora-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Upload className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-100">
              Publish Release to Viora
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={isUploading}
            aria-label="Close dialog"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="overflow-y-auto p-6 space-y-5 flex-1">
          {uploadError && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* Video & Thumbnail File Pickers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Video Picker */}
            <div
              onClick={() => !isUploading && videoInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                videoFile
                  ? 'border-indigo-500/60 bg-indigo-500/10'
                  : 'border-viora-border hover:border-indigo-500/40 bg-viora-card/40'
              }`}
            >
              <input
                ref={videoInputRef}
                type="file"
                accept="video/mp4,video/webm,video/quicktime,video/x-matroska"
                onChange={handleVideoSelect}
                className="hidden"
              />
              <FileVideo className={`w-8 h-8 mb-2 ${videoFile ? 'text-indigo-400' : 'text-slate-500'}`} />
              <p className="text-xs font-semibold text-slate-200">
                {videoFile ? videoFile.name : 'Select Video File'}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">MP4, WebM, MKV (up to 100MB)</p>
            </div>

            {/* Thumbnail Picker */}
            <div
              onClick={() => !isUploading && thumbInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all relative overflow-hidden ${
                thumbnailPreview
                  ? 'border-indigo-500/60'
                  : 'border-viora-border hover:border-indigo-500/40 bg-viora-card/40'
              }`}
            >
              <input
                ref={thumbInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleThumbnailSelect}
                className="hidden"
              />
              {thumbnailPreview ? (
                <img
                  src={thumbnailPreview}
                  alt="Thumbnail Preview"
                  className="w-full h-24 object-cover rounded-xl"
                />
              ) : (
                <>
                  <ImageIcon className="w-8 h-8 text-slate-500 mb-2" />
                  <p className="text-xs font-semibold text-slate-200">
                    Select Artwork
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">JPEG, PNG, WebP (16:9)</p>
                </>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Title <span className="text-indigo-400">*</span>
            </label>
            <input
              type="text"
              placeholder="Release title..."
              {...register('title', {
                required: 'Title is required',
                minLength: { value: 3, message: 'Minimum 3 characters' },
                maxLength: { value: 120, message: 'Maximum 120 characters' },
              })}
              className="w-full px-3.5 py-2.5 bg-viora-card border border-viora-border rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-slate-100 placeholder-slate-500"
            />
            {errors.title && (
              <p className="mt-1 text-xs text-rose-400">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Tell your audience about this release..."
              {...register('description')}
              className="w-full px-3.5 py-2.5 bg-viora-card border border-viora-border rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-slate-100 placeholder-slate-500 resize-none"
            />
          </div>

          {/* Category & Visibility */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Category
              </label>
              <select
                {...register('category')}
                className="w-full px-3.5 py-2.5 bg-viora-card border border-viora-border rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-slate-200 cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-viora-surface text-slate-200">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Visibility
              </label>
              <select
                {...register('visibility')}
                className="w-full px-3.5 py-2.5 bg-viora-card border border-viora-border rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-slate-200 cursor-pointer"
              >
                <option value="public" className="bg-viora-surface text-slate-200">Public (Platform Wide)</option>
                <option value="unlisted" className="bg-viora-surface text-slate-200">Unlisted (Direct Link)</option>
                <option value="private" className="bg-viora-surface text-slate-200">Private (Creator Only)</option>
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Tags (Comma separated)
            </label>
            <input
              type="text"
              placeholder="techno, coding, podcast, stream"
              {...register('tags')}
              className="w-full px-3.5 py-2.5 bg-viora-card border border-viora-border rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-slate-100 placeholder-slate-500"
            />
          </div>

          {/* Upload Progress Bar */}
          {isUploading && (
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs font-semibold text-slate-300">
                <span>Transcoding & Uploading Media...</span>
                <span className="font-mono text-indigo-400">{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 bg-viora-card rounded-full overflow-hidden border border-viora-border">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 transition-all duration-300 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Submit Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-viora-border">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="px-5 py-2.5 text-xs font-semibold text-slate-400 hover:text-white rounded-xl transition-colors"
            >
              Cancel
            </button>

            <Button
              type="submit"
              disabled={isUploading}
              variant="primary"
              className="flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>Publish Release</span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadModal;
