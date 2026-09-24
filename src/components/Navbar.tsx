import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Upload, 
  Search, 
  Database, 
  Sliders, 
  Sparkles,
  Zap,
  LogIn,
  LogOut,
  Mail,
  Radio,
  CheckCircle2,
  Loader2,
  ChevronDown,
  Smartphone,
  Monitor,
  Clock,
  History,
  X,
  ArrowUpRight,
  Trash2
} from 'lucide-react';
import { User, SupabaseConfig } from '../types';
import { 
  getRecentSearches, 
  saveRecentSearch, 
  removeRecentSearch, 
  clearRecentSearches 
} from '../lib/storage';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenUpload: () => void;
  onOpenArchitecture: () => void;
  onOpenSettings: () => void;
  onOpenAndroid: () => void;
  onOpenWindows: () => void;
  currentUser: User | null;
  onSignIn: (email: string) => Promise<{ success: boolean; message: string }>;
  onSignOut: () => void;
  onNavigateHome: () => void;
  supabaseConfig: SupabaseConfig;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  onSearchChange,
  onOpenUpload,
  onOpenArchitecture,
  onOpenSettings,
  onOpenAndroid,
  onOpenWindows,
  currentUser,
  onSignIn,
  onSignOut,
  onNavigateHome,
  supabaseConfig,
}) => {
  const [showAuthDropdown, setShowAuthDropdown] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [authStatusMessage, setAuthStatusMessage] = useState<{ text: string; type: 'info' | 'success' | 'error' } | null>(null);

  const authDropdownRef = useRef<HTMLDivElement>(null);

  // Search suggestions state
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => getRecentSearches());
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter recent searches by current query as the user types
  const matchingSuggestions = useMemo(() => {
    const trimmed = searchQuery.trim().toLowerCase();
    if (!trimmed) {
      return recentSearches;
    }
    return recentSearches.filter((item) =>
      item.toLowerCase().includes(trimmed)
    );
  }, [recentSearches, searchQuery]);

  // Click outside listener for search suggestions
  useEffect(() => {
    const handleSearchClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleSearchClickOutside);
    return () => document.removeEventListener('mousedown', handleSearchClickOutside);
  }, []);

  const executeSearch = (query: string) => {
    const trimmed = query.trim();
    if (trimmed) {
      const updated = saveRecentSearch(trimmed);
      setRecentSearches(updated);
    }
    onSearchChange(trimmed);
    setIsSearchFocused(false);
    setActiveIndex(-1);
    searchInputRef.current?.blur();
  };

  const handleRemoveRecentSearch = (e: React.MouseEvent, query: string) => {
    e.stopPropagation();
    e.preventDefault();
    const updated = removeRecentSearch(query);
    setRecentSearches(updated);
  };

  const handleClearAllRecent = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    clearRecentSearches();
    setRecentSearches([]);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (matchingSuggestions.length > 0) {
        setIsSearchFocused(true);
        setActiveIndex((prev) => (prev + 1) % matchingSuggestions.length);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (matchingSuggestions.length > 0) {
        setIsSearchFocused(true);
        setActiveIndex((prev) => (prev <= 0 ? matchingSuggestions.length - 1 : prev - 1));
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && matchingSuggestions[activeIndex]) {
        executeSearch(matchingSuggestions[activeIndex]);
      } else {
        executeSearch(searchQuery);
      }
    } else if (e.key === 'Escape') {
      setIsSearchFocused(false);
      setActiveIndex(-1);
      searchInputRef.current?.blur();
    }
  };

  const renderHighlightedText = (text: string, highlight: string) => {
    const trimmedHighlight = highlight.trim();
    if (!trimmedHighlight) return <span>{text}</span>;

    const regex = new RegExp(`(${trimmedHighlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    return (
      <span>
        {parts.map((part, i) =>
          regex.test(part) ? (
            <span key={i} className="text-cyan-400 font-semibold underline decoration-cyan-500/50">
              {part}
            </span>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </span>
    );
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (authDropdownRef.current && !authDropdownRef.current.contains(e.target as Node)) {
        setShowAuthDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    setIsSending(true);
    setAuthStatusMessage({ text: 'Sending magic link...', type: 'info' });

    try {
      const result = await onSignIn(emailInput.trim());
      if (result.success) {
        setAuthStatusMessage({ text: result.message, type: 'success' });
        setTimeout(() => {
          setShowAuthDropdown(false);
          setAuthStatusMessage(null);
        }, 3500);
      } else {
        setAuthStatusMessage({ text: result.message, type: 'error' });
      }
    } catch (err: any) {
      setAuthStatusMessage({ text: err.message || 'Failed to send login link', type: 'error' });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-800/80 bg-neutral-950/85 backdrop-blur-md px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all duration-300">
              <Zap className="w-5 h-5 text-white animate-pulse" />
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-neutral-950" title="R2 Zero-Egress Connected" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white group-hover:text-cyan-400 transition-colors">
                  Reelport
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-cyan-950/70 border border-cyan-800/50 text-cyan-400">
                  Video Studio
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 hidden sm:block">
                Cloudflare R2 + Supabase Free-Tier Architecture
              </p>
            </div>
          </button>
        </div>

        {/* Global Search with localStorage Recent Query Suggestions */}
        <div ref={searchContainerRef} className="flex-1 max-w-xl mx-2 sm:mx-6 relative">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onFocus={() => {
                setIsSearchFocused(true);
                setRecentSearches(getRecentSearches());
              }}
              onChange={(e) => {
                onSearchChange(e.target.value);
                setActiveIndex(-1);
                if (!isSearchFocused) setIsSearchFocused(true);
              }}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search videos, tags, categories, or engineers..."
              className="w-full pl-10 pr-9 py-2 bg-neutral-900/90 border border-neutral-800 rounded-xl text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/50 transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  onSearchChange('');
                  setActiveIndex(-1);
                  searchInputRef.current?.focus();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-white rounded-md hover:bg-neutral-800 transition-colors"
                title="Clear input"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Recent Queries Suggestions Dropdown */}
          {isSearchFocused && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-neutral-900/95 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150 backdrop-blur-md">
              {matchingSuggestions.length > 0 ? (
                <div>
                  <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-neutral-800/80 bg-neutral-950/70 text-xs">
                    <span className="text-[11px] font-semibold text-neutral-400 flex items-center gap-1.5 uppercase tracking-wider">
                      <History className="w-3.5 h-3.5 text-cyan-400" />
                      {searchQuery.trim() ? 'Matching Searches' : 'Recent Searches'}
                    </span>
                    <button
                      type="button"
                      onMouseDown={handleClearAllRecent}
                      className="text-[11px] text-neutral-500 hover:text-red-400 flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Clear all</span>
                    </button>
                  </div>

                  <ul className="py-1 max-h-64 overflow-y-auto divide-y divide-neutral-800/30">
                    {matchingSuggestions.map((item, index) => {
                      const isSelected = activeIndex === index;
                      return (
                        <li
                          key={item}
                          onMouseEnter={() => setActiveIndex(index)}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            executeSearch(item);
                          }}
                          className={`flex items-center justify-between px-3.5 py-2 text-xs cursor-pointer transition-colors group ${
                            isSelected
                              ? 'bg-cyan-950/40 text-cyan-200 border-l-2 border-cyan-500 pl-3'
                              : 'text-neutral-300 hover:bg-neutral-800/60 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Clock className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'text-cyan-400' : 'text-neutral-500 group-hover:text-neutral-400'}`} />
                            <span className="truncate">
                              {renderHighlightedText(item, searchQuery)}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              title="Remove search"
                              onMouseDown={(e) => handleRemoveRecentSearch(e, item)}
                              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-neutral-800 text-neutral-500 hover:text-neutral-200 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                            <ArrowUpRight className={`w-3 h-3 ${isSelected ? 'text-cyan-400 opacity-100' : 'text-neutral-500 opacity-0 group-hover:opacity-100'} transition-opacity`} />
                          </div>
                        </li>
                      );
                    })}
                  </ul>

                  <div className="px-3 py-1.5 bg-neutral-950/70 border-t border-neutral-800/60 text-[10px] text-neutral-500 flex items-center justify-between">
                    <span>Press <kbd className="px-1 py-0.5 rounded bg-neutral-800 text-neutral-300 font-mono">↑</kbd> <kbd className="px-1 py-0.5 rounded bg-neutral-800 text-neutral-300 font-mono">↓</kbd> to navigate</span>
                    <span><kbd className="px-1 py-0.5 rounded bg-neutral-800 text-neutral-300 font-mono">Enter</kbd> to search</span>
                  </div>
                </div>
              ) : searchQuery.trim() ? (
                <div
                  onMouseDown={(e) => {
                    e.preventDefault();
                    executeSearch(searchQuery);
                  }}
                  className="px-4 py-3 text-xs text-neutral-400 hover:bg-neutral-800/60 cursor-pointer flex items-center gap-2 transition-colors"
                >
                  <Search className="w-3.5 h-3.5 text-cyan-400" />
                  <span>
                    Search for <span className="text-white font-semibold">"{searchQuery.trim()}"</span>
                  </span>
                  <span className="ml-auto text-[10px] text-neutral-500 font-mono">Press Enter</span>
                </div>
              ) : (
                <div className="px-4 py-3 text-xs text-neutral-500 text-center">
                  No recent searches found. Type to search videos!
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Architecture & Code Export button */}
          <button
            onClick={onOpenArchitecture}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-cyan-300 bg-cyan-950/40 border border-cyan-800/50 rounded-lg hover:bg-cyan-900/40 hover:border-cyan-600/70 transition-all"
            title="View Supabase Schema & Cloudflare R2 Next.js code"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Architecture & Code</span>
          </button>

          {/* Android App Modal button */}
          <button
            onClick={onOpenAndroid}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-300 bg-emerald-950/40 border border-emerald-800/50 rounded-lg hover:bg-emerald-900/40 hover:border-emerald-600/70 transition-all"
            title="Install Android App / Download APK"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Android App</span>
          </button>

          {/* Windows App Modal button */}
          <button
            onClick={onOpenWindows}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-300 bg-blue-950/40 border border-blue-800/50 rounded-lg hover:bg-blue-900/40 hover:border-blue-600/70 transition-all"
            title="Install Windows App / Window Mode & Shortcuts"
          >
            <Monitor className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Windows App</span>
          </button>

          {/* Infrastructure Settings */}
          <button
            onClick={onOpenSettings}
            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-900 rounded-lg border border-transparent hover:border-neutral-800 transition-all"
            title="Configure Cloudflare R2 & Supabase Keys"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* User Authenticated vs Guest State */}
          {currentUser ? (
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Broadcast / Direct Upload button */}
              <button
                onClick={onOpenUpload}
                className="flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-neutral-950 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-lg hover:from-cyan-300 hover:to-blue-300 shadow-md shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all"
                title="Upload directly to Cloudflare R2"
              >
                <Radio className="w-4 h-4 animate-pulse text-neutral-950" />
                <span className="font-bold">Broadcast</span>
              </button>

              {/* User Avatar + Sign Out */}
              <div className="flex items-center gap-2 pl-2 border-l border-neutral-800">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-cyan-500/30"
                />
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-medium text-neutral-200 leading-tight truncate max-w-[120px]">
                    {currentUser.name}
                  </p>
                  <p className="text-[10px] text-cyan-400 leading-tight">
                    {currentUser.channel_handle}
                  </p>
                </div>
                <button
                  onClick={onSignOut}
                  className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-neutral-900 rounded-lg transition-colors ml-1"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Guest / Signed Out: Sign In Dropdown Trigger */
            <div className="relative" ref={authDropdownRef}>
              <button
                onClick={() => setShowAuthDropdown(!showAuthDropdown)}
                className="flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-neutral-200 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 hover:border-cyan-500/50 rounded-lg transition-all"
              >
                <LogIn className="w-4 h-4 text-cyan-400" />
                <span>Sign in</span>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
              </button>

              {/* Magic Link Dropdown Box */}
              {showAuthDropdown && (
                <div className="absolute right-0 mt-2 w-80 sm:w-88 p-4 bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl z-50 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-800/80">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-cyan-400" />
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        Supabase Magic Link Sign-In
                      </h4>
                    </div>
                  </div>

                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    No password required. Enter your email and Supabase will email you a secure login link.
                  </p>

                  <form onSubmit={handleSendMagicLink} className="space-y-3">
                    <div>
                      <label className="block text-[11px] text-neutral-300 font-medium mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-cyan-500/70"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSending || !emailInput.trim()}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 disabled:opacity-50 text-neutral-950 font-bold text-xs rounded-xl shadow-md shadow-cyan-500/20 transition-all"
                    >
                      {isSending ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Sending link...</span>
                        </>
                      ) : (
                        <>
                          <Mail className="w-3.5 h-3.5" />
                          <span>Send magic link</span>
                        </>
                      )}
                    </button>
                  </form>

                  {authStatusMessage && (
                    <div
                      className={`p-2.5 rounded-xl text-[11px] leading-relaxed flex items-start gap-2 ${
                        authStatusMessage.type === 'success'
                          ? 'bg-emerald-950/60 border border-emerald-800/60 text-emerald-300'
                          : authStatusMessage.type === 'error'
                          ? 'bg-red-950/60 border border-red-800/60 text-red-300'
                          : 'bg-neutral-900 border border-neutral-800 text-neutral-300'
                      }`}
                    >
                      {authStatusMessage.type === 'success' && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      )}
                      <span>{authStatusMessage.text}</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-neutral-800/80 text-[10px] text-neutral-500 leading-normal">
                    Tip: If testing without a live SMTP provider, you can also sign in with the built-in dev studio account.
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
