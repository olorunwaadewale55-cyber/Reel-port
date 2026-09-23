import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  ThumbsUp, 
  Trash2, 
  Clock, 
  CornerDownRight, 
  Check, 
  Sparkles,
  User as UserIcon
} from 'lucide-react';
import { Comment, User } from '../types';
import { 
  getStoredComments, 
  addCommentRecord, 
  toggleCommentLike, 
  deleteCommentRecord 
} from '../lib/storage';

interface CommentSectionProps {
  videoId: string;
  currentUser: User;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  videoId,
  currentUser,
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [likedCommentIds, setLikedCommentIds] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load comments whenever videoId changes
  useEffect(() => {
    const loaded = getStoredComments(videoId);
    setComments(loaded);
    setReplyingTo(null);
    setNewCommentText('');
  }, [videoId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    const text = newCommentText.trim();
    if (!text || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const created = addCommentRecord(videoId, text, currentUser);
      setComments((prev) => [created, ...prev]);
      setNewCommentText('');
      showToast('Comment posted and stored to local storage!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePostReply = (parentComment: Comment) => {
    const text = replyText.trim();
    if (!text || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const formatted = `@${parentComment.user_name} ${text}`;
      const created = addCommentRecord(videoId, formatted, currentUser);
      setComments((prev) => [created, ...prev]);
      setReplyingTo(null);
      setReplyText('');
      showToast(`Reply posted to @${parentComment.user_name}!`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = (commentId: string) => {
    const isLiked = likedCommentIds.includes(commentId);
    const { likes } = toggleCommentLike(commentId);
    
    setLikedCommentIds((prev) => 
      isLiked ? prev.filter((id) => id !== commentId) : [...prev, commentId]
    );

    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, likes: isLiked ? Math.max(0, c.likes - 1) : likes || c.likes + 1 } : c))
    );
  };

  const handleDelete = (commentId: string) => {
    deleteCommentRecord(commentId);
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    showToast('Comment deleted.');
  };

  const formatTimestamp = (isoDate: string) => {
    try {
      const date = new Date(isoDate);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSecs = Math.max(0, Math.floor(diffMs / 1000));
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffSecs < 45) return 'just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'recently';
    }
  };

  return (
    <section className="space-y-4 pt-6 border-t border-neutral-800/80">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-950/90 border border-cyan-500/60 text-cyan-200 text-xs shadow-md animate-in fade-in slide-in-from-top-1 duration-200">
          <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-800/60 text-cyan-400">
            <MessageSquare className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-white tracking-tight">
            Discussion & Technical Notes
          </h3>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-neutral-800 text-neutral-300 border border-neutral-700">
            {comments.length}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 font-mono">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Local Storage Persisted</span>
        </div>
      </div>

      {/* Post Comment Input */}
      <form onSubmit={handlePostComment} className="flex gap-3 items-start p-3 rounded-2xl bg-neutral-900/50 border border-neutral-800">
        <img
          src={currentUser.avatar}
          alt={currentUser.name}
          className="w-8 h-8 rounded-full object-cover ring-1 ring-cyan-500/40 mt-0.5 flex-shrink-0"
        />
        <div className="flex-1 space-y-2 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
              <span>{currentUser.name}</span>
              <span className="text-[10px] text-cyan-400 font-mono">({currentUser.channel_handle})</span>
            </span>
            <span className="text-[10px] text-neutral-500 font-mono">Posting as Author</span>
          </div>

          <textarea
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            placeholder="Share technical observations, architecture questions, or streaming feedback..."
            rows={2}
            className="w-full p-2.5 bg-neutral-950 border border-neutral-800 focus:border-cyan-500/70 rounded-xl text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none transition-colors resize-y min-h-[58px]"
          />

          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-neutral-500 font-mono">
              Markdown & @mentions supported
            </span>

            <button
              type="submit"
              disabled={!newCommentText.trim() || isSubmitting}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:hover:bg-cyan-500 text-neutral-950 font-bold rounded-lg text-xs transition-all shadow-md shadow-cyan-500/20"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Comment</span>
            </button>
          </div>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-3 pt-1">
        {comments.length === 0 ? (
          <div className="text-center py-8 px-4 rounded-xl bg-neutral-900/20 border border-dashed border-neutral-800 text-neutral-400 space-y-2">
            <MessageSquare className="w-6 h-6 mx-auto text-neutral-500 opacity-60" />
            <p className="text-xs font-medium text-neutral-300">No comments yet on this stream.</p>
            <p className="text-[11px] text-neutral-500">Be the first to post a question or note about this video!</p>
          </div>
        ) : (
          comments.map((comment) => {
            const isCurrentUserAuthor = comment.user_id === currentUser.id;
            const isLiked = likedCommentIds.includes(comment.id);

            return (
              <div 
                key={comment.id} 
                className="group flex gap-3 p-3.5 bg-neutral-900/40 hover:bg-neutral-900/70 border border-neutral-800/60 rounded-xl transition-all"
              >
                <img
                  src={comment.user_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=128&q=80'}
                  alt={comment.user_name}
                  className="w-8 h-8 rounded-full object-cover ring-1 ring-neutral-700 flex-shrink-0 mt-0.5"
                />

                <div className="flex-1 min-w-0 space-y-1.5 text-xs">
                  {/* Author Header */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-neutral-100">{comment.user_name}</span>
                      {isCurrentUserAuthor && (
                        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 font-mono">
                          You
                        </span>
                      )}
                      <span className="text-neutral-600">•</span>
                      <span 
                        className="text-[11px] text-neutral-400 flex items-center gap-1 font-mono"
                        title={new Date(comment.created_at).toLocaleString()}
                      >
                        <Clock className="w-3 h-3 text-neutral-500" />
                        <span>{formatTimestamp(comment.created_at)}</span>
                      </span>
                    </div>

                    {/* Delete action if user's own comment */}
                    {isCurrentUserAuthor && (
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-neutral-500 hover:text-red-400 transition-all rounded hover:bg-neutral-800"
                        title="Delete your comment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Comment Body */}
                  <p className="text-neutral-200 leading-relaxed whitespace-pre-line text-xs font-normal">
                    {comment.content}
                  </p>

                  {/* Comment Actions (Like, Reply) */}
                  <div className="flex items-center gap-3 pt-1">
                    <button
                      onClick={() => handleLike(comment.id)}
                      className={`flex items-center gap-1.5 text-[11px] font-medium transition-colors ${
                        isLiked 
                          ? 'text-cyan-400' 
                          : 'text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
                      <span>{comment.likes || 0}</span>
                    </button>

                    <button
                      onClick={() => {
                        setReplyingTo(replyingTo === comment.id ? null : comment.id);
                        setReplyText('');
                      }}
                      className="text-[11px] text-neutral-400 hover:text-cyan-300 font-medium transition-colors"
                    >
                      {replyingTo === comment.id ? 'Cancel' : 'Reply'}
                    </button>
                  </div>

                  {/* Inline Reply Form */}
                  {replyingTo === comment.id && (
                    <div className="mt-2.5 pt-2 border-t border-neutral-800/80 flex gap-2 items-start animate-in fade-in duration-150">
                      <CornerDownRight className="w-3.5 h-3.5 text-cyan-400 mt-2 flex-shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder={`Reply to @${comment.user_name}...`}
                          rows={2}
                          className="w-full p-2 bg-neutral-950 border border-neutral-800 focus:border-cyan-500/70 rounded-xl text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none resize-none"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setReplyingTo(null)}
                            className="px-2.5 py-1 text-xs text-neutral-400 hover:text-white rounded-lg transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePostReply(comment)}
                            disabled={!replyText.trim()}
                            className="px-3 py-1 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-neutral-950 font-bold rounded-lg text-xs transition-colors"
                          >
                            Reply
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};
