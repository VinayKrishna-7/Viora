import React, { useState } from 'react';
import { Youtube, ExternalLink, Loader2 } from 'lucide-react';

export const YouTubeEmbedPlayer = ({
  videoId,
  title = 'YouTube Video Player',
  startTime = 0,
}) => {
  const [isIframeLoading, setIsIframeLoading] = useState(true);
  const cleanId = (videoId || '').replace(/^yt_/, '');

  if (!cleanId) {
    return (
      <div className="aspect-video w-full rounded-2xl bg-viora-card border border-white/5 flex flex-col items-center justify-center text-slate-400 gap-2">
        <Youtube className="w-12 h-12 text-rose-400" />
        <p className="text-sm">No valid YouTube Video ID provided.</p>
      </div>
    );
  }

  // Build embed URL with parameters
  const embedUrl = new URL(`https://www.youtube.com/embed/${cleanId}`);
  embedUrl.searchParams.set('autoplay', '1');
  embedUrl.searchParams.set('enablejsapi', '1');
  embedUrl.searchParams.set('rel', '0');
  embedUrl.searchParams.set('modestbranding', '1');
  if (startTime > 0) {
    embedUrl.searchParams.set('start', Math.floor(startTime).toString());
  }

  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl border border-white/10">
      {/* Loading Skeleton behind iframe */}
      {isIframeLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-viora-bg text-white z-10 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
          <p className="text-xs text-slate-400 font-medium tracking-wide">
            Connecting to high-definition player stream...
          </p>
        </div>
      )}

      {/* Official YouTube Iframe Player */}
      <iframe
        src={embedUrl.toString()}
        title={title}
        className="w-full h-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        onLoad={() => setIsIframeLoading(false)}
      />
    </div>
  );
};

export default YouTubeEmbedPlayer;
