import React, { useRef, useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  RotateCcw, 
  Share2, 
  ThumbsUp, 
  Bookmark, 
  Download, 
  MessageSquare, 
  Check, 
  Sparkles,
  Info,
  Server,
  Cloud,
  Send,
  Eye,
  History,
  PlayCircle,
  Link2,
  Copy,
  X,
  HeartHandshake,
  Tv,
  DollarSign
} from 'lucide-react';
import { Video, Comment, User, Tip } from '../types';
import { CommentSection } from './CommentSection';
import { TipModal } from './TipModal';
import { 
  saveVideoWatchProgress, 
  getVideoWatchProgress,
  getTipsForVideo
} from '../lib/storage';

interface VideoPlayerProps {
  video: Video;
  allVideos: Video[];
  onSelectVideo: (video: Video) => void;
  onToggleLike: (videoId: string) => void;
  onToggleSave: (videoId: string) => void;
  currentUser: User;
  onBack: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  video,
  allVideos,
  onSelectVideo,
  onToggleLike,
  onToggleSave,
  currentUser,
  onBack,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(video.duration || 0);
  const [volume, setVolume] = useState(0.9);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showTechDetails, setShowTechDetails] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareFeedbackMsg, setShareFeedbackMsg] = useState<string | null>(null);
  const [isTipOpen, setIsTipOpen] = useState(false);
  const [tipsCount, setTipsCount] = useState<number>(() => getTipsForVideo(video.id).length);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [resumedFromSeconds, setResumedFromSeconds] = useState<number | null>(null);
  const [showResumeBanner, setShowResumeBanner] = useState(false);
  const [shortcutFeedback, setShortcutFeedback] = useState<{ icon: 'play' | 'pause' | 'mute' | 'unmute' | 'fullscreen' | 'window'; label: string } | null>(null);
  const feedbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const triggerFeedback = (icon: 'play' | 'pause' | 'mute' | 'unmute' | 'fullscreen' | 'window', label: string) => {
    setShortcutFeedback({ icon, label });
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    feedbackTimeoutRef.current = setTimeout(() => {
      setShortcutFeedback(null);
    }, 900);
  };

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const savedProgress = getVideoWatchProgress(video.id);

    // If there is saved progress (> 3 seconds and not at the very end)
    const initialSeekTime = savedProgress && savedProgress.currentTime > 3 && (savedProgress.duration === 0 || savedProgress.currentTime < savedProgress.duration - 5)
      ? savedProgress.currentTime
      : 0;

    setCurrentTime(initialSeekTime);
    setIsPlaying(true);

    if (initialSeekTime > 0) {
      setResumedFromSeconds(initialSeekTime);
      setShowResumeBanner(true);
      setTimeout(() => setShowResumeBanner(false), 4500);
    } else {
      setResumedFromSeconds(null);
      setShowResumeBanner(false);
    }

    if (videoRef.current) {
      videoRef.current.currentTime = initialSeekTime;
      videoRef.current.play().catch(() => setIsPlaying(false));
    }
  }, [video.id]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 2800);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
      triggerFeedback('pause', 'Paused');
    } else {
      videoRef.current.play();
      setIsPlaying(true);
      triggerFeedback('play', 'Playing');
    }
  };

  const lastSaveTimeRef = useRef<number>(0);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const cur = videoRef.current.currentTime;
      setCurrentTime(cur);
      const dur = videoRef.current.duration || duration;
      if (videoRef.current.duration) {
        setDuration(videoRef.current.duration);
      }

      // Persist watch progress every 2 seconds
      const now = Date.now();
      if (now - lastSaveTimeRef.current > 2000) {
        lastSaveTimeRef.current = now;
        saveVideoWatchProgress(video.id, cur, dur);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = parseFloat(e.target.value);
    setCurrentTime(target);
    if (videoRef.current) {
      videoRef.current.currentTime = target;
      saveVideoWatchProgress(video.id, target, videoRef.current.duration || duration);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setIsMuted(val === 0);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const newMuteState = !isMuted;
    setIsMuted(newMuteState);
    videoRef.current.muted = newMuteState;
    if (!newMuteState && volume === 0) {
      setVolume(0.5);
      videoRef.current.volume = 0.5;
    }
    triggerFeedback(newMuteState ? 'mute' : 'unmute', newMuteState ? 'Muted' : 'Unmuted');
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement || isFullscreen) {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
      triggerFeedback('fullscreen', 'Exit Fullscreen');
    } else {
      if (containerRef.current.requestFullscreen) {
        containerRef.current
          .requestFullscreen()
          .then(() => setIsFullscreen(true))
          .catch(() => {
            // Fallback for iframes or restricted fullscreen environments
            setIsFullscreen(true);
          });
      } else {
        setIsFullscreen(true);
      }
      triggerFeedback('fullscreen', 'Fullscreen');
    }
  };

  const togglePiP = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        triggerFeedback('window', 'Exited Pop-out');
      } else if (document.pictureInPictureEnabled) {
        await videoRef.current.requestPictureInPicture();
        triggerFeedback('window', 'Pop-out Window (PiP)');
      }
    } catch (err) {
      console.warn('PiP not available or permission denied', err);
    }
  };

  // Global keyboard shortcuts: Space (Play/Pause), M (Mute/Unmute), F (Fullscreen), P (Pop-out Window)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore shortcut when typing in inputs, textareas, or contentEditable elements
      const target = e.target as HTMLElement | null;
      if (target) {
        const tagName = target.tagName.toUpperCase();
        if (tagName === 'INPUT' || tagName === 'TEXTAREA' || target.isContentEditable) {
          return;
        }
      }

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        toggleMute();
      } else if (e.code === 'KeyF') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.code === 'KeyP') {
        e.preventDefault();
        togglePiP();
      } else if (e.code === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPlaying, isMuted, volume]);

  const getShareableUrl = (includeTimestamp: boolean = false) => {
    try {
      const url = new URL(window.location.origin + window.location.pathname);
      url.searchParams.set('v', video.id);
      if (includeTimestamp && currentTime > 1) {
        url.searchParams.set('t', Math.floor(currentTime).toString());
      }
      return url.toString();
    } catch {
      return window.location.href;
    }
  };

  const handleCopyLink = (textToCopy: string, label: string = 'Link copied to clipboard!') => {
    navigator.clipboard.writeText(textToCopy);
    setCopiedLink(true);
    setShareFeedbackMsg(label);
    setTimeout(() => {
      setCopiedLink(false);
      setShareFeedbackMsg(null);
    }, 2500);
  };

  const handleShare = () => {
    const url = getShareableUrl(false);
    handleCopyLink(url, 'Share link copied to clipboard!');
    setShowShareModal(true);
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds) || seconds < 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const paddedMins = mins < 10 ? `0${mins}` : `${mins}`;
    const paddedSecs = secs < 10 ? `0${secs}` : `${secs}`;
    return `${paddedMins}:${paddedSecs}`;
  };

  const relatedVideos = allVideos.filter((v) => v.id !== video.id).slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Back button & Video Title Breadcrumb */}
      <div className="flex items-center justify-between text-xs text-neutral-400">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 hover:text-white transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Back to Feed</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 px-2 py-0.5 rounded text-[11px]">
            Cloudflare R2 Direct Egress: $0.00
          </span>
          <span className="font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded text-[11px]">
            Supabase DB: Connected
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Cinema Player & Details (2 columns on lg) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video Player Box */}
          <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => isPlaying && setShowControls(false)}
            className={`relative w-full ${
              isFullscreen
                ? 'fixed inset-0 z-50 rounded-none w-screen h-screen max-w-none border-none'
                : 'aspect-video rounded-2xl shadow-2xl border border-neutral-800'
            } bg-black overflow-hidden group select-none transition-all duration-200`}
          >
            {/* HTML5 Native Range-Request Video */}
            <video
              ref={videoRef}
              src={video.video_url}
              poster={video.thumbnail_url}
              onClick={togglePlay}
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => setIsPlaying(false)}
              playsInline
              autoPlay
              className="w-full h-full object-contain cursor-pointer"
            />

            {/* Top Overlay Badge */}
            <div
              className={`absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none transition-opacity duration-300 ${
                showControls ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className="flex items-center gap-2 pointer-events-auto">
                <span className="px-2.5 py-1 rounded-md bg-neutral-950/80 backdrop-blur-md text-xs font-semibold text-cyan-300 border border-cyan-800/50 flex items-center gap-1.5">
                  <Cloud className="w-3.5 h-3.5 text-cyan-400" />
                  R2 Public Range Stream
                </span>
                <span className="px-2 py-1 rounded-md bg-neutral-950/80 backdrop-blur-md text-[11px] font-mono text-neutral-300 border border-neutral-800">
                  HTTP 206 Partial Content
                </span>
              </div>

              <button
                onClick={() => setShowTechDetails(!showTechDetails)}
                className="pointer-events-auto p-1.5 rounded-lg bg-neutral-950/80 backdrop-blur-md text-neutral-300 hover:text-white border border-neutral-800 transition-colors"
                title="Inspect R2 Streaming Specs"
              >
                <Info className="w-4 h-4 text-cyan-400" />
              </button>
            </div>

            {/* Tech Details Inspector Drawer Overlay */}
            {showTechDetails && (
              <div className="absolute top-14 right-4 w-80 bg-neutral-950/95 backdrop-blur-md border border-cyan-800/60 rounded-xl p-4 text-xs font-mono text-neutral-300 shadow-2xl z-30 space-y-2.5">
                <div className="flex items-center justify-between text-cyan-400 font-bold border-b border-neutral-800 pb-1.5">
                  <span>Stream Diagnostic</span>
                  <button onClick={() => setShowTechDetails(false)} className="text-neutral-400 hover:text-white">✕</button>
                </div>
                <div className="space-y-1.5">
                  <div>
                    <span className="text-neutral-500">R2 Object Key:</span>
                    <p className="text-cyan-200 truncate">{video.r2_key}</p>
                  </div>
                  <div>
                    <span className="text-neutral-500">Protocol:</span>
                    <p className="text-neutral-200">HTTP/2 range requests (Fast Scrub)</p>
                  </div>
                  <div>
                    <span className="text-neutral-500">Egress Cost:</span>
                    <p className="text-emerald-400 font-bold">$0.00 / GB (Zero egress fees)</p>
                  </div>
                  <div>
                    <span className="text-neutral-500">Canvas Thumbnail:</span>
                    <p className="text-neutral-200">Captured in browser &rarr; R2 JPEG</p>
                  </div>
                </div>
              </div>
            )}

            {/* Custom Control Bar Overlay */}
            <div
              className={`absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 flex flex-col gap-2 transition-opacity duration-300 ${
                showControls ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {/* Scrub Timeline */}
              <div className="relative w-full flex items-center group/scrubber cursor-pointer">
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  step={0.1}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1.5 bg-neutral-700/80 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none hover:h-2 transition-all"
                />
              </div>

              {/* Controls Row */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-3">
                  {/* Play / Pause button */}
                  <button
                    onClick={togglePlay}
                    className="p-1.5 rounded-lg text-white hover:text-cyan-400 transition-colors"
                    title="Play / Pause (Space)"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
                  </button>

                  {/* Volume Controls */}
                  <div className="flex items-center gap-2 group/volume">
                    <button
                      onClick={toggleMute}
                      className="p-1 text-neutral-300 hover:text-white transition-colors"
                      title="Mute / Unmute (M)"
                    >
                      {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-16 h-1 bg-neutral-700 rounded-lg appearance-none accent-cyan-400 cursor-pointer"
                    />
                  </div>

                  {/* Time Indicator */}
                  <div className="text-xs font-mono text-neutral-300">
                    <span>{formatTime(currentTime)}</span>
                    <span className="text-neutral-500 mx-1">/</span>
                    <span className="text-neutral-500">{formatTime(duration)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Playback speed selector */}
                  <div className="flex items-center gap-1 text-xs font-medium text-neutral-300">
                    {[1, 1.25, 1.5, 2].map((s) => (
                      <button
                        key={s}
                        onClick={() => handleSpeedChange(s)}
                        className={`px-1.5 py-0.5 rounded text-[11px] font-mono transition-colors ${
                          playbackSpeed === s
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                            : 'hover:text-white text-neutral-400'
                        }`}
                      >
                        {s}x
                      </button>
                    ))}
                  </div>

                  {/* Pop-out Picture-in-Picture Window (P) */}
                  <button
                    onClick={togglePiP}
                    className="p-1.5 text-neutral-300 hover:text-white transition-colors"
                    title="Pop-out Floating Window (P)"
                  >
                    <Tv className="w-4 h-4" />
                  </button>

                  {/* Fullscreen button */}
                  <button
                    onClick={toggleFullscreen}
                    className="p-1.5 text-neutral-300 hover:text-white transition-colors"
                    title="Fullscreen (F)"
                  >
                    {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Global Shortcut HUD Toast Feedback (Center of player) */}
            {shortcutFeedback && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40">
                <div className="flex flex-col items-center gap-2 px-5 py-3 rounded-2xl bg-neutral-950/85 backdrop-blur-md border border-neutral-700/80 shadow-2xl text-white animate-in zoom-in-75 fade-in duration-150">
                  {shortcutFeedback.icon === 'play' && <Play className="w-8 h-8 text-cyan-400 fill-current" />}
                  {shortcutFeedback.icon === 'pause' && <Pause className="w-8 h-8 text-neutral-200 fill-current" />}
                  {shortcutFeedback.icon === 'mute' && <VolumeX className="w-8 h-8 text-red-400" />}
                  {shortcutFeedback.icon === 'unmute' && <Volume2 className="w-8 h-8 text-emerald-400" />}
                  {shortcutFeedback.icon === 'fullscreen' && <Maximize className="w-8 h-8 text-cyan-400" />}
                  {shortcutFeedback.icon === 'window' && <Tv className="w-8 h-8 text-blue-400" />}
                  <span className="text-xs font-semibold tracking-wide uppercase font-mono text-neutral-300">
                    {shortcutFeedback.label}
                  </span>
                </div>
              </div>
            )}

            {/* Persistent Watch Duration Progress Bar along the bottom rim */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-neutral-900/90 z-30 overflow-hidden pointer-events-none">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 transition-[width] duration-300 ease-out"
                style={{ width: `${Math.min(100, Math.max(0, duration > 0 ? (currentTime / duration) * 100 : 0))}%` }}
              />
            </div>

            {/* Resume playback banner notification */}
            {showResumeBanner && resumedFromSeconds && (
              <div className="absolute top-16 left-4 z-30 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-950/90 border border-cyan-500/50 text-xs text-neutral-200 shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-300">
                <History className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '4s' }} />
                <span>
                  Resumed at <strong className="text-cyan-300 font-mono">{formatTime(resumedFromSeconds)}</strong>
                </span>
                <button
                  onClick={() => {
                    if (videoRef.current) {
                      videoRef.current.currentTime = 0;
                      setCurrentTime(0);
                      saveVideoWatchProgress(video.id, 0, duration);
                      setShowResumeBanner(false);
                    }
                  }}
                  className="ml-1 text-[11px] underline text-neutral-400 hover:text-white"
                >
                  Start from beginning
                </button>
              </div>
            )}
          </div>

          {/* Watch Progress Summary Strip */}
          <div className="p-3 bg-neutral-900/50 border border-neutral-800/80 rounded-xl flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-800/50 text-cyan-400 flex-shrink-0">
                <PlayCircle className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">Watch Progress Saved</span>
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-900/60">
                    {Math.round(duration > 0 ? (currentTime / duration) * 100 : 0)}%
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 truncate">
                  Watched {formatTime(currentTime)} of {formatTime(duration)} — Automatically persists so you can resume anytime
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0 font-mono text-xs">
              <div className="w-28 sm:w-36 h-2 bg-neutral-800 rounded-full overflow-hidden border border-neutral-700/60">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(0, duration > 0 ? (currentTime / duration) * 100 : 0))}%` }}
                />
              </div>
              <span className="text-neutral-400 hidden sm:inline">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Video Metadata Header */}
          <div className="space-y-4">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
              {video.title}
            </h1>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 py-2 border-y border-neutral-800/80">
              {/* Channel Info */}
              <div className="flex items-center gap-3">
                <img
                  src={video.uploader_avatar}
                  alt={video.uploader_name}
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-cyan-500/30"
                />
                <div>
                  <h4 className="text-sm font-semibold text-white hover:text-cyan-300 cursor-pointer transition-colors">
                    {video.uploader_name}
                  </h4>
                  <p className="text-xs text-neutral-400">
                    {(video.uploader_subscribers || 12000).toLocaleString()} subscribers
                  </p>
                </div>
                <button
                  onClick={() => setIsSubscribed(!isSubscribed)}
                  className={`ml-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    isSubscribed
                      ? 'bg-neutral-800 text-neutral-300 border border-neutral-700'
                      : 'bg-white text-neutral-950 hover:bg-neutral-200'
                  }`}
                >
                  {isSubscribed ? 'Subscribed' : 'Subscribe'}
                </button>
              </div>

              {/* Interactive Actions (Like, Save, Share, R2 Download) */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onToggleLike(video.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                    video.is_liked
                      ? 'bg-blue-950/60 border-blue-700 text-blue-400'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800'
                  }`}
                >
                  <ThumbsUp className={`w-3.5 h-3.5 ${video.is_liked ? 'fill-current' : ''}`} />
                  <span>{video.likes}</span>
                </button>

                <button
                  onClick={() => onToggleSave(video.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                    video.is_saved
                      ? 'bg-amber-950/60 border-amber-700 text-amber-400'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800'
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${video.is_saved ? 'fill-current' : ''}`} />
                  <span>{video.is_saved ? 'Saved' : 'Save'}</span>
                </button>

                <button
                  onClick={handleShare}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                    copiedLink
                      ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300 shadow-sm shadow-emerald-500/20'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800'
                  }`}
                  title="Share video link or copy URL"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied Link!' : 'Share'}</span>
                </button>

                {/* Send Money & Tip Creator */}
                <button
                  onClick={() => setIsTipOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 border border-amber-500/50 text-amber-300 hover:from-amber-500/30 hover:to-orange-500/30 shadow-sm shadow-amber-500/10 hover:shadow-amber-500/20 transition-all"
                  title="Send money and Super Thanks to creator"
                >
                  <HeartHandshake className="w-3.5 h-3.5 text-amber-400" />
                  <span>Send Tip</span>
                  {tipsCount > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/30 text-amber-200 font-mono">
                      {tipsCount}
                    </span>
                  )}
                </button>

                <a
                  href={video.video_url}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
                  title="Direct R2 Media Stream URL"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">R2 Source</span>
                </a>
              </div>
            </div>

            {/* Share Feedback Toast */}
            {shareFeedbackMsg && (
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-950/90 border border-cyan-500/60 text-cyan-200 text-xs shadow-lg animate-in fade-in slide-in-from-top-1 duration-200">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="font-medium">{shareFeedbackMsg}</span>
              </div>
            )}

            {/* Video Description Box */}
            <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-xl p-4 text-xs space-y-3">
              <div className="flex items-center gap-4 text-neutral-400 font-medium">
                <span className="text-white font-semibold flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  {video.views.toLocaleString()} views
                </span>
                <span>Uploaded {new Date(video.created_at).toLocaleDateString()}</span>
                <span className="text-cyan-400">Category: {video.category}</span>
              </div>

              <p className="text-neutral-300 leading-relaxed whitespace-pre-line">
                {video.description}
              </p>

              {/* Tags & Keyboard Shortcuts */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-neutral-800/60">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {video.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] text-cyan-300 bg-cyan-950/40 border border-cyan-800/40 px-2 py-0.5 rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-[11px] text-neutral-400 font-mono flex-shrink-0">
                  <span className="text-neutral-500">Shortcuts:</span>
                  <span className="bg-neutral-800 px-1.5 py-0.5 rounded border border-neutral-700 text-neutral-300">Space</span>
                  <span>Play</span>
                  <span className="bg-neutral-800 px-1.5 py-0.5 rounded border border-neutral-700 text-neutral-300">M</span>
                  <span>Mute</span>
                  <span className="bg-neutral-800 px-1.5 py-0.5 rounded border border-neutral-700 text-neutral-300">F</span>
                  <span>Fullscreen</span>
                </div>
              </div>
            </div>
          </div>

          {/* Comment Section Component (persisted per videoId to localStorage) */}
          <CommentSection
            videoId={video.id}
            currentUser={currentUser}
          />
        </div>

        {/* Sidebar Column: Up Next / Related Videos */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-neutral-200 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Up Next on Reelport</span>
          </h3>

          <div className="space-y-3">
            {relatedVideos.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectVideo(item)}
                className="group flex gap-3 p-2 rounded-xl bg-neutral-900/30 hover:bg-neutral-900/80 border border-transparent hover:border-neutral-800 cursor-pointer transition-all"
              >
                <div className="relative w-36 aspect-video flex-shrink-0 rounded-lg overflow-hidden bg-neutral-950">
                  <img
                    src={item.thumbnail_url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-neutral-950/80 text-[10px] font-mono text-neutral-300">
                    {Math.floor(item.duration / 60)}:{(item.duration % 60).toString().padStart(2, '0')}
                  </span>
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                  <h4 className="text-xs font-semibold text-neutral-200 group-hover:text-cyan-300 transition-colors line-clamp-2 leading-tight">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-neutral-400 mt-1 truncate">{item.uploader_name}</p>
                  <p className="text-[10px] text-neutral-500 font-mono">
                    {(item.views / 1000).toFixed(1)}k views • R2 Direct
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Share Modal Dialog */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-800/60 text-cyan-400">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Share Video</h3>
                  <p className="text-[11px] text-neutral-400">Direct link to watch this stream</p>
                </div>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Video preview mini-card */}
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800/80">
              <img
                src={video.thumbnail_url}
                alt={video.title}
                className="w-16 h-10 object-cover rounded-md flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-semibold text-white truncate">{video.title}</h4>
                <p className="text-[10px] text-neutral-400 truncate">{video.uploader_name} • {video.category}</p>
              </div>
            </div>

            {/* Canonical Share Link Input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-neutral-300 flex items-center justify-between">
                <span>Unique Shareable URL</span>
                {copiedLink && (
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                    <Check className="w-3 h-3" />
                    Copied to clipboard!
                  </span>
                )}
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    readOnly
                    value={getShareableUrl(false)}
                    className="w-full pl-8 pr-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs font-mono text-cyan-300 focus:outline-none select-all"
                  />
                  <Link2 className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>
                <button
                  onClick={() => handleCopyLink(getShareableUrl(false), 'Share URL copied to clipboard!')}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-neutral-950 flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/20 flex-shrink-0"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </button>
              </div>
            </div>

            {/* Direct Cloudflare R2 Media Source Link */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-neutral-300">
                Direct Cloudflare R2 Public Media Stream
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    readOnly
                    value={video.video_url}
                    className="w-full pl-8 pr-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs font-mono text-neutral-300 focus:outline-none select-all"
                  />
                  <Cloud className="w-3.5 h-3.5 text-cyan-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>
                <button
                  onClick={() => handleCopyLink(video.video_url, 'R2 direct stream URL copied!')}
                  className="px-3 py-2 rounded-xl text-xs font-medium bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 flex items-center gap-1.5 transition-all flex-shrink-0"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy R2</span>
                </button>
              </div>
            </div>

            {/* Current Timestamp Option */}
            {currentTime > 2 && (
              <div className="pt-2 border-t border-neutral-800/60 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-neutral-400">
                  <History className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Start at timestamp ({formatTime(currentTime)})</span>
                </div>
                <button
                  onClick={() => handleCopyLink(getShareableUrl(true), `Copied share URL at ${formatTime(currentTime)}!`)}
                  className="text-xs text-cyan-400 hover:text-cyan-300 underline font-mono"
                >
                  Copy at {formatTime(currentTime)}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tip & Send Money Modal */}
      <TipModal
        isOpen={isTipOpen}
        onClose={() => setIsTipOpen(false)}
        video={video}
        currentUser={currentUser}
        onTipSent={() => setTipsCount((prev) => prev + 1)}
      />
    </div>
  );
};
