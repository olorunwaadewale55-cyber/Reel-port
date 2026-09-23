import React, { useState } from 'react';
import { 
  X, 
  Database, 
  Cloud, 
  Code2, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  Zap, 
  Server, 
  Layers, 
  Terminal, 
  FileText
} from 'lucide-react';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'presign' | 'schema' | 'setup'>('overview');
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const presignRouteCode = `// app/api/upload/presign/route.ts
// Next.js (App Router) API Route for Cloudflare R2 Presigned Upload URLs
import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Cloudflare R2 is 100% S3-compatible
const r2 = new S3Client({
  region: 'auto',
  endpoint: \`https://\${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com\`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

export async function POST(req: Request) {
  try {
    const { filename, contentType, size } = await req.json();

    if (!filename || !contentType) {
      return NextResponse.json({ error: 'Missing filename or contentType' }, { status: 400 });
    }

    // Generate unique storage key
    const timestamp = Date.now();
    const sanitizedName = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = \`videos/\${new Date().getFullYear()}/\${timestamp}_\${sanitizedName}\`;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME || 'nightwire-videos',
      Key: key,
      ContentType: contentType,
    });

    // 15-minute presigned upload window
    const presignedUrl = await getSignedUrl(r2, command, { expiresIn: 900 });
    const publicUrl = \`\${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/\${key}\`;

    return NextResponse.json({
      presignedUrl,
      r2Key: key,
      publicUrl,
    });
  } catch (error: any) {
    console.error('R2 Presign Error:', error);
    return NextResponse.json({ error: error.message || 'Presign failed' }, { status: 500 });
  }
}`;

  const supabaseSchemaCode = `-- Supabase PostgreSQL Schema for Nightwire Video Studio
-- Run this directly in your Supabase SQL Editor:

-- 1. Create Videos table
create table public.videos (
  id uuid primary key default gen_random_uuid(),
  uploader_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text default '',
  category text not null default 'Engineering',
  r2_key text not null unique,
  video_url text not null,
  thumbnail_url text not null,
  duration numeric not null default 0,
  views bigint not null default 0,
  likes bigint not null default 0,
  tags text[] default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create Comments table
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  video_id uuid references public.videos(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Row Level Security (RLS)
alter table public.videos enable row level security;
alter table public.comments enable row level security;

-- Public can read all videos
create policy "Videos are viewable by everyone" 
  on public.videos for select using (true);

-- Authenticated users can insert their own videos
create policy "Users can upload their own videos" 
  on public.videos for insert 
  with check (auth.uid() = uploader_id);

-- Uploader can update their own video metadata
create policy "Users can update their own videos" 
  on public.videos for update 
  using (auth.uid() = uploader_id);

-- Comments policies
create policy "Comments are viewable by everyone" 
  on public.comments for select using (true);

create policy "Authenticated users can create comments" 
  on public.comments for insert 
  with check (auth.uid() = user_id);

-- Performance indices
create index idx_videos_created_at on public.videos(created_at desc);
create index idx_videos_category on public.videos(category);
create index idx_comments_video_id on public.comments(video_id);`;

  const r2CorsConfig = `[
  {
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["GET", "PUT", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag", "Content-Range", "Accept-Ranges", "Content-Length"],
    "MaxAgeSeconds": 3000
  }
]`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-800/80 bg-neutral-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-800/50 text-cyan-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Free-Tier Production Architecture
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-800/50 text-emerald-400">
                  Zero Egress Cost
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Next.js (Vercel) + Cloudflare R2 (10GB) + Supabase (Postgres & Auth)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-5 border-b border-neutral-800/80 bg-neutral-900/30 overflow-x-auto text-xs font-medium">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3.5 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'border-cyan-400 text-cyan-400 font-semibold'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Architecture Blueprint</span>
          </button>

          <button
            onClick={() => setActiveTab('presign')}
            className={`py-3 px-3.5 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'presign'
                ? 'border-cyan-400 text-cyan-400 font-semibold'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Next.js R2 Presign Route</span>
          </button>

          <button
            onClick={() => setActiveTab('schema')}
            className={`py-3 px-3.5 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'schema'
                ? 'border-cyan-400 text-cyan-400 font-semibold'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Supabase Schema SQL</span>
          </button>

          <button
            onClick={() => setActiveTab('setup')}
            className={`py-3 px-3.5 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'setup'
                ? 'border-cyan-400 text-cyan-400 font-semibold'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Step-by-Step Setup</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-neutral-300 text-xs leading-relaxed">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Architecture diagram card */}
              <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Server className="w-4 h-4 text-cyan-400" />
                  <span>The 4-Step Direct-to-Storage Video Pipeline</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800 space-y-1.5">
                    <div className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-700 text-cyan-300 font-mono font-bold flex items-center justify-center text-xs">
                      1
                    </div>
                    <h4 className="font-semibold text-neutral-100">Ask for Presigned URL</h4>
                    <p className="text-neutral-400 text-[11px]">
                      Client asks <code className="text-cyan-300">/api/upload/presign</code> for an S3-compatible PUT URL.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-cyan-800/40 space-y-1.5">
                    <div className="w-6 h-6 rounded-full bg-blue-950 border border-blue-700 text-blue-300 font-mono font-bold flex items-center justify-center text-xs">
                      2
                    </div>
                    <h4 className="font-semibold text-neutral-100">Direct R2 Upload</h4>
                    <p className="text-neutral-400 text-[11px]">
                      Browser uploads direct to Cloudflare R2 bucket. Bypasses Vercel’s 4.5MB request payload limit!
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800 space-y-1.5">
                    <div className="w-6 h-6 rounded-full bg-amber-950 border border-amber-700 text-amber-300 font-mono font-bold flex items-center justify-center text-xs">
                      3
                    </div>
                    <h4 className="font-semibold text-neutral-100">Client Canvas Frame</h4>
                    <p className="text-neutral-400 text-[11px]">
                      HTML5 canvas extracts high-res JPEG from video at user scrubbed timestamp. No heavy ffmpeg needed.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-emerald-800/40 space-y-1.5">
                    <div className="w-6 h-6 rounded-full bg-emerald-950 border border-emerald-700 text-emerald-300 font-mono font-bold flex items-center justify-center text-xs">
                      4
                    </div>
                    <h4 className="font-semibold text-neutral-100">Supabase DB Row</h4>
                    <p className="text-neutral-400 text-[11px]">
                      Client inserts metadata row into Postgres: <code className="text-emerald-300">r2_key, title, duration</code>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Free-tier breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800 space-y-2">
                  <div className="flex items-center gap-2 text-cyan-400 font-semibold">
                    <Cloud className="w-4 h-4" />
                    <span>Cloudflare R2</span>
                  </div>
                  <ul className="space-y-1.5 text-[11px] text-neutral-400">
                    <li>• <strong className="text-neutral-200">10 GB</strong> Free Storage / mo</li>
                    <li>• <strong className="text-emerald-400 font-bold">$0.00 Egress Fees</strong> (Crucial for video streaming bandwidth)</li>
                    <li>• Native HTTP Range Requests for instant scrubbing</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                    <Database className="w-4 h-4" />
                    <span>Supabase Postgres</span>
                  </div>
                  <ul className="space-y-1.5 text-[11px] text-neutral-400">
                    <li>• <strong className="text-neutral-200">500 MB</strong> dedicated PostgreSQL</li>
                    <li>• Built-in Supabase Auth (OAuth & Email)</li>
                    <li>• Row Level Security (RLS) on videos and comments</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800 space-y-2">
                  <div className="flex items-center gap-2 text-blue-400 font-semibold">
                    <Server className="w-4 h-4" />
                    <span>Vercel (Next.js)</span>
                  </div>
                  <ul className="space-y-1.5 text-[11px] text-neutral-400">
                    <li>• Free App Router hosting & Edge APIs</li>
                    <li>• Serverless presigned URL signer</li>
                    <li>• Zero bandwidth hits since videos stream from R2</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRESIGN ROUTE CODE */}
          {activeTab === 'presign' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Next.js App Router API Route
                  </h3>
                  <p className="text-[11px] text-neutral-400">
                    Uses <code className="text-cyan-300">@aws-sdk/client-s3</code> with Cloudflare R2 credentials.
                  </p>
                </div>
                <button
                  onClick={() => handleCopy(presignRouteCode, 'presign')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-medium transition-colors"
                >
                  {copiedIndex === 'presign' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedIndex === 'presign' ? 'Copied' : 'Copy Route'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 font-mono text-[11px] text-neutral-300 overflow-x-auto">
                <code>{presignRouteCode}</code>
              </pre>
            </div>
          )}

          {/* TAB 3: SUPABASE SCHEMA SQL */}
          {activeTab === 'schema' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Supabase PostgreSQL Tables & RLS Policies
                  </h3>
                  <p className="text-[11px] text-neutral-400">
                    Execute in the Supabase SQL Query Editor to provision tables, relations, and security.
                  </p>
                </div>
                <button
                  onClick={() => handleCopy(supabaseSchemaCode, 'schema')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-medium transition-colors"
                >
                  {copiedIndex === 'schema' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedIndex === 'schema' ? 'Copied' : 'Copy SQL'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 font-mono text-[11px] text-neutral-300 overflow-x-auto max-h-96">
                <code>{supabaseSchemaCode}</code>
              </pre>
            </div>
          )}

          {/* TAB 4: SETUP INSTRUCTIONS */}
          {activeTab === 'setup' && (
            <div className="space-y-6">
              {/* Cloudflare R2 Setup */}
              <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
                <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                  <Cloud className="w-4 h-4" />
                  <span>1. Cloudflare R2 Setup (5 Minutes)</span>
                </h4>
                <ol className="list-decimal list-inside space-y-1.5 text-neutral-300 text-xs">
                  <li>Log in to <strong className="text-white">Cloudflare Dashboard &rarr; R2</strong>.</li>
                  <li>Click <strong className="text-white">Create Bucket</strong> &rarr; Name it <code className="text-cyan-300">nightwire-videos</code>.</li>
                  <li>In bucket <strong className="text-white">Settings &rarr; Public access</strong>, enable the <strong className="text-white">r2.dev subdomain</strong> (or link a custom domain).</li>
                  <li>In bucket <strong className="text-white">Settings &rarr; CORS Policy</strong>, paste this JSON:</li>
                </ol>
                <div className="relative">
                  <pre className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 font-mono text-[10px] text-neutral-300">
                    <code>{r2CorsConfig}</code>
                  </pre>
                  <button
                    onClick={() => handleCopy(r2CorsConfig, 'cors')}
                    className="absolute top-2 right-2 px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-[10px] flex items-center gap-1"
                  >
                    {copiedIndex === 'cors' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>Copy CORS</span>
                  </button>
                </div>
                <p className="text-[11px] text-neutral-400">
                  5. Click <strong className="text-white">Manage R2 API Tokens</strong> &rarr; Create Token with <em>Object Read & Write</em> permissions. Copy Account ID, Access Key ID, and Secret Access Key.
                </p>
              </div>

              {/* Supabase Setup */}
              <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  <span>2. Supabase Setup (3 Minutes)</span>
                </h4>
                <ol className="list-decimal list-inside space-y-1.5 text-neutral-300 text-xs">
                  <li>Go to <strong className="text-white">database.new</strong> &rarr; Create a free Supabase project.</li>
                  <li>Open the <strong className="text-white">SQL Editor</strong> tab &rarr; Paste and execute the SQL schema from the <em>Supabase Schema SQL</em> tab.</li>
                  <li>Go to <strong className="text-white">Project Settings &rarr; API</strong> &rarr; Copy the Project URL and Anon Public Key.</li>
                </ol>
              </div>

              {/* Environment setup */}
              <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-2">
                <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                  <Terminal className="w-4 h-4" />
                  <span>3. Local Environment (.env.local)</span>
                </h4>
                <p className="text-neutral-400 text-xs">
                  Your project now has <code className="text-cyan-300">.env.local.example</code> copied to <code className="text-cyan-300">.env.local</code>. Populate the keys with your credentials and deploy anytime!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800/80 bg-neutral-900/50 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-neutral-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Ready for 100,000+ views on pure free-tier bandwidth</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors font-medium"
          >
            Close Architecture
          </button>
        </div>
      </div>
    </div>
  );
};
