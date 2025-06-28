import React, { createContext, useContext, ReactNode } from 'react';
import { SpotifyUser } from '@shared/types';
import { useSpotifyAuth } from '../hooks/useSpotifyAuth';
import { useSpotifyPlayer } from '../hooks/useSpotifyPlayer';

interface SpotifyContextType {
  // Auth state
  isAuthenticated: boolean;
  user: SpotifyUser | null;
  isPremium: boolean;
  accessToken: string | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => void;
  
  // Player state
  isPlayerReady: boolean;
  currentTrack: Spotify.Track | null;
  isPlaying: boolean;
  position: number;
  duration: number;
  canUsePlayer: boolean;
  
  // Player controls
  playTrack: (uri: string) => Promise<void>;
  playPlaylist: (playlistUri: string, startIndex?: number) => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  nextTrack: () => Promise<void>;
  previousTrack: () => Promise<void>;
  seek: (positionMs: number) => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
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
  const {
    isAuthenticated,
    user,
    accessToken,
    loading,
    login,
    logout,
    isPremium
  } = useSpotifyAuth();

  const {
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
    canUsePlayer
  } = useSpotifyPlayer(accessToken, isPremium);

  const value: SpotifyContextType = {
    // Auth state
    isAuthenticated,
    user,
    isPremium,
    accessToken,
    loading,
    login,
    logout,
    
    // Player state
    isPlayerReady,
    currentTrack,
    isPlaying,
    position,
    duration,
    canUsePlayer,
    
    // Player controls
    playTrack,
    playPlaylist,
    pause,
    resume,
    nextTrack,
    previousTrack,
    seek,
    setVolume,
  };

  return (
    <SpotifyContext.Provider value={value}>
      {children}
    </SpotifyContext.Provider>
  );
};