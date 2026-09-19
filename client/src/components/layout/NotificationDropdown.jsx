import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Loader2, Video, Heart, MessageSquare, UserPlus } from 'lucide-react';
import { 
  getNotificationsApi, 
  getUnreadCountApi, 
  markAsReadApi, 
  markAllAsReadApi 
} from '../../services/notificationService';
import { formatDateAgo } from '../../utils/formatters';
import { getSocket } from '../../services/socket';

export const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Load unread count on mount and poll occasionally
  useEffect(() => {
    fetchUnreadCount();

    const interval = setInterval(fetchUnreadCount, 45000);
    return () => clearInterval(interval);
  }, []);

  // Real-time notifications via WebSocket
  useEffect(() => {
    const socket = getSocket();
    const handleIncoming = (newNotif) => {
      setNotifications((prev) => [newNotif, ...prev]);
      setUnreadCount((c) => c + 1);
    };

    socket.on('notification', handleIncoming);
    return () => {
      socket.off('notification', handleIncoming);
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  const fetchUnreadCount = async () => {
    try {
      const res = await getUnreadCountApi();
      setUnreadCount(res.data?.unreadCount || 0);
    } catch (err) {
      // ignore
    }
  };

  const handleOpen = async () => {
    const nextState = !isOpen;
    setIsOpen(nextState);

    if (nextState) {
      setIsLoading(true);
      try {
        const res = await getNotificationsApi({ limit: 30 });
        setNotifications(res.data?.notifications || []);
        setUnreadCount(res.data?.unreadCount || 0);
      } catch (err) {
        console.error('Failed to load notifications:', err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsReadApi();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      markAsReadApi(notification._id).catch(() => {});
      setNotifications((prev) =>
        prev.map((n) => (n._id === notification._id ? { ...n, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    }

    setIsOpen(false);

    if (notification.video) {
      const vidId = typeof notification.video === 'object' ? notification.video._id : notification.video;
      navigate(`/watch/${vidId}`);
    } else if (notification.sender) {
      navigate(`/channel/${notification.sender.username}`);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'like':
        return <Heart className="w-3 h-3 text-rose-400 fill-current" />;
      case 'comment':
      case 'reply':
        return <MessageSquare className="w-3 h-3 text-cyan-400 fill-current" />;
      case 'subscribe':
        return <UserPlus className="w-3 h-3 text-indigo-400" />;
      default:
        return <Video className="w-3 h-3 text-violet-400" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={handleOpen}
        title="Notifications"
        className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition focus:outline-none"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-viora-bg font-mono">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-viora-surface rounded-3xl border border-viora-border shadow-2xl overflow-hidden z-50 animate-fadeIn">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-viora-border">
            <h3 className="text-sm font-bold text-slate-100">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-viora-border/60">
            {isLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Bell className="w-10 h-10 mx-auto mb-2 opacity-30 text-indigo-400" />
                <p className="text-xs font-semibold text-slate-300">All caught up!</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Follow creators or publish releases to receive updates
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`flex items-start gap-3 p-3.5 cursor-pointer transition ${
                    !notif.read
                      ? 'bg-indigo-500/10 hover:bg-indigo-500/15'
                      : 'hover:bg-white/[0.03]'
                  }`}
                >
                  {/* Avatar + Sub-icon */}
                  <div className="relative shrink-0">
                    <img
                      src={notif.sender?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                      alt={notif.sender?.username}
                      className="w-10 h-10 rounded-full object-cover ring-1 ring-white/10"
                    />
                    <div className="absolute -bottom-1 -right-1 p-0.5 bg-viora-surface rounded-full shadow border border-viora-border">
                      {getIcon(notif.type)}
                    </div>
                  </div>

                  {/* Message & Time */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-300 leading-snug line-clamp-2">
                      <span className="font-semibold text-slate-100">
                        @{notif.sender?.username || 'User'}{' '}
                      </span>
                      {notif.text || notif.type}
                    </p>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      {formatDateAgo(notif.createdAt)}
                    </span>
                  </div>

                  {/* Video Thumbnail preview */}
                  {notif.video && (
                    <img
                      src={notif.video.thumbnailUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600'}
                      alt={notif.video.title}
                      className="w-12 aspect-video rounded-lg object-cover shrink-0 border border-viora-border"
                    />
                  )}

                  {/* Unread indicator dot */}
                  {!notif.read && (
                    <span className="w-2 h-2 rounded-full bg-indigo-400 shrink-0 self-center" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
