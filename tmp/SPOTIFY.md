Based on your requirements and the Spotify API constraints, here's a comprehensive integration plan for your monorepo:

## 🎵 **Spotify Integration Implementation Plan**

### **Phase 1: Foundation & Backend Setup**

#### **1.1 Dependencies & Environment Setup**

**Backend Dependencies** (`apps/server/package.json`):
```json
{
  "dependencies": {
    // Add these to existing dependencies:
    "spotify-web-api-node": "^5.0.2",
    "node-fetch": "^3.3.2"
  },
  "devDependencies": {
    // Add type definitions:
    "@types/spotify-web-api-node": "^5.0.7"
  }
}
```

**Environment Variables** (`.env`):
```bash
# Add to apps/server/.env
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:3000/auth/spotify/callback
```

#### **1.2 Database Schema Extensions**

**Update** `packages/supabase/supabase/seed.sql`:
```sql
-- Add Spotify integration fields to existing users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS spotify_connected BOOLEAN DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS spotify_user_id TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS spotify_display_name TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS spotify_image_url TEXT;

-- Create spotify_tokens table for OAuth management
CREATE TABLE IF NOT EXISTS public.spotify_tokens (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Extend tracks table for richer Spotify metadata
ALTER TABLE public.tracks ADD COLUMN IF NOT EXISTS album_name TEXT;
ALTER TABLE public.tracks ADD COLUMN IF NOT EXISTS album_image_url TEXT;
ALTER TABLE public.tracks ADD COLUMN IF NOT EXISTS preview_url TEXT;
ALTER TABLE public.tracks ADD COLUMN IF NOT EXISTS external_url TEXT;
ALTER TABLE public.tracks ADD COLUMN IF NOT EXISTS artist_id TEXT;
ALTER TABLE public.tracks ADD COLUMN IF NOT EXISTS album_id TEXT;

-- Create spotify_cache table for performance
CREATE TABLE IF NOT EXISTS public.spotify_cache (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    cache_key TEXT UNIQUE NOT NULL,
    data JSONB NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_spotify_tokens_user_id ON public.spotify_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_spotify_cache_key ON public.spotify_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_tracks_spotify_id ON public.tracks(spotify_id);

-- RLS policies for new tables
ALTER TABLE public.spotify_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spotify_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own spotify tokens" ON public.spotify_tokens
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Cache is publicly readable" ON public.spotify_cache
    FOR SELECT USING (true);
```

#### **1.3 Shared Types Extension**

**Update** `packages/shared/src/types/index.ts`:
```typescript
// Add these interfaces to the existing file:

export interface SpotifyAuth {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

export interface SpotifyUser {
  id: string;
  display_name: string;
  email: string;
  images: Array<{ url: string; width: number; height: number }>;
  country: string;
  product: 'free' | 'premium';
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ id: string; name: string }>;
  album: {
    id: string;
    name: string;
    images: Array<{ url: string; width: number; height: number }>;
  };
  duration_ms: number;
  preview_url: string | null;
  external_urls: { spotify: string };
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  artists: Array<{ id: string; name: string }>;
  images: Array<{ url: string; width: number; height: number }>;
  release_date: string;
  total_tracks: number;
  tracks: { items: SpotifyTrack[] };
  external_urls: { spotify: string };
}

export interface SpotifyArtist {
  id: string;
  name: string;
  images: Array<{ url: string; width: number; height: number }>;
  genres: string[];
  followers: { total: number };
  external_urls: { spotify: string };
}

export interface SpotifySearchResults {
  tracks?: { items: SpotifyTrack[] };
  albums?: { items: SpotifyAlbum[] };
  artists?: { items: SpotifyArtist[] };
}

// Extend existing User interface
export interface User {
  // ... existing fields ...
  spotify_connected?: boolean;
  spotify_user_id?: string;
  spotify_display_name?: string;
  spotify_image_url?: string;
}

// Extend existing Track interface
export interface Track {
  // ... existing fields ...
  album_name?: string;
  album_image_url?: string;
  preview_url?: string;
  external_url?: string;
  artist_id?: string;
  album_id?: string;
}
```

#### **1.4 Backend Implementation**

**Create** `apps/server/src/services/spotifyService.ts`:
```typescript
import SpotifyWebApi from 'spotify-web-api-node';
import { SpotifyAuth, SpotifySearchResults, SpotifyTrack, SpotifyAlbum, SpotifyArtist } from '@repo/shared';

class SpotifyService {
  private spotify: SpotifyWebApi;

  constructor() {
    this.spotify = new SpotifyWebApi({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      redirectUri: process.env.SPOTIFY_REDIRECT_URI,
    });
  }

  async getAuthUrl(state: string): Promise<string> {
    const scopes = [
      'streaming',
      'user-read-email',
      'user-read-private',
      'playlist-read-private',
      'playlist-modify-public',
      'playlist-modify-private'
    ];
    
    return this.spotify.createAuthorizeURL(scopes, state);
  }

  async exchangeCodeForTokens(code: string): Promise<SpotifyAuth> {
    const data = await this.spotify.authorizationCodeGrant(code);
    return {
      access_token: data.body.access_token,
      refresh_token: data.body.refresh_token,
      expires_in: data.body.expires_in,
      token_type: data.body.token_type,
      scope: data.body.scope,
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<SpotifyAuth> {
    this.spotify.setRefreshToken(refreshToken);
    const data = await this.spotify.refreshAccessToken();
    return {
      access_token: data.body.access_token,
      refresh_token: refreshToken, // Keep existing refresh token
      expires_in: data.body.expires_in,
      token_type: data.body.token_type,
      scope: data.body.scope || '',
    };
  }

  async search(query: string, types: string[], accessToken: string): Promise<SpotifySearchResults> {
    this.spotify.setAccessToken(accessToken);
    const data = await this.spotify.search(query, types);
    return data.body;
  }

  async getTrack(trackId: string, accessToken: string): Promise<SpotifyTrack> {
    this.spotify.setAccessToken(accessToken);
    const data = await this.spotify.getTrack(trackId);
    return data.body;
  }

  async getAlbum(albumId: string, accessToken: string): Promise<SpotifyAlbum> {
    this.spotify.setAccessToken(accessToken);
    const data = await this.spotify.getAlbum(albumId);
    return data.body;
  }

  async getArtist(artistId: string, accessToken: string): Promise<SpotifyArtist> {
    this.spotify.setAccessToken(accessToken);
    const data = await this.spotify.getArtist(artistId);
    return data.body;
  }

  async getArtistAlbums(artistId: string, accessToken: string): Promise<SpotifyAlbum[]> {
    this.spotify.setAccessToken(accessToken);
    const data = await this.spotify.getArtistAlbums(artistId, { limit: 50 });
    return data.body.items;
  }
}

export const spotifyService = new SpotifyService();
```

**Create** `apps/server/src/routes/spotify.ts`:
```typescript
import { Router } from 'express';
import { spotifyService } from '../services/spotifyService';
import jwt from 'jsonwebtoken';

const router = Router();

// Authentication routes
router.get('/auth/login', async (req, res) => {
  try {
    const state = jwt.sign({ timestamp: Date.now() }, process.env.JWT_SECRET!);
    const authUrl = await spotifyService.getAuthUrl(state);
    res.json({ authUrl });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate auth URL' });
  }
});

router.post('/auth/callback', async (req, res) => {
  try {
    const { code, state } = req.body;
    
    // Verify state parameter
    jwt.verify(state, process.env.JWT_SECRET!);
    
    const tokens = await spotifyService.exchangeCodeForTokens(code);
    
    // Store tokens in database (implement this)
    // await storeUserTokens(req.user.id, tokens);
    
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: 'Invalid authorization code' });
  }
});

// Search routes
router.get('/search', async (req, res) => {
  try {
    const { q, type } = req.query;
    const accessToken = req.headers.authorization?.replace('Bearer ', '');
    
    if (!accessToken) {
      return res.status(401).json({ error: 'Access token required' });
    }
    
    const results = await spotifyService.search(
      q as string, 
      (type as string).split(','),
      accessToken
    );
    
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
});

// Content routes
router.get('/track/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const accessToken = req.headers.authorization?.replace('Bearer ', '');
    
    if (!accessToken) {
      return res.status(401).json({ error: 'Access token required' });
    }
    
    const track = await spotifyService.getTrack(id, accessToken);
    res.json(track);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch track' });
  }
});

router.get('/album/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const accessToken = req.headers.authorization?.replace('Bearer ', '');
    
    if (!accessToken) {
      return res.status(401).json({ error: 'Access token required' });
    }
    
    const album = await spotifyService.getAlbum(id, accessToken);
    res.json(album);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch album' });
  }
});

router.get('/artist/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const accessToken = req.headers.authorization?.replace('Bearer ', '');
    
    if (!accessToken) {
      return res.status(401).json({ error: 'Access token required' });
    }
    
    const artist = await spotifyService.getArtist(id, accessToken);
    res.json(artist);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch artist' });
  }
});

router.get('/artist/:id/albums', async (req, res) => {
  try {
    const { id } = req.params;
    const accessToken = req.headers.authorization?.replace('Bearer ', '');
    
    if (!accessToken) {
      return res.status(401).json({ error: 'Access token required' });
    }
    
    const albums = await spotifyService.getArtistAlbums(id, accessToken);
    res.json(albums);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch artist albums' });
  }
});

export default router;
```

**Update** `apps/server/src/index.ts`:
```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import spotifyRoutes from './routes/spotify';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running!' });
});

// Spotify routes
app.use('/api/spotify', spotifyRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
```

### **Phase 2: Web Frontend Implementation**

#### **2.1 Web Dependencies** (`apps/web/package.json`):
```json
{
  "dependencies": {
    // Add to existing dependencies:
    "@spotify/web-playback-sdk": "^0.1.0"
  },
  "devDependencies": {
    "@types/spotify-web-playback-sdk": "^0.1.19"
  }
}
```

#### **2.2 Spotify Context & Hooks**

**Create** `apps/web/src/contexts/SpotifyContext.tsx`:
```tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SpotifyAuth, SpotifyUser } from '@repo/shared';

interface SpotifyContextType {
  isAuthenticated: boolean;
  user: SpotifyUser | null;
  accessToken: string | null;
  player: Spotify.Player | null;
  deviceId: string | null;
  isPlaying: boolean;
  currentTrack: Spotify.Track | null;
  connectSpotify: () => Promise<void>;
  disconnectSpotify: () => void;
  playTrack: (uri: string) => Promise<void>;
  pausePlayback: () => Promise<void>;
  resumePlayback: () => Promise<void>;
}

const SpotifyContext = createContext<SpotifyContextType | undefined>(undefined);

export const useSpotify = () => {
  const context = useContext(SpotifyContext);
  if (!context) {
    throw new Error('useSpotify must be used within SpotifyProvider');
  }
  return context;
};

interface SpotifyProviderProps {
  children: ReactNode;
}

export const SpotifyProvider: React.FC<SpotifyProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<SpotifyUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [player, setPlayer] = useState<Spotify.Player | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Spotify.Track | null>(null);

  useEffect(() => {
    // Load Spotify Web Playback SDK
    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      initializePlayer();
    };

    return () => {
      if (player) {
        player.disconnect();
      }
    };
  }, [accessToken]);

  const initializePlayer = () => {
    if (!accessToken) return;

    const spotifyPlayer = new window.Spotify.Player({
      name: 'Bandruption Playlist Player',
      getOAuthToken: (cb: (token: string) => void) => {
        cb(accessToken);
      },
      volume: 0.5,
    });

    spotifyPlayer.addListener('ready', ({ device_id }) => {
      console.log('Ready with Device ID', device_id);
      setDeviceId(device_id);
    });

    spotifyPlayer.addListener('not_ready', ({ device_id }) => {
      console.log('Device ID has gone offline', device_id);
    });

    spotifyPlayer.addListener('player_state_changed', (state) => {
      if (!state) return;
      
      setCurrentTrack(state.track_window.current_track);
      setIsPlaying(!state.paused);
    });

    spotifyPlayer.connect();
    setPlayer(spotifyPlayer);
  };

  const connectSpotify = async () => {
    try {
      const response = await fetch('/api/spotify/auth/login');
      const { authUrl } = await response.json();
      
      window.location.href = authUrl;
    } catch (error) {
      console.error('Failed to connect to Spotify:', error);
    }
  };

  const disconnectSpotify = () => {
    if (player) {
      player.disconnect();
    }
    setIsAuthenticated(false);
    setUser(null);
    setAccessToken(null);
    setPlayer(null);
    setDeviceId(null);
    setIsPlaying(false);
    setCurrentTrack(null);
  };

  const playTrack = async (uri: string) => {
    if (!player || !deviceId) return;

    try {
      await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: 'PUT',
        body: JSON.stringify({ uris: [uri] }),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });
    } catch (error) {
      console.error('Failed to play track:', error);
    }
  };

  const pausePlayback = async () => {
    if (player) {
      await player.pause();
    }
  };

  const resumePlayback = async () => {
    if (player) {
      await player.resume();
    }
  };

  const value: SpotifyContextType = {
    isAuthenticated,
    user,
    accessToken,
    player,
    deviceId,
    isPlaying,
    currentTrack,
    connectSpotify,
    disconnectSpotify,
    playTrack,
    pausePlayback,
    resumePlayback,
  };

  return (
    <SpotifyContext.Provider value={value}>
      {children}
    </SpotifyContext.Provider>
  );
};
```

#### **2.3 Search Component**

**Create** `apps/web/src/components/SpotifySearch.tsx`:
```tsx
import React, { useState } from 'react';
import { useSpotify } from '../contexts/SpotifyContext';
import { SpotifySearchResults, SpotifyTrack, SpotifyAlbum, SpotifyArtist } from '@repo/shared';

export const SpotifySearch: React.FC = () => {
  const { accessToken } = useSpotify();
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<string>('track,album,artist');
  const [results, setResults] = useState<SpotifySearchResults | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim() || !accessToken) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/spotify/search?q=${encodeURIComponent(query)}&type=${searchType}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );
      
      const searchResults = await response.json();
      setResults(searchResults);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="spotify-search">
      <div className="search-controls">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for songs, artists, albums..."
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        
        <select 
          value={searchType} 
          onChange={(e) => setSearchType(e.target.value)}
        >
          <option value="track,album,artist">All</option>
          <option value="track">Songs</option>
          <option value="album">Albums</option>
          <option value="artist">Artists</option>
        </select>
        
        <button onClick={handleSearch} disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {results && (
        <div className="search-results">
          {results.tracks && (
            <div className="tracks-section">
              <h3>Songs</h3>
              {results.tracks.items.map((track: SpotifyTrack) => (
                <div key={track.id} className="track-item">
                  <img src={track.album.images[0]?.url} alt={track.album.name} />
                  <div>
                    <p><strong>{track.name}</strong></p>
                    <p>{track.artists.map(a => a.name).join(', ')}</p>
                    <p>{track.album.name}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {results.albums && (
            <div className="albums-section">
              <h3>Albums</h3>
              {results.albums.items.map((album: SpotifyAlbum) => (
                <div key={album.id} className="album-item">
                  <img src={album.images[0]?.url} alt={album.name} />
                  <div>
                    <p><strong>{album.name}</strong></p>
                    <p>{album.artists.map(a => a.name).join(', ')}</p>
                    <p>{album.release_date}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {results.artists && (
            <div className="artists-section">
              <h3>Artists</h3>
              {results.artists.items.map((artist: SpotifyArtist) => (
                <div key={artist.id} className="artist-item">
                  <img src={artist.images[0]?.url} alt={artist.name} />
                  <div>
                    <p><strong>{artist.name}</strong></p>
                    <p>{artist.followers.total.toLocaleString()} followers</p>
                    <p>{artist.genres.slice(0, 3).join(', ')}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
```

### **Phase 3: Mobile Integration**

#### **3.1 Mobile Dependencies** (`apps/mobile/package.json`):
```json
{
  "dependencies": {
    // Add to existing dependencies:
    "react-native-spotify-remote": "^2.3.1",
    "@react-native-async-storage/async-storage": "^1.19.0"
  }
}
```

#### **3.2 iOS Configuration** (`apps/mobile/ios/`):

**Add to Info.plist**:
```xml
<key>LSApplicationQueriesSchemes</key>
<array>
  <string>spotify</string>
</array>

<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLName</key>
    <string>com.bandruption.mobile</string>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>bandruption</string>
    </array>
  </dict>
</array>
```

#### **3.3 Android Configuration** (`apps/mobile/android/`):

**Add to AndroidManifest.xml**:
```xml
<activity
  android:name=".SpotifyAuthActivity"
  android:launchMode="singleInstance">
  <intent-filter>
    <action android:name="android.intent.action.VIEW"/>
    <category android:name="android.intent.category.DEFAULT"/>
    <category android:name="android.intent.category.BROWSABLE"/>
    <data android:host="spotify-auth" android:scheme="bandruption"/>
  </intent-filter>
</activity>
```

### **Phase 4: Implementation Timeline**

#### **Week 1-2: Backend Foundation**
- [ ] Set up Spotify Web API integration
- [ ] Implement authentication flows
- [ ] Create database schema updates
- [ ] Build search and metadata endpoints

#### **Week 3-4: Web Frontend**
- [ ] Implement Spotify Web Playback SDK
- [ ] Build search interface
- [ ] Create player controls
- [ ] Add playlist integration

#### **Week 5-6: Mobile Integration**
- [ ] Set up iOS/Android Spotify SDKs
- [ ] Implement mobile authentication
- [ ] Build mobile player components
- [ ] Add platform-specific features

#### **Week 7-8: Polish & Testing**
- [ ] User testing
- [ ] Performance optimization
- [ ] Error handling improvements
- [ ] Documentation

### **Phase 5: Key Features Implementation**

#### **5.1 Public Profile Pages** (extend existing profile system)
#### **5.2 Playlist Sharing** (build on existing playlist structure)
#### **5.3 Premium vs Free User Handling** (preview URLs vs full playback)
#### **5.4 Deep Linking** (album/artist detail views)

This plan leverages your existing infrastructure while adding the necessary Spotify integration. Would you like me to start implementing any specific phase or elaborate on particular components?