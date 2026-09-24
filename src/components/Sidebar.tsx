import React from 'react';
import { motion } from 'framer-motion';
import { 
  Home, 
  Compass, 
  Flame, 
  Bookmark, 
  ThumbsUp, 
  History, 
  Cloud, 
  Database, 
  ShieldCheck, 
  Zap, 
  Film, 
  Cpu, 
  Music, 
  Gamepad2, 
  BookOpen,
  Smartphone,
  Monitor
} from 'lucide-react';
import { R2Config, SupabaseConfig } from '../types';

interface SidebarProps {
  currentCategory: string;
  onSelectCategory: (category: string) => void;
  activeFilter: 'all' | 'liked' | 'saved' | 'history';
  onSelectFilter: (filter: 'all' | 'liked' | 'saved' | 'history') => void;
  r2Config: R2Config;
  supabaseConfig: SupabaseConfig;
  videoCount: number;
  onOpenAndroid?: () => void;
  onOpenWindows?: () => void;
}

export const CATEGORIES = [
  { id: 'All', label: 'All Videos', icon: Compass },
  { id: 'Engineering', label: 'Engineering & Arch', icon: Cpu },
  { id: 'Cyberpunk', label: 'Cyberpunk & Sci-Fi', icon: Zap },
  { id: 'Lo-Fi', label: 'Lo-Fi & Synth', icon: Music },
  { id: 'Film', label: 'Cinematics & CGI', icon: Film },
  { id: 'Gaming', label: 'Gaming Demos', icon: Gamepad2 },
  { id: 'Tutorials', label: 'Full-Stack Guides', icon: BookOpen },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentCategory,
  onSelectCategory,
  activeFilter,
  onSelectFilter,
  r2Config,
  supabaseConfig,
  videoCount,
  onOpenAndroid,
  onOpenWindows,
}) => {
  return (
    <aside className="w-64 flex-shrink-0 hidden md:flex flex-col gap-6 py-6 px-4 border-r border-neutral-800/80 bg-neutral-950/60 min-h-[calc(100vh-65px)]">
      {/* Navigation Sections */}
      <div className="space-y-1">
        <p className="px-3 text-[11px] font-semibold tracking-wider uppercase text-neutral-500 mb-2">
          Discover
        </p>
        <motion.button
          onClick={() => {
            onSelectFilter('all');
            onSelectCategory('All');
          }}
          whileHover={{ x: 5 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeFilter === 'all' && currentCategory === 'All'
              ? 'bg-neutral-800 text-cyan-400 font-semibold shadow-inner'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
          }`}
        >
          <Home className="w-4 h-4 text-cyan-400" />
          <span>Home Feed</span>
        </motion.button>

        <motion.button
          onClick={() => onSelectFilter('liked')}
          whileHover={{ x: 5 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeFilter === 'liked'
              ? 'bg-neutral-800 text-cyan-400 font-semibold shadow-inner'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
          }`}
        >
          <ThumbsUp className="w-4 h-4 text-blue-400" />
          <span>Liked Videos</span>
        </motion.button>

        <motion.button
          onClick={() => onSelectFilter('saved')}
          whileHover={{ x: 5 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeFilter === 'saved'
              ? 'bg-neutral-800 text-cyan-400 font-semibold shadow-inner'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
          }`}
        >
          <Bookmark className="w-4 h-4 text-amber-400" />
          <span>Saved to Watch</span>
        </motion.button>

        <motion.button
          onClick={() => onSelectFilter('history')}
          whileHover={{ x: 5 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeFilter === 'history'
              ? 'bg-neutral-800 text-cyan-400 font-semibold shadow-inner'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
          }`}
        >
          <History className="w-4 h-4 text-purple-400" />
          <span>Watch History</span>
        </motion.button>
      </div>

      {/* Categories */}
      <div className="space-y-1">
        <p className="px-3 text-[11px] font-semibold tracking-wider uppercase text-neutral-500 mb-2">
          Categories
        </p>
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isSelected = activeFilter === 'all' && currentCategory === cat.id;
          return (
            <motion.button
              key={cat.id}
              onClick={() => {
                onSelectFilter('all');
                onSelectCategory(cat.id);
              }}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                isSelected
                  ? 'bg-cyan-950/60 border border-cyan-800/60 text-cyan-300 font-semibold'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900/80'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-cyan-400' : 'text-neutral-500'}`} />
              <span>{cat.label}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Android Mobile Banner */}
      {onOpenAndroid && (
        <button
          onClick={onOpenAndroid}
          className="w-full p-3 rounded-xl bg-gradient-to-r from-emerald-950/40 to-cyan-950/40 border border-emerald-800/40 hover:border-emerald-600/70 transition-all text-left flex items-center justify-between group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-emerald-300 group-hover:text-emerald-200">
                Android App
              </p>
              <p className="text-[10px] text-neutral-400">Install APK & PWA</p>
            </div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-300 font-mono font-medium">
            Ready
          </span>
        </button>
      )}

      {/* Windows Desktop Banner */}
      {onOpenWindows && (
        <button
          onClick={onOpenWindows}
          className="w-full p-3 rounded-xl bg-gradient-to-r from-blue-950/40 to-cyan-950/40 border border-blue-800/40 hover:border-blue-600/70 transition-all text-left flex items-center justify-between group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Monitor className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-blue-300 group-hover:text-blue-200">
                Windows App
              </p>
              <p className="text-[10px] text-neutral-400">Desktop & Window</p>
            </div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-900/60 text-blue-300 font-mono font-medium">
            Ready
          </span>
        </button>
      )}

      {/* Live Free-Tier Architecture Badge */}
      <div className="mt-auto p-3.5 bg-neutral-900/80 border border-neutral-800 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            Free-Tier Stack
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/40">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            Healthy
          </span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between text-neutral-300">
            <span className="flex items-center gap-1.5 text-neutral-400">
              <Cloud className="w-3.5 h-3.5 text-amber-400" />
              Cloudflare R2:
            </span>
            <span className="font-mono text-[11px] text-cyan-300 font-medium">
              Zero Egress ($0)
            </span>
          </div>

          <div className="flex items-center justify-between text-neutral-300">
            <span className="flex items-center gap-1.5 text-neutral-400">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              Supabase Postgres:
            </span>
            <span className="font-mono text-[11px] text-emerald-300 font-medium">
              500MB Free
            </span>
          </div>

          <div className="flex items-center justify-between text-neutral-300">
            <span className="flex items-center gap-1.5 text-neutral-400">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              Direct Presigned:
            </span>
            <span className="font-mono text-[11px] text-blue-300 font-medium">
              Client &rarr; Bucket
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-neutral-800/80 text-[10px] text-neutral-500 leading-relaxed">
          Bypasses serverless memory/payload limits. HTTP Range requests stream directly to the native HTML5 player.
        </div>
      </div>
    </aside>
  );
};
