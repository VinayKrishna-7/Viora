import React from 'react';
import { Link } from 'react-router-dom';

export const LogoIcon = ({ className = 'w-8 h-8' }) => (
  <svg
    viewBox="0 0 48 48"
    className={`shrink-0 ${className}`}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="vioraAppBlueGrad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#4f46e5" />
        <stop offset="50%" stopColor="#6366f1" />
        <stop offset="100%" stopColor="#8b5cf6" />
      </linearGradient>
    </defs>
    <rect width="48" height="48" rx="12" fill="url(#vioraAppBlueGrad)" />
    <polygon points="19,14 35,24 19,34" fill="#ffffff" />
    <circle cx="40" cy="8" r="3.5" fill="#22d3ee" stroke="#090a10" strokeWidth="1.5" />
  </svg>
);

export const Logo = ({
  to = '/',
  size = 'md',
  showText = true,
  badge = null,
  className = '',
}) => {
  const sizeMap = {
    sm: {
      icon: 'w-7 h-7',
      text: 'text-lg',
      gap: 'gap-2',
    },
    md: {
      icon: 'w-8 h-8',
      text: 'text-xl',
      gap: 'gap-2.5',
    },
    lg: {
      icon: 'w-10 h-10',
      text: 'text-2xl',
      gap: 'gap-3',
    },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  const content = (
    <div className={`inline-flex items-center ${currentSize.gap} group focus:outline-none select-none ${className}`}>
      <div className="relative transform transition-transform duration-200 group-hover:scale-105 shadow-md shadow-indigo-500/25 rounded-xl">
        <LogoIcon className={currentSize.icon} />
      </div>
      {showText && (
        <div className={`font-bold tracking-tight ${currentSize.text} flex items-center`}>
          <span className="text-white">Vio</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
            ra
          </span>
        </div>
      )}
      {badge && (
        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300">
          {badge}
        </span>
      )}
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="inline-flex items-center focus:outline-none">
        {content}
      </Link>
    );
  }

  return content;
};

export default Logo;
