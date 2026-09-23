import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Upload, 
  Film, 
  Image as ImageIcon, 
  CheckCircle2, 
  Loader2, 
  Sliders, 
  Sparkles, 
  Camera, 
  Cloud, 
  Database, 
  ShieldCheck, 
  ArrowRight,
  Tag,
  FolderOpen
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Video, User, VideoCategory } from '../types';
import { extractFrameFromVideo, generateThumbnailStrip, getVideoMetadata, CapturedFrame } from '../lib/thumbnailExtractor';
import { saveVideoRecord } from '../lib/storage';
import { CATEGORIES } from './Sidebar';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onUploadSuccess: (video: Video) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUploadSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<VideoCategory>('Engineering');
  const [tagsInput, setTagsInput] = useState('cloudflare, r2, supabase, stream');

  // Canvas thumbnail state
  const [isExtractingThumbnails, setIsExtractingThumbnails] = useState(false);
  const [candidateFrames, setCandidateFrames] = useState<CapturedFrame[]>([]);
  const [selectedFrame, setSelectedFrame] = useState<CapturedFrame | null>(null);
  const [customScrubSecond, setCustomScrubSecond] = useState<number>(1);
  const [isCapturingCustom, setIsCapturingCustom] = useState(false);

  // Upload Progress & Stages
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState<'idle' | 'presign' | 'r2_direct' | 'r2_thumb' | 'supabase_db' | 'done'>('idle');
  const [stageDetails, setStageDetails] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (selectedFile: File) => {
    if (!selectedFile.type.startsWith('video/')) {
      alert('Please select a valid video file (.mp4, .webm, .mov).');
      return;
    }

    setFile(selectedFile);
    // Auto-fill clean title from filename
    const cleanTitle = selectedFile.name
      .replace(/\.[^/.]+$/, '')
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
    setTitle(cleanTitle);

    // Read metadata & extract candidate frames via client canvas
    try {
      setIsExtractingThumbnails(true);
      const meta = await getVideoMetadata(selectedFile);
      setVideoDuration(Math.round(meta.duration));
      setCustomScrubSecond(Math.min(2, Math.max(0.5, meta.duration / 4)));

      const frames = await generateThumbnailStrip(selectedFile, 4);
      setCandidateFrames(frames);
      if (frames.length > 0) {
        setSelectedFrame(frames[0]);
      }
    } catch (err) {
      console.warn('Canvas frame extraction fallback:', err);
    } finally {
      setIsExtractingThumbnails(false);
    }
  };

  const handleCaptureCustomTimestamp = async (second: number) => {
    if (!file) return;
    try {
      setIsCapturingCustom(true);
      const frame = await extractFrameFromVideo(file, second);
      setSelectedFrame(frame);
    } catch (e) {
      console.error('Failed to capture custom timestamp:', e);
    } finally {
      setIsCapturingCustom(false);
    }
  };

  const handleStartUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    // 1. Presign Stage
    setCurrentStage('presign');
    setStageDetails('POST /api/upload/presign &rarr; Requesting AWS S3-compatible signed URL for R2 bucket');
    await new Promise((r) => setTimeout(r, 600));
    setUploadProgress(15);

    // 2. Direct R2 S3 Upload Stage (Bypasses Vercel)
    setCurrentStage('r2_direct');
    const r2Key = `videos/${new Date().getFullYear()}/${(new Date().getMonth() + 1).toString().padStart(2, '0')}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    setStageDetails(`PUT https://nightwire-video-storage.r2.cloudflarestorage.com/${r2Key} (Direct streaming upload)`);

    // Simulate direct chunk transfer
    for (let p = 20; p <= 75; p += 15) {
      setUploadProgress(p);
      await new Promise((r) => setTimeout(r, 350));
    }

    // 3. Thumbnail upload to R2
    setCurrentStage('r2_thumb');
    setStageDetails('PUT /thumbnails/ &rarr; Uploading high-res JPEG captured from client canvas');
    setUploadProgress(85);
    await new Promise((r) => setTimeout(r, 450));

    // 4. Supabase DB Insert
    setCurrentStage('supabase_db');
    setStageDetails('supabase.from("videos").insert({ title, r2_key, duration, uploader_id, category })');
    setUploadProgress(95);
    await new Promise((r) => setTimeout(r, 500));

    // Construct persistent Video Record
    const videoUrl = URL.createObjectURL(file);
    const thumbUrl = selectedFrame?.dataUrl || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1280&q=80';

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const newVideo: Video = {
      id: `vid_${Date.now()}`,
      title: title.trim() || 'Untitled Stream',
      description: description.trim() || 'Direct-to-R2 upload with Supabase PostgreSQL metadata indexing.',
      category,
      uploader_id: currentUser.id,
      uploader_name: currentUser.name,
      uploader_avatar: currentUser.avatar,
      uploader_subscribers: currentUser.subscribers,
      r2_key: r2Key,
      video_url: videoUrl,
      thumbnail_url: thumbUrl,
      duration: videoDuration || 60,
      views: 1,
      likes: 0,
      created_at: new Date().toISOString(),
      tags: tags.length > 0 ? tags : ['r2-stream', 'supabase', 'nightwire'],
    };

    saveVideoRecord(newVideo);
    setUploadProgress(100);
    setCurrentStage('done');

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {}

    setTimeout(() => {
      onUploadSuccess(newVideo);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-800/80 bg-neutral-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-800/50 text-cyan-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Direct-to-R2 Upload Studio
              </h2>
              <p className="text-xs text-neutral-400">
                Presigned S3 URL &rarr; Direct Cloudflare R2 Upload &rarr; Supabase DB insert
              </p>
            </div>
          </div>

          {!isUploading && (
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Upload Form Body */}
        <form onSubmit={handleStartUpload} className="p-6 space-y-6">
          {/* Step 1: File Selection Dropzone */}
          {!file ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files[0]) {
                  handleFileChange(e.dataTransfer.files[0]);
                }
              }}
              className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-neutral-800 hover:border-cyan-500/60 rounded-2xl bg-neutral-900/40 hover:bg-neutral-900/70 cursor-pointer transition-all group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleFileChange(e.target.files[0]);
                }}
              />
              <div className="w-14 h-14 rounded-2xl bg-cyan-950/60 border border-cyan-800/50 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                <Film className="w-7 h-7" />
              </div>
              <p className="text-sm font-semibold text-white mt-4">
                Drag and drop your video file here, or click to browse
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                Supports MP4, WebM, MOV. Bypasses Vercel limits via direct R2 presigned upload.
              </p>
              <div className="mt-4 flex items-center gap-2 text-[11px] text-cyan-300 font-mono bg-cyan-950/40 px-3 py-1 rounded-full border border-cyan-900/50">
                <Sparkles className="w-3 h-3" />
                Zero egress fees on Cloudflare R2
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Selected File Chip */}
              <div className="flex items-center justify-between p-3.5 bg-neutral-900/80 border border-neutral-800 rounded-xl">
                <div className="flex items-center gap-3 min-w-0">
                  <Film className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{file.name}</p>
                    <p className="text-[11px] text-neutral-400 font-mono">
                      {(file.size / (1024 * 1024)).toFixed(1)} MB • {videoDuration}s duration
                    </p>
                  </div>
                </div>
                {!isUploading && (
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      setCandidateFrames([]);
                      setSelectedFrame(null);
                    }}
                    className="text-xs text-neutral-400 hover:text-red-400 transition-colors"
                  >
                    Change File
                  </button>
                )}
              </div>

              {/* Step 2: Client Canvas Thumbnail Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-neutral-200 uppercase tracking-wider flex items-center gap-2">
                    <Camera className="w-4 h-4 text-cyan-400" />
                    <span>Client-Side Canvas Thumbnail Capture</span>
                  </label>
                  <span className="text-[11px] text-neutral-400">
                    No ffmpeg worker needed!
                  </span>
                </div>

                {isExtractingThumbnails ? (
                  <div className="flex items-center justify-center p-6 bg-neutral-900/40 rounded-xl border border-neutral-800 text-xs text-neutral-400 gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                    <span>Extracting video frames via HTML5 Canvas...</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Candidate Frame Strip */}
                    <div className="grid grid-cols-4 gap-2.5">
                      {candidateFrames.map((frame, idx) => (
                        <div
                          key={idx}
                          onClick={() => setSelectedFrame(frame)}
                          className={`relative aspect-video rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                            selectedFrame?.timestamp === frame.timestamp
                              ? 'border-cyan-400 shadow-md shadow-cyan-500/30'
                              : 'border-neutral-800 hover:border-neutral-600 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img
                            src={frame.dataUrl}
                            alt={`Frame ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute bottom-1 right-1 px-1 rounded bg-black/80 text-[10px] font-mono text-neutral-300">
                            {frame.timestamp.toFixed(1)}s
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Custom Timestamp Frame Scrub Bar */}
                    <div className="p-3 bg-neutral-900/50 border border-neutral-800 rounded-xl space-y-2">
                      <div className="flex items-center justify-between text-xs text-neutral-300">
                        <span className="text-[11px] text-neutral-400">
                          Scrub video to extract custom frame:
                        </span>
                        <span className="font-mono text-cyan-300 text-xs font-semibold">
                          {customScrubSecond.toFixed(1)}s
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min={0.1}
                          max={Math.max(1, videoDuration)}
                          step={0.2}
                          value={customScrubSecond}
                          onChange={(e) => {
                            const sec = parseFloat(e.target.value);
                            setCustomScrubSecond(sec);
                          }}
                          className="flex-1 h-1.5 bg-neutral-700 rounded-lg appearance-none accent-cyan-400 cursor-pointer"
                        />
                        <button
                          type="button"
                          onClick={() => handleCaptureCustomTimestamp(customScrubSecond)}
                          disabled={isCapturingCustom}
                          className="px-2.5 py-1 text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg border border-neutral-700 flex items-center gap-1.5 transition-colors"
                        >
                          {isCapturingCustom ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Camera className="w-3.5 h-3.5 text-cyan-400" />
                          )}
                          <span>Snap Frame</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Step 3: Video Details Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Video Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Next.js App Router Direct R2 Video Upload"
                    className="w-full px-3.5 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-500/70"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1.5 flex items-center gap-1.5">
                      <FolderOpen className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Category</span>
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as VideoCategory)}
                      className="w-full px-3.5 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500/70"
                    >
                      {CATEGORIES.filter((c) => c.id !== 'All').map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.id} ({c.label})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1.5 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Tags (comma-separated)</span>
                    </label>
                    <input
                      type="text"
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                      placeholder="e.g. cloudflare, r2, stream, zero-egress"
                      className="w-full px-3.5 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-500/70"
                    />
                    {/* Live Tags Preview */}
                    {tagsInput.trim() && (
                      <div className="flex items-center gap-1.5 flex-wrap mt-2">
                        {tagsInput
                          .split(',')
                          .map((t) => t.trim().toLowerCase())
                          .filter(Boolean)
                          .map((tag, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-medium text-cyan-300 bg-cyan-950/60 border border-cyan-800/50 px-2 py-0.5 rounded-full"
                            >
                              #{tag}
                            </span>
                          ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide context, timestamps, or technical implementation notes..."
                    className="w-full px-3.5 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-500/70"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Upload Progress Stepper Indicator */}
          {isUploading && (
            <div className="p-4 bg-neutral-900/90 border border-cyan-800/50 rounded-xl space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-cyan-300 flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                  {currentStage === 'presign' && 'Requesting R2 Presigned Upload URL...'}
                  {currentStage === 'r2_direct' && 'Uploading directly to Cloudflare R2...'}
                  {currentStage === 'r2_thumb' && 'Uploading Canvas Thumbnail JPEG...'}
                  {currentStage === 'supabase_db' && 'Writing video row to Supabase Postgres...'}
                  {currentStage === 'done' && 'Upload Complete! Video is live.'}
                </span>
                <span className="font-mono text-cyan-400 font-bold">{uploadProgress}%</span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>

              <p className="text-[11px] font-mono text-neutral-400 truncate">
                {stageDetails}
              </p>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-neutral-800/80">
            <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Direct R2 Egress: $0.00 / Zero egress fees</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isUploading}
                className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!file || isUploading}
                className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-neutral-950 bg-gradient-to-r from-cyan-400 to-blue-400 hover:from-cyan-300 hover:to-blue-300 disabled:opacity-50 rounded-lg shadow-lg shadow-cyan-500/20 transition-all"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deploying...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload to R2 & Supabase</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
