import React, { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  LayoutDashboard, 
  Video, 
  BarChart3, 
  MessageSquare, 
  Plus, 
  ArrowLeft,
  Settings,
  Menu,
  X,
  Sparkles
} from 'lucide-react';
import UploadModal from '../components/video/UploadModal';
import Button from '../components/ui/Button';

const navItems = [
  { name: 'Dashboard', path: '/studio', icon: LayoutDashboard, end: true },
  { name: 'Content', path: '/studio/content', icon: Video },
  { name: 'Analytics', path: '/studio/analytics', icon: BarChart3 },
  { name: 'Discussions', path: '/studio/comments', icon: MessageSquare },
];

export const StudioLayout = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const navLinkClasses = ({ isActive }) =>
    `flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 ${
      isActive
        ? 'bg-indigo-500/15 text-indigo-400 font-bold border border-indigo-500/30 shadow-sm'
        : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
    }`;

  return (
    <div className="min-h-screen bg-viora-bg text-slate-100 flex flex-col font-sans antialiased">
      {/* Studio Top Navbar */}
      <header className="sticky top-0 z-40 bg-viora-surface/90 backdrop-blur-xl border-b border-viora-border px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
            className="p-2 rounded-xl text-slate-400 hover:bg-white/5 md:hidden"
            aria-label="Toggle studio menu"
          >
            {isMobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link to="/studio" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-md shadow-indigo-500/20">
              <svg className="w-4 h-4 text-white fill-current ml-0.5" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-white font-display">
              Vio<span className="text-indigo-400">ra</span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300">
              Studio
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Platform</span>
          </Link>

          <Button
            onClick={() => setIsUploadOpen(true)}
            variant="primary"
            size="sm"
            className="flex items-center gap-2 shadow-lg shadow-indigo-500/25"
          >
            <Plus className="w-4 h-4" />
            <span>Create</span>
          </Button>

          <Link to={`/channel/${user?.username}`}>
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
              alt={user?.username}
              className="w-9 h-9 rounded-full object-cover ring-1 ring-indigo-500/40"
            />
          </Link>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Studio Sidebar Desktop */}
        <aside className="hidden md:flex flex-col w-64 bg-viora-surface border-r border-viora-border p-4 justify-between shrink-0">
          <div className="space-y-6">
            {/* Channel Profile Card */}
            <div className="flex flex-col items-center text-center p-4 bg-viora-card/50 rounded-2xl border border-viora-border">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                alt={user?.username}
                className="w-16 h-16 rounded-full object-cover ring-2 ring-indigo-500/40 mb-2 shadow-lg"
              />
              <span className="text-sm font-bold text-slate-100 truncate max-w-[180px]">
                Your Channel
              </span>
              <span className="text-xs text-indigo-400 truncate max-w-[180px]">
                @{user?.username}
              </span>
            </div>

            {/* Navigation Links */}
            <nav className="space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  end={item.end}
                  className={navLinkClasses}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="pt-4 border-t border-viora-border space-y-1">
            <Link
              to="/settings"
              className="flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </Link>
          </div>
        </aside>

        {/* Mobile Nav Drawer */}
        {isMobileNavOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-xs"
              onClick={() => setIsMobileNavOpen(false)}
            />
            <div className="relative flex flex-col w-64 h-full bg-viora-surface border-r border-viora-border p-4 z-10 shadow-2xl">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-viora-border">
                <span className="font-bold text-slate-100">Studio Menu</span>
                <button
                  onClick={() => setIsMobileNavOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="space-y-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    end={item.end}
                    onClick={() => setIsMobileNavOpen(false)}
                    className={navLinkClasses}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </NavLink>
                ))}
              </nav>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-viora-bg">
          <Outlet />
        </main>
      </div>

      {/* Upload Modal triggered from Studio */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={() => {
          navigate('/studio/content');
        }}
      />
    </div>
  );
};

export default StudioLayout;
