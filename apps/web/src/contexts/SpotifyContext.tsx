import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SpotifyAuth, SpotifyUser } from '@shared/types';

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

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: typeof Spotify;
  }
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