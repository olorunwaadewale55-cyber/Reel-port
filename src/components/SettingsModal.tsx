import React, { useState } from 'react';
import { 
  X, 
  Cloud, 
  Database, 
  Save, 
  CheckCircle2, 
  RotateCcw, 
  KeyRound, 
  Sliders, 
  ShieldCheck,
  Check
} from 'lucide-react';
import { R2Config, SupabaseConfig } from '../types';
import { saveR2Config, saveSupabaseConfig } from '../lib/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  r2Config: R2Config;
  supabaseConfig: SupabaseConfig;
  onSave?: (r2: R2Config, supabase: SupabaseConfig) => void;
  onUpdateR2?: (r2: R2Config) => void;
  onUpdateSupabase?: (supabase: SupabaseConfig) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  r2Config,
  supabaseConfig,
  onSave,
  onUpdateR2,
  onUpdateSupabase,
}) => {
  const [r2, setR2] = useState<R2Config>({ ...r2Config });
  const [supabase, setSupabase] = useState<SupabaseConfig>({ ...supabaseConfig });
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedR2 = {
      ...r2,
      isConfigured: !!(r2.accountId && r2.bucketName && r2.accessKeyId),
    };
    const updatedSupabase = {
      ...supabase,
      isConfigured: !!(supabase.url && supabase.anonKey),
    };

    saveR2Config(updatedR2);
    saveSupabaseConfig(updatedSupabase);
    if (onSave) onSave(updatedR2, updatedSupabase);
    if (onUpdateR2) onUpdateR2(updatedR2);
    if (onUpdateSupabase) onUpdateSupabase(updatedSupabase);

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleResetToDemo = () => {
    const demoR2: R2Config = {
      accountId: 'cf_demo_account_84920',
      bucketName: 'reelport-videos',
      accessKeyId: 'cf_r2_key_live_public',
      secretAccessKey: '****************************',
      publicUrl: 'https://pub-demo-reelport.r2.dev',
      isConfigured: true,
    };
    const demoSupabase: SupabaseConfig = {
      url: 'https://xyzcompany.supabase.co',
      anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.demo-anon-key',
      isConfigured: true,
    };
    setR2(demoR2);
    setSupabase(demoSupabase);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-800/80 bg-neutral-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-800/50 text-cyan-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Infrastructure Settings & Keys
              </h2>
              <p className="text-xs text-neutral-400">
                Connect your real Cloudflare R2 bucket and Supabase PostgreSQL project
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 text-xs">
          {/* Cloudflare R2 Section */}
          <div className="space-y-3.5 p-4 rounded-xl bg-neutral-900/50 border border-neutral-800">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <Cloud className="w-4 h-4" />
                <span>Cloudflare R2 Storage</span>
              </h3>
              <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full font-mono">
                Zero Egress
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">
                  Cloudflare Account ID
                </label>
                <input
                  type="text"
                  value={r2.accountId}
                  onChange={(e) => setR2({ ...r2, accountId: e.target.value })}
                  placeholder="e.g. 748b9f...28f0"
                  className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-200 font-mono text-[11px] focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">
                  R2 Bucket Name
                </label>
                <input
                  type="text"
                  value={r2.bucketName}
                  onChange={(e) => setR2({ ...r2, bucketName: e.target.value })}
                  placeholder="e.g. nightwire-videos"
                  className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-200 font-mono text-[11px] focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">
                  R2 Access Key ID
                </label>
                <input
                  type="text"
                  value={r2.accessKeyId}
                  onChange={(e) => setR2({ ...r2, accessKeyId: e.target.value })}
                  placeholder="e.g. cf_r2_key_..."
                  className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-200 font-mono text-[11px] focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">
                  R2 Secret Access Key
                </label>
                <input
                  type="password"
                  value={r2.secretAccessKey}
                  onChange={(e) => setR2({ ...r2, secretAccessKey: e.target.value })}
                  placeholder="••••••••••••••••••••••••"
                  className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-200 font-mono text-[11px] focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-neutral-400 mb-1">
                Public Bucket URL (for HTTP Range streaming)
              </label>
              <input
                type="text"
                value={r2.publicUrl}
                onChange={(e) => setR2({ ...r2, publicUrl: e.target.value })}
                placeholder="https://pub-your-id.r2.dev or https://media.yourdomain.com"
                className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-200 font-mono text-[11px] focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Supabase Section */}
          <div className="space-y-3.5 p-4 rounded-xl bg-neutral-900/50 border border-neutral-800">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Database className="w-4 h-4" />
                <span>Supabase PostgreSQL & Auth</span>
              </h3>
              <span className="text-[10px] text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 px-2 py-0.5 rounded-full font-mono">
                500MB DB
              </span>
            </div>

            <div>
              <label className="block text-[11px] text-neutral-400 mb-1">
                Supabase Project URL
              </label>
              <input
                type="text"
                value={supabase.url}
                onChange={(e) => setSupabase({ ...supabase, url: e.target.value })}
                placeholder="https://your-project.supabase.co"
                className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-200 font-mono text-[11px] focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] text-neutral-400 mb-1">
                Supabase Anon Public API Key
              </label>
              <input
                type="text"
                value={supabase.anonKey}
                onChange={(e) => setSupabase({ ...supabase, anonKey: e.target.value })}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI..."
                className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-200 font-mono text-[11px] focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Info note */}
          <div className="p-3 bg-neutral-900/30 border border-neutral-800 rounded-xl text-[11px] text-neutral-400 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
            <p>
              Values are securely stored in your local browser storage and mirrored to <code className="text-cyan-300">.env.local</code> for Next.js runtime. Direct client-to-R2 uploads are performed using presigned URLs.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleResetToDemo}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 rounded-lg border border-neutral-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Load Free-Tier Presets</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-semibold rounded-lg shadow-md shadow-cyan-500/20 transition-all"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-950" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Configuration</span>
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
