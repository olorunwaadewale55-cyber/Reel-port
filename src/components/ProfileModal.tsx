import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  AtSign, 
  Mail, 
  Shield, 
  Lock, 
  KeyRound, 
  LogOut, 
  Radio, 
  Video as VideoIcon, 
  DollarSign, 
  Bookmark, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Trash2, 
  Play, 
  Eye, 
  ThumbsUp, 
  CreditCard, 
  ExternalLink,
  Edit3,
  Calendar,
  Sparkles
} from 'lucide-react';
import { User as AppUser, Video, CreatorPayout } from '../types';
import { 
  getUserUploadedVideos, 
  deleteVideoRecord, 
  getCreatorBalance, 
  getCreatorPayout, 
  saveCreatorPayout,
  updateUserRecord,
  getSavedVideoIds,
  getStoredVideos
} from '../lib/storage';
import { updateUserPassword, updateUserProfile } from '../lib/supabase';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AppUser;
  onSignOut: () => void;
  onSelectVideo?: (video: Video) => void;
  onOpenUpload?: () => void;
  onUserUpdated?: (updated: AppUser) => void;
}

type ProfileTab = 'overview' | 'uploads' | 'saved' | 'payouts' | 'security';

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSignOut,
  onSelectVideo,
  onOpenUpload,
  onUserUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<ProfileTab>('overview');

  // Edit profile state
  const [name, setName] = useState(currentUser.name);
  const [handle, setHandle] = useState(currentUser.channel_handle);
  const [bio, setBio] = useState(currentUser.bio || '');
  const [avatar, setAvatar] = useState(currentUser.avatar);

  // Security / Password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Tipping payout state
  const [payoutConfig, setPayoutConfig] = useState<CreatorPayout>(() => getCreatorPayout(currentUser.id));

  // Feedback states
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // User videos & saved videos list
  const [myVideos, setMyVideos] = useState<Video[]>([]);
  const [savedVideos, setSavedVideos] = useState<Video[]>([]);

  useEffect(() => {
    if (isOpen) {
      setName(currentUser.name);
      setHandle(currentUser.channel_handle);
      setBio(currentUser.bio || '');
      setAvatar(currentUser.avatar);
      setPayoutConfig(getCreatorPayout(currentUser.id));
      setStatusMessage(null);

      const uploads = getUserUploadedVideos(currentUser.id);
      setMyVideos(uploads);

      const savedIds = getSavedVideoIds(currentUser.id);
      const allVideos = getStoredVideos(currentUser.id);
      setSavedVideos(allVideos.filter((v) => savedIds.includes(v.id)));
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const totalViews = myVideos.reduce((acc, v) => acc + (v.views || 0), 0);
  const totalLikes = myVideos.reduce((acc, v) => acc + (v.likes || 0), 0);
  const creatorBalance = getCreatorBalance(currentUser.id);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);

    try {
      const cleanHandle = handle.startsWith('@') ? handle : `@${handle}`;
      const updatedUser: AppUser = {
        ...currentUser,
        name: name.trim() || currentUser.name,
        channel_handle: cleanHandle,
        bio: bio.trim(),
        avatar: avatar.trim() || currentUser.avatar,
      };

      // Update in Supabase Auth user metadata
      await updateUserProfile({
        name: updatedUser.name,
        channel_handle: updatedUser.channel_handle,
        bio: updatedUser.bio,
        avatar: updatedUser.avatar,
      });

      // Update in local storage and active state
      updateUserRecord(updatedUser);
      if (onUserUpdated) onUserUpdated(updatedUser);

      setStatusMessage({ text: 'Profile changes saved successfully!', type: 'success' });
      setTimeout(() => setStatusMessage(null), 3500);
    } catch (err: any) {
      setStatusMessage({ text: err?.message || 'Failed to update profile', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setStatusMessage({ text: 'New password must be at least 6 characters long.', type: 'error' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setStatusMessage({ text: 'Passwords do not match.', type: 'error' });
      return;
    }

    setIsSaving(true);
    setStatusMessage(null);
    try {
      const msg = await updateUserPassword(newPassword);
      setStatusMessage({ text: msg, type: 'success' });
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setStatusMessage(null), 3500);
    } catch (err: any) {
      setStatusMessage({ text: err?.message || 'Failed to update password', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePayouts = (e: React.FormEvent) => {
    e.preventDefault();
    saveCreatorPayout({
      ...payoutConfig,
      creatorId: currentUser.id,
    });
    setStatusMessage({ text: 'Creator tipping & payout settings saved!', type: 'success' });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleDeleteVideo = (videoId: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) {
      const ok = deleteVideoRecord(videoId, currentUser.id);
      if (ok) {
        setMyVideos((prev) => prev.filter((v) => v.id !== videoId));
        setStatusMessage({ text: `"${title}" has been deleted.`, type: 'success' });
        setTimeout(() => setStatusMessage(null), 3000);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-800/80 bg-neutral-900/70">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-cyan-500/40 shadow-md"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-neutral-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  {currentUser.name}
                </h2>
                <span className="text-[11px] font-mono text-cyan-400">
                  {currentUser.channel_handle}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <span>{currentUser.email}</span>
                <span aria-hidden="true">·</span>
                <span>{currentUser.subscribers.toLocaleString()} subscribers</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onSignOut();
              }}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-400 hover:text-red-300 bg-red-950/30 hover:bg-red-950/60 border border-red-800/40 rounded-lg transition-colors"
              title="Sign out of Reelport"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              aria-label="Close profile"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Creator Performance Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-neutral-800/80 bg-neutral-950/80 text-xs">
          <div className="p-3 border-r border-b sm:border-b-0 border-neutral-800/60">
            <p className="text-[11px] text-neutral-400">My Uploads</p>
            <p className="text-sm font-bold text-white mt-0.5">{myVideos.length} videos</p>
          </div>
          <div className="p-3 border-r border-b sm:border-b-0 border-neutral-800/60">
            <p className="text-[11px] text-neutral-400">Total Views</p>
            <p className="text-sm font-bold text-cyan-300 mt-0.5">{totalViews.toLocaleString()}</p>
          </div>
          <div className="p-3 border-r border-neutral-800/60">
            <p className="text-[11px] text-neutral-400">Likes Received</p>
            <p className="text-sm font-bold text-blue-300 mt-0.5">{totalLikes.toLocaleString()}</p>
          </div>
          <div className="p-3">
            <p className="text-[11px] text-neutral-400">Tips Balance</p>
            <p className="text-sm font-bold text-emerald-400 mt-0.5">${creatorBalance.toFixed(2)} USD</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto border-b border-neutral-800/80 bg-neutral-900/30 px-3 py-1.5 gap-1 text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-neutral-800 text-cyan-300 font-semibold'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile Details</span>
          </button>

          <button
            onClick={() => setActiveTab('uploads')}
            className={`px-3 py-1.5 font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'uploads'
                ? 'bg-neutral-800 text-cyan-300 font-semibold'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <span>My Uploads ({myVideos.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('saved')}
            className={`px-3 py-1.5 font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'saved'
                ? 'bg-neutral-800 text-cyan-300 font-semibold'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-400" />
            <span>Saved to Watch ({savedVideos.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('payouts')}
            className={`px-3 py-1.5 font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'payouts'
                ? 'bg-neutral-800 text-cyan-300 font-semibold'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            <span>Tipping & Payouts</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`px-3 py-1.5 font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'security'
                ? 'bg-neutral-800 text-cyan-300 font-semibold'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-purple-400" />
            <span>Security & Sign Out</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Status Message */}
          {statusMessage && (
            <div
              role="alert"
              className={`p-3 rounded-xl text-xs flex items-start gap-2.5 leading-relaxed ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-950/60 border border-emerald-800/60 text-emerald-200'
                  : 'bg-red-950/60 border border-red-800/60 text-red-200'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* TAB 1: OVERVIEW & PROFILE EDIT */}
          {activeTab === 'overview' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-neutral-300">
                    Display Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-neutral-300">
                    Channel Handle
                  </label>
                  <input
                    type="text"
                    required
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-neutral-300">
                  Channel Bio & Description
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell viewers what you stream (engineering, gaming, music, tutorials)..."
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-neutral-300">
                  Avatar Image URL
                </label>
                <input
                  type="url"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-neutral-950 font-bold text-xs rounded-xl shadow-md shadow-cyan-500/20 transition-all flex items-center gap-2"
                >
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Edit3 className="w-3.5 h-3.5" />}
                  <span>Save Profile Changes</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: MY UPLOADS */}
          {activeTab === 'uploads' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Your Uploaded Videos</h3>
                  <p className="text-xs text-neutral-400">
                    Uploaded directly to your Cloudflare R2 bucket with Supabase PostgreSQL metadata
                  </p>
                </div>
                {onOpenUpload && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenUpload();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-400 hover:bg-cyan-300 text-neutral-950 font-bold text-xs rounded-lg transition-colors"
                  >
                    <Radio className="w-3.5 h-3.5" />
                    <span>Upload New</span>
                  </button>
                )}
              </div>

              {myVideos.length === 0 ? (
                <div className="p-8 text-center rounded-xl bg-neutral-900/40 border border-neutral-800 space-y-3">
                  <VideoIcon className="w-8 h-8 text-neutral-600 mx-auto" />
                  <p className="text-xs text-neutral-400">
                    You haven't uploaded any videos to this account yet.
                  </p>
                  {onOpenUpload && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenUpload();
                      }}
                      className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-cyan-300 text-xs font-semibold rounded-lg border border-cyan-800/60 transition-colors"
                    >
                      Broadcast your first video
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-2.5">
                  {myVideos.map((video) => (
                    <div
                      key={video.id}
                      className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 hover:border-neutral-700 flex items-center justify-between gap-3 group transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={video.thumbnail_url}
                          alt={video.title}
                          className="w-16 h-10 rounded-lg object-cover flex-shrink-0 bg-neutral-800"
                        />
                        <div className="min-w-0">
                          <h4 className="text-xs font-semibold text-white truncate max-w-sm">
                            {video.title}
                          </h4>
                          <div className="flex items-center gap-2 text-[11px] text-neutral-400 mt-0.5">
                            <span>{video.category}</span>
                            <span aria-hidden="true">·</span>
                            <span>{video.views} views</span>
                            <span aria-hidden="true">·</span>
                            <span>{video.likes} likes</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {onSelectVideo && (
                          <button
                            onClick={() => {
                              onSelectVideo(video);
                              onClose();
                            }}
                            className="p-2 text-cyan-400 hover:bg-cyan-950/60 rounded-lg transition-colors"
                            title="Play Video"
                          >
                            <Play className="w-4 h-4 fill-cyan-400" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteVideo(video.id, video.title)}
                          className="p-2 text-neutral-500 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors"
                          title="Delete Video"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SAVED VIDEOS */}
          {activeTab === 'saved' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white">Your Saved Watch Later Playlist</h3>
                <p className="text-xs text-neutral-400">
                  Protected specifically for {currentUser.name}
                </p>
              </div>

              {savedVideos.length === 0 ? (
                <div className="p-8 text-center rounded-xl bg-neutral-900/40 border border-neutral-800 space-y-2">
                  <Bookmark className="w-8 h-8 text-neutral-600 mx-auto" />
                  <p className="text-xs text-neutral-400">No saved videos in your personal library yet.</p>
                  <p className="text-[11px] text-neutral-500">
                    Click the bookmark icon on any stream to save it here!
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {savedVideos.map((video) => (
                    <div
                      key={video.id}
                      className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 hover:border-neutral-700 flex items-center justify-between gap-3 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={video.thumbnail_url}
                          alt={video.title}
                          className="w-16 h-10 rounded-lg object-cover flex-shrink-0 bg-neutral-800"
                        />
                        <div className="min-w-0">
                          <h4 className="text-xs font-semibold text-white truncate max-w-sm">
                            {video.title}
                          </h4>
                          <p className="text-[11px] text-neutral-400 mt-0.5 truncate">
                            {video.uploader_name} · {video.category}
                          </p>
                        </div>
                      </div>

                      {onSelectVideo && (
                        <button
                          onClick={() => {
                            onSelectVideo(video);
                            onClose();
                          }}
                          className="p-2 text-cyan-400 hover:bg-cyan-950/60 rounded-lg transition-colors flex-shrink-0"
                          title="Watch Now"
                        >
                          <Play className="w-4 h-4 fill-cyan-400" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: CREATOR PAYOUTS & TIPPING */}
          {activeTab === 'payouts' && (
            <form onSubmit={handleSavePayouts} className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white">Creator Tipping Configuration</h3>
                <p className="text-xs text-neutral-400">
                  Configure where viewers can send tips and Super Thanks directly to you.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 to-neutral-900 border border-emerald-800/40 flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-neutral-400">Current Creator Tips Earnings</p>
                  <p className="text-xl font-extrabold text-emerald-400 mt-0.5">
                    ${creatorBalance.toFixed(2)} USD
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-neutral-300">
                    PayPal Receiver Email
                  </label>
                  <input
                    type="email"
                    value={payoutConfig.paypalEmail || ''}
                    onChange={(e) => setPayoutConfig({ ...payoutConfig, paypalEmail: e.target.value })}
                    placeholder="creator@paypal.com"
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-neutral-300">
                    CashApp $Cashtag
                  </label>
                  <input
                    type="text"
                    value={payoutConfig.cashAppTag || ''}
                    onChange={(e) => setPayoutConfig({ ...payoutConfig, cashAppTag: e.target.value })}
                    placeholder="$YourCashTag"
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-100 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-neutral-300">
                    Crypto Receiving Wallet (USDC / SOL / ETH)
                  </label>
                  <input
                    type="text"
                    value={payoutConfig.cryptoAddress || ''}
                    onChange={(e) => setPayoutConfig({ ...payoutConfig, cryptoAddress: e.target.value })}
                    placeholder="0x... or Solana pubkey"
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-100 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-neutral-950 font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition-all"
                >
                  Save Tipping Settings
                </button>
              </div>
            </form>
          )}

          {/* TAB 5: SECURITY & SIGN OUT */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              {/* Change Password Form */}
              <form onSubmit={handleUpdatePassword} className="space-y-4 p-4 rounded-xl bg-neutral-900/50 border border-neutral-800">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-cyan-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Change Password
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-neutral-300">
                      New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-100 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-neutral-300">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-100 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSaving || !newPassword}
                    className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-cyan-300 disabled:opacity-50 text-xs font-semibold rounded-lg border border-cyan-800/60 transition-colors"
                  >
                    {isSaving ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>

              {/* Sign Out Card */}
              <div className="p-4 rounded-xl bg-neutral-900/30 border border-neutral-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">Active Session</h4>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Signed in as {currentUser.email} with Supabase Auth
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSignOut();
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-red-950/40 hover:bg-red-900/60 border border-red-800/50 text-red-300 font-semibold text-xs rounded-xl transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
