import { Video, Comment, User, R2Config, SupabaseConfig, Tip, CreatorPayout } from '../types';

const STORAGE_KEYS = {
  VIDEOS: 'nightwire_videos_v2',
  COMMENTS: 'nightwire_comments_v2',
  R2_CONFIG: 'nightwire_r2_config',
  SUPABASE_CONFIG: 'nightwire_supabase_config',
  CURRENT_USER: 'nightwire_current_user',
  LIKED_VIDEOS: 'nightwire_liked_ids',
  SAVED_VIDEOS: 'nightwire_saved_ids',
  WATCH_HISTORY: 'nightwire_history_ids',
  WATCH_PROGRESS: 'nightwire_watch_progress',
  TIPS: 'nightwire_tips_v1',
  CREATOR_PAYOUTS: 'nightwire_creator_payouts_v1',
  RECENT_SEARCHES: 'nightwire_recent_searches_v1',
};

export const DEFAULT_USER: User = {
  id: 'usr_nw_dev01',
  name: 'Alex Vance',
  email: 'alex@nightwire.dev',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80',
  channel_handle: '@alexvance',
  subscribers: 14200,
};

export const INITIAL_VIDEOS: Video[] = [
  {
    id: 'vid_r2_zero_egress',
    title: 'Architecting Zero-Egress Video Streaming: Cloudflare R2 + Supabase + Next.js',
    description: `A deep-dive technical breakdown of why traditional S3 egress fees kill video startups, and how the free-tier Cloudflare R2 (zero egress) + Supabase PostgreSQL architecture solves it.\n\n00:00 - The AWS S3 Bandwidth Trap\n01:45 - Cloudflare R2 Presigned Direct Uploads\n03:30 - Client-Side Canvas Frame Extraction\n05:15 - Supabase Metadata Schema & RLS\n08:00 - Native HTML5 Range Requests & Streaming`,
    category: 'Engineering',
    uploader_id: 'usr_nw_dev01',
    uploader_name: 'Alex Vance',
    uploader_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80',
    uploader_subscribers: 14200,
    r2_key: 'videos/2026/09/r2_zero_egress_guide.mp4',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1280&q=80',
    duration: 734,
    views: 48920,
    likes: 3120,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    tags: ['cloud', 'cloudflare-r2', 'supabase', 'nextjs', 'streaming'],
  },
  {
    id: 'vid_cyberpunk_neon',
    title: 'Night City District 07: Ray Traced Cyberpunk Ambient Walkthrough',
    description: `Immerse in the rainy neon back-alleys of District 07. Recorded with full path tracing and atmospheric binaural audio.\n\nCaptured at native 4K with unlocked bitrates. Suitable for background focus or aesthetic screens.`,
    category: 'Cyberpunk',
    uploader_id: 'usr_neon_pilot',
    uploader_name: 'Neon Runner',
    uploader_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80',
    uploader_subscribers: 86400,
    r2_key: 'videos/2026/09/night_city_district07.mp4',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1280&q=80',
    duration: 596,
    views: 129400,
    likes: 9840,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
    tags: ['cyberpunk', 'ambient', 'neon', '4k', 'pathtracing'],
  },
  {
    id: 'vid_lofi_cyber_synth',
    title: 'Nightwire Radio — 24/7 Deep Lo-Fi Beats to Code, Study, and Relax to',
    description: `Mellow synthesizers, tape-saturated drums, and rain sounds on an industrial rooftop. Handcrafted analog beats for night coding sessions and deep focus.\n\nAll music licensed under Creative Commons. Powered by R2 edge delivery.`,
    category: 'Lo-Fi',
    uploader_id: 'usr_wire_audio',
    uploader_name: 'Wire Frequency',
    uploader_avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&h=256&q=80',
    uploader_subscribers: 245000,
    r2_key: 'videos/2026/09/lofi_radio_nightwire.mp4',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1280&q=80',
    duration: 653,
    views: 312000,
    likes: 21400,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    tags: ['lofi', 'beats', 'coding', 'relax', 'synthwave'],
  },
  {
    id: 'vid_nextjs_server_actions',
    title: 'Next.js App Router Masterclass: Direct-to-S3 Uploads & Presigned URLs',
    description: `Stop routing multi-gigabyte video uploads through your serverless API routes! Learn how to use AWS SDK S3Client with Cloudflare R2 to generate secure signed upload URLs in under 5ms, then send files directly from browser fetch().`,
    category: 'Engineering',
    uploader_id: 'usr_fullstack_dev',
    uploader_name: 'DevCraft Studio',
    uploader_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&h=256&q=80',
    uploader_subscribers: 53100,
    r2_key: 'videos/2026/09/nextjs_direct_r2.mp4',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1280&q=80',
    duration: 15,
    views: 24800,
    likes: 1850,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    tags: ['nextjs', 'react', 'typescript', 'vercel', 's3'],
  },
  {
    id: 'vid_deep_space_webb',
    title: 'James Webb Space Telescope: Pillars of Creation in Infinite Resolution',
    description: `Spectacular infrared composite imaging of the Eagle Nebula M16, processed directly from NASA/ESA scientific FITS data. Observe newly forming stars piercing through interstellar hydrogen gas columns.`,
    category: 'Film',
    uploader_id: 'usr_cosmic_eye',
    uploader_name: 'Cosmic Observatory',
    uploader_avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=256&h=256&q=80',
    uploader_subscribers: 182000,
    r2_key: 'videos/2026/09/jwst_pillars_m16.mp4',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1280&q=80',
    duration: 28,
    views: 94100,
    likes: 7600,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
    tags: ['space', 'astronomy', 'jwst', 'cosmos', '4k'],
  },
  {
    id: 'vid_sintel_fantasy',
    title: 'Sintel — High Fantasy CGI Quest & The Dragon of Ischna',
    description: `The acclaimed open-source computer-animated cinematic masterpiece. Follow Sintel as she tracks a baby dragon across barren snow mountains and desolate ruins to the forbidden citadel.`,
    category: 'Film',
    uploader_id: 'usr_blender_open',
    uploader_name: 'Cinematic Arts',
    uploader_avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&h=256&q=80',
    uploader_subscribers: 420000,
    r2_key: 'videos/2026/09/sintel_open_movie.mp4',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1280&q=80',
    duration: 888,
    views: 540000,
    likes: 42000,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
    tags: ['animation', 'cgi', 'fantasy', 'story', 'cinematic'],
  },
];

export const INITIAL_COMMENTS: Comment[] = [
  {
    id: 'cmt_01',
    video_id: 'vid_r2_zero_egress',
    user_id: 'usr_commenter_1',
    user_name: 'Elena Rostova',
    user_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=128&q=80',
    content: 'The zero egress fee aspect of Cloudflare R2 is legitimately the only reason indie video platforms can exist today. S3 bandwidth at $0.09/GB would bankrupt you at 10,000 views!',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    likes: 42,
  },
  {
    id: 'cmt_02',
    video_id: 'vid_r2_zero_egress',
    user_id: 'usr_commenter_2',
    user_name: 'Marcus Brody',
    user_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=128&q=80',
    content: 'Client-side canvas thumbnail generation is such a clever hack. It completely eliminates needing a serverless Lambda ffmpeg worker just to grab a frame!',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
    likes: 19,
  },
];

export const DEFAULT_R2_CONFIG: R2Config = {
  accountId: 'cloudflare_acc_demo_885292e4',
  bucketName: 'nightwire-video-storage',
  accessKeyId: 'r2_key_pub_preview',
  secretAccessKey: '••••••••••••••••••••••••',
  publicUrl: 'https://pub-r2.nightwire.dev',
  isConfigured: true,
};

export const DEFAULT_SUPABASE_CONFIG: SupabaseConfig = {
  url: 'https://rmun6gj2waodbc2my.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtdW42Z2oyd2FvZGJjMm15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDAsImV4cCI6MjAwMH0',
  isConfigured: true,
};

// Storage Helpers with User-Specific isolation
function getLikedKey(userId?: string): string {
  return userId ? `${STORAGE_KEYS.LIKED_VIDEOS}_${userId}` : STORAGE_KEYS.LIKED_VIDEOS;
}

function getSavedKey(userId?: string): string {
  return userId ? `${STORAGE_KEYS.SAVED_VIDEOS}_${userId}` : STORAGE_KEYS.SAVED_VIDEOS;
}

function getHistoryKey(userId?: string): string {
  return userId ? `${STORAGE_KEYS.WATCH_HISTORY}_${userId}` : STORAGE_KEYS.WATCH_HISTORY;
}

export function getStoredVideos(userId?: string): Video[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.VIDEOS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(INITIAL_VIDEOS));
      return INITIAL_VIDEOS;
    }
    const parsed: Video[] = JSON.parse(raw);
    const likedIds = getLikedVideoIds(userId);
    const savedIds = getSavedVideoIds(userId);
    return parsed.map((v) => ({
      ...v,
      is_liked: likedIds.includes(v.id),
      is_saved: savedIds.includes(v.id),
    }));
  } catch (e) {
    return INITIAL_VIDEOS;
  }
}

export function saveVideoRecord(video: Video): void {
  const current = getStoredVideos();
  const updated = [video, ...current];
  localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(updated));
}

export function deleteVideoRecord(videoId: string, userId: string): boolean {
  try {
    const current = getStoredVideos();
    const target = current.find((v) => v.id === videoId);
    if (!target) return false;
    // Allow if uploader matches or admin/demo
    if (target.uploader_id && target.uploader_id !== userId && userId !== 'usr_nw_dev01') {
      return false;
    }
    const filtered = current.filter((v) => v.id !== videoId);
    localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(filtered));
    return true;
  } catch {
    return false;
  }
}

export function getUserUploadedVideos(userId: string): Video[] {
  const videos = getStoredVideos(userId);
  return videos.filter((v) => v.uploader_id === userId);
}

export function getVideoById(id: string): Video | undefined {
  const videos = getStoredVideos();
  return videos.find((v) => v.id === id);
}

export function incrementVideoViews(id: string): void {
  const videos = getStoredVideos();
  const index = videos.findIndex((v) => v.id === id);
  if (index !== -1) {
    videos[index].views += 1;
    localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(videos));
  }
}

export function toggleLikeVideo(id: string, userId?: string): { isLiked: boolean; count: number } {
  const key = getLikedKey(userId);
  const likedIds = getLikedVideoIds(userId);
  const isCurrentlyLiked = likedIds.includes(id);
  const newLikedIds = isCurrentlyLiked
    ? likedIds.filter((item) => item !== id)
    : [...likedIds, id];
  localStorage.setItem(key, JSON.stringify(newLikedIds));

  const videos = getStoredVideos();
  const index = videos.findIndex((v) => v.id === id);
  let newCount = 0;
  if (index !== -1) {
    videos[index].likes += isCurrentlyLiked ? -1 : 1;
    newCount = videos[index].likes;
    localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(videos));
  }
  return { isLiked: !isCurrentlyLiked, count: newCount };
}

export function toggleSaveVideo(id: string, userId?: string): boolean {
  const key = getSavedKey(userId);
  const savedIds = getSavedVideoIds(userId);
  const isSaved = savedIds.includes(id);
  const newSavedIds = isSaved
    ? savedIds.filter((item) => item !== id)
    : [...savedIds, id];
  localStorage.setItem(key, JSON.stringify(newSavedIds));
  return !isSaved;
}

export function getLikedVideoIds(userId?: string): string[] {
  try {
    const key = getLikedKey(userId);
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
}

export function getSavedVideoIds(userId?: string): string[] {
  try {
    const key = getSavedKey(userId);
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
}

export function saveSavedVideoOrder(ids: string[], userId?: string): void {
  const key = getSavedKey(userId);
  localStorage.setItem(key, JSON.stringify(ids));
}

export function getWatchHistory(userId?: string): string[] {
  try {
    const key = getHistoryKey(userId);
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
}

export function addToWatchHistory(videoId: string, userId?: string): void {
  const key = getHistoryKey(userId);
  const history = getWatchHistory(userId).filter((id) => id !== videoId);
  history.unshift(videoId);
  localStorage.setItem(key, JSON.stringify(history.slice(0, 50)));
}

export function getStoredComments(videoId: string): Comment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COMMENTS);
    const allComments: Comment[] = raw ? JSON.parse(raw) : INITIAL_COMMENTS;
    return allComments.filter((c) => c.video_id === videoId);
  } catch {
    return INITIAL_COMMENTS.filter((c) => c.video_id === videoId);
  }
}

export function addCommentRecord(
  videoId: string,
  content: string,
  user: User = DEFAULT_USER
): Comment {
  const raw = localStorage.getItem(STORAGE_KEYS.COMMENTS);
  const allComments: Comment[] = raw ? JSON.parse(raw) : INITIAL_COMMENTS;

  const newComment: Comment = {
    id: `cmt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    video_id: videoId,
    user_id: user.id,
    user_name: user.name,
    user_avatar: user.avatar,
    content,
    created_at: new Date().toISOString(),
    likes: 0,
  };

  const updated = [newComment, ...allComments];
  localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(updated));
  return newComment;
}

export function toggleCommentLike(commentId: string): { likes: number } {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COMMENTS);
    const allComments: Comment[] = raw ? JSON.parse(raw) : INITIAL_COMMENTS;
    const index = allComments.findIndex((c) => c.id === commentId);
    let newLikes = 0;
    if (index !== -1) {
      allComments[index].likes = (allComments[index].likes || 0) + 1;
      newLikes = allComments[index].likes;
      localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(allComments));
    }
    return { likes: newLikes };
  } catch {
    return { likes: 0 };
  }
}

export function deleteCommentRecord(commentId: string): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COMMENTS);
    const allComments: Comment[] = raw ? JSON.parse(raw) : INITIAL_COMMENTS;
    const filtered = allComments.filter((c) => c.id !== commentId);
    localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(filtered));
  } catch {}
}

export function getR2Config(): R2Config {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.R2_CONFIG);
    return raw ? JSON.parse(raw) : DEFAULT_R2_CONFIG;
  } catch {
    return DEFAULT_R2_CONFIG;
  }
}

export function saveR2Config(config: R2Config): void {
  localStorage.setItem(STORAGE_KEYS.R2_CONFIG, JSON.stringify(config));
}

export function getSupabaseConfig(): SupabaseConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUPABASE_CONFIG);
    return raw ? JSON.parse(raw) : DEFAULT_SUPABASE_CONFIG;
  } catch {
    return DEFAULT_SUPABASE_CONFIG;
  }
}

export function saveSupabaseConfig(config: SupabaseConfig): void {
  localStorage.setItem(STORAGE_KEYS.SUPABASE_CONFIG, JSON.stringify(config));
}

export function getCurrentUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setCurrentUser(user: User | null): void {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
}

export const persistCurrentUser = setCurrentUser;

export function updateUserRecord(updated: User): void {
  persistCurrentUser(updated);
  // Also update uploader info in videos uploaded by this user in memory/storage
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.VIDEOS);
    if (raw) {
      const parsed: Video[] = JSON.parse(raw);
      const updatedVideos = parsed.map((v) => {
        if (v.uploader_id === updated.id) {
          return {
            ...v,
            uploader_name: updated.name,
            uploader_avatar: updated.avatar,
          };
        }
        return v;
      });
      localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(updatedVideos));
    }
  } catch {}
}

export function saveVideoWatchProgress(videoId: string, currentTime: number, duration: number): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WATCH_PROGRESS);
    const progressMap: Record<string, { currentTime: number; duration: number; updatedAt: number }> = raw
      ? JSON.parse(raw)
      : {};

    progressMap[videoId] = {
      currentTime,
      duration: duration || progressMap[videoId]?.duration || 0,
      updatedAt: Date.now(),
    };

    localStorage.setItem(STORAGE_KEYS.WATCH_PROGRESS, JSON.stringify(progressMap));
  } catch (err) {
    console.error('Failed to save watch progress', err);
  }
}

export function getVideoWatchProgress(videoId: string): { currentTime: number; duration: number } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WATCH_PROGRESS);
    if (!raw) return null;
    const progressMap = JSON.parse(raw);
    const item = progressMap[videoId];
    if (!item) return null;
    return {
      currentTime: typeof item.currentTime === 'number' ? item.currentTime : 0,
      duration: typeof item.duration === 'number' ? item.duration : 0,
    };
  } catch {
    return null;
  }
}

export const INITIAL_TIPS: Tip[] = [
  {
    id: 'tip_demo_1',
    videoId: 'vid_r2_zero_egress',
    videoTitle: 'Architecting Zero-Egress Video Streaming',
    senderId: 'usr_sarah_c',
    senderName: 'Sarah Connor',
    senderAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&h=256&q=80',
    recipientId: 'usr_nw_dev01',
    recipientName: 'Alex Vance',
    amount: 10,
    currency: 'USD',
    message: 'Incredible breakdown on Cloudflare R2 presigned URLs! Saved us $500/mo on AWS S3 egress.',
    paymentMethod: 'card',
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    id: 'tip_demo_2',
    videoId: 'vid_r2_zero_egress',
    videoTitle: 'Architecting Zero-Egress Video Streaming',
    senderId: 'usr_kenji_s',
    senderName: 'Kenji Sato',
    senderAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&h=256&q=80',
    recipientId: 'usr_nw_dev01',
    recipientName: 'Alex Vance',
    amount: 25,
    currency: 'USD',
    message: 'Super Thanks from Tokyo! Keep releasing these full-stack architectures.',
    paymentMethod: 'paypal',
    created_at: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
  },
  {
    id: 'tip_demo_3',
    videoId: 'vid_cyberpunk_neon',
    videoTitle: 'Night City District 07: Ray Traced Cyberpunk Ambient Walkthrough',
    senderId: 'usr_david_m',
    senderName: 'David Miller',
    senderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&h=256&q=80',
    recipientId: 'usr_neon_pilot',
    recipientName: 'Neon Runner',
    amount: 5,
    currency: 'USD',
    message: 'The audio mixing on this rain scene is pure bliss ☕',
    paymentMethod: 'cashapp',
    created_at: new Date(Date.now() - 1000 * 60 * 720).toISOString(),
  }
];

export function getStoredTips(): Tip[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TIPS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.TIPS, JSON.stringify(INITIAL_TIPS));
      return INITIAL_TIPS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_TIPS;
  }
}

export function sendTip(tipData: Omit<Tip, 'id' | 'created_at'>): Tip {
  const tips = getStoredTips();
  const newTip: Tip = {
    ...tipData,
    id: `tip_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    created_at: new Date().toISOString(),
  };

  const updated = [newTip, ...tips];
  localStorage.setItem(STORAGE_KEYS.TIPS, JSON.stringify(updated));
  return newTip;
}

export function getTipsForVideo(videoId: string): Tip[] {
  return getStoredTips().filter((t) => t.videoId === videoId);
}

export function getTipsForCreator(creatorId: string): Tip[] {
  return getStoredTips().filter((t) => t.recipientId === creatorId);
}

export function getCreatorBalance(creatorId: string): number {
  return getTipsForCreator(creatorId).reduce((sum, tip) => sum + tip.amount, 0);
}

export function getCreatorPayout(creatorId: string): CreatorPayout {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEYS.CREATOR_PAYOUTS}_${creatorId}`);
    if (!raw) {
      return {
        creatorId,
        paypalEmail: 'creator@reelport.app',
        cashAppTag: '$ReelportCreator',
        cryptoAddress: '0x71C...4982',
        stripeConnected: true,
      };
    }
    return JSON.parse(raw);
  } catch {
    return { creatorId };
  }
}

export function saveCreatorPayout(payout: CreatorPayout): void {
  localStorage.setItem(`${STORAGE_KEYS.CREATOR_PAYOUTS}_${payout.creatorId}`, JSON.stringify(payout));
}

const DEFAULT_RECENT_SEARCHES: string[] = [
  'Cloudflare R2',
  'Zero Egress',
  'Cyberpunk',
  'Supabase',
  'Next.js',
  'Ray Traced',
  'Synthwave',
];

export function getRecentSearches(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECENT_SEARCHES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(DEFAULT_RECENT_SEARCHES));
      return DEFAULT_RECENT_SEARCHES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_RECENT_SEARCHES;
  } catch {
    return DEFAULT_RECENT_SEARCHES;
  }
}

export function saveRecentSearch(query: string): string[] {
  const trimmed = query.trim();
  if (!trimmed) return getRecentSearches();

  const current = getRecentSearches();
  const filtered = current.filter((item) => item.toLowerCase() !== trimmed.toLowerCase());
  const updated = [trimmed, ...filtered].slice(0, 10);

  try {
    localStorage.setItem(STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save recent search query', err);
  }
  return updated;
}

export function removeRecentSearch(query: string): string[] {
  const current = getRecentSearches();
  const updated = current.filter((item) => item.toLowerCase() !== query.toLowerCase().trim());
  try {
    localStorage.setItem(STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to remove recent search query', err);
  }
  return updated;
}

export function clearRecentSearches(): void {
  try {
    localStorage.setItem(STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify([]));
  } catch (err) {
    console.error('Failed to clear recent searches', err);
  }
}


