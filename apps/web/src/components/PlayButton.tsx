import React from 'react';
import { useSpotify } from '../contexts/SpotifyContext';
import { SpotifyTrack } from '@shared/types';

interface PlayButtonProps {
  track: SpotifyTrack;
  className?: string;
}

export const PlayButton: React.FC<PlayButtonProps> = ({ track, className = '' }) => {
  const { isAuthenticated, isPremium, login, playTrack, isPlayerReady } = useSpotify();

  const handlePlay = async () => {
    if (!isAuthenticated) {
      login();
      return;
    }

    if (!isPremium) {
      const deepLink = `spotify:track:${track.id}`;
      const webLink = `https://open.spotify.com/track/${track.id}`;
      
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

    if (isPremium && isPlayerReady) {
      try {
        await playTrack(`spotify:track:${track.id}`);
      } catch (error) {
        console.error('Playback failed:', error);
        window.open(`https://open.spotify.com/track/${track.id}`, '_blank');
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
      className={`play-button ${className} ${!isPremium ? 'external' : 'internal'} px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors disabled:opacity-50`}
    >
      <span className="icon mr-1">{getButtonIcon()}</span>
      <span className="text">{getButtonText()}</span>
    </button>
  );
};