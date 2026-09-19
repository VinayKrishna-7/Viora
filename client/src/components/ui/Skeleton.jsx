import React from 'react';

export const Skeleton = ({
  className = '',
  variant = 'rectangular',
  ...props
}) => {
  const base = 'animate-pulse bg-white/[0.06]';
  const variants = {
    circular: 'rounded-full',
    rounded: 'rounded-xl',
    rectangular: 'rounded-2xl',
    text: 'rounded-md h-3',
  };

  return (
    <div
      className={`${base} ${variants[variant] || variants.rectangular} ${className}`}
      {...props}
    />
  );
};

export const VideoCardSkeleton = () => (
  <div className="flex flex-col gap-3">
    <Skeleton className="aspect-video w-full rounded-2xl" />
    <div className="flex gap-3 px-1">
      <Skeleton variant="circular" className="w-9 h-9 shrink-0" />
      <div className="flex-1 space-y-2 py-0.5">
        <Skeleton variant="text" className="w-4/5" />
        <Skeleton variant="text" className="w-1/2 h-2.5" />
      </div>
    </div>
  </div>
);

export default Skeleton;
