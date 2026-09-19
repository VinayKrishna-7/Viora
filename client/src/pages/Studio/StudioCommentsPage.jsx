import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Trash2, ExternalLink, ThumbsUp } from 'lucide-react';
import { getStudioCommentsApi } from '../../services/studioService';
import { deleteCommentApi } from '../../services/commentService';
import { formatDateAgo } from '../../utils/formatters';

export const StudioCommentsPage = () => {
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await getStudioCommentsApi({ limit: 50 });
      setComments(res.data?.comments || []);
    } catch (err) {
      setError(err.message || 'Failed to load comments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;

    try {
      await deleteCommentApi(commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">
          Channel Comments
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Review, engage with, and moderate comments across your channel.
        </p>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-viora-card/60 border border-white/5 rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-16 text-rose-400 bg-viora-card/40 rounded-3xl border border-white/5">
          <p>{error}</p>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-20 bg-viora-card/40 rounded-3xl border border-white/5 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto mb-3">
            <MessageSquare className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-white">
            No comments yet
          </h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 leading-relaxed">
            When viewers comment on your videos, they will show up here for moderation and interaction.
          </p>
        </div>
      ) : (
        <div className="bg-viora-card/50 rounded-3xl border border-white/5 shadow-xl overflow-hidden divide-y divide-white/5">
          {comments.map((comment) => (
            <div
              key={comment._id}
              className="p-5 hover:bg-white/[0.02] transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-4 group"
            >
              {/* Left: User & Comment */}
              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                <Link to={`/channel/${comment.user?.username}`}>
                  <img
                    src={comment.user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                    alt={comment.user?.username}
                    className="w-10 h-10 rounded-full object-cover ring-1 ring-white/10 flex-shrink-0"
                  />
                </Link>

                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/channel/${comment.user?.username}`}
                      className="text-xs font-bold text-white hover:text-indigo-400 transition-colors"
                    >
                      {comment.user?.username}
                    </Link>
                    <span className="text-[11px] text-slate-500">
                      {formatDateAgo(comment.createdAt)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                    {comment.text}
                  </p>

                  <div className="flex items-center gap-3 pt-0.5 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1.5 font-medium">
                      <ThumbsUp className="w-3 h-3 text-indigo-400" />
                      <span>{comment.likesCount || 0}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Video Card & Action */}
              <div className="flex items-center gap-3 sm:self-center flex-shrink-0 pl-13 sm:pl-0">
                {comment.video && (
                  <Link
                    to={`/watch/${comment.video._id}`}
                    className="flex items-center gap-2.5 p-2 bg-viora-surface/80 rounded-xl hover:bg-viora-surface border border-white/5 hover:border-indigo-500/20 transition-all max-w-xs"
                  >
                    <img
                      src={comment.video.thumbnailUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600'}
                      alt={comment.video.title}
                      className="w-12 aspect-video rounded-lg object-cover"
                    />
                    <span className="text-[11px] font-semibold text-slate-300 truncate max-w-[130px]">
                      {comment.video.title}
                    </span>
                  </Link>
                )}

                <button
                  onClick={() => handleDeleteComment(comment._id)}
                  title="Delete comment"
                  className="p-2 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudioCommentsPage;
