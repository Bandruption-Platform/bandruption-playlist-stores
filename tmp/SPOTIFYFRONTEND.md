# Frontend Spotify Integration - Using Existing Backend APIs

## **🏗️ Frontend Architecture with Backend API Integration**

### **Frontend Components Structure**
```
apps/web/src/
├── services/
│   ├── spotifyApi.ts          # Backend API calls
│   └── spotifyPlayer.ts       # Web Playback SDK only
├── hooks/
│   ├── useSpotifyAuth.ts      # Authentication state
│   ├── useSpotifyPlayer.ts    # Player controls
│   └── useSpotifySearch.ts    # Search functionality
├── components/
│   ├── SpotifyPlayer.tsx      # Premium player component
│   ├── TrackCard.tsx          # Universal track display
│   └── PlayButton.tsx         # Smart play button
└── contexts/
    └── SpotifyContext.tsx     # Global Spotify state
```

---

## **🔌 API Service Integration**

### **Frontend API Service** (`apps/web/src/services/spotifyApi.ts`)

```typescript
import { SpotifySearchResults, SpotifyTrack, SpotifyAlbum, SpotifyArtist, SpotifyUser } from '@shared/types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class SpotifyApiService {
  // Public endpoints (no auth required)
  async searchPublic(query: string, types: string = 'track,album,artist'): Promise<SpotifySearchResults> {
    const response = await fetch(`${API_BASE}/api/spotify/public/search?q=${encodeURIComponent(query)}&type=${types}`);
    if (!response.ok) throw new Error('Search failed');
    return response.json();
  }

  async getTrackPublic(trackId: string): Promise<SpotifyTrack> {
    const response = await fetch(`${API_BASE}/api/spotify/public/track/${trackId}`);
    if (!response.ok) throw new Error('Failed to fetch track');
    return response.json();
  }

  async getAlbumPublic(albumId: string): Promise<SpotifyAlbum> {
    const response = await fetch(`${API_BASE}/api/spotify/public/album/${albumId}`);
    if (!response.ok) throw new Error('Failed to fetch album');
    return response.json();
  }

  async getArtistPublic(artistId: string): Promise<SpotifyArtist> {
    const response = await fetch(`${API_BASE}/api/spotify/public/artist/${artistId}`);
    if (!response.ok) throw new Error('Failed to fetch artist');
    return response.json();
  }

  async getArtistAlbumsPublic(artistId: string): Promise<SpotifyAlbum[]> {
    const response = await fetch(`${API_BASE}/api/spotify/public/artist/${artistId}/albums`);
    if (!response.ok) throw new Error('Failed to fetch artist albums');
    return response.json();
  }

  // Authentication endpoints
  async getAuthUrl(): Promise<{ authUrl: string }> {
    const response = await fetch(`${API_BASE}/api/spotify/auth/login`);
    if (!response.ok) throw new Error('Failed to get auth URL');
    return response.json();
  }

  async handleAuthCallback(code: string, state: string): Promise<{ success: boolean; userId: string }> {
    const response = await fetch(`${API_BASE}/api/spotify/auth/callback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, state })
    });
    if (!response.ok) throw new Error('Auth callback failed');
    return response.json();
  }

  // Authenticated endpoints (with user token)
  async searchAuthenticated(query: string, token: string, types: string = 'track,album,artist'): Promise<SpotifySearchResults> {
    const response = await fetch(`${API_BASE}/api/spotify/search?q=${encodeURIComponent(query)}&type=${types}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Authenticated search failed');
    return response.json();
  }

  async getTrackAuthenticated(trackId: string, token: string): Promise<SpotifyTrack> {
    const response = await fetch(`${API_BASE}/api/spotify/track/${trackId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch track');
    return response.json();
  }

  async getUserProfile(userId: string, token: string): Promise<SpotifyUser> {
    const response = await fetch(`${API_BASE}/api/spotify/me/${userId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch user profile');
    return response.json();
  }
}

export const spotifyApi = new SpotifyApiService();
```

---

## **🎵 Web Playback SDK Service** (`apps/web/src/services/spotifyPlayer.ts`)

```typescript
// This handles ONLY the Web Playback SDK - all data comes from backend APIs
class SpotifyPlayerService {
  private player: Spotify.Player | null = null;
  private deviceId: string | null = null;
  private accessToken: string | null = null;

  async initialize(accessToken: string): Promise<void> {
    this.accessToken = accessToken;
    
    if (!window.Spotify) {
      await this.loadSDK();
    }

    this.player = new window.Spotify.Player({
      name: 'Bandruption Web Player',
      getOAuthToken: (cb: (token: string) => void) => {
        cb(accessToken);
      },
      volume: 0.8,
    });

    // Set up event listeners
    this.setupEventListeners();
    
    // Connect the player
    await this.player.connect();
  }

  private setupEventListeners(): void {
    if (!this.player) return;

    this.player.addListener('ready', ({ device_id }) => {
      console.log('Spotify Player Ready with Device ID:', device_id);
      this.deviceId = device_id;
      this.onPlayerReady?.(device_id);
    });

    this.player.addListener('not_ready', ({ device_id }) => {
      console.log('Spotify Player Not Ready:', device_id);
      this.onPlayerNotReady?.(device_id);
    });

    this.player.addListener('player_state_changed', (state) => {
      if (!state) return;
      this.onStateChanged?.(state);
    });

    this.player.addListener('initialization_error', ({ message }) => {
      console.error('Spotify Player Initialization Error:', message);
    });

    this.player.addListener('authentication_error', ({ message }) => {
      console.error('Spotify Player Authentication Error:', message);
    });

    this.player.addListener('account_error', ({ message }) => {
      console.error('Spotify Player Account Error:', message);
    });
  }

  // Playback control methods - these use direct Spotify Web API
  async playTrack(spotifyUri: string): Promise<void> {
    if (!this.deviceId || !this.accessToken) {
      throw new Error('Player not ready');
    }

    await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${this.deviceId}`, {
      method: 'PUT',
      body: JSON.stringify({ uris: [spotifyUri] }),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.accessToken}`,
      },
    });
  }

  async playPlaylist(playlistUri: string, startIndex: number = 0): Promise<void> {
    if (!this.deviceId || !this.accessToken) {
      throw new Error('Player not ready');
    }

    await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${this.deviceId}`, {
      method: 'PUT',
      body: JSON.stringify({ 
        context_uri: playlistUri,
        offset: { position: startIndex }
      }),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.accessToken}`,
      },
    });
  }

  // Player control methods
  async pause(): Promise<void> { await this.player?.pause(); }
  async resume(): Promise<void> { await this.player?.resume(); }
  async nextTrack(): Promise<void> { await this.player?.nextTrack(); }
  async previousTrack(): Promise<void> { await this.player?.previousTrack(); }
  async seek(positionMs: number): Promise<void> { await this.player?.seek(positionMs); }
  async setVolume(volume: number): Promise<void> { await this.player?.setVolume(volume); }

  async getCurrentState(): Promise<Spotify.PlaybackState | null> {
    return this.player?.getCurrentState() || null;
  }

  disconnect(): void {
    this.player?.disconnect();
    this.player = null;
    this.deviceId = null;
    this.accessToken = null;
  }

  // Event callbacks (set from React components)
  onPlayerReady?: (deviceId: string) => void;
  onPlayerNotReady?: (deviceId: string) => void;
  onStateChanged?: (state: Spotify.PlaybackState) => void;

  private async loadSDK(): Promise<void> {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;
      document.body.appendChild(script);

      window.onSpotifyWebPlaybackSDKReady = () => {
        resolve();
      };
    });
  }
}

export const spotifyPlayer = new SpotifyPlayerService();
```

---

## **🎣 React Hooks for Integration**

### **Authentication Hook** (`apps/web/src/hooks/useSpotifyAuth.ts`)

```tsx
import { useState, useEffect } from 'react';
import { spotifyApi } from '../services/spotifyApi';
import { SpotifyUser } from '@shared/types';

export const useSpotifyAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<SpotifyUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing auth state
    const storedToken = localStorage.getItem('spotify_access_token');
    const storedUser = localStorage.getItem('spotify_user');
    
    if (storedToken && storedUser) {
      setAccessToken(storedToken);
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
    setLoading(false);

    // Handle OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    
    if (code && state) {
      handleAuthCallback(code, state);
    }
  }, []);

  const login = async () => {
    try {
      const { authUrl } = await spotifyApi.getAuthUrl();
      window.location.href = authUrl;
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleAuthCallback = async (code: string, state: string) => {
    try {
      const result = await spotifyApi.handleAuthCallback(code, state);
      if (result.success) {
        // Backend should return user data and token
        // This might need adjustment based on your actual backend response
        const userData = await spotifyApi.getUserProfile(result.userId, accessToken!);
        
        setUser(userData);
        setIsAuthenticated(true);
        
        // Store auth state
        localStorage.setItem('spotify_user', JSON.stringify(userData));
        // Note: Token storage should be handled securely by your backend
      }
    } catch (error) {
      console.error('Auth callback failed:', error);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_user');
  };

  return {
    isAuthenticated,
    user,
    accessToken,
    loading,
    login,
    logout,
    isPremium: user?.product === 'premium'
  };
};
```

### **Player Hook** (`apps/web/src/hooks/useSpotifyPlayer.ts`)

```tsx
import { useState, useEffect, useCallback } from 'react';
import { spotifyPlayer } from '../services/spotifyPlayer';

export const useSpotifyPlayer = (accessToken: string | null, isPremium: boolean) => {
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Spotify.Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (accessToken && isPremium) {
      initializePlayer();
    }

    return () => {
      spotifyPlayer.disconnect();
    };
  }, [accessToken, isPremium]);

  const initializePlayer = async () => {
    try {
      spotifyPlayer.onPlayerReady = (deviceId) => {
        console.log('Player ready with device ID:', deviceId);
        setIsPlayerReady(true);
      };

      spotifyPlayer.onPlayerNotReady = (deviceId) => {
        console.log('Player not ready:', deviceId);
        setIsPlayerReady(false);
      };

      spotifyPlayer.onStateChanged = (state) => {
        setCurrentTrack(state.track_window.current_track);
        setIsPlaying(!state.paused);
        setPosition(state.position);
        setDuration(state.duration);
      };

      await spotifyPlayer.initialize(accessToken!);
    } catch (error) {
      console.error('Failed to initialize player:', error);
    }
  };

  const playTrack = useCallback(async (spotifyUri: string) => {
    if (!isPlayerReady) throw new Error('Player not ready');
    await spotifyPlayer.playTrack(spotifyUri);
  }, [isPlayerReady]);

  const playPlaylist = useCallback(async (playlistUri: string, startIndex: number = 0) => {
    if (!isPlayerReady) throw new Error('Player not ready');
    await spotifyPlayer.playPlaylist(playlistUri, startIndex);
  }, [isPlayerReady]);

  const pause = useCallback(async () => {
    await spotifyPlayer.pause();
  }, []);

  const resume = useCallback(async () => {
    await spotifyPlayer.resume();
  }, []);

  const nextTrack = useCallback(async () => {
    await spotifyPlayer.nextTrack();
  }, []);

  const previousTrack = useCallback(async () => {
    await spotifyPlayer.previousTrack();
  }, []);

  const seek = useCallback(async (positionMs: number) => {
    await spotifyPlayer.seek(positionMs);
  }, []);

  const setVolume = useCallback(async (volume: number) => {
    await spotifyPlayer.setVolume(volume);
  }, []);

  return {
    isPlayerReady,
    currentTrack,
    isPlaying,
    position,
    duration,
    playTrack,
    playPlaylist,
    pause,
    resume,
    nextTrack,
    previousTrack,
    seek,
    setVolume,
    canUsePlayer: isPremium && isPlayerReady
  };
};
```

### **Search Hook** (`apps/web/src/hooks/useSpotifySearch.ts`)

```tsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { spotifyApi } from '../services/spotifyApi';
import { SpotifySearchResults } from '@shared/types';

export const useSpotifySearch = (accessToken?: string) => {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState('track,album,artist');

  // Use authenticated search if token available, public otherwise
  const searchFunction = accessToken 
    ? (q: string, type: string) => spotifyApi.searchAuthenticated(q, accessToken, type)
    : (q: string, type: string) => spotifyApi.searchPublic(q, type);

  const {
    data: results,
    isLoading,
    error,
    refetch
  } = useQuery<SpotifySearchResults>({
    queryKey: ['spotify-search', query, searchType, !!accessToken],
    queryFn: () => searchFunction(query, searchType),
    enabled: query.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const search = (newQuery: string) => {
    setQuery(newQuery);
  };

  return {
    query,
    results,
    isLoading,
    error,
    search,
    searchType,
    setSearchType,
    refetch
  };
};
```

---

## **⚡ Smart Play Button Component**

```tsx
// apps/web/src/components/PlayButton.tsx
import React from 'react';
import { useSpotifyAuth } from '../hooks/useSpotifyAuth';
import { useSpotifyPlayer } from '../hooks/useSpotifyPlayer';
import { Track } from '@shared/types';

interface PlayButtonProps {
  track: Track;
  className?: string;
}

export const PlayButton: React.FC<PlayButtonProps> = ({ track, className = '' }) => {
  const { isAuthenticated, isPremium, login } = useSpotifyAuth();
  const { canUsePlayer, playTrack, isPlayerReady } = useSpotifyPlayer();

  const handlePlay = async () => {
    if (!isAuthenticated) {
      login();
      return;
    }

    if (!isPremium) {
      // Redirect to Spotify app for free users
      const deepLink = `spotify:track:${track.spotify_id}`;
      const webLink = `https://open.spotify.com/track/${track.spotify_id}`;
      
      try {
        window.location.href = deepLink;
        setTimeout(() => {
          window.open(webLink, '_blank');
        }, 1500);
      } catch (error) {
        window.open(webLink, '_blank');
      }
      return;
    }

    if (canUsePlayer) {
      // Premium users get in-browser playback
      try {
        await playTrack(`spotify:track:${track.spotify_id}`);
      } catch (error) {
        console.error('Playback failed:', error);
        // Fallback to Spotify app
        window.open(`https://open.spotify.com/track/${track.spotify_id}`, '_blank');
      }
    }
  };

  const getButtonText = () => {
    if (!isAuthenticated) return 'Login to Play';
    if (!isPremium) return 'Play in Spotify';
    if (!isPlayerReady) return 'Loading Player...';
    return 'Play';
  };

  const getButtonIcon = () => {
    if (!isAuthenticated || !isPremium) return '🎵';
    return '▶️';
  };

  return (
    <button
      onClick={handlePlay}
      disabled={isPremium && !isPlayerReady}
      className={`play-button ${className} ${!isPremium ? 'external' : 'internal'}`}
    >
      <span className="icon">{getButtonIcon()}</span>
      <span className="text">{getButtonText()}</span>
    </button>
  );
};
```

---

## **🔄 Key Benefits of This Architecture**

### **✅ Advantages:**
1. **Clean Separation** - Backend handles all Spotify API calls, frontend only manages playback
2. **Consistent Data** - All track/album/artist data comes from your backend
3. **Caching** - Backend can implement caching strategies
4. **Security** - Spotify credentials stay on backend
5. **Scalability** - Easy to add features like user playlists, favorites, etc.

### **🎯 User Experience Flow:**
1. **Anonymous Users** - Can search and browse using public endpoints
2. **Free Users** - Get auth, can save playlists, deep link to Spotify app
3. **Premium Users** - Full in-browser streaming experience + all free features

This architecture lets you provide a great experience for all user types while keeping your existing backend API structure intact!