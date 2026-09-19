import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Home, 
  Flame, 
  FolderClock, 
  ListVideo, 
  Video, 
  Clock, 
  ThumbsUp, 
  Music2, 
  Gamepad2, 
  Newspaper, 
  Trophy, 
  GraduationCap, 
  Settings, 
  Sparkles,
  Shield,
  Radio,
  Tv2,
  X
} from 'lucide-react';

const discoverLinks = [
  { name: 'Discover', path: '/', icon: Home },
  { name: 'Trending', path: '/search?q=trending', icon: Flame },
  { name: 'Music Hub', path: '/search?category=Music&q=songs', icon: Music2, badge: 'Hi-Fi' },
  { name: 'Subscriptions', path: '/subscriptions', icon: Tv2 },
  { name: 'Shorts', path: '/shorts', icon: Sparkles },
];

const libraryLinks = [
  { name: 'History', path: '/history', icon: FolderClock },
  { name: 'Playlists', path: '/playlists', icon: ListVideo },
  { name: 'Liked Videos', path: '/liked', icon: ThumbsUp },
  { name: 'Watch Later', path: '/watch-later', icon: Clock },
];

const studioLinks = [
  { name: 'Creator Studio', path: '/studio/content', icon: Video },
  { name: 'Live Stream', path: '/search?q=live', icon: Radio },
];

const exploreLinks = [
  { name: 'Gaming', path: '/search?category=Gaming', icon: Gamepad2 },
  { name: 'News & World', path: '/search?category=News', icon: Newspaper },
  { name: 'Sports', path: '/search?category=Sports', icon: Trophy },
  { name: 'Education', path: '/search?category=Education', icon: GraduationCap },
];

export const Sidebar = ({ isOpen, isMobile, onCloseMobile }) => {
  const { user } = useSelector((state) => state.auth);

  const navLinkClass = ({ isActive }) =>
    `group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
      isActive
        ? 'bg-indigo-500/10 text-indigo-400 font-semibold border border-indigo-500/20 shadow-sm shadow-indigo-500/5'
        : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.04]'
    }`;

  const slimNavLinkClass = ({ isActive }) =>
    `flex flex-col items-center justify-center py-3 px-1 rounded-xl text-[11px] font-medium transition-all ${
      isActive
        ? 'bg-indigo-500/10 text-indigo-400 font-semibold border border-indigo-500/20'
        : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.04]'
    }`;

  // Mobile Drawer Overlay
  if (isMobile) {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 z-50 flex">
        <div 
          onClick={onCloseMobile} 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity" 
          aria-hidden="true" 
        />
        <aside className="relative flex flex-col w-72 h-full bg-viora-surface border-r border-viora-border p-4 overflow-y-auto z-10 shadow-2xl">
          <div className="flex items-center justify-between px-2 py-2 border-b border-viora-border/60 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-md shadow-indigo-500/20">
                <svg className="w-4 h-4 text-white fill-current ml-0.5" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight text-white font-display">
                Vio<span className="text-indigo-400">ra</span>
              </span>
            </div>
            <button 
              onClick={onCloseMobile}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6 flex-1">
            {/* Discover */}
            <div>
              <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Discover
              </div>
              <div className="space-y-1">
                {discoverLinks.map((item) => (
                  <NavLink key={item.name} to={item.path} onClick={onCloseMobile} className={navLinkClass}>
                    <div className="flex items-center gap-3.5">
                      <item.icon className="w-4 h-4 transition-transform group-hover:scale-110 text-slate-400 group-[.font-semibold]:text-indigo-400" />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>

            {/* Library */}
            <div>
              <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Library
              </div>
              <div className="space-y-1">
                {libraryLinks.map((item) => (
                  <NavLink key={item.name} to={item.path} onClick={onCloseMobile} className={navLinkClass}>
                    <div className="flex items-center gap-3.5">
                      <item.icon className="w-4 h-4 transition-transform group-hover:scale-110 text-slate-400 group-[.font-semibold]:text-indigo-400" />
                      <span>{item.name}</span>
                    </div>
                  </NavLink>
                ))}
              </div>
            </div>

            {/* Studio */}
            <div>
              <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Creator
              </div>
              <div className="space-y-1">
                {studioLinks.map((item) => (
                  <NavLink key={item.name} to={item.path} onClick={onCloseMobile} className={navLinkClass}>
                    <div className="flex items-center gap-3.5">
                      <item.icon className="w-4 h-4 transition-transform group-hover:scale-110 text-slate-400 group-[.font-semibold]:text-indigo-400" />
                      <span>{item.name}</span>
                    </div>
                  </NavLink>
                ))}
              </div>
            </div>

            {/* Explore */}
            <div>
              <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Explore
              </div>
              <div className="space-y-1">
                {exploreLinks.map((item) => (
                  <NavLink key={item.name} to={item.path} onClick={onCloseMobile} className={navLinkClass}>
                    <div className="flex items-center gap-3.5">
                      <item.icon className="w-4 h-4 transition-transform group-hover:scale-110 text-slate-400 group-[.font-semibold]:text-indigo-400" />
                      <span>{item.name}</span>
                    </div>
                  </NavLink>
                ))}
              </div>
            </div>

            {/* Admin */}
            {user?.role === 'admin' && (
              <div>
                <div className="px-3 pb-2 text-[11px] font-semibold text-amber-500/80 uppercase tracking-wider">
                  Admin
                </div>
                <div className="space-y-1">
                  <NavLink to="/admin" onClick={onCloseMobile} className={navLinkClass}>
                    <div className="flex items-center gap-3.5">
                      <Shield className="w-4 h-4 text-amber-400" />
                      <span className="font-semibold text-amber-400">Admin Console</span>
                    </div>
                  </NavLink>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    );
  }

  // Collapsed slim sidebar for desktop when isOpen = false
  if (!isOpen) {
    return (
      <aside className="w-20 flex flex-col items-center py-3 px-2 bg-viora-surface/90 backdrop-blur-xl border-r border-viora-border select-none shrink-0 transition-all duration-200">
        <div className="space-y-2 w-full">
          {discoverLinks.slice(0, 4).map((item) => (
            <NavLink key={item.name} to={item.path} className={slimNavLinkClass} title={item.name}>
              <item.icon className="w-5 h-5 mb-1 text-slate-400 group-hover:text-white" />
              <span className="truncate text-center w-full">{item.name.split(' ')[0]}</span>
            </NavLink>
          ))}
          <NavLink to="/history" className={slimNavLinkClass} title="Library">
            <FolderClock className="w-5 h-5 mb-1 text-slate-400" />
            <span className="truncate">Library</span>
          </NavLink>
          <NavLink to="/studio/content" className={slimNavLinkClass} title="Studio">
            <Video className="w-5 h-5 mb-1 text-slate-400" />
            <span className="truncate">Studio</span>
          </NavLink>
        </div>
      </aside>
    );
  }

  // Expanded full sidebar for desktop
  return (
    <aside className="w-64 h-[calc(100vh-3.75rem)] sticky top-[3.75rem] flex flex-col px-3 py-4 bg-viora-surface/75 backdrop-blur-xl border-r border-viora-border overflow-y-auto select-none shrink-0 transition-all duration-200">
      <div className="space-y-6 flex-1">
        {/* Discover Section */}
        <div>
          <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Discover
          </div>
          <div className="space-y-1">
            {discoverLinks.map((item) => (
              <NavLink key={item.name} to={item.path} className={navLinkClass}>
                <div className="flex items-center gap-3.5">
                  <item.icon className="w-4 h-4 transition-transform group-hover:scale-110 text-slate-400 group-[.font-semibold]:text-indigo-400" />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        </div>

        {/* Library Section */}
        <div>
          <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Library
          </div>
          <div className="space-y-1">
            {libraryLinks.map((item) => (
              <NavLink key={item.name} to={item.path} className={navLinkClass}>
                <div className="flex items-center gap-3.5">
                  <item.icon className="w-4 h-4 transition-transform group-hover:scale-110 text-slate-400 group-[.font-semibold]:text-indigo-400" />
                  <span>{item.name}</span>
                </div>
              </NavLink>
            ))}
          </div>
        </div>

        {/* Studio Section */}
        <div>
          <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Creator
          </div>
          <div className="space-y-1">
            {studioLinks.map((item) => (
              <NavLink key={item.name} to={item.path} className={navLinkClass}>
                <div className="flex items-center gap-3.5">
                  <item.icon className="w-4 h-4 transition-transform group-hover:scale-110 text-slate-400 group-[.font-semibold]:text-indigo-400" />
                  <span>{item.name}</span>
                </div>
              </NavLink>
            ))}
          </div>
        </div>

        {/* Explore Section */}
        <div>
          <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Explore
          </div>
          <div className="space-y-1">
            {exploreLinks.map((item) => (
              <NavLink key={item.name} to={item.path} className={navLinkClass}>
                <div className="flex items-center gap-3.5">
                  <item.icon className="w-4 h-4 transition-transform group-hover:scale-110 text-slate-400 group-[.font-semibold]:text-indigo-400" />
                  <span>{item.name}</span>
                </div>
              </NavLink>
            ))}
          </div>
        </div>

        {/* Settings & Admin */}
        <div>
          <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            System
          </div>
          <div className="space-y-1">
            <NavLink to="/settings" className={navLinkClass}>
              <div className="flex items-center gap-3.5">
                <Settings className="w-4 h-4 text-slate-400 group-[.font-semibold]:text-indigo-400" />
                <span>Settings</span>
              </div>
            </NavLink>
            {user?.role === 'admin' && (
              <NavLink to="/admin" className={navLinkClass}>
                <div className="flex items-center gap-3.5">
                  <Shield className="w-4 h-4 text-amber-400" />
                  <span className="font-semibold text-amber-400">Admin Console</span>
                </div>
              </NavLink>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 pt-4 px-3 border-t border-viora-border/50 text-[11px] text-slate-400 leading-relaxed">
        <div className="flex items-center gap-1.5 font-medium text-slate-400 mb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Viora Platform v2.4</span>
        </div>
        <p className="text-slate-400">Cinematic Video & Music Hub</p>
      </div>
    </aside>
  );
};

export default Sidebar;
