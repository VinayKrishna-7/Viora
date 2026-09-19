import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Menu, 
  Search, 
  Plus, 
  Sun, 
  Moon, 
  User as UserIcon, 
  LogOut, 
  Settings, 
  Tv, 
  LayoutDashboard, 
  Shield,
  X,
  Sparkles
} from 'lucide-react';
import { toggleTheme } from '../../store/slices/themeSlice';
import { logoutUser } from '../../store/slices/authSlice';
import UploadModal from '../video/UploadModal';
import NotificationDropdown from './NotificationDropdown';

export const Header = ({ onToggleSidebar }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const themeMode = useSelector((state) => state.theme.mode);
  const { user, isAuthenticated, isLoading } = useSelector((state) => state.auth);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // Keyboard shortcut Ctrl/Cmd + K for search focus
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    await dispatch(logoutUser());
    navigate('/');
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-3 md:px-6 h-16 bg-[#090a10]/85 backdrop-blur-xl border-b border-white/[0.06] transition-colors">
      {/* Left Section: Menu trigger & Viora Brand */}
      <div className="flex items-center gap-3 md:gap-5">
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
          className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link to="/" className="flex items-center gap-2.5 group focus:outline-none">
          {/* Stylized Viora Geometric Icon */}
          <div className="relative w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-200">
            <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[9px] border-l-white border-b-[5px] border-b-transparent ml-0.5" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-cyan-400 border border-[#090a10]" />
          </div>

          <div className="flex items-center font-bold tracking-tight text-xl">
            <span className="text-white">Vio</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">ra</span>
          </div>
        </Link>
      </div>

      {/* Center Section: Unified Modern Search Bar */}
      <div className="flex-1 max-w-xl mx-3 md:mx-8">
        <form onSubmit={handleSearch} className="relative w-full">
          <div className="relative flex items-center w-full rounded-full bg-white/[0.04] hover:bg-white/[0.06] border border-white/[0.08] focus-within:border-indigo-500/80 focus-within:bg-white/[0.08] focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all duration-200">
            <Search className="w-4 h-4 text-zinc-400 ml-3.5 shrink-0 pointer-events-none" />
            
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search videos, music, creators..."
              className="w-full h-10 pl-3 pr-10 text-sm bg-transparent border-none text-white placeholder-zinc-500 focus:outline-none focus:ring-0"
            />

            {searchQuery ? (
              <button
                type="button"
                onClick={handleClearSearch}
                className="p-1 mr-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                title="Clear query"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="hidden sm:flex items-center gap-1 mr-3 shrink-0 pointer-events-none">
                <kbd className="text-[10px] font-mono text-zinc-500 bg-white/[0.04] border border-white/10 px-1.5 py-0.5 rounded">
                  ⌘K
                </kbd>
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Right Section: Actions, Notifications, & Profile */}
      <div className="flex items-center gap-1.5 md:gap-3">
        {/* Theme Toggle (Subtle Ghost) */}
        <button
          onClick={() => dispatch(toggleTheme())}
          title={`Switch to ${themeMode === 'dark' ? 'Light' : 'Dark'} mode`}
          aria-label="Toggle theme"
          className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
        >
          {themeMode === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {isAuthenticated && (
          <>
            {/* Create CTA Button with gradient */}
            <button
              onClick={() => setIsUploadOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white text-xs font-semibold shadow-sm shadow-indigo-500/25 transition-all active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Create</span>
            </button>

            {/* Notifications Dropdown */}
            <NotificationDropdown />
          </>
        )}

        {/* User Auth Status Display */}
        {isLoading ? (
          <div className="w-8 h-8 rounded-full bg-white/[0.08] animate-pulse ml-1" />
        ) : isAuthenticated && user ? (
          <div className="relative ml-1" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center rounded-full ring-2 ring-transparent hover:ring-indigo-500/50 focus:outline-none focus:ring-indigo-500 transition-all"
            >
              <img
                src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                alt={user.username}
                className="w-8 h-8 rounded-full object-cover border border-white/10"
              />
            </button>

            {/* User Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2.5 w-64 bg-[#10131e] border border-white/[0.08] rounded-2xl shadow-2xl py-2 z-50 text-sm backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150">
                {/* User Info Header */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06]">
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                    alt={user.username}
                    className="w-10 h-10 rounded-full object-cover border border-white/10"
                  />
                  <div className="overflow-hidden">
                    <p className="font-semibold text-white truncate">@{user.username}</p>
                    <p className="text-xs text-zinc-400 truncate">{user.email}</p>
                    <span className="inline-block mt-0.5 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300">
                      {user.role}
                    </span>
                  </div>
                </div>

                <div className="py-1">
                  <Link
                    to={`/channel/${user.username}`}
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.06] text-zinc-300 hover:text-white transition-colors"
                  >
                    <Tv className="w-4 h-4 text-zinc-400" />
                    <span>Your Channel</span>
                  </Link>

                  <Link
                    to="/studio"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.06] text-zinc-300 hover:text-white transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4 text-zinc-400" />
                    <span>Viora Studio</span>
                  </Link>

                  <Link
                    to="/settings"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.06] text-zinc-300 hover:text-white transition-colors"
                  >
                    <Settings className="w-4 h-4 text-zinc-400" />
                    <span>Settings</span>
                  </Link>

                  {user?.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-indigo-500/15 text-indigo-400 font-medium transition-colors"
                    >
                      <Shield className="w-4 h-4" />
                      <span>Admin Panel</span>
                    </Link>
                  )}
                </div>

                <div className="border-t border-white/[0.06] pt-1">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-rose-500/15 text-rose-400 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-zinc-200 hover:text-white border border-white/10 text-xs font-semibold transition-all"
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </Link>
        )}
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
      />
    </header>
  );
};

export default Header;
