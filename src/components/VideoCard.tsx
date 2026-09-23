import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Eye, ThumbsUp, Bookmark, Clock, Share2, Check } from 'lucide-react';
import { Video } from '../types';
import { getVideoWatchProgress } from '../lib/storage';

interface VideoCardProps {
  video: Video;
  onSelect: (video: Video) => void;
  onToggleSave?: (videoId: string, e: React.MouseEvent) => void;
  onToggleLike?: (videoId: string, e: React.MouseEvent) => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  video,
  onSelect,
  onToggleSave,
  onToggleLike,
}) => {
  const [copied, setCopied] = useState(false);

  const formatDuration = (seconds?: number) => {
    if (!seconds || isNaN(seconds) || seconds < 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const paddedMins = mins < 10 ? `0${mins}` : `${mins}`;
    const paddedSecs = secs < 10 ? `0${secs}` : `${secs}`;
    return `${paddedMins}:${paddedSecs}`;
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  const formatTimeAgo = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffSeconds = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 1000));

      if (diffSeconds < 45) return 'Just now';
      
      const diffMinutes = Math.floor(diffSeconds / 60);
      if (diffMinutes < 60) {
        return `${diffMinutes} ${diffMinutes === 1 ? 'min' : 'mins'} ago`;
      }

      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) {
        return `${diffHours} ${diffHours === 1 ? 'hr' : 'hrs'} ago`;
      }

      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) {
        return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
      }

      const diffWeeks = Math.floor(diffDays / 7);
      if (diffDays < 30) {
        return `${diffWeeks} ${diffWeeks === 1 ? 'week' : 'weeks'} ago`;
      }

      const diffMonths = Math.floor(diffDays / 30);
      if (diffDays < 365) {
        return `${diffMonths} ${diffMonths === 1 ? 'month' : 'months'} ago`;
      }

      const diffYears = Math.floor(diffDays / 365);
      return `${diffYears} ${diffYears === 1 ? 'year' : 'years'} ago`;
    } catch {
      return 'Recently';
    }
  };

  const handleShareR2Url = (e: React.MouseEvent) => {
    e.stopPropagation();
    const urlToCopy = video.video_url;
    navigator.clipboard.writeText(urlToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const watchProgress = getVideoWatchProgress(video.id);
  const progressPercent = watchProgress && watchProgress.currentTime > 2 && (video.duration || watchProgress.duration) > 0
    ? Math.min(100, Math.round((watchProgress.currentTime / (video.duration || watchProgress.duration)) * 100))
    : 0;

  return (
    <motion.div 
      onClick={() => onSelect(video)}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
      className="group relative flex flex-col bg-neutral-900/40 hover:bg-neutral-900/80 border border-neutral-800/60 hover:border-neutral-700/80 rounded-2xl overflow-hidden cursor-pointer transition-colors duration-300 hover:shadow-xl hover:shadow-cyan-950/20"
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-video w-full overflow-hidden bg-neutral-950">
        <img
          src={video.thumbnail_url}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Gradient Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-black/20 opacity-60 group-hover:opacity-80 transition-opacity" />

        {/* Duration Badge */}
        <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-neutral-950/85 backdrop-blur-sm text-[11px] font-mono font-medium text-neutral-200 border border-neutral-800">
          {formatDuration(video.duration)}
        </div>

        {/* Category Pill */}
        <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-cyan-950/80 backdrop-blur-sm text-[10px] uppercase font-bold tracking-wider text-cyan-300 border border-cyan-800/60">
          {video.category}
        </div>

        {/* Play Icon Overlay on Hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-12 h-12 rounded-full bg-cyan-500/90 text-neutral-950 flex items-center justify-center shadow-lg shadow-cyan-500/40 transform scale-75 group-hover:scale-100 transition-transform duration-300">
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </div>
        </div>

        {/* Thumbnail Watch Progress Bar */}
        {progressPercent > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-neutral-950/90 z-20 overflow-hidden border-t border-neutral-900/60">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 via-cyan-300 to-blue-500 shadow-[0_0_8px_rgba(34,211,238,0.7)]"
              style={{ width: `${progressPercent}%` }}
              title={`Watched ${progressPercent}%`}
            />
          </div>
        )}
      </div>

      {/* Video Info */}
      <div className="p-4 flex gap-3 flex-1">
        {/* Channel Avatar */}
        <img
          src={video.uploader_avatar}
          alt={video.uploader_name}
          className="w-9 h-9 rounded-full object-cover ring-1 ring-neutral-700 flex-shrink-0 mt-0.5"
        />

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-neutral-100 group-hover:text-cyan-300 transition-colors line-clamp-2 leading-snug">
            {video.title}
          </h3>

          {/* Tags Badges below the title */}
          {video.tags && video.tags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap mt-1.5 mb-1">
              {video.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center text-[10px] font-medium text-cyan-300/90 bg-cyan-950/60 border border-cyan-800/40 px-2 py-0.5 rounded-full hover:bg-cyan-900/50 transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <p className="text-xs text-neutral-400 mt-1 hover:text-neutral-200 transition-colors">
            {video.uploader_name}
          </p>

          <div className="flex items-center gap-2 text-[11px] text-neutral-400 mt-1.5 font-medium flex-wrap">
            <span className="flex items-center gap-1 text-neutral-300">
              <Eye className="w-3 h-3 text-neutral-400" />
              {formatViews(video.views)} views
            </span>
            <span className="text-neutral-600">•</span>
            {/* Contextual Time Ago with Clock icon */}
            <span className="flex items-center gap-1 text-neutral-300" title={new Date(video.created_at).toLocaleString()}>
              <Clock className="w-3 h-3 text-cyan-400/80" />
              <span>{formatTimeAgo(video.created_at)}</span>
            </span>
          </div>

          {/* Quick R2 Zero-Egress Tag & Category badge */}
          <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-mono text-cyan-400/90 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-900/50">
              R2 Range Stream
            </span>
            {video.category && (
              <span className="text-[10px] font-medium text-neutral-300 bg-neutral-800/80 px-1.5 py-0.5 rounded border border-neutral-700/60">
                {video.category}
              </span>
            )}
          </div>
        </div>

        {/* Hover / persistent action buttons */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1.5 items-center justify-start">
          {/* Share Button (copies Cloudflare R2 Public URL) */}
          <button
            onClick={handleShareR2Url}
            className={`p-1.5 rounded-lg border transition-all ${
              copied
                ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300 shadow-sm shadow-emerald-500/20'
                : 'bg-neutral-800/80 border-neutral-700/80 text-neutral-300 hover:text-cyan-300 hover:border-cyan-600 hover:bg-neutral-700'
            }`}
            title={copied ? 'Cloudflare R2 URL copied!' : 'Copy public Cloudflare R2 URL'}
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Share2 className="w-3.5 h-3.5" />
            )}
          </button>

          {onToggleSave && (
            <button
              onClick={(e) => onToggleSave(video.id, e)}
              className={`p-1.5 rounded-lg border transition-colors ${
                video.is_saved
                  ? 'bg-amber-950/60 border-amber-800/60 text-amber-400'
                  : 'bg-neutral-800/80 border-neutral-700/80 text-neutral-400 hover:text-white hover:bg-neutral-700'
              }`}
              title={video.is_saved ? 'Saved' : 'Save to Watch Later'}
            >
              <Bookmark className={`w-3.5 h-3.5 ${video.is_saved ? 'fill-current' : ''}`} />
            </button>
          )}

          {onToggleLike && (
            <button
              onClick={(e) => onToggleLike(video.id, e)}
              className={`p-1.5 rounded-lg border transition-colors ${
                video.is_liked
                  ? 'bg-blue-950/60 border-blue-800/60 text-blue-400'
                  : 'bg-neutral-800/80 border-neutral-700/80 text-neutral-400 hover:text-white hover:bg-neutral-700'
              }`}
              title={video.is_liked ? 'Liked' : 'Like'}
            >
              <ThumbsUp className={`w-3.5 h-3.5 ${video.is_liked ? 'fill-current' : ''}`} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
