import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  PictureInPicture,
  RotateCcw,
  RotateCw,
  Subtitles,
  ListVideo
} from 'lucide-react';
import { formatDuration } from '../../utils/formatters';
import { saveProgressApi } from '../../services/progressService';

const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export const VideoPlayer = ({
  videoId,
  videoUrl,
  poster,
  chapters = [],
  subtitles = [],
  initialTime = 0,
  onVideoEnd,
}) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const lastSavedTimeRef = useRef(0);
  const initialSeekDoneRef = useRef(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showChaptersMenu, setShowChaptersMenu] = useState(false);
  const [showSubtitleMenu, setShowSubtitleMenu] = useState(false);
  const [activeSubtitleLang, setActiveSubtitleLang] = useState('off');
  const [bufferedPercent, setBufferedPercent] = useState(0);
  const [resumeToast, setResumeToast] = useState(null);

  // Play / Pause toggle
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().catch((err) => console.log('Autoplay prevented:', err));
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  // Save progress helper (throttled)
  const reportProgress = useCallback((time, vidDuration) => {
    if (!videoId || !vidDuration || vidDuration <= 0) return;
    // Don't save if difference is less than 4 seconds
    if (Math.abs(time - lastSavedTimeRef.current) < 4) return;

    lastSavedTimeRef.current = time;
    saveProgressApi(videoId, time, vidDuration).catch(() => {});
  }, [videoId]);

  // Initial resume seek
  useEffect(() => {
    if (initialTime > 0 && videoRef.current && !initialSeekDoneRef.current) {
      initialSeekDoneRef.current = true;
      videoRef.current.currentTime = initialTime;
      setCurrentTime(initialTime);
      setResumeToast(`Resumed from ${formatDuration(initialTime)}`);
      setTimeout(() => setResumeToast(null), 4000);
    }
  }, [initialTime]);

  // Periodic progress saving when playing
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      if (videoRef.current && videoRef.current.duration > 0) {
        reportProgress(videoRef.current.currentTime, videoRef.current.duration);
      }
    }, 6000);

    return () => clearInterval(interval);
  }, [isPlaying, reportProgress]);

  // Save progress on unmount / pause
  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.duration > 0) {
        reportProgress(videoRef.current.currentTime, videoRef.current.duration);
      }
    };
  }, [reportProgress]);

  // Time Updates
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const curr = videoRef.current.currentTime;
    setCurrentTime(curr);

    // Calculate buffered progress
    if (videoRef.current.buffered.length > 0 && videoRef.current.duration) {
      const bufferedEnd = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
      setBufferedPercent((bufferedEnd / videoRef.current.duration) * 100);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration;
      setDuration(dur);
      if (initialTime > 0 && !initialSeekDoneRef.current) {
        initialSeekDoneRef.current = true;
        videoRef.current.currentTime = initialTime;
        setCurrentTime(initialTime);
        setResumeToast(`Resumed from ${formatDuration(initialTime)}`);
        setTimeout(() => setResumeToast(null), 4000);
      }
    }
  };

  // Seek Progress
  const handleSeek = (e) => {
    if (!videoRef.current || duration <= 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newTime = pos * duration;
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Jump directly to chapter
  const handleChapterJump = (startSec) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = startSec;
    setCurrentTime(startSec);
    setShowChaptersMenu(false);
  };

  // Volume Change
  const handleVolumeChange = (e) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (videoRef.current) {
      videoRef.current.volume = newVol;
      videoRef.current.muted = newVol === 0;
      setIsMuted(newVol === 0);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.muted = false;
      videoRef.current.volume = volume > 0 ? volume : 0.5;
      setIsMuted(false);
      if (volume === 0) setVolume(0.5);
    } else {
      videoRef.current.muted = true;
      setIsMuted(true);
    }
  };

  // Playback Rate
  const handleSpeedChange = (speed) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = speed;
    setPlaybackRate(speed);
    setShowSpeedMenu(false);
  };

  // Subtitle Selection
  const handleSubtitleChange = (lang) => {
    setActiveSubtitleLang(lang);
    setShowSubtitleMenu(false);
    if (!videoRef.current) return;

    const tracks = videoRef.current.textTracks;
    for (let i = 0; i < tracks.length; i++) {
      if (lang === 'off') {
        tracks[i].mode = 'hidden';
      } else if (tracks[i].language === lang) {
        tracks[i].mode = 'showing';
      } else {
        tracks[i].mode = 'hidden';
      }
    }
  };

  // Fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => console.error(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch((err) => console.error(err));
      setIsFullscreen(false);
    }
  }, []);

  // Picture in Picture
  const togglePiP = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (err) {
      console.error('PiP Error:', err);
    }
  };

  // Controls Visibility Timeout
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
        setShowSpeedMenu(false);
        setShowChaptersMenu(false);
        setShowSubtitleMenu(false);
      }, 2500);
    }
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.key === ' ' || e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        toggleMute();
      } else if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        if (subtitles.length > 0) {
          handleSubtitleChange(activeSubtitleLang === 'off' ? subtitles[0].language : 'off');
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'j' || e.key === 'J') {
        e.preventDefault();
        if (videoRef.current) videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
      } else if (e.key === 'ArrowRight' || e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        if (videoRef.current) videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 10);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, toggleFullscreen, duration, subtitles, activeSubtitleLang]);

  // Fullscreen change listener
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Active Chapter lookup
  const currentChapter = chapters && chapters.length > 0
    ? [...chapters]
        .sort((a, b) => a.startSeconds - b.startSeconds)
        .reverse()
        .find((ch) => currentTime >= ch.startSeconds)
    : null;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden group select-none shadow-2xl"
    >
      {/* HTML5 Video Element with Subtitle Tracks */}
      <video
        ref={videoRef}
        src={videoUrl}
        poster={poster}
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPause={() => {
          setIsPlaying(false);
          if (videoRef.current) reportProgress(videoRef.current.currentTime, videoRef.current.duration);
        }}
        onEnded={() => {
          setIsPlaying(false);
          if (videoRef.current) reportProgress(videoRef.current.duration, videoRef.current.duration);
          if (onVideoEnd) onVideoEnd();
        }}
        playsInline
        crossOrigin="anonymous"
        className="w-full h-full object-contain cursor-pointer"
      >
        {subtitles && subtitles.map((sub, idx) => (
          <track
            key={idx}
            kind="subtitles"
            label={sub.label || sub.language}
            srcLang={sub.language}
            src={sub.url}
            default={idx === 0 && activeSubtitleLang === sub.language}
          />
        ))}
      </video>

      {/* Resume from previous progress Toast */}
      {resumeToast && (
        <div className="absolute top-4 left-4 z-40 bg-zinc-900/90 backdrop-blur-md text-white px-3.5 py-1.5 rounded-lg text-xs flex items-center gap-2 border border-zinc-700 shadow-xl animate-fade-in">
          <span>{resumeToast}</span>
          <button
            onClick={() => {
              if (videoRef.current) {
                videoRef.current.currentTime = 0;
                setCurrentTime(0);
                setResumeToast(null);
              }
            }}
            className="text-red-400 font-bold hover:underline"
          >
            Start over
          </button>
        </div>
      )}

      {/* Center Big Play Button (when paused) */}
      {!isPlaying && (
        <div
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/20 backdrop-blur-xs transition-opacity"
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-2xl shadow-indigo-500/40 hover:scale-110 transition-transform">
            <Play className="w-8 h-8 sm:w-10 sm:h-10 ml-1 fill-current" />
          </div>
        </div>
      )}

      {/* Controls Overlay */}
      <div
        className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent px-3 sm:px-4 pt-8 pb-2.5 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Seek Bar with Chapter Markers */}
        <div
          onClick={handleSeek}
          className="relative w-full h-1.5 hover:h-2.5 bg-white/20 rounded-full cursor-pointer mb-3 transition-all flex items-center"
        >
          {/* Buffered track */}
          <div
            className="absolute left-0 top-0 bottom-0 bg-white/40 rounded-full"
            style={{ width: `${bufferedPercent}%` }}
          />
          {/* Played track */}
          <div
            className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
          {/* Thumb */}
          <div
            className="absolute w-3.5 h-3.5 bg-white rounded-full shadow-md ring-2 ring-indigo-500 -translate-x-1/2"
            style={{ left: `${progressPercent}%` }}
          />

          {/* Chapter Markers */}
          {chapters && duration > 0 && chapters.map((ch, idx) => {
            const markerPos = (ch.startSeconds / duration) * 100;
            if (markerPos <= 0 || markerPos >= 100) return null;
            return (
              <div
                key={idx}
                title={ch.title}
                className="absolute top-0 bottom-0 w-0.5 bg-black/60 hover:bg-white z-10"
                style={{ left: `${markerPos}%` }}
              />
            );
          })}
        </div>

        {/* Bottom Bar Controls */}
        <div className="flex items-center justify-between text-white text-sm">
          {/* Left Controls */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              className="p-1 hover:text-indigo-400 transition-colors focus:outline-none shrink-0"
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
            </button>

            {/* Seek 10s back & forward */}
            <button
              onClick={() => {
                if (videoRef.current) videoRef.current.currentTime = Math.max(0, currentTime - 10);
              }}
              aria-label="Skip backward 10 seconds"
              className="p-1 text-gray-300 hover:text-white transition-colors hidden sm:block shrink-0"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                if (videoRef.current) videoRef.current.currentTime = Math.min(duration, currentTime + 10);
              }}
              aria-label="Skip forward 10 seconds"
              className="p-1 text-gray-300 hover:text-white transition-colors hidden sm:block shrink-0"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            {/* Volume */}
            <div className="flex items-center gap-1.5 group/volume shrink-0">
              <button
                onClick={toggleMute}
                aria-label={isMuted ? 'Unmute' : 'Mute'}
                className="p-1 hover:text-indigo-400 transition-colors"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                aria-label="Volume slider"
                className="w-12 sm:w-20 h-1 accent-indigo-500 bg-white/30 rounded-lg cursor-pointer"
              />
            </div>

            {/* Time / Duration & Active Chapter */}
            <div className="text-xs font-mono text-gray-300 truncate flex items-center gap-1.5">
              <span>{formatDuration(currentTime)}</span>
              <span>/</span>
              <span>{formatDuration(duration)}</span>
              {currentChapter && (
                <span className="hidden md:inline-flex items-center gap-1 text-gray-400 font-sans truncate">
                  • <span className="text-white truncate font-medium">{currentChapter.title}</span>
                </span>
              )}
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 relative">
            {/* Chapters Drawer Trigger */}
            {chapters && chapters.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => {
                    setShowChaptersMenu(!showChaptersMenu);
                    setShowSubtitleMenu(false);
                    setShowSpeedMenu(false);
                  }}
                  title="Chapters"
                  className={`p-1 transition-colors ${showChaptersMenu ? 'text-indigo-400' : 'hover:text-indigo-400'}`}
                >
                  <ListVideo className="w-5 h-5" />
                </button>

                {showChaptersMenu && (
                  <div className="absolute right-0 bottom-8 bg-viora-surface/95 border border-white/10 rounded-xl py-2 shadow-2xl z-50 text-xs w-56 max-h-60 overflow-y-auto backdrop-blur-md">
                    <div className="px-3 py-1 font-semibold text-slate-400 border-b border-white/10 text-[11px] mb-1">
                      Chapters
                    </div>
                    {chapters.map((ch, idx) => {
                      const isActive = currentChapter?.title === ch.title;
                      return (
                        <button
                          key={idx}
                          onClick={() => handleChapterJump(ch.startSeconds)}
                          className={`w-full px-3 py-2 text-left hover:bg-white/5 transition-colors flex items-center justify-between gap-2 ${
                            isActive ? 'text-indigo-400 font-bold bg-indigo-500/10' : 'text-slate-200'
                          }`}
                        >
                          <span className="truncate">{ch.title}</span>
                          <span className="font-mono text-[11px] text-slate-400 shrink-0">
                            {formatDuration(ch.startSeconds)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Subtitles (CC) Menu */}
            {subtitles && subtitles.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => {
                    setShowSubtitleMenu(!showSubtitleMenu);
                    setShowChaptersMenu(false);
                    setShowSpeedMenu(false);
                  }}
                  title="Subtitles / CC"
                  className={`p-1 transition-colors ${
                    activeSubtitleLang !== 'off' ? 'text-indigo-400' : 'hover:text-indigo-400 text-slate-300'
                  }`}
                >
                  <Subtitles className="w-5 h-5" />
                </button>

                {showSubtitleMenu && (
                  <div className="absolute right-0 bottom-8 bg-viora-surface/95 border border-white/10 rounded-xl py-1.5 shadow-2xl z-50 text-xs w-36 backdrop-blur-md">
                    <div className="px-3 py-1 font-semibold text-slate-400 border-b border-white/10 text-[11px]">
                      Subtitles / CC
                    </div>
                    <button
                      onClick={() => handleSubtitleChange('off')}
                      className={`w-full px-3 py-1.5 text-left hover:bg-white/5 transition-colors flex items-center justify-between ${
                        activeSubtitleLang === 'off' ? 'text-indigo-400 font-bold' : 'text-slate-200'
                      }`}
                    >
                      <span>Off</span>
                      {activeSubtitleLang === 'off' && <span>✓</span>}
                    </button>
                    {subtitles.map((sub, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSubtitleChange(sub.language)}
                        className={`w-full px-3 py-1.5 text-left hover:bg-white/5 transition-colors flex items-center justify-between ${
                          activeSubtitleLang === sub.language ? 'text-indigo-400 font-bold' : 'text-slate-200'
                        }`}
                      >
                        <span className="capitalize">{sub.label || sub.language}</span>
                        {activeSubtitleLang === sub.language && <span>✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Playback Speed Menu */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowSpeedMenu(!showSpeedMenu);
                  setShowChaptersMenu(false);
                  setShowSubtitleMenu(false);
                }}
                title="Playback Speed"
                className="p-1 hover:text-indigo-400 transition-colors text-xs font-bold"
              >
                {playbackRate}x
              </button>

              {showSpeedMenu && (
                <div className="absolute right-0 bottom-8 bg-viora-surface/95 border border-white/10 rounded-xl py-1.5 shadow-2xl z-50 text-xs w-28 backdrop-blur-md">
                  <div className="px-3 py-1 font-semibold text-slate-400 border-b border-white/10 text-[11px]">
                    Playback Speed
                  </div>
                  {PLAYBACK_SPEEDS.map((speed) => (
                    <button
                      key={speed}
                      onClick={() => handleSpeedChange(speed)}
                      className={`w-full px-3 py-1.5 text-left hover:bg-white/5 transition-colors flex items-center justify-between ${
                        playbackRate === speed ? 'text-indigo-400 font-bold' : 'text-slate-200'
                      }`}
                    >
                      <span>{speed}x</span>
                      {playbackRate === speed && <span>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Picture-in-Picture */}
            {document.pictureInPictureEnabled && (
              <button
                onClick={togglePiP}
                title="Picture in Picture"
                className="p-1 hover:text-indigo-400 transition-colors hidden sm:block"
              >
                <PictureInPicture className="w-4 h-4" />
              </button>
            )}

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              className="p-1 hover:text-indigo-400 transition-colors"
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
