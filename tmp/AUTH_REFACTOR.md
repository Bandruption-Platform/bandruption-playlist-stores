Excellent question! This is exactly the kind of real-world scenario that needs to be handled elegantly. You're right - we need to support users who authenticate with Google but then want Spotify functionality.

The solution is a **Hybrid Approach** where Spotify works as **both** a primary OAuth option AND a linkable service. Here's how:

## **Hybrid Architecture: Best of Both Worlds**

```
┌─────────────────────────┐    ┌──────────────────────┐
│   Primary Auth          │    │   Linked Services    │
│   (Supabase OAuth)      │    │   (Your Backend)     │
│                         │    │                      │
│ • Google               │    │ • Spotify Tokens     │
│ • Facebook             │───▶│   (for non-Spotify   │
│ • Discord              │    │    primary users)    │
│ • Email                │    │                      │
│ • Spotify (optional)   │    │                      │
└─────────────────────────┘    └──────────────────────┘
```

## **Implementation Strategy**

### 1. **Update Supabase Config** 
Add Spotify as a primary option:

```toml
[auth.external.spotify]
enabled = true
client_id = "env(SPOTIFY_CLIENT_ID)"
secret = "env(SPOTIFY_CLIENT_SECRET)"
redirect_uri = "http://localhost:54321/auth/v1/callback"
```

### 2. **Enhanced AuthContext with Popup Support**
Read file: apps/web/src/contexts/AuthContext.tsx

Here's how to enhance your `AuthContext.tsx` to support the hybrid approach:

```typescript:apps/web/src/contexts/AuthContext.tsx
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

    // Check if user authenticated with Spotify as primary
    const spotifyIdentity = session.user.identities?.find(
      identity => identity.provider === 'spotify'
    );

    if (spotifyIdentity) {
      setHasSpotifyAccess(true);
      return;
    }

    // Check if user has linked Spotify account
    const { data: linkedTokens } = await supabase
      .from('spotify_tokens')
      .select('access_token, expires_at')
      .eq('user_id', session.user.id)
      .single();

    if (linkedTokens) {
      const expiresAt = new Date(linkedTokens.expires_at);
      setHasSpotifyAccess(expiresAt > new Date());
    } else {
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
          } catch (error) {
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

  // ... rest of existing methods

  const value = {
    user,
    session,
    loading,
    signInWithOAuth,
    signInWithOAuthPopup, // New popup method
    signInWithEmail,
    signUpWithEmail,
    signOut,
    hasSpotifyAccess,
    getSpotifyAccessMethod,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
```

### 3. **Enhanced Spotify Hook for Unified Access**

Create a unified hook that handles both scenarios:

```typescript:apps/web/src/hooks/useSpotifyAccess.ts
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSpotifyLinking } from './useSpotifyLinking';
import { SpotifyUser } from '@shared/types';

export const useSpotifyAccess = () => {
  const { session, hasSpotifyAccess, getSpotifyAccessMethod } = useAuth();
  const { linkSpotifyAccount, isLinking } = useSpotifyLinking();
  const [spotifyUser, setSpotifyUser] = useState<SpotifyUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const getSpotifyTokens = useCallback(async () => {
    if (!session?.user) return null;

    const accessMethod = getSpotifyAccessMethod();
    
    if (accessMethod === 'primary') {
      // User authenticated with Spotify as primary - get tokens from session
      const spotifyIdentity = session.user.identities?.find(
        identity => identity.provider === 'spotify'
      );
      
      if (spotifyIdentity) {
        // Get fresh tokens from your backend using the Supabase session
        const response = await fetch('/api/spotify/tokens', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          return {
            access_token: data.access_token,
            user_data: data.user_data,
          };
        }
      }
    } else if (accessMethod === 'linked') {
      // User has linked Spotify - get from your custom table
      const storedToken = localStorage.getItem('spotify_access_token');
      const storedUser = localStorage.getItem('spotify_user');
      
      if (storedToken && storedUser) {
        return {
          access_token: storedToken,
          user_data: JSON.parse(storedUser),
        };
      }
    }
    
    return null;
  }, [session, getSpotifyAccessMethod]);

  useEffect(() => {
    const loadSpotifyData = async () => {
      setLoading(true);
      
      if (hasSpotifyAccess) {
        const tokens = await getSpotifyTokens();
        if (tokens) {
          setAccessToken(tokens.access_token);
          setSpotifyUser(tokens.user_data);
        }
      } else {
        setAccessToken(null);
        setSpotifyUser(null);
      }
      
      setLoading(false);
    };

    loadSpotifyData();
  }, [hasSpotifyAccess, getSpotifyTokens]);

  const ensureSpotifyAccess = async (): Promise<{ success: boolean; error?: string }> => {
    if (hasSpotifyAccess) {
      return { success: true };
    }

    // If user doesn't have Spotify access, offer to link it
    return await linkSpotifyAccount();
  };

  return {
    hasSpotifyAccess,
    spotifyUser,
    accessToken,
    loading,
    isLinking,
    accessMethod: getSpotifyAccessMethod(),
    ensureSpotifyAccess,
    isPremium: spotifyUser?.product === 'premium',
  };
};
```

### 4. **Updated Play Button Component**

Now your play button can handle all scenarios seamlessly:

```typescript:apps/web/src/components/PlayButton.tsx
export const PlayButton: React.FC<PlayButtonProps> = ({ track, className = '' }) => {
  const { user, signInWithOAuthPopup } = useAuth();
  const { hasSpotifyAccess, ensureSpotifyAccess, isPremium, accessMethod } = useSpotifyAccess();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [showAuthError, setShowAuthError] = useState<string | null>(null);

  const handlePlay = async () => {
    // Step 1: Ensure user is authenticated
    if (!user) {
      setIsAuthenticating(true);
      
      // Show auth options popup
      const authChoice = await showAuthOptionsModal(); // 'google' | 'spotify' | 'facebook' | etc.
      
      const result = await signInWithOAuthPopup(authChoice);
      setIsAuthenticating(false);
      
      if (!result.success) {
        setShowAuthError(result.error || 'Authentication failed');
        return;
      }
      
      // After auth, the component will re-render and user can try again
      return;
    }

    // Step 2: Ensure Spotify access
    if (!hasSpotifyAccess) {
      setIsAuthenticating(true);
      
      const result = await ensureSpotifyAccess();
      setIsAuthenticating(false);
      
      if (!result.success) {
        setShowAuthError(result.error || 'Failed to connect Spotify');
        return;
      }
      
      // After linking, the component will re-render
      return;
    }

    // Step 3: Play the track
    // ... existing play logic
  };

  const getButtonText = () => {
    if (isAuthenticating) return 'Connecting...';
    if (!user) return 'Sign In to Play';
    if (!hasSpotifyAccess) return 'Connect Spotify';
    if (!isPremium) return 'Play in Spotify';
    return 'Play';
  };

  // ... rest of component
};
```

## **Key Benefits of This Hybrid Approach:**

### **Flexibility** 🎯
- Users can sign in with **any** provider (Google, Spotify, Facebook, etc.)
- All authentication happens in **popups** (preserves state)
- Spotify access is guaranteed regardless of primary auth method

### **User Experience Scenarios:**

1. **Spotify-First User**: Signs in with Spotify → Immediate access to all features
2. **Google-First User**: Signs in with Google → Can link Spotify when needed
3. **Existing User**: Already has Google account → Links Spotify seamlessly

### **Backend Simplification:**
Your backend just needs to check for Spotify tokens in two places:

```typescript
// Backend middleware
const getSpotifyTokensForUser = async (supabaseSession) => {
  // Check if user authenticated with Spotify primarily
  const spotifyIdentity = supabaseSession.user.identities?.find(
    identity => identity.provider === 'spotify'
  );
  
  if (spotifyIdentity) {
    // Get tokens from Supabase session
    return getSupabaseSpotifyTokens(supabaseSession);
  } else {
    // Get tokens from custom spotify_tokens table
    return getLinkedSpotifyTokens(supabaseSession.user.id);
  }
};
```

This gives you maximum flexibility while preserving state and providing the smoothest possible user experience! Users never leave the search page, and the system intelligently handles whatever authentication path they choose.