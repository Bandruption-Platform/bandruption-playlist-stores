import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@shared/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  // Regular auth methods (redirect-based)
  signInWithOAuth: (provider: 'google' | 'facebook' | 'discord' | 'spotify') => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ error?: AuthError }>;
  signUpWithEmail: (email: string, password: string) => Promise<{ error?: AuthError }>;
  // Popup-based auth methods (state-preserving)
  signInWithOAuthPopup: (provider: 'google' | 'facebook' | 'discord' | 'spotify') => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  // Spotify helpers
  hasSpotifyAccess: boolean;
  getSpotifyAccessMethod: () => 'primary' | 'linked' | 'none';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasSpotifyAccess, setHasSpotifyAccess] = useState(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      checkSpotifyAccess(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      checkSpotifyAccess(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkSpotifyAccess = async (session: Session | null) => {
    if (!session?.user) {
      setHasSpotifyAccess(false);
      return;
    }

    try {
      // Check Spotify link status via backend API
      const response = await fetch('/api/spotify/link-status', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const statusData = await response.json();
        setHasSpotifyAccess(statusData.hasSpotifyAccess);
      } else {
        setHasSpotifyAccess(false);
      }
    } catch (error) {
      console.error('Failed to check Spotify access:', error);
      setHasSpotifyAccess(false);
    }
  };

  const getSpotifyAccessMethod = (): 'primary' | 'linked' | 'none' => {
    if (!session?.user) return 'none';
    
    // Check if Spotify is primary auth method
    const spotifyIdentity = session.user.identities?.find(
      identity => identity.provider === 'spotify'
    );
    
    if (spotifyIdentity) return 'primary';
    if (hasSpotifyAccess) return 'linked';
    return 'none';
  };

  const signInWithOAuth = async (provider: 'google' | 'facebook' | 'discord' | 'spotify') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    
    if (error) {
      throw error;
    }
  };

  const signInWithOAuthPopup = async (
    provider: 'google' | 'facebook' | 'discord' | 'spotify'
  ): Promise<{ success: boolean; error?: string }> => {
    return new Promise((resolve) => {
      supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          skipBrowserRedirect: true,
        },
      }).then(({ data, error }) => {
        if (error) {
          resolve({ success: false, error: error.message });
          return;
        }

        // Open popup with the auth URL
        const popup = window.open(
          data.url,
          `${provider}-auth`,
          'width=500,height=700,scrollbars=yes,resizable=yes'
        );

        if (!popup) {
          resolve({ success: false, error: 'Popup blocked' });
          return;
        }

        // Listen for successful auth
        const checkAuth = setInterval(async () => {
          try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
              clearInterval(checkAuth);
              popup.close();
              resolve({ success: true });
            }
          } catch {
            // Session not ready yet, continue checking
          }

          // Check if popup was closed manually
          if (popup.closed) {
            clearInterval(checkAuth);
            resolve({ success: false, error: 'Authentication cancelled' });
          }
        }, 1000);

        // Timeout after 5 minutes
        setTimeout(() => {
          clearInterval(checkAuth);
          if (!popup.closed) popup.close();
          resolve({ success: false, error: 'Authentication timeout' });
        }, 5 * 60 * 1000);
      });
    });
  };

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error || undefined };
  };

  const signUpWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { error: error || undefined };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  };

  const value = {
    user,
    session,
    loading,
    signInWithOAuth,
    signInWithOAuthPopup,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    hasSpotifyAccess,
    getSpotifyAccessMethod,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};