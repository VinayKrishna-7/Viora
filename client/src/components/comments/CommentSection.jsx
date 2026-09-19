import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { MessageSquare, Send } from 'lucide-react';
import CommentItem from './CommentItem';
import Button from '../ui/Button';
import { getVideoCommentsApi, addCommentApi } from '../../services/commentService';

export const CommentSection = ({ videoId }) => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [comments, setComments] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [page, setPage] = useState(1);

  // Fetch comments
  const fetchComments = useCallback(async (pageNum = 1, append = false) => {
    if (!videoId) return;
    try {
      setIsLoading(true);
      const res = await getVideoCommentsApi(videoId, { page: pageNum, limit: 15 });
      if (append) {
        setComments((prev) => [...prev, ...res.data.comments]);
      } else {
        setComments(res.data.comments);
      }
      setPagination(res.data.pagination);
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setIsLoading(false);
    }
  }, [videoId]);

  useEffect(() => {
    setPage(1);
    fetchComments(1, false);
  }, [fetchComments]);

  // Submit Top-Level Comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await addCommentApi(videoId, { text: commentText.trim() });
      setComments((prev) => [res.data, ...prev]);
      setCommentText('');
      if (pagination) {
        setPagination((prev) => ({ ...prev, total: (prev?.total || 0) + 1 }));
      }
    } catch (err) {
      alert(err.message || 'Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = (commentId) => {
    setComments((prev) => prev.filter((c) => c._id !== commentId));
    if (pagination) {
      setPagination((prev) => ({ ...prev, total: Math.max(0, (prev?.total || 1) - 1) }));
    }
  };

  const handleLoadMore = () => {
    if (pagination?.hasNextPage) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchComments(nextPage, true);
    }
  };

  return (
    <div className="space-y-6 pt-6">
      {/* Header with Count */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
          <MessageSquare className="w-4 h-4" />
        </div>
        <h3 className="text-base sm:text-lg font-bold text-slate-100">
          {pagination?.total || 0} Discussions
        </h3>
      </div>

      {/* Add Comment Input */}
      {isAuthenticated ? (
        <form onSubmit={handleAddComment} className="flex gap-3">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
            alt={user?.username}
            className="w-10 h-10 rounded-full object-cover shrink-0 ring-1 ring-white/10"
          />
          <div className="flex-1 space-y-2">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Contribute to the conversation..."
              rows={2}
              className="w-full px-4 py-2.5 bg-viora-card border border-viora-border rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all text-slate-100 placeholder-slate-500 resize-none"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCommentText('')}
                className="px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <Button
                type="submit"
                disabled={isSubmitting || !commentText.trim()}
                variant="primary"
                size="sm"
                className="flex items-center gap-1.5"
              >
                <Send className="w-3 h-3" />
                <span>Publish</span>
              </Button>
            </div>
          </div>
        </form>
      ) : (
        <div className="p-4 rounded-2xl bg-viora-card border border-viora-border text-center text-xs sm:text-sm text-slate-300">
          <span>Want to join the conversation? </span>
          <Link to="/login" className="text-indigo-400 font-semibold hover:underline">
            Sign in
          </Link>
          <span> to share your thoughts.</span>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4 pt-2">
        {isLoading && comments.length === 0 ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3 animate-pulse p-2 rounded-xl bg-viora-card/40">
                <div className="w-9 h-9 rounded-full bg-viora-surface shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-viora-surface rounded w-1/4" />
                  <div className="h-3 bg-viora-surface rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <div className="p-8 rounded-2xl bg-viora-card/40 border border-viora-border text-center">
            <p className="text-sm text-slate-400">
              No comments yet. Start the conversation!
            </p>
          </div>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              videoId={videoId}
              onDeleteComment={handleDeleteComment}
            />
          ))
        )}
      </div>

      {/* Load More Comments */}
      {pagination?.hasNextPage && (
        <div className="text-center pt-3">
          <button
            onClick={handleLoadMore}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300 hover:underline"
          >
            {isLoading ? 'Loading...' : 'Load more comments'}
          </button>
        </div>
      )}
    </div>
  );
};

export default CommentSection;
