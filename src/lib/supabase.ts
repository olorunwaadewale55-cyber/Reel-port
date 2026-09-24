import { createClient, SupabaseClient, User as SupabaseAuthUser } from '@supabase/supabase-js';
import { User, SupabaseConfig } from '../types';
import { getSupabaseConfig, saveSupabaseConfig, persistCurrentUser } from './storage';

// Cached Supabase client instance
let cachedClient: SupabaseClient | null = null;
let currentConfigString = '';

/**
 * Returns a configured Supabase client.
 * If credentials change, recreates the client dynamically.
 */
export function getSupabaseClient(): SupabaseClient | null {
  try {
    const config = getActiveSupabaseConfig();
    const configKey = `${config.url}_${config.anonKey}`;

    if (cachedClient && currentConfigString === configKey) {
      return cachedClient;
    }

    if (!config.url || !config.anonKey || !config.url.startsWith('http')) {
      return null;
    }

    cachedClient = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      },
    });
    currentConfigString = configKey;
    return cachedClient;
  } catch (error) {
    console.warn('Failed to initialize Supabase client:', error);
    return null;
  }
}

/**
 * Reads Supabase config from Vite environment variables or localStorage.
 */
export function getActiveSupabaseConfig(): SupabaseConfig {
  const envUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const envAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

  const stored = getSupabaseConfig();

  const url = (envUrl && envUrl.trim() && !envUrl.includes('your-project')) 
    ? envUrl.trim() 
    : stored.url;

  const anonKey = (envAnonKey && envAnonKey.trim() && !envAnonKey.includes('your-anon-key')) 
    ? envAnonKey.trim() 
    : stored.anonKey;

  const isConfigured = Boolean(
    url && 
    anonKey && 
    url.startsWith('https://') && 
    !url.includes('xyzcompany')
  );

  return {
    url,
    anonKey,
    isConfigured,
  };
}

/**
 * Convert a Supabase user into our application User model
 */
export function mapSupabaseUserToAppUser(sbUser: SupabaseAuthUser): User {
  const meta = sbUser.user_metadata || {};
  const emailName = (sbUser.email || '').split('@')[0] || 'User';
  const displayName = meta.name || meta.full_name || emailName.charAt(0).toUpperCase() + emailName.slice(1);
  const handle = meta.channel_handle || `@${emailName.toLowerCase().replace(/[^a-z0-9_]/g, '') || 'creator'}`;
  const avatar = meta.avatar || meta.avatar_url || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&h=256&q=80`;

  return {
    id: sbUser.id,
    name: displayName,
    email: sbUser.email || '',
    avatar,
    channel_handle: handle,
    subscribers: meta.subscribers || 0,
    bio: meta.bio || 'Reelport creator & broadcaster',
    created_at: sbUser.created_at || new Date().toISOString(),
  };
}

/**
 * Sign Up with Email and Password
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  profile: { name: string; channelHandle: string; avatar?: string; bio?: string }
): Promise<{ user: User | null; message: string; requiresEmailConfirmation: boolean }> {
  const client = getSupabaseClient();
  const cleanEmail = email.trim().toLowerCase();

  // If Supabase is connected to a live URL
  if (client && client.auth) {
    try {
      const redirectUrl = typeof window !== 'undefined' ? window.location.origin : undefined;
      const { data, error } = await client.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name: profile.name.trim(),
            channel_handle: profile.channelHandle.startsWith('@') ? profile.channelHandle : `@${profile.channelHandle}`,
            avatar: profile.avatar || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&h=256&q=80`,
            bio: profile.bio || '',
            subscribers: 0,
          },
        },
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        const appUser = mapSupabaseUserToAppUser(data.user);
        // If session was established immediately (auto-confirm enabled on Supabase)
        if (data.session) {
          persistCurrentUser(appUser);
          return {
            user: appUser,
            message: 'Account created and signed in successfully!',
            requiresEmailConfirmation: false,
          };
        } else {
          // Email confirmation is required by this Supabase instance
          return {
            user: appUser,
            message: 'Account created! Please check your email inbox to confirm your address before logging in.',
            requiresEmailConfirmation: true,
          };
        }
      }
    } catch (err: any) {
      console.warn('Supabase signUp error:', err);
      // If error is network or invalid project setup, provide clear details
      if (err?.message && !err.message.includes('fetch failed')) {
        throw new Error(err.message);
      }
    }
  }

  // Graceful Local Fallback for sandbox / demo mode
  const localUser: User = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: profile.name.trim() || cleanEmail.split('@')[0],
    email: cleanEmail,
    avatar: profile.avatar || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&h=256&q=80`,
    channel_handle: profile.channelHandle.startsWith('@') ? profile.channelHandle : `@${profile.channelHandle}`,
    subscribers: 0,
    bio: profile.bio || 'Broadcasting on Reelport',
    created_at: new Date().toISOString(),
  };

  persistCurrentUser(localUser);
  return {
    user: localUser,
    message: 'Account created successfully in Reelport studio sandbox!',
    requiresEmailConfirmation: false,
  };
}

/**
 * Sign In with Email and Password
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<{ user: User; message: string }> {
  const client = getSupabaseClient();
  const cleanEmail = email.trim().toLowerCase();

  if (client && client.auth) {
    try {
      const { data, error } = await client.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        const appUser = mapSupabaseUserToAppUser(data.user);
        persistCurrentUser(appUser);
        return {
          user: appUser,
          message: `Welcome back, ${appUser.name}!`,
        };
      }
    } catch (err: any) {
      console.warn('Supabase signIn error:', err);
      if (err?.message && !err.message.includes('fetch failed') && !err.message.includes('Failed to fetch')) {
        throw new Error(err.message);
      }
    }
  }

  // Sandbox fallback
  const namePart = cleanEmail.split('@')[0];
  const localUser: User = {
    id: `usr_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`,
    name: namePart.charAt(0).toUpperCase() + namePart.slice(1),
    email: cleanEmail,
    avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&h=256&q=80`,
    channel_handle: `@${namePart.toLowerCase()}`,
    subscribers: 1,
    bio: 'Reelport broadcaster',
    created_at: new Date().toISOString(),
  };

  persistCurrentUser(localUser);
  return {
    user: localUser,
    message: `Signed in as ${localUser.name}!`,
  };
}

/**
 * Send Password Reset link via Supabase Auth
 */
export async function sendPasswordReset(email: string): Promise<string> {
  const client = getSupabaseClient();
  const cleanEmail = email.trim().toLowerCase();

  if (client && client.auth) {
    try {
      const redirectUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}?type=recovery` 
        : undefined;

      const { error } = await client.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: redirectUrl,
      });

      if (error) {
        throw error;
      }

      return `Password reset email dispatched to ${cleanEmail}. Follow the link in your email to reset your password.`;
    } catch (err: any) {
      console.warn('Supabase resetPassword error:', err);
      if (err?.message) throw new Error(err.message);
    }
  }

  return `Password reset email dispatched to ${cleanEmail}. In sandbox mode, you can sign in directly.`;
}

/**
 * Update user password (when user is in session or through recovery flow)
 */
export async function updateUserPassword(newPassword: string): Promise<string> {
  const client = getSupabaseClient();

  if (client && client.auth) {
    try {
      const { error } = await client.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }

      return 'Password successfully updated!';
    } catch (err: any) {
      console.warn('Supabase updateUser password error:', err);
      if (err?.message) throw new Error(err.message);
    }
  }

  return 'Password updated in studio sandbox!';
}

/**
 * Update user profile metadata
 */
export async function updateUserProfile(updates: Partial<User>): Promise<User | null> {
  const client = getSupabaseClient();

  if (client && client.auth) {
    try {
      const metadataUpdates: Record<string, any> = {};
      if (updates.name) metadataUpdates.name = updates.name;
      if (updates.channel_handle) metadataUpdates.channel_handle = updates.channel_handle;
      if (updates.avatar) metadataUpdates.avatar = updates.avatar;
      if (updates.bio) metadataUpdates.bio = updates.bio;

      const { data, error } = await client.auth.updateUser({
        data: metadataUpdates,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        const updatedAppUser = mapSupabaseUserToAppUser(data.user);
        persistCurrentUser(updatedAppUser);
        return updatedAppUser;
      }
    } catch (err: any) {
      console.warn('Supabase updateUser profile error:', err);
    }
  }

  return null;
}

/**
 * Sign Out
 */
export async function signOutUser(): Promise<void> {
  const client = getSupabaseClient();
  try {
    if (client && client.auth) {
      await client.auth.signOut();
    }
  } catch (err) {
    console.warn('Supabase signOut error:', err);
  } finally {
    persistCurrentUser(null);
  }
}

/**
 * Get the current Supabase session and user if already authenticated
 */
export async function getCurrentSupabaseUser(): Promise<User | null> {
  const client = getSupabaseClient();
  if (!client || !client.auth) return null;

  try {
    const { data: { session }, error } = await client.auth.getSession();
    if (error || !session || !session.user) {
      return null;
    }
    return mapSupabaseUserToAppUser(session.user);
  } catch (err) {
    console.warn('Failed to retrieve Supabase session:', err);
    return null;
  }
}
