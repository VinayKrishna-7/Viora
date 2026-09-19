import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  MoreVertical, 
  ChevronDown, 
  ChevronUp, 
  Trash2, 
  Edit2, 
  Send 
} from 'lucide-react';
import { formatDateAgo } from '../../utils/formatters';
import { 
  addCommentApi, 
  getCommentRepliesApi, 
  updateCommentApi, 
  deleteCommentApi 
} from '../../services/commentService';
import Button from '../ui/Button';

export const CommentItem = ({ comment, videoId, onDeleteComment }) => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);
  const [currentText, setCurrentText] = useState(comment.text);

  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState([]);
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);
  const [repliesCount, setRepliesCount] = useState(comment.repliesCount || 0);

  const [showMenu, setShowMenu] = useState(false);

  const isOwner = user?._id === comment.user?._id;

  // Handle Edit
  const handleSaveEdit = async () => {
    if (!editText.trim() || editText.trim() === currentText) {
      setIsEditing(false);
      return;
    }
    try {
      await updateCommentApi(comment._id, { text: editText.trim() });
      setCurrentText(editText.trim());
      setIsEditing(false);
    } catch (err) {
      alert(err.message || 'Failed to update comment');
    }
  };

  // Handle Delete
  const handleDelete = async () => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await deleteCommentApi(comment._id);
      if (onDeleteComment) onDeleteComment(comment._id);
    } catch (err) {
      alert(err.message || 'Failed to delete comment');
    }
  };

  // Toggle and Fetch Nested Replies
  const handleToggleReplies = async () => {
    if (!showReplies && replies.length === 0) {
      setIsLoadingReplies(true);
      try {
        const res = await getCommentRepliesApi(comment._id);
        setReplies(res.data.replies);
      } catch (err) {
        console.error('Error loading replies:', err);
      } finally {
        setIsLoadingReplies(false);
      }
    }
    setShowReplies(!showReplies);
  };

  // Submit Reply
  const handleAddReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setIsSubmittingReply(true);
    try {
      const res = await addCommentApi(videoId, {
        text: replyText.trim(),
        parentCommentId: comment._id,
      });

      setReplies((prev) => [...prev, res.data]);
      setRepliesCount((prev) => prev + 1);
      setReplyText('');
      setShowReplyInput(false);
      setShowReplies(true);
    } catch (err) {
      alert(err.message || 'Failed to post reply');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  return (
    <div className="flex gap-3 text-sm group p-3 rounded-2xl bg-viora-card/30 border border-viora-border/50">
      {/* Author Avatar */}
      <Link to={`/channel/${comment.user?.username}`} className="shrink-0">
        <img
          src={comment.user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
          alt={comment.user?.username}
          className="w-9 h-9 rounded-full object-cover ring-1 ring-white/10"
        />
      </Link>

      <div className="flex-1 space-y-1.5 min-w-0">
        {/* Author name & Date */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link
              to={`/channel/${comment.user?.username}`}
              className="font-bold text-xs text-slate-200 hover:text-indigo-400 transition-colors"
            >
              @{comment.user?.username}
            </Link>
            <span className="text-[11px] text-slate-500">
              {formatDateAgo(comment.createdAt)}
            </span>
          </div>

          {/* Owner actions menu */}
          {isOwner && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-1 w-28 bg-viora-surface border border-viora-border rounded-xl shadow-2xl py-1 z-30 text-xs">
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setShowMenu(false);
                    }}
                    className="flex items-center gap-2 w-full px-3 py-1.5 text-slate-300 hover:text-white hover:bg-white/5 text-left"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => {
                      handleDelete();
                      setShowMenu(false);
                    }}
                    className="flex items-center gap-2 w-full px-3 py-1.5 hover:bg-rose-500/10 text-rose-400 text-left"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Comment Text or Edit Input */}
        {isEditing ? (
          <div className="space-y-2 pt-1">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-viora-surface border border-viora-border rounded-xl text-xs focus:outline-none focus:border-indigo-500 text-slate-100 resize-none"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1 text-xs font-semibold text-slate-400 hover:text-white rounded-lg"
              >
                Cancel
              </button>
              <Button
                onClick={handleSaveEdit}
                variant="primary"
                size="sm"
              >
                Save
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-xs sm:text-sm text-slate-300 whitespace-pre-line leading-relaxed">
            {currentText}
          </p>
        )}

        {/* Action bar: Reply button */}
        <div className="flex items-center gap-4 pt-1 text-xs">
          {isAuthenticated && (
            <button
              onClick={() => setShowReplyInput(!showReplyInput)}
              className="font-medium text-slate-400 hover:text-indigo-400 transition-colors"
            >
              Reply
            </button>
          )}

          {/* Toggle Nested Replies Accordion */}
          {repliesCount > 0 && (
            <button
              onClick={handleToggleReplies}
              className="flex items-center gap-1 font-semibold text-indigo-400 hover:text-indigo-300"
            >
              {showReplies ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" />
                  <span>Hide {repliesCount} {repliesCount === 1 ? 'reply' : 'replies'}</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" />
                  <span>View {repliesCount} {repliesCount === 1 ? 'reply' : 'replies'}</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Inline Reply Input */}
        {showReplyInput && (
          <form onSubmit={handleAddReply} className="flex gap-2 pt-2">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={`Replying to @${comment.user?.username}...`}
              className="flex-1 px-3 py-1.5 bg-viora-surface border border-viora-border rounded-xl text-xs focus:outline-none focus:border-indigo-500 text-slate-100 placeholder-slate-500"
            />
            <Button
              type="submit"
              disabled={isSubmittingReply || !replyText.trim()}
              variant="primary"
              size="sm"
              className="flex items-center gap-1"
            >
              <Send className="w-3 h-3" />
              <span>Reply</span>
            </Button>
          </form>
        )}

        {/* Nested Replies List */}
        {showReplies && (
          <div className="pl-4 sm:pl-6 pt-3 space-y-3 border-l-2 border-viora-border mt-2">
            {isLoadingReplies ? (
              <div className="text-xs text-slate-400 py-1">Loading replies...</div>
            ) : (
              replies.map((reply) => (
                <div key={reply._id} className="flex gap-2.5 text-xs">
                  <img
                    src={reply.user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                    alt={reply.user?.username}
                    className="w-7 h-7 rounded-full object-cover ring-1 ring-white/10"
                  />
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-200">
                        @{reply.user?.username}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {formatDateAgo(reply.createdAt)}
                      </span>
                    </div>
                    <p className="text-slate-300">{reply.text}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentItem;
