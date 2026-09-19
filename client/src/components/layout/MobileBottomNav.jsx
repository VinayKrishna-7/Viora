import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Home, Sparkles, Plus, Tv2, User as UserIcon } from 'lucide-react';
import UploadModal from '../video/UploadModal';

export const MobileBottomNav = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const navigate = useNavigate();

  const handleUploadClick = () => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      setIsUploadOpen(true);
    }
  };

  const navClass = ({ isActive }) =>
    `flex flex-col items-center justify-center flex-1 py-1.5 text-[11px] font-medium transition-all duration-150 ${
      isActive
        ? 'text-indigo-400 font-semibold'
        : 'text-slate-400 hover:text-slate-200'
    }`;

  return (
    <>
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-viora-surface/90 backdrop-blur-2xl border-t border-viora-border flex items-center justify-around h-16 md:hidden select-none safe-area-bottom px-2 shadow-2xl">
        <NavLink to="/" className={navClass}>
          <Home className="w-5 h-5 mb-1" />
          <span>Home</span>
        </NavLink>

        <NavLink to="/shorts" className={navClass}>
          <Sparkles className="w-5 h-5 mb-1" />
          <span>Shorts</span>
        </NavLink>

        {/* Center Create Button with Indigo/Violet Gradient */}
        <button
          onClick={handleUploadClick}
          aria-label="Create or Upload"
          className="relative -top-2 flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-transform"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>

        <NavLink to="/subscriptions" className={navClass}>
          <Tv2 className="w-5 h-5 mb-1" />
          <span>Subs</span>
        </NavLink>

        <NavLink
          to={isAuthenticated ? (user ? `/channel/${user.username}` : '/history') : '/login'}
          className={navClass}
        >
          {isAuthenticated && user?.avatar ? (
            <img
              src={user.avatar}
              alt="You"
              className="w-5 h-5 rounded-full object-cover mb-1 ring-1 ring-indigo-500/50"
            />
          ) : (
            <UserIcon className="w-5 h-5 mb-1" />
          )}
          <span>You</span>
        </NavLink>
      </nav>

      {/* Upload Modal triggered from Mobile Nav */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
      />
    </>
  );
};

export default MobileBottomNav;
