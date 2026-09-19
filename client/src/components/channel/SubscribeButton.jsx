import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Bell, Check } from 'lucide-react';
import { 
  toggleSubscriptionApi, 
  getSubscriptionStatusApi 
} from '../../services/subscriptionService';

export const SubscribeButton = ({ channelId, initialSubscribed = false, onStatusChange }) => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [isSubscribed, setIsSubscribed] = useState(initialSubscribed);
  const [isLoading, setIsLoading] = useState(false);

  const isSelf = user?._id === channelId;

  // Sync subscription status on mount or channelId change
  useEffect(() => {
    if (!channelId || isSelf) return;

    getSubscriptionStatusApi(channelId)
      .then((res) => {
        setIsSubscribed(res.data.isSubscribed);
      })
      .catch(() => {});
  }, [channelId, isSelf]);

  const handleToggle = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (isSelf || isLoading) return;

    setIsLoading(true);
    try {
      const res = await toggleSubscriptionApi(channelId);
      setIsSubscribed(res.data.isSubscribed);
      if (onStatusChange) {
        onStatusChange(res.data);
      }
    } catch (err) {
      alert(err.message || 'Failed to update subscription');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSelf) {
    return (
      <span className="px-3.5 py-1.5 bg-white/5 border border-white/10 text-slate-400 text-xs font-semibold rounded-full select-none">
        Your Channel
      </span>
    );
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 shadow-sm disabled:opacity-50 ${
        isSubscribed
          ? 'bg-viora-card hover:bg-white/10 text-slate-200 border border-viora-border'
          : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-md shadow-indigo-500/25 active:scale-95'
      }`}
    >
      {isLoading ? (
        <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : isSubscribed ? (
        <>
          <Check className="w-3.5 h-3.5 text-indigo-400" />
          <span>Subscribed</span>
        </>
      ) : (
        <>
          <Bell className="w-3.5 h-3.5" />
          <span>Subscribe</span>
        </>
      )}
    </button>
  );
};

export default SubscribeButton;
