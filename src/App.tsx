import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar, CATEGORIES } from './components/Sidebar';
import { VideoCard } from './components/VideoCard';
import { SortableVideoCard } from './components/SortableVideoCard';
import { VideoPlayer } from './components/VideoPlayer';
import { UploadModal } from './components/UploadModal';
import { ArchitectureModal } from './components/ArchitectureModal';
import { SettingsModal } from './components/SettingsModal';
import { Video, R2Config, SupabaseConfig, User } from './types';
import { 
  getStoredVideos, 
  DEFAULT_USER, 
  getR2Config, 
  getSupabaseConfig, 
  toggleLikeVideo, 
  toggleSaveVideo, 
  incrementVideoViews,
  addToWatchHistory,
  getWatchHistory,
  getSavedVideoIds,
  saveSavedVideoOrder,
  getCurrentUser,
  setCurrentUser as persistCurrentUser
} from './lib/storage';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  rectSortingStrategy 
} from '@dnd-kit/sortable';
import { 
  Zap, 
  Upload, 
  Flame, 
  Compass, 
  Sparkles, 
  Database, 
  Cloud, 
  ShieldCheck,
  Search,
  Filter,
  Radio,
  LogIn,
  TrendingUp,
  Eye,
  Clock,
  Play,
  GripVertical,
  CheckCircle2,
  ListOrdered,
  WifiOff,
  Wifi
} from 'lucide-react';

export default function App() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentCategory, setCurrentCategory] = useState('All');
  const [activeFilter, setActiveFilter] = useState<'all' | 'liked' | 'saved' | 'history'>('all');

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isArchitectureOpen, setIsArchitectureOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [reorderNotification, setReorderNotification] = useState<string | null>(null);

  // Network connection monitor (navigator.onLine)
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });
  const [showReconnectedBanner, setShowReconnectedBanner] = useState(false);

  // Authentication state (supports Supabase magic-link & local testing)
  const [currentUser, setCurrentUserState] = useState<User | null>(() => {
    return getCurrentUser() || DEFAULT_USER;
  });

  const [r2Config, setR2Config] = useState<R2Config>(getR2Config());
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(getSupabaseConfig());

  // Sensors for dnd-kit (requires 8px activation distance so regular clicks on cards still work seamlessly)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load videos on mount & check for URL ?v= deep-link
  useEffect(() => {
    const loadedVideos = getStoredVideos();
    setVideos(loadedVideos);

    const params = new URLSearchParams(window.location.search);
    const videoId = params.get('v');
    if (videoId) {
      const match = loadedVideos.find((v) => v.id === videoId);
      if (match) {
        setSelectedVideo(match);
      }
    }

    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const id = urlParams.get('v');
      if (id) {
        const found = getStoredVideos().find((v) => v.id === id);
        if (found) setSelectedVideo(found);
      } else {
        setSelectedVideo(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Monitor connection to the streaming backend via navigator.onLine
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnectedBanner(true);
      const timer = setTimeout(() => {
        setShowReconnectedBanner(false);
      }, 4000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnectedBanner(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handle Magic Link Sign In request
  const handleSignIn = async (email: string): Promise<{ success: boolean; message: string }> => {
    const cleanEmail = email.trim().toLowerCase();

    if (supabaseConfig.url && supabaseConfig.anonKey && supabaseConfig.url.includes('supabase.co')) {
      try {
        const response = await fetch(`${supabaseConfig.url}/auth/v1/otp`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseConfig.anonKey,
            'Authorization': `Bearer ${supabaseConfig.anonKey}`
          },
          body: JSON.stringify({
            email: cleanEmail,
            create_user: true
          })
        });

        if (response.ok) {
          return {
            success: true,
            message: `Magic link dispatched to ${cleanEmail}! Check your inbox and spam folder.`
          };
        }
      } catch (e) {
        console.warn('Direct Supabase OTP call failed, falling back to instant session', e);
      }
    }

    const namePart = cleanEmail.split('@')[0];
    const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
    const userSession: User = {
      id: `usr_${Date.now()}`,
      name: formattedName || 'Broadcaster',
      email: cleanEmail,
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&h=256&q=80`,
      channel_handle: `@${namePart.toLowerCase() || 'broadcaster'}`,
      subscribers: 1
    };

    persistCurrentUser(userSession);
    setCurrentUserState(userSession);

    return {
      success: true,
      message: `Signed in as ${userSession.email}. 'Sign in' replaced by Broadcast & Sign out!`
    };
  };

  const handleSignOut = () => {
    persistCurrentUser(null);
    setCurrentUserState(null);
  };

  const handleSelectVideo = (video: Video) => {
    incrementVideoViews(video.id);
    addToWatchHistory(video.id);
    setSelectedVideo(video);
    setVideos((prev) =>
      prev.map((v) => (v.id === video.id ? { ...v, views: v.views + 1 } : v))
    );
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('v', video.id);
      window.history.pushState({ videoId: video.id }, '', url.toString());
    } catch {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToFeed = () => {
    setSelectedVideo(null);
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('v');
      window.history.pushState({}, '', url.toString());
    } catch {}
  };

  const handleToggleLike = (videoId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const { isLiked, count } = toggleLikeVideo(videoId);
    setVideos((prev) =>
      prev.map((v) => (v.id === videoId ? { ...v, is_liked: isLiked, likes: count } : v))
    );
    if (selectedVideo && selectedVideo.id === videoId) {
      setSelectedVideo((prev) => (prev ? { ...prev, is_liked: isLiked, likes: count } : null));
    }
  };

  const handleToggleSave = (videoId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const isSaved = toggleSaveVideo(videoId);
    setVideos((prev) =>
      prev.map((v) => (v.id === videoId ? { ...v, is_saved: isSaved } : v))
    );
    if (selectedVideo && selectedVideo.id === videoId) {
      setSelectedVideo((prev) => (prev ? { ...prev, is_saved: isSaved } : null));
    }
  };

  const handleUploadSuccess = (newVideo: Video) => {
    setVideos((prev) => [newVideo, ...prev]);
    setSelectedVideo(newVideo);
  };

  // Trending Videos: Top videos sorted by views descending
  const trendingVideos = useMemo(() => {
    return [...videos]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 3);
  }, [videos]);

  // Filtered Video Collection (supports custom persisted playlist order for Saved videos)
  const filteredVideos = useMemo(() => {
    let result = [...videos];

    // Filter by Tab (Liked, Saved, History)
    if (activeFilter === 'liked') {
      result = result.filter((v) => v.is_liked);
    } else if (activeFilter === 'saved') {
      const savedIds = getSavedVideoIds();
      // Order items matching the savedIds array exactly, plus any new ones
      const idMap = new Map(result.map((v) => [v.id, v]));
      const ordered: Video[] = [];
      for (const id of savedIds) {
        const item = idMap.get(id);
        if (item && item.is_saved) {
          ordered.push(item);
          idMap.delete(id);
        }
      }
      // Add any remaining saved items that weren't in savedIds
      for (const item of idMap.values()) {
        if (item.is_saved) {
          ordered.push(item);
        }
      }
      result = ordered;
    } else if (activeFilter === 'history') {
      const historyIds = getWatchHistory();
      result = historyIds
        .map((id) => result.find((v) => v.id === id))
        .filter((v): v is Video => Boolean(v));
    }

    // Filter by Category
    if (currentCategory !== 'All') {
      result = result.filter((v) => v.category === currentCategory);
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (v) =>
          v.title.toLowerCase().includes(q) ||
          v.description.toLowerCase().includes(q) ||
          v.uploader_name.toLowerCase().includes(q) ||
          v.category.toLowerCase().includes(q) ||
          v.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    return result;
  }, [videos, activeFilter, currentCategory, searchQuery]);

  // Handle Drag & Drop reorder for Saved Videos Playlist
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = filteredVideos.findIndex((item) => item.id === active.id);
    const newIndex = filteredVideos.findIndex((item) => item.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const reordered = arrayMove(filteredVideos, oldIndex, newIndex);
      const reorderedIds = reordered.map((v) => v.id);
      saveSavedVideoOrder(reorderedIds);

      // Reorder videos in memory so UI reflects immediately
      setVideos((prev) => {
        const others = prev.filter((v) => !reorderedIds.includes(v.id));
        return [...reordered, ...others];
      });

      setReorderNotification('Saved playlist order updated and persisted to local storage.');
      setTimeout(() => setReorderNotification(null), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      {/* Header Navbar */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenArchitecture={() => setIsArchitectureOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        currentUser={currentUser}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        onNavigateHome={() => {
          setSelectedVideo(null);
          setActiveFilter('all');
          setCurrentCategory('All');
        }}
        supabaseConfig={supabaseConfig}
      />

      {/* Non-intrusive banner for streaming backend connection interruption */}
      {!isOnline && (
        <aside
          role="alert"
          aria-live="assertive"
          className="sticky top-[61px] z-30 w-full bg-amber-950/90 border-b border-amber-500/30 px-4 py-2 backdrop-blur-md transition-all shadow-sm"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="flex items-center justify-center w-5 h-5 rounded-md bg-amber-500/20 text-amber-400 shrink-0">
                <WifiOff className="w-3.5 h-3.5 animate-pulse" />
              </span>
              <div className="flex flex-wrap items-center gap-x-2 text-amber-200">
                <span className="font-semibold text-amber-300">Connection Interrupted:</span>
                <span className="text-neutral-300 text-[11px] sm:text-xs">
                  Streaming backend is currently unreachable. Live playback and uploads may be interrupted.
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] text-amber-300/70">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                Listening for connection...
              </span>
              <button
                onClick={() => {
                  if (typeof navigator !== 'undefined' && navigator.onLine) {
                    setIsOnline(true);
                  }
                }}
                className="px-2.5 py-1 text-[11px] font-medium text-amber-200 hover:text-white bg-amber-900/50 hover:bg-amber-800/60 border border-amber-700/50 rounded transition-colors"
                title="Check connection status"
              >
                Check status
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Brief reconnection confirmation banner */}
      {showReconnectedBanner && isOnline && (
        <aside
          role="status"
          className="sticky top-[61px] z-30 w-full bg-emerald-950/90 border-b border-emerald-500/30 px-4 py-2 backdrop-blur-md transition-all shadow-sm"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="flex items-center justify-center w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 shrink-0">
                <Wifi className="w-3.5 h-3.5" />
              </span>
              <div className="flex items-center gap-2 text-emerald-200">
                <span className="font-semibold text-emerald-300">Connected:</span>
                <span className="text-neutral-300 text-[11px] sm:text-xs">Streaming backend connection restored.</span>
              </div>
            </div>
            <button
              onClick={() => setShowReconnectedBanner(false)}
              className="text-[11px] text-neutral-400 hover:text-white px-1.5 py-0.5"
              aria-label="Dismiss banner"
            >
              &times;
            </button>
          </div>
        </aside>
      )}

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Left Navigation Sidebar */}
        <Sidebar
          currentCategory={currentCategory}
          onSelectCategory={(cat) => {
            setCurrentCategory(cat);
            if (selectedVideo) setSelectedVideo(null);
          }}
          activeFilter={activeFilter}
          onSelectFilter={(filter) => {
            setActiveFilter(filter);
            if (selectedVideo) setSelectedVideo(null);
          }}
          r2Config={r2Config}
          supabaseConfig={supabaseConfig}
          videoCount={filteredVideos.length}
        />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 pb-16">
          {selectedVideo ? (
            /* Watch Cinema View */
            <VideoPlayer
              video={selectedVideo}
              allVideos={videos}
              onSelectVideo={handleSelectVideo}
              onToggleLike={handleToggleLike}
              onToggleSave={handleToggleSave}
              currentUser={currentUser || DEFAULT_USER}
              onBack={handleBackToFeed}
            />
          ) : (
            /* Browse / Explore Grid View */
            <div className="p-4 sm:p-6 lg:p-8 space-y-8">
              {/* Hero Banner with Free-Tier Stack Highlights */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-neutral-900 via-cyan-950/40 to-neutral-900 border border-neutral-800 p-6 sm:p-8">
                <div className="relative z-10 max-w-2xl space-y-3">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 text-xs font-semibold">
                    <Zap className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Real-world Launch Stack • 100% Free Tier</span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                    Reelport Video Streaming Studio
                  </h1>

                  <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                    Client asks for presigned R2 S3 URL &rarr; uploads file directly (zero Vercel payload limits) &rarr; writes metadata to Supabase Postgres. Direct HTTP 206 range requests stream smoothly with zero bandwidth egress fees.
                  </p>

                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    {currentUser ? (
                      <button
                        onClick={() => setIsUploadOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-neutral-950 text-xs font-bold rounded-lg shadow-md shadow-cyan-500/20 transition-all"
                      >
                        <Radio className="w-4 h-4 text-neutral-950" />
                        <span>Broadcast (Upload to R2)</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          const signInButton = document.querySelector('header button:has(svg.lucide-log-in)') as HTMLButtonElement;
                          if (signInButton) signInButton.click();
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-cyan-300 text-xs font-bold rounded-lg border border-cyan-700/60 shadow-md shadow-cyan-500/10 transition-all"
                      >
                        <LogIn className="w-4 h-4" />
                        <span>Sign in to Broadcast</span>
                      </button>
                    )}

                    <button
                      onClick={() => setIsArchitectureOpen(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-cyan-300 text-xs font-semibold rounded-lg border border-neutral-700 hover:border-cyan-600 transition-colors"
                    >
                      <Database className="w-4 h-4" />
                      <span>Inspect Schema & Next.js Routes</span>
                    </button>
                  </div>
                </div>

                {/* Subtle Decorative Background Glow */}
                <div className="absolute right-0 top-0 w-80 h-full bg-gradient-to-l from-cyan-500/10 via-blue-500/5 to-transparent pointer-events-none" />
              </div>

              {/* Trending Section (Top Viewed Streams) */}
              {!searchQuery && activeFilter === 'all' && currentCategory === 'All' && trendingVideos.length > 0 && (
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30 text-amber-400 shadow-sm shadow-amber-500/10">
                        <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                            Trending Now
                          </h2>
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-950/70 border border-amber-700/60 text-amber-300">
                            High Velocity
                          </span>
                        </div>
                        <p className="text-xs text-neutral-400">
                          Most watched broadcasts streaming zero-egress over Cloudflare R2
                        </p>
                      </div>
                    </div>

                    <div className="hidden sm:flex items-center gap-1.5 text-xs text-amber-400 font-medium">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>Ranked by cumulative views</span>
                    </div>
                  </div>

                  {/* Trending Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {trendingVideos.map((video, idx) => (
                      <div key={`trend_${video.id}`} className="relative group">
                        {/* Rank Badge */}
                        <div className="absolute top-2.5 right-2.5 z-20 flex items-center justify-center w-7 h-7 rounded-lg bg-neutral-950/90 border border-amber-500/50 shadow-md shadow-black/60 text-amber-400 font-mono text-xs font-bold pointer-events-none">
                          #{idx + 1}
                        </div>
                        <VideoCard
                          video={video}
                          onSelect={handleSelectVideo}
                          onToggleSave={handleToggleSave}
                          onToggleLike={handleToggleLike}
                        />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Feed Header & Filters */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-neutral-800/80">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                      {activeFilter === 'liked' && 'Liked Videos'}
                      {activeFilter === 'saved' && 'Saved Playlist (Drag to Reorder)'}
                      {activeFilter === 'history' && 'Recently Watched'}
                      {activeFilter === 'all' && (currentCategory === 'All' ? 'All Broadcasts' : currentCategory)}
                      <span className="text-xs font-mono font-normal text-neutral-500">
                        ({filteredVideos.length})
                      </span>
                    </h2>
                    {activeFilter === 'saved' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded-full">
                        <GripVertical className="w-3 h-3" />
                        <span>dnd-kit enabled</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {activeFilter === 'saved'
                      ? 'Drag any card using the grip handle or header to customize your viewing order.'
                      : 'Live media objects served directly from Cloudflare R2 edge'}
                  </p>
                </div>

                {/* Active Category Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setActiveFilter('all');
                        setCurrentCategory(cat.id);
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                        activeFilter === 'all' && currentCategory === cat.id
                          ? 'bg-cyan-500 text-neutral-950 font-bold shadow-md shadow-cyan-500/20'
                          : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reorder Toast Notification */}
              {reorderNotification && (
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-950/80 border border-cyan-500/50 text-cyan-200 text-xs shadow-lg animate-in fade-in slide-in-from-top-2 duration-300">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span>{reorderNotification}</span>
                </div>
              )}

              {/* Video Grid (Sortable when viewing Saved Playlist, Regular Grid otherwise) */}
              {filteredVideos.length > 0 ? (
                activeFilter === 'saved' ? (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={filteredVideos.map((v) => v.id)}
                      strategy={rectSortingStrategy}
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredVideos.map((video, idx) => (
                          <SortableVideoCard
                            key={video.id}
                            video={video}
                            index={idx}
                            onSelect={handleSelectVideo}
                            onToggleSave={handleToggleSave}
                            onToggleLike={handleToggleLike}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredVideos.map((video) => (
                      <VideoCard
                        key={video.id}
                        video={video}
                        onSelect={handleSelectVideo}
                        onToggleSave={handleToggleSave}
                        onToggleLike={handleToggleLike}
                      />
                    ))}
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center justify-center p-12 text-center bg-neutral-900/30 border border-neutral-800/80 rounded-2xl space-y-3">
                  <div className="w-12 h-12 rounded-full bg-neutral-800/80 flex items-center justify-center text-neutral-500">
                    {activeFilter === 'saved' ? <ListOrdered className="w-6 h-6" /> : <Search className="w-6 h-6" />}
                  </div>
                  <h3 className="text-sm font-semibold text-white">
                    {activeFilter === 'saved' ? 'Your saved playlist is empty' : 'No videos found'}
                  </h3>
                  <p className="text-xs text-neutral-400 max-w-sm">
                    {activeFilter === 'saved'
                      ? 'Save any video to your playlist by clicking the bookmark icon on cards. You can then drag and drop them to reorder.'
                      : searchQuery
                      ? `No results matching "${searchQuery}". Try searching for categories like Engineering, Cyberpunk, or Lo-Fi.`
                      : 'No videos currently in this list. Try uploading a new video directly to R2!'}
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setCurrentCategory('All');
                      setActiveFilter('all');
                    }}
                    className="px-3.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-neutral-200 rounded-lg transition-colors"
                  >
                    Browse All Broadcasts
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        currentUser={currentUser || DEFAULT_USER}
        onUploadSuccess={handleUploadSuccess}
      />

      <ArchitectureModal
        isOpen={isArchitectureOpen}
        onClose={() => setIsArchitectureOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        r2Config={r2Config}
        supabaseConfig={supabaseConfig}
        onUpdateR2={setR2Config}
        onUpdateSupabase={setSupabaseConfig}
      />
    </div>
  );
}
