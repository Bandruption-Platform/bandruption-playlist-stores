Absolutely! That's a much better UX approach. We can use a **popup window** for Spotify auth instead of redirecting the main page. This way the user never leaves the search page and can immediately play their song after logging in.

Here's how to implement popup-based authentication:
Search files...

Perfect! Let's implement popup-based authentication so users never leave the search page. This will provide a seamless experience where they can immediately play their song after logging in.

## **🚀 Popup Authentication Implementation**

### **1. Create Popup Auth Service**

```typescript:apps/web/src/services/popupAuth.ts
export interface PopupAuthResult {
  success: boolean;
  userId?: string;
  accessToken?: string;
  userData?: any;
  error?: string;
}

class PopupAuthService {
  private currentPopup: Window | null = null;

  async loginWithPopup(): Promise<PopupAuthResult> {
    return new Promise((resolve, reject) => {
      this.openAuthPopup()
        .then((result) => resolve(result))
        .catch((error) => reject(error));
    });
  }

  private async openAuthPopup(): Promise<PopupAuthResult> {
    try {
      // Get auth URL from backend
      const response = await fetch('http://localhost:3001/api/spotify/auth/login');
      const { authUrl } = await response.json();

      // Open popup window
      const popup = window.open(
        authUrl,
        'spotify-auth',
        'width=500,height=700,scrollbars=yes,resizable=yes,status=yes,location=yes,toolbar=no,menubar=no'
      );

      if (!popup) {
        throw new Error('Popup blocked. Please allow popups for this site.');
      }

      this.currentPopup = popup;

      // Listen for messages from popup
      return new Promise((resolve, reject) => {
        const messageListener = (event: MessageEvent) => {
          // Security: Only accept messages from our domain
          if (event.origin !== window.location.origin) {
            return;
          }

          if (event.data.type === 'spotify-auth-success') {
            window.removeEventListener('message', messageListener);
            popup.close();
            this.currentPopup = null;
            resolve({
              success: true,
              userId: event.data.userId,
              accessToken: event.data.accessToken,
              userData: event.data.userData
            });
          }

          if (event.data.type === 'spotify-auth-error') {
            window.removeEventListener('message', messageListener);
            popup.close();
            this.currentPopup = null;
            resolve({
              success: false,
              error: event.data.error
            });
          }
        };

        // Listen for popup messages
        window.addEventListener('message', messageListener);

        // Handle popup being closed manually
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            window.removeEventListener('message', messageListener);
            this.currentPopup = null;
            resolve({
              success: false,
              error: 'Authentication cancelled'
            });
          }
        }, 1000);

        // Timeout after 5 minutes
        setTimeout(() => {
          if (!popup.closed) {
            popup.close();
            this.currentPopup = null;
          }
          clearInterval(checkClosed);
          window.removeEventListener('message', messageListener);
          reject(new Error('Authentication timeout'));
        }, 5 * 60 * 1000);
      });

    } catch (error) {
      throw new Error(`Failed to start authentication: ${error}`);
    }
  }

  closeCurrentPopup() {
    if (this.currentPopup && !this.currentPopup.closed) {
      this.currentPopup.close();
      this.currentPopup = null;
    }
  }
}

export const popupAuthService = new PopupAuthService();
```

### **2. Update SpotifyCallback for Popup Mode**

```typescript:apps/web/src/pages/SpotifyCallback.tsx
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { spotifyApi } from '../services/spotifyApi';

export function SpotifyCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = React.useState<string | null>(null);
  const [isPopup, setIsPopup] = React.useState(false);

  useEffect(() => {
    // Check if this is running in a popup window
    const inPopup = window.opener && window.opener !== window;
    setIsPopup(inPopup);

    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    const handleAuthResult = (result: any) => {
      if (inPopup) {
        // Send result to parent window
        window.opener.postMessage({
          type: result.success ? 'spotify-auth-success' : 'spotify-auth-error',
          ...result
        }, window.location.origin);
        
        // Close popup
        window.close();
      } else {
        // Regular redirect flow (fallback)
        if (result.success) {
          navigate('/search');
        } else {
          setTimeout(() => navigate('/search'), 3000);
        }
      }
    };

    if (error) {
      setError(`Spotify authorization failed: ${error}`);
      handleAuthResult({
        success: false,
        error: `Spotify authorization failed: ${error}`
      });
      return;
    }

    if (code && state) {
      // Exchange the code for tokens
      spotifyApi.handleAuthCallback(code, state)
        .then((result) => {
          handleAuthResult(result);
        })
        .catch((err) => {
          console.error('Failed to exchange code for tokens:', err);
          const errorMsg = 'Failed to complete Spotify authentication';
          setError(errorMsg);
          handleAuthResult({
            success: false,
            error: errorMsg
          });
        });
    } else {
      const errorMsg = 'Invalid callback parameters';
      setError(errorMsg);
      handleAuthResult({
        success: false,
        error: errorMsg
      });
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        {error ? (
          <div className="text-red-500">
            <p className="text-xl mb-2">❌ {error}</p>
            {!isPopup && (
              <p className="text-gray-400">Redirecting back to search...</p>
            )}
          </div>
        ) : (
          <div>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-xl mb-2">Connecting to Spotify...</p>
            {isPopup && (
              <p className="text-sm text-gray-400">This window will close automatically</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
```

### **3. Update useSpotifyAuth Hook for Popup Support**

```typescript:apps/web/src/hooks/useSpotifyAuth.ts
import { useState, useEffect } from 'react';
import { spotifyApi } from '../services/spotifyApi';
import { popupAuthService } from '../services/popupAuth';
import { SpotifyUser } from '@shared/types';

export const useSpotifyAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<SpotifyUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    const checkSpotifyConnection = async () => {
      const storedToken = localStorage.getItem('spotify_access_token');
      const storedUser = localStorage.getItem('spotify_user');
      
      if (storedToken && storedUser) {
        try {
          setAccessToken(storedToken);
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Failed to parse stored user data:', error);
          // Clear corrupted data
          localStorage.removeItem('spotify_access_token');
          localStorage.removeItem('spotify_user');
        }
      }
      setLoading(false);
    };

    checkSpotifyConnection();

    // Listen for auth changes (from popup or other tabs)
    window.addEventListener('spotify-auth-changed', checkSpotifyConnection);

    return () => {
      window.removeEventListener('spotify-auth-changed', checkSpotifyConnection);
    };
  }, []);

  const loginWithPopup = async (): Promise<{ success: boolean; error?: string }> => {
    setIsAuthenticating(true);
    
    try {
      const result = await popupAuthService.loginWithPopup();
      
      if (result.success && result.accessToken && result.userData) {
        // Store authentication data
        localStorage.setItem('spotify_access_token', result.accessToken);
        localStorage.setItem('spotify_user', JSON.stringify(result.userData));
        localStorage.setItem('spotify_connected', 'true');
        localStorage.setItem('spotify_user_id', result.userId!);
        
        // Update state
        setAccessToken(result.accessToken);
        setUser(result.userData);
        setIsAuthenticated(true);
        
        // Notify other components
        window.dispatchEvent(new CustomEvent('spotify-auth-changed'));
        
        return { success: true };
      } else {
        return { 
          success: false, 
          error: result.error || 'Authentication failed' 
        };
      }
    } catch (error) {
      console.error('Popup authentication failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Authentication failed' 
      };
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Fallback to redirect method
  const loginWithRedirect = async () => {
    try {
      const { authUrl } = await spotifyApi.getAuthUrl();
      window.location.href = authUrl;
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setAccessToken(null);
    spotifyApi.disconnect();
  };

  return {
    isAuthenticated,
    user,
    accessToken,
    loading,
    isAuthenticating,
    loginWithPopup,
    loginWithRedirect,
    logout,
    isPremium: user?.product === 'premium'
  };
};
```

### **4. Update Backend to Return Complete Auth Data**

```typescript:apps/server/src/routes/spotify.ts
// Update the callback route to return complete auth data
router.post('/auth/callback', async (req, res) => {
  try {
    const { code, state } = req.body;
    
    if (!code || !state) {
      return res.status(400).json({ error: 'Missing code or state parameter' });
    }
    
    try {
      jwt.verify(state, process.env.JWT_SECRET!);
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError);
      return res.status(400).json({ error: 'Invalid state parameter' });
    }
    
    try {
      const tokens = await spotifyService.exchangeCodeForTokens(code);
      const user = await spotifyService.getCurrentUser(tokens.access_token);
      
      // Store tokens
      userTokens.set(user.id, {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        userId: user.id
      });
      
      // Return complete auth data for popup
      res.json({ 
        success: true, 
        userId: user.id,
        accessToken: tokens.access_token,  // Include access token
        userData: user                     // Include full user data
      });
    } catch (spotifyError) {
      console.error('Spotify token exchange failed:', spotifyError);
      return res.status(400).json({ error: 'Failed to exchange authorization code' });
    }
  } catch (error) {
    console.error('Unexpected error in auth callback:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

### **5. Update PlayButton Component**

```typescript:apps/web/src/components/PlayButton.tsx
import React, { useState } from 'react';
import { useSpotify } from '../hooks/useSpotify';
import { SpotifyTrack } from '@shared/types';

interface PlayButtonProps {
  track: SpotifyTrack;
  className?: string;
}

export const PlayButton: React.FC<PlayButtonProps> = ({ track, className = '' }) => {
  const { isAuthenticated, isPremium, loginWithPopup, playTrack, isPlayerReady, isAuthenticating } = useSpotify();
  const [showAuthError, setShowAuthError] = useState<string | null>(null);

  const handlePlay = async () => {
    if (!isAuthenticated) {
      // Use popup authentication
      const result = await loginWithPopup();
      
      if (!result.success) {
        setShowAuthError(result.error || 'Authentication failed');
        setTimeout(() => setShowAuthError(null), 5000);
        return;
      }
      
      // Auth succeeded, but we need to wait for the hook to update
      // The button will re-render and user can click again
      return;
    }

    if (!isPremium) {
      // Free users - redirect to Spotify app
      const deepLink = `spotify:track:${track.id}`;
      const webLink = `https://open.spotify.com/track/${track.id}`;
      
      try {
        window.location.href = deepLink;
        setTimeout(() => {
          window.open(webLink, '_blank');
        }, 1500);
      } catch {
        window.open(webLink, '_blank');
      }
      return;
    }

    if (isPremium && isPlayerReady) {
      // Premium users - play in browser
      try {
        await playTrack(`spotify:track:${track.id}`);
      } catch (error) {
        console.error('Playback failed:', error);
        window.open(`https://open.spotify.com/track/${track.id}`, '_blank');
      }
    }
  };

  const getButtonText = () => {
    if (isAuthenticating) return 'Connecting...';
    if (!isAuthenticated) return 'Login to Play';
    if (!isPremium) return 'Play in Spotify';
    if (!isPlayerReady) return 'Loading Player...';
    return 'Play';
  };

  const getButtonIcon = () => {
    if (isAuthenticating) return '⏳';
    if (!isAuthenticated || !isPremium) return '🎵';
    return '▶️';
  };

  return (
    <div className="relative">
      <button
        onClick={handlePlay}
        disabled={isAuthenticating || (isPremium && !isPlayerReady)}
        className={`play-button ${className} ${!isPremium ? 'external' : 'internal'} px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors disabled:opacity-50`}
      >
        <span className="icon mr-1">{getButtonIcon()}</span>
        <span className="text">{getButtonText()}</span>
      </button>
      
      {showAuthError && (
        <div className="absolute top-full left-0 mt-1 bg-red-900 text-red-200 text-xs px-2 py-1 rounded shadow-lg z-10 whitespace-nowrap">
          {showAuthError}
        </div>
      )}
    </div>
  );
};
```

## **🎉 User Experience Flow**

```
1. User searches "Taylor Swift" 
   → Results appear on /search ✅

2. User clicks "Login to Play" on a song
   → Small popup opens with Spotify auth 🪟
   → Main page stays on /search with results visible

3. User approves in popup
   → Popup closes automatically ✅
   → Main page button changes to "Play" 🎵
   → Search results still there!

4. User clicks "Play" again
   → Song starts playing immediately 🎶
   → Never left the search page!
```

## **✨ Benefits:**

- **🚀 Zero navigation** - User never leaves search page
- **🎯 Preserved context** - Search results always visible  
- **⚡ Immediate playback** - Can play song right after auth
- **🔒 Secure** - Uses postMessage API for safe cross-window communication
- **📱 Responsive** - Works on mobile and desktop
- **🔄 Fallback** - Still has redirect option if popups are blocked

This creates a seamless, modern authentication experience that keeps users in their flow!