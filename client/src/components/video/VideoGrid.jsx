import React from 'react';
import VideoCard from './VideoCard';
import VideoCardSkeleton from '../ui/Skeleton';
import { Film, Plus } from 'lucide-react';
import Button from '../ui/Button';

export const VideoGrid = ({
  videos = [],
  isLoading = false,
  skeletonCount = 8,
  emptyMessage = 'No videos found in this category',
  onUploadClick,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-6 gap-x-4">
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <VideoCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-2xl border border-dashed border-viora-border bg-viora-card/20">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 shadow-sm">
          <Film className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-slate-100 mb-1">
          {emptyMessage}
        </h3>
        <p className="text-sm text-slate-400 max-w-sm mb-6">
          Be the first creator to upload a video here or explore other categories.
        </p>
        {onUploadClick && (
          <Button
            onClick={onUploadClick}
            variant="primary"
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Video</span>
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-7 gap-x-5">
      {videos.map((video) => (
        <VideoCard key={video._id} video={video} />
      ))}
    </div>
  );
};

export default VideoGrid;
