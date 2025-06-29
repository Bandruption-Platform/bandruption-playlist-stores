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