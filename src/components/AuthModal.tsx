import React, { useState, useEffect } from 'react';
import { 
  X, 
  LogIn, 
  UserPlus, 
  KeyRound, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  User, 
  AtSign, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Send,
  RefreshCw
} from 'lucide-react';
import { User as AppUser, SupabaseConfig } from '../types';
import { 
  signUpWithEmail, 
  signInWithEmail, 
  sendPasswordReset, 
  updateUserPassword,
  getActiveSupabaseConfig 
} from '../lib/supabase';

export type AuthMode = 'sign_in' | 'sign_up' | 'reset_password';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: AuthMode;
  onClose: () => void;
  onAuthSuccess: (user: AppUser, message: string) => void;
  supabaseConfig: SupabaseConfig;
  onOpenSettings?: () => void;
  initialRecoveryToken?: boolean;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&h=256&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&h=256&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&h=256&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&h=256&q=80',
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'sign_in',
  onClose,
  onAuthSuccess,
  supabaseConfig,
  onOpenSettings,
  initialRecoveryToken = false,
}) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [channelHandle, setChannelHandle] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(PRESET_AVATARS[0]);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // New password update state when in recovery flow
  const [isSettingNewPassword, setIsSettingNewPassword] = useState(initialRecoveryToken);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Synchronize initial mode when modal opens
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMessage(null);
      setSuccessMessage(null);
      if (initialRecoveryToken) {
        setIsSettingNewPassword(true);
        setMode('reset_password');
      }
    }
  }, [isOpen, initialMode, initialRecoveryToken]);

  if (!isOpen) return null;

  const activeSupabase = getActiveSupabaseConfig();

  const handleNameChange = (val: string) => {
    setName(val);
    if (!channelHandle || channelHandle === `@${name.toLowerCase().replace(/[^a-z0-9_]/g, '')}`) {
      const generated = `@${val.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 20)}`;
      setChannelHandle(generated);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      if (mode === 'sign_in') {
        if (!email.trim() || !password) {
          throw new Error('Please enter both email and password.');
        }
        const result = await signInWithEmail(email, password);
        setSuccessMessage(result.message);
        setTimeout(() => {
          onAuthSuccess(result.user, result.message);
          onClose();
        }, 600);
      } else if (mode === 'sign_up') {
        if (!email.trim() || !password) {
          throw new Error('Please enter a valid email and password.');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters long.');
        }
        if (confirmPassword && password !== confirmPassword) {
          throw new Error('Passwords do not match. Please verify.');
        }

        const effectiveAvatar = customAvatarUrl.trim() || selectedAvatar;
        const result = await signUpWithEmail(email, password, {
          name: name.trim() || email.split('@')[0],
          channelHandle: channelHandle.trim() || `@${email.split('@')[0]}`,
          avatar: effectiveAvatar,
        });

        if (result.requiresEmailConfirmation) {
          setSuccessMessage(result.message);
        } else if (result.user) {
          setSuccessMessage(result.message);
          setTimeout(() => {
            onAuthSuccess(result.user!, result.message);
            onClose();
          }, 800);
        }
      } else if (mode === 'reset_password') {
        if (isSettingNewPassword) {
          if (!password || password.length < 6) {
            throw new Error('New password must be at least 6 characters long.');
          }
          if (confirmPassword && password !== confirmPassword) {
            throw new Error('Passwords do not match.');
          }
          const msg = await updateUserPassword(password);
          setSuccessMessage(msg);
          setTimeout(() => {
            setMode('sign_in');
            setIsSettingNewPassword(false);
          }, 1500);
        } else {
          if (!email.trim()) {
            throw new Error('Please enter your account email to receive the reset link.');
          }
          const msg = await sendPasswordReset(email);
          setSuccessMessage(msg);
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Authentication error. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div 
        className="relative w-full max-w-md bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-800/80 bg-neutral-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-800/50 text-cyan-400">
              {mode === 'sign_in' && <LogIn className="w-5 h-5" />}
              {mode === 'sign_up' && <UserPlus className="w-5 h-5" />}
              {mode === 'reset_password' && <KeyRound className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                {mode === 'sign_in' && 'Sign In to Reelport'}
                {mode === 'sign_up' && 'Create Your Reelport Account'}
                {mode === 'reset_password' && (isSettingNewPassword ? 'Set New Password' : 'Reset Password')}
              </h2>
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <span>Supabase Auth</span>
                <span aria-hidden="true">·</span>
                <span>{activeSupabase.isConfigured ? 'Live PostgreSQL' : 'Sandbox Ready'}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher (Sign In vs Sign Up) */}
        {mode !== 'reset_password' && (
          <div className="flex border-b border-neutral-800/80 bg-neutral-950/50 p-1.5 gap-1.5">
            <button
              type="button"
              onClick={() => {
                setMode('sign_in');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                mode === 'sign_in'
                  ? 'bg-neutral-850 text-white shadow-sm border border-neutral-700/80'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('sign_up');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                mode === 'sign_up'
                  ? 'bg-neutral-850 text-cyan-300 shadow-sm border border-cyan-800/60'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Sign Up</span>
            </button>
          </div>
        )}

        {/* Main Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Status Messages */}
          {errorMessage && (
            <div 
              role="alert"
              className="p-3 rounded-xl bg-red-950/60 border border-red-800/60 text-red-200 text-xs flex items-start gap-2.5 leading-relaxed"
            >
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold text-red-300">Authentication Failed:</span>{' '}
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          {successMessage && (
            <div 
              role="status"
              className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-200 text-xs flex items-start gap-2.5 leading-relaxed"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold text-emerald-300">Success:</span>{' '}
                <span>{successMessage}</span>
              </div>
            </div>
          )}

          {/* SIGN UP SPECIFIC: Display Name, Handle, Avatar */}
          {mode === 'sign_up' && (
            <>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-neutral-300">
                  Channel / Creator Name <span className="text-cyan-400">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-neutral-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Alex Vance"
                    className="w-full pl-9 pr-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-neutral-300">
                  Channel Handle <span className="text-cyan-400">*</span>
                </label>
                <div className="relative">
                  <AtSign className="absolute left-3 top-2.5 w-4 h-4 text-neutral-500" />
                  <input
                    type="text"
                    required
                    value={channelHandle}
                    onChange={(e) => {
                      const val = e.target.value;
                      setChannelHandle(val.startsWith('@') ? val : `@${val}`);
                    }}
                    placeholder="@alexvance"
                    className="w-full pl-9 pr-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-mono"
                  />
                </div>
              </div>

              {/* Avatar Selector */}
              <div className="space-y-2 pt-1">
                <label className="block text-xs font-medium text-neutral-300">
                  Choose Profile Avatar
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {PRESET_AVATARS.map((avatarUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSelectedAvatar(avatarUrl);
                        setCustomAvatarUrl('');
                      }}
                      className={`relative flex-shrink-0 rounded-full transition-all p-0.5 ${
                        selectedAvatar === avatarUrl && !customAvatarUrl
                          ? 'ring-2 ring-cyan-400 scale-105'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={avatarUrl}
                        alt="Avatar choice"
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* EMAIL INPUT (Not required if setting new password in recovery mode) */}
          {!(mode === 'reset_password' && isSettingNewPassword) && (
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-neutral-300">
                Email Address <span className="text-cyan-400">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-neutral-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  autoComplete="email"
                  className="w-full pl-9 pr-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>
          )}

          {/* PASSWORD INPUT (Sign In, Sign Up, or New Password in Recovery) */}
          {(mode !== 'reset_password' || isSettingNewPassword) && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium text-neutral-300">
                  {mode === 'reset_password' ? 'New Password' : 'Password'}{' '}
                  <span className="text-cyan-400">*</span>
                </label>
                {mode === 'sign_in' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('reset_password');
                      setIsSettingNewPassword(false);
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-neutral-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  autoComplete={mode === 'sign_in' ? 'current-password' : 'new-password'}
                  className="w-full pl-9 pr-10 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-neutral-500 hover:text-neutral-300 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* CONFIRM PASSWORD (Sign Up or Set New Password) */}
          {(mode === 'sign_up' || (mode === 'reset_password' && isSettingNewPassword)) && (
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-neutral-300">
                Confirm Password <span className="text-cyan-400">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-neutral-500" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  className="w-full pl-9 pr-10 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2.5 text-neutral-500 hover:text-neutral-300 transition-colors"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 disabled:opacity-50 text-neutral-950 font-bold text-xs rounded-xl shadow-md shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : mode === 'sign_in' ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In with Email</span>
              </>
            ) : mode === 'sign_up' ? (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Create Reelport Account</span>
              </>
            ) : isSettingNewPassword ? (
              <>
                <KeyRound className="w-4 h-4" />
                <span>Save New Password</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Send Password Reset Email</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Navigation */}
        <div className="p-4 border-t border-neutral-800/80 bg-neutral-900/40 flex flex-col gap-2.5 text-center text-xs">
          {mode === 'sign_in' && (
            <p className="text-neutral-400">
              New to Reelport?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('sign_up');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
              >
                Create an account
              </button>
            </p>
          )}

          {mode === 'sign_up' && (
            <p className="text-neutral-400">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('sign_in');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
              >
                Sign In instead
              </button>
            </p>
          )}

          {mode === 'reset_password' && (
            <p className="text-neutral-400">
              Remember your password?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('sign_in');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
              >
                Back to Sign In
              </button>
            </p>
          )}

          {/* Supabase backend status */}
          <div className="pt-2 border-t border-neutral-800/60 flex items-center justify-between text-[11px] text-neutral-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Public Anon Key • Zero Secrets Exposed</span>
            </span>
            {onOpenSettings && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSettings();
                }}
                className="text-neutral-400 hover:text-cyan-300 underline transition-colors"
              >
                Configure Supabase
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
