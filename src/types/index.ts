export type VideoCategory = 
  | 'Engineering' 
  | 'Cyberpunk' 
  | 'Lo-Fi' 
  | 'Film' 
  | 'Gaming' 
  | 'Tutorials'
  | string;

export interface Video {
  id: string;
  title: string;
  description: string;
  category: VideoCategory;
  uploader_id: string;
  uploader_name: string;
  uploader_avatar: string;
  uploader_subscribers: number;
  r2_key: string;
  video_url: string;
  thumbnail_url: string;
  duration: number; // in seconds
  views: number;
  likes: number;
  created_at: string;
  tags: string[];
  is_liked?: boolean;
  is_saved?: boolean;
}

export interface Comment {
  id: string;
  video_id: string;
  user_id: string;
  user_name: string;
  user_avatar: string;
  content: string;
  created_at: string;
  likes: number;
  is_liked?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  channel_handle: string;
  subscribers: number;
}

export interface R2Config {
  accountId: string;
  bucketName: string;
  accessKeyId: string;
  secretAccessKey: string;
  publicUrl: string;
  isConfigured: boolean;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConfigured: boolean;
}

export interface ThumbnailCandidate {
  timestamp: number;
  dataUrl: string;
  label: string;
}

export interface Tip {
  id: string;
  videoId: string;
  videoTitle: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  recipientId: string;
  recipientName: string;
  amount: number;
  currency: string;
  message?: string;
  paymentMethod: 'card' | 'paypal' | 'cashapp' | 'crypto';
  created_at: string;
}

export interface CreatorPayout {
  creatorId: string;
  paypalEmail?: string;
  cashAppTag?: string;
  cryptoAddress?: string;
  stripeConnected?: boolean;
}
