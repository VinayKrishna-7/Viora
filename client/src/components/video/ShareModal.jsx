import React, { useState } from 'react';
import { X, Copy, Check, Share2 } from 'lucide-react';
import { formatDuration } from '../../utils/formatters';
import Button from '../ui/Button';

export const ShareModal = ({ isOpen, onClose, videoTitle, videoId, currentTime = 0 }) => {
  const [includeTimestamp, setIncludeTimestamp] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const roundedTime = Math.floor(currentTime);
  const origin = window.location.origin;
  const baseUrl = `${origin}/watch/${videoId}`;
  const shareUrl = includeTimestamp && roundedTime > 0 ? `${baseUrl}?t=${roundedTime}` : baseUrl;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const shareOptions = [
    {
      name: 'WhatsApp',
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${videoTitle || 'Check this out'} ${shareUrl}`)}`,
      bg: 'bg-emerald-600 hover:bg-emerald-500',
    },
    {
      name: 'X (Twitter)',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(videoTitle || 'Check this out')}&url=${encodeURIComponent(shareUrl)}`,
      bg: 'bg-slate-800 hover:bg-slate-700',
    },
    {
      name: 'Facebook',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      bg: 'bg-blue-600 hover:bg-blue-500',
    },
    {
      name: 'Reddit',
      url: `https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(videoTitle || 'Watch on Viora')}`,
      bg: 'bg-orange-600 hover:bg-orange-500',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-viora-surface border border-viora-border rounded-3xl p-6 shadow-2xl space-y-5 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-viora-border">
          <div className="flex items-center gap-2 font-bold text-slate-100 text-base">
            <Share2 className="w-5 h-5 text-indigo-400" />
            <span>Share Release</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Social Share Buttons */}
        <div className="grid grid-cols-4 gap-2.5">
          {shareOptions.map((opt) => (
            <a
              key={opt.name}
              href={opt.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`py-2.5 px-1 rounded-xl text-white text-xs font-semibold text-center transition-all ${opt.bg}`}
            >
              {opt.name}
            </a>
          ))}
        </div>

        {/* Timestamp Checkbox */}
        {roundedTime > 0 && (
          <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-300">
            <input
              type="checkbox"
              checked={includeTimestamp}
              onChange={(e) => setIncludeTimestamp(e.target.checked)}
              className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
            />
            <span>Start playback at <strong className="font-mono text-indigo-400">{formatDuration(roundedTime)}</strong></span>
          </label>
        )}

        {/* Link input with Copy button */}
        <div className="flex items-center gap-2 p-1.5 bg-viora-card rounded-2xl border border-viora-border">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="flex-1 bg-transparent px-3 py-1.5 text-xs text-slate-200 focus:outline-none select-all"
          />
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-colors shrink-0 shadow-md shadow-indigo-500/25"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
